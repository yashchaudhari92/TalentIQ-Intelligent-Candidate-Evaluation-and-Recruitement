const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// -------- Create Job (Recruiter Only) --------
router.post(
  "/",
  protect,
  authorizeRoles("recruiter"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        requirements,
        skills,
        location,
        salary,
        status,
        testRequired,
      } = req.body;

      const job = await Job.create({
        title,
        description,
        requirements: Array.isArray(requirements)
          ? requirements
          : requirements.split(",").map((x) => x.trim()),
        skills: Array.isArray(skills)
          ? skills
          : skills.split(",").map((x) => x.trim()),
        location,
        salary,
        status,
        testRequired: Boolean(testRequired), // ⭐ FIXED
        createdBy: req.user._id,
      });

      res.status(201).json({ success: true, job });
    } catch (err) {
      console.log("Job Create Error:", err);
      res.status(500).json({ message: "Job creation failed", error: err.message });
    }
  }
);

// -------- Get Jobs (Role-based) --------
router.get("/", protect, async (req, res) => {
  try {
    let jobs;

    if (req.user.role === "recruiter") {
      // ✅ Recruiter sees ONLY their own jobs
      jobs = await Job.find({ createdBy: req.user._id })
        .populate("createdBy", "name email role")
        .sort({ createdAt: -1 });
    } else {
      // ✅ Candidate sees ALL open jobs
      jobs = await Job.find({ status: "open" })
        .populate("createdBy", "name email role")
        .sort({ createdAt: -1 });
    }

    res.json(jobs);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching jobs",
      error: err.message,
    });
  }
});


// -------- Get All Jobs --------
// router.get("/", protect, async (req, res) => {
//   try {
//     const jobs = await Job.find().populate("createdBy", "name email role");
//     res.json(jobs);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching jobs", error: err.message });
//   }
// });

// -------- Get Single Job --------
router.get("/:id", protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("createdBy", "name email role");

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Error fetching job", error: err.message });
  }
});

// -------- Update Job --------
router.put(
  "/:id",
  protect,
  authorizeRoles("recruiter"),
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);

      if (!job) return res.status(404).json({ message: "Job not found" });

      if (job.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updated = await Job.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });

      res.json({ success: true, job: updated });
    } catch (err) {
      res.status(500).json({ message: "Job update failed", error: err.message });
    }
  }
);

// -------- Delete Job --------
router.delete(
  "/:id",
  protect,
  authorizeRoles("recruiter"),
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);

      if (!job) return res.status(404).json({ message: "Job not found" });

      if (job.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await job.deleteOne();

      res.json({ success: true, message: "Job deleted" });
    } catch (err) {
      res.status(500).json({ message: "Job deletion failed", error: err.message });
    }
  }
);

module.exports = router;
