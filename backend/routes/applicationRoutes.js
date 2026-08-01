const express = require("express");
const router = express.Router();

const multer = require("multer");
const FormData = require("form-data");
const fs = require("fs");
const axios = require("axios");

const Application = require("../models/Application");
const Job = require("../models/Job");
const Candidate = require("../models/Candidate");
const Message = require("../models/Message");
const calculateFitScore = require("../utils/calculateFitScore")

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// --------------------------------------------
//  MULTER CONFIG
// --------------------------------------------
const upload = multer({ dest: "uploads/resumes/" });


// ------------------------------------------------------
//  APPLY TO JOB  (NO TEST VALIDATION HERE ANYMORE)
// ------------------------------------------------------
router.post(
  "/apply/:jobId",
  protect,
  authorizeRoles("candidate"),
  upload.single("resume"),
  async (req, res) => {
    try {
      const { jobId } = req.params;
      const { note } = req.body;

      // 1️⃣ Validate Job
      const job = await Job.findById(jobId);
      if (!job)
        return res.status(404).json({ message: "Job not found" });

      // 2️⃣ Validate Candidate Profile
      const profile = await Candidate.findOne({ userId: req.user._id });

      if (
        !profile ||
        profile.education.length === 0 ||
        profile.skills.length === 0 ||
        (!profile.resumeUrl && !profile.parsedData)
      ) {
        return res.status(400).json({
          message: "Please complete your profile before applying.",
        });
      }

      // --------------------------------------------------
      // 3️⃣ RESUME PARSING — SAFE + FILE SIZE CHECK
      // --------------------------------------------------
      let resumeUrl = null;
      let parsedResume = {};

      if (req.file) {
        // 3.1 File size check (Max 5MB)
        if (req.file.size > 5 * 1024 * 1024) {
          return res.status(400).json({
            message: "Resume must be under 5MB.",
          });
        }

        resumeUrl = `/uploads/resumes/${req.file.filename}`;

        // 3.2 Send to Python parser (FastAPI)
        const form = new FormData();
        form.append("file", fs.createReadStream(req.file.path), {
          filename: req.file.originalname,
          contentType: "application/pdf"
        });


        try {
          const ai = await axios.post(
            "http://localhost:5000/parse-resume",
            form,
            { headers: form.getHeaders() }
          );

          parsedResume = {
            summary: ai.data.summary,
            extractedSkills: ai.data.extractedSkills,
            keywords: [],
          };

        } catch (err) {
          console.log("❌ Resume Parser Error:", err.response?.data || err);
          return res.status(400).json({
            message: "Resume parsing failed. Upload valid PDF under 5MB.",
          });
        }
      }

      // --------------------------------------------------
      // 4️⃣ CREATE APPLICATION
      // --------------------------------------------------
      const fitResult = calculateFitScore(job, profile, parsedResume);
      const application = await Application.create({
        job: jobId,
        candidate: req.user._id,
        note,
        resumeUrl,
        parsedResume,
        // New Score addition
        fitScore: fitResult.total,
        fitBreakdown: fitResult.breakdown,
        candidateSnapshot: {
          education: profile.education,
          skills: profile.skills,
          experience: profile.experience,
        },
      });

      return res.json({ success: true, application });

    } catch (err) {
      console.log("❌ APPLY ERROR:", err);
      return res.status(500).json({
        message: "Apply failed",
        error: err.message,
      });
    }
  }
);


// ------------------------------------------------------
//  GET MY APPLICATIONS
// ------------------------------------------------------
router.get(
  "/my-applications",
  protect,
  authorizeRoles("candidate"),
  async (req, res) => {
    try {
      const applications = await Application.find({ candidate: req.user._id })
        .populate("job", "title location salary status")
        .sort({ createdAt: -1 });

      res.json(applications);
    } catch (err) {
      res.status(500).json({
        message: "Error fetching applications",
        error: err.message,
      });
    }
  }
);


// ------------------------------------------------------
//  RECRUITER → GET APPLICATIONS FOR A JOB
// ------------------------------------------------------
router.get(
  "/job/:jobId",
  protect,
  authorizeRoles("recruiter"),
  async (req, res) => {
    try {
      const applications = await Application.find({ job: req.params.jobId })
        .populate("candidate", "name email")
        .sort({ createdAt: -1 });

      res.json(applications);
    } catch (err) {
      res.status(500).json({
        message: "Error fetching applications",
        error: err.message,
      });
    }
  }
);


// ------------------------------------------------------
//  RECRUITER → UPDATE STATUS + AUTO MESSAGE
// ------------------------------------------------------
router.put(
  "/:id",
  protect,
  authorizeRoles("recruiter"),
  async (req, res) => {
    try {
      const application = await Application.findById(req.params.id)
        .populate("job");

      if (!application)
        return res.status(404).json({ message: "Application not found" });

      application.status = req.body.status || application.status;
      await application.save();

      // ⭐ Auto Mail: If shortlisted
      if (req.body.status === "shortlisted") {
        await Message.create({
          userId: application.candidate,
          title: "🎉 You have been shortlisted!",
          body: `Congratulations! You are shortlisted for the job: ${application.job.title}`,
        });
      }

      res.json({
        success: true,
        message: "Application status updated",
        application,
      });
    } catch (err) {
      res.status(500).json({
        message: "Failed to update status",
        error: err.message,
      });
    }
  }
);

// GET SHORTLISTED APPLICATIONS BY JOB
router.get(
  "/job/:jobId/shortlisted",
  protect,
  authorizeRoles("recruiter"),
  async (req, res) => {
    try {
      const apps = await Application.find({
        job: req.params.jobId,
        status: "shortlisted",
      }).populate("candidate", "name email");

      res.json(apps);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch shortlisted candidates" });
    }
  }
);



module.exports = router;
