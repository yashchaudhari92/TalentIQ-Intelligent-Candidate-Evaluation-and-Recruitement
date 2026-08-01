const express = require("express");
const router = express.Router();
const Test = require("../models/Test");
const TestResult = require("../models/TestResult");
const Application = require("../models/Application");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const XLSX = require("xlsx");
const upload = require("multer")({ dest: "uploads/" });

// -------- Recruiter: Create Test --------
router.post(
  "/create/:jobId",
  protect,
  authorizeRoles("recruiter"),
  async (req, res) => {
    try {
      const { jobId } = req.params;
      const { questions, passScore } = req.body;

      const test = await Test.create({ jobId, questions, passScore });
      res.json({ success: true, test });
    } catch (err) {
      res.status(500).json({
        message: "Test creation failed",
        error: err.message,
      });
    }
  }
);

router.post(
  "/upload-excel/:jobId",
  protect,
  authorizeRoles("recruiter"),
  upload.single("file"),
  async (req, res) => {
    try {
      const { jobId } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Read Excel
      const workbook = XLSX.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      // Expected format:
      // Question | CorrectAnswer

      const questions = data.map((row) => ({
        question: row.Question || row.question,
        correctAnswer: row.CorrectAnswer || row.correctAnswer,
      }));

      if (!questions.length) {
        return res.status(400).json({ message: "Excel is empty" });
      }

      // Save test (same logic)
      const test = await Test.findOneAndUpdate(
        { jobId },
        { questions },
        { new: true, upsert: true }
      );

      res.json({ success: true, test });

    } catch (err) {
      console.log("Excel upload error:", err);
      res.status(500).json({
        message: "Excel upload failed",
        error: err.message,
      });
    }
  }
);

// -------- Get Test --------
router.get("/:jobId", protect, async (req, res) => {
  try {
    const test = await Test.findOne({ jobId: req.params.jobId });
    res.json({ test });
  } catch (err) {
    res.status(500).json({
      message: "Test fetch failed",
      error: err.message,
    });
  }
});

// -------- Get Candidate's Test Result --------
router.get(
  "/result/:jobId",
  protect,
  authorizeRoles("candidate"),
  async (req, res) => {
    try {
      const result = await TestResult.findOne({
        jobId: req.params.jobId,
        candidateId: req.user._id,
      });

      if (!result) return res.json({ taken: false });

      res.json({
        taken: true,
        passed: result.passed,
        score: result.score,
      });
    } catch (err) {
      res.status(500).json({
        message: "Result fetch failed",
        error: err.message,
      });
    }
  }
);

// -------- Submit Test --------
router.post(
  "/submit/:jobId",
  protect,
  authorizeRoles("candidate"),
  async (req, res) => {
    try {
      const rawAnswers = req.body.answers ?? {};
      const test = await Test.findOne({ jobId: req.params.jobId });

      if (!test)
        return res.status(404).json({ message: "Test not found" });

      const answersArr = test.questions.map((_, i) => {
        const v = rawAnswers[i] ?? rawAnswers[String(i)] ?? "";
        return String(v).trim().toLowerCase();
      });

      let scoreCount = 0;
      test.questions.forEach((q, i) => {
        const correct = String(q.correctAnswer ?? "")
          .trim()
          .toLowerCase();
        if (answersArr[i] === correct) scoreCount++;
      });

      const percent = Math.round(
        (scoreCount / test.questions.length) * 100
      );
      const passed = percent >= (test.passScore ?? 50);

      // Save test result
      const result = await TestResult.findOneAndUpdate(
        { jobId: req.params.jobId, candidateId: req.user._id },
        { score: percent, passed },
        { new: true, upsert: true }
      );

      // Update application
      await Application.findOneAndUpdate(
        { job: req.params.jobId, candidate: req.user._id },
        {
          testRequired: true,
          testTaken: true,
          testPassed: passed,
          testScore: percent,
        }
      );

      res.json({ success: true, result, percent, passed });
    } catch (err) {
      console.error("Test submit error:", err);
      res.status(500).json({
        message: "Test submit error",
        error: err.message,
      });
    }
  }
);

// -------- Recruiter: Get candidate test result for a job --------
router.get(
  "/result/:jobId/:candidateId",
  protect,
  authorizeRoles("recruiter"),
  async (req, res) => {
    try {
      const { jobId, candidateId } = req.params;

      const result = await TestResult.findOne({ jobId, candidateId });

      if (!result) {
        return res.json({ taken: false });
      }

      res.json({
        taken: true,
        score: result.score,
        passed: result.passed,
      });
    } catch (err) {
      res.status(500).json({
        message: "Failed to fetch test result",
        error: err.message,
      });
    }
  }
);


module.exports = router;
