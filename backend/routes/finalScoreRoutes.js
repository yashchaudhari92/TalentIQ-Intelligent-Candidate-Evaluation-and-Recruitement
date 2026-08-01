const express = require("express");
const router = express.Router();

const Application = require("../models/Application");
const Interview = require("../models/Interview");
const TestResult = require("../models/TestResult");

const calculateAIInterviewScore = require("../utils/calculateAIInterviewScore");
const calculateFinalFitScore = require("../utils/calculateFinalFitScore");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// 🔹 Score Label Helper
function getScoreLabel(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 50) return "Average";
  return "Weak";
}

router.get(
  "/final-score/:jobId/:candidateId",
  protect,
  authorizeRoles("recruiter"),
  async (req, res) => {
    try {
      const { jobId, candidateId } = req.params;

      const application = await Application.findOne({
        job: jobId,
        candidate: candidateId,
      });

      const test = await TestResult.findOne({ jobId, candidateId });

      // const interview = await Interview.findOne({
      //   jobId,
      //   candidateId,
      //   status: "completed",
      // });

      // New 
      const interview = await Interview.findOne({
        jobId,
        candidateId,
        status: "completed",
        "proctoringData.0": { $exists: true }, // ✅ MUST have data
      }).sort({ createdAt: -1 }); // ✅ latest interview

      const aiInterviewScore = interview
        ? calculateAIInterviewScore(interview)
        : null;

      // const finalScore = calculateFinalFitScore({
      //   resumeFit: application?.fitScore || 0,
      //   aiRankScore: application?.fitScore || 0,
      //   testScore: test?.score ?? null,
      //   aiInterviewScore,
      // });

      const finalScore = calculateFinalFitScore({
        resumeFit: application?.fitScore ?? null,
        aiRankScore: 0, // ❌ REMOVE DUPLICATE (important fix)
        testScore: test?.score ?? null,
        aiInterviewScore,
      });

      // ------------------------------
      // 🔹 CONFIDENCE CALCULATION
      // ------------------------------
      let totalParts = 4;
      let available = 0;

      // if (application?.fitScore !== undefined) available++;
      // if (application?.fitScore !== undefined) available++; // aiRank
      // if (test?.score !== undefined) available++;
      // if (aiInterviewScore !== null) available++;

      if (application?.fitScore !== null) available++;
      if (test?.score !== null && test?.score !== undefined) available++;
      if (aiInterviewScore !== null) available++;

      const confidence = Math.round((available / totalParts) * 100);

      res.json({
        resumeFit: application?.fitScore || 0,
        testScore: test?.score ?? null,
        aiInterviewScore,
        finalScore,
        confidence,
        label: getScoreLabel(finalScore),
      });
    } catch (err) {
      console.error("Final Score Error:", err);
      res.status(500).json({ message: "Failed to calculate final score" });
    }
  }
);

module.exports = router;

// const express = require("express");
// const router = express.Router();

// const Application = require("../models/Application");
// const Interview = require("../models/Interview");
// const TestResult = require("../models/TestResult");

// const calculateAIInterviewScore = require("../utils/calculateAIInterviewScore");
// const calculateFinalFitScore = require("../utils/calculateFinalFitScore");

// const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// router.get(
//   "/final-score/:jobId/:candidateId",
//   protect,
//   authorizeRoles("recruiter"),
//   async (req, res) => {
//     try {
//       const { jobId, candidateId } = req.params;

//       const application = await Application.findOne({
//         job: jobId,
//         candidate: candidateId,
//       });

//       if (!application) {
//         return res.status(404).json({ message: "Application not found" });
//       }

//       const test = await TestResult.findOne({
//         jobId,
//         candidateId,
//       });

//       const interview = await Interview.findOne({
//         jobId,
//         candidateId,
//         status: "completed",
//       });

//       const aiInterviewScore = interview
//         ? calculateAIInterviewScore(interview)
//         : 0;

//       const finalScore = calculateFinalFitScore({
//         resumeFit: application.fitScore || 0,
//         aiRankScore: application.fitScore || 0, // already normalized
//         testScore: test?.score || 0,
//         aiInterviewScore,
//       });

//       res.json({
//         resumeFit: application.fitScore || 0,
//         testScore: test?.score ?? null,
//         aiInterviewScore,
//         finalScore,
//       });
//     } catch (err) {
//       console.error("Final score error:", err);
//       res.status(500).json({ message: "Failed to calculate final score" });
//     }
//   }
// );

// module.exports = router;
