const express = require("express");
const router = express.Router();
const axios = require("axios");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Candidate = require("../models/Candidate");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// ---------------- Rank Candidates for a Job ----------------
router.get(
  "/rank/:jobId",
  protect,
  authorizeRoles("recruiter"),
  async (req, res) => {
    try {
      const { jobId } = req.params;

      // 1. Fetch job
      const job = await Job.findById(jobId);
      if (!job) return res.status(404).json({ message: "Job not found" });

      // 2. Fetch all applications for this job
      const applications = await Application.find({ job: jobId })
        .populate("candidate", "name email") // populate only basic user info
        .sort({ createdAt: -1 });

      if (!applications || applications.length === 0) {
        return res.status(200).json({ message: "No applications yet", ranked: [] });
      }

      // 3. Collect valid userIds (filter out null candidates)
      const validUserIds = applications
        .filter((app) => app.candidate && app.candidate._id)
        .map((app) => app.candidate._id);

      if (validUserIds.length === 0) {
        return res.status(200).json({ message: "No valid candidate profiles found", ranked: [] });
      }

      // 4. Fetch candidate profiles
      const candidates = await Candidate.find({ userId: { $in: validUserIds } });

      if (!candidates || candidates.length === 0) {
        return res.status(200).json({ message: "No candidate profiles found", ranked: [] });
      }

      // 5. Build candidate payloads (safe mapping)
      const candidatesPayload = candidates.map((c) => {
        const education = Array.isArray(c.education) ? c.education : [];
        const experience = Array.isArray(c.experience) ? c.experience : [];
        const extractedSkills = Array.isArray(c.parsedData?.extractedSkills)
          ? c.parsedData.extractedSkills
          : [];
        const skills =
          Array.isArray(c.skills) && c.skills.length > 0 ? c.skills : extractedSkills;

        return {
          id: c._id.toString(),
          name: c.name || "",
          email: c.email || "",
          education,
          skills,
          experience,
        };
      });

      // 6. Clean job skills (split comma-separated into proper array)
      const jobSkills = [];
      (job.skills || []).forEach((s) => {
        if (typeof s === "string") {
          s.split(",").forEach((part) => {
            const trimmed = part.trim();
            if (trimmed) jobSkills.push(trimmed);
          });
        }
      });

      // Debug logs
      console.log("[aiRank] Raw job.skills from DB:", job.skills);
      console.log("[aiRank] Cleaned job.skills:", jobSkills);
      console.log("[aiRank] Sample candidate payload:", candidatesPayload[0]);

      // 7. Prepare payload for Python AI microservice
      const payload = {
        job: {
          id: job._id.toString(),
          title: job.title,
          description: job.description,
          requirements: job.requirements || [],
          skills: jobSkills,
        },
        candidates: candidatesPayload,
      };

      // 8. Call Python microservice
      const aiResponse = await axios.post(
        "http://localhost:5000/rank-candidates",
        payload
      );

      res.json(aiResponse.data);
    } catch (err) {
      console.error("Error in /rank/:jobId:", err);
      res.status(500).json({ message: "Ranking failed", error: err.message });
    }
  }
);

module.exports = router;


// const express = require("express");
// const router = express.Router();
// const axios = require("axios");
// const Job = require("../models/Job");
// const Application = require("../models/Application");
// const Candidate = require("../models/Candidate");
// const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// // ---------------- Rank Candidates for a Job ----------------
// router.get(
//   "/rank/:jobId",
//   protect,
//   authorizeRoles("recruiter"),
//   async (req, res) => {
//     try {
//       const { jobId } = req.params;

//       // 1. Fetch job
//       const job = await Job.findById(jobId);
//       if (!job) return res.status(404).json({ message: "Job not found" });

//       // 2. Fetch all applications for this job
//       const applications = await Application.find({ job: jobId })
//         .populate("candidate", "name email") // populate only basic user info
//         .sort({ createdAt: -1 });

//       if (!applications || applications.length === 0) {
//         return res.status(200).json({ message: "No applications yet", ranked: [] });
//       }

//       // 3. Safely collect userIds (filter out null candidates)
//       const validUserIds = applications
//         .filter((app) => app.candidate && app.candidate._id)
//         .map((app) => app.candidate._id);

//       if (validUserIds.length === 0) {
//         return res.status(200).json({ message: "No valid candidate profiles found", ranked: [] });
//       }

//       // 4. Fetch matching Candidate profiles
//       const candidates = await Candidate.find({ userId: { $in: validUserIds } });

//       if (!candidates || candidates.length === 0) {
//         return res.status(200).json({ message: "No candidate profiles found", ranked: [] });
//       }

//       // 5. Build candidate payloads
//       // backend/routes/aiRank.js  (replace the candidatesPayload block)
//       const candidatesPayload = candidates.map((c) => {
//         const education = Array.isArray(c.education) ? c.education : [];
//         const experience = Array.isArray(c.experience) ? c.experience : [];
//         // parsedData has only: keywords, extractedSkills, summary
//         const extractedSkills = Array.isArray(c.parsedData?.extractedSkills) ? c.parsedData.extractedSkills : [];
//         const skills = (Array.isArray(c.skills) && c.skills.length > 0) ? c.skills : extractedSkills;

//         return {
//           id: c._id.toString(),
//           name: c.name || "",
//           email: c.email || "",
//           education,                // ✅ don’t read from parsedData.education (it doesn’t exist)
//           skills,                   // ✅ prefer explicit skills, else extractedSkills
//           experience,               // ✅ don’t read from parsedData.experience (it doesn’t exist)
//         };
//       });

//       console.log("[aiRank] Raw job.skills from DB:", job.skills);
//       console.log("[aiRank] Job skills:", job.skills);
//       console.log("[aiRank] Sample candidate payload:", candidatesPayload[0]);


//       // 6. Prepare payload for Python AI microservice
//       const payload = {
//         job: {
//           id: job._id.toString(),
//           title: job.title,
//           description: job.description,
//           requirements: job.requirements || [],
//           skills: job.skills || [],
//         },
//         candidates: candidatesPayload,
//       };

//       // 7. Call Python AI microservice
//       const aiResponse = await axios.post("http://localhost:5000/rank-candidates", payload);

//       res.json(aiResponse.data);
//     } catch (err) {
//       console.error("Error in /rank/:jobId:", err);
//       res.status(500).json({ message: "Ranking failed", error: err.message });
//     }
//   }
// );

// module.exports = router;