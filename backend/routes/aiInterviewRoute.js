const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const Interview = require("../models/Interview");
const { error } = require("console");

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "ai_interviews");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ✅ Generate AI Questions
router.post("/generate", async (req, res) => {
  try {
    const { candidateId, skills, summary, jobId } = req.body;
    if (!skills || !summary || !candidateId) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const py = await axios.post("http://localhost:5000/generate-interview-questions", {
      skills,
      summary,
    });

    const questions = py.data.questions || [];
    const sessionId = uuidv4();

    const interview = new Interview({
      jobId: jobId || null,
      recruiterId: null,
      candidateId,
      sessionId,
      status: "in-progress",
      proctoringData: [],
    });

    await interview.save();

    const sessionDir = path.join(UPLOAD_DIR, sessionId);
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    res.json({
      success: true,
      message: "AI Interview session created successfully",
      interviewId: interview._id,
      sessionId,
      questions,
      uploadAnswerUrl: `/api/ai-interview/upload-answer/${sessionId}`,
      finalizeUrl: `/api/ai-interview/finalize/${sessionId}`,
      logUrl: `/api/interviews/log/${sessionId}`,
    });
  } catch (err) {
    console.log(err);
    console.error("[AI Interview] Generation error:", err.response?.data || err.message || err);
    res.status(500).json({ success: false, message: "Failed to generate questions" });
  }
});

// ✅ Upload Recorded Video
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload-answer/:sessionId", upload.single("answer"), async (req, res) => {
  try {
    const { sessionId } = req.params;
    const qIndex = req.body.qIndex;
    if (!req.file || qIndex === undefined)
      return res.status(400).json({ success: false, message: "Missing file or qIndex" });

    const sessionDir = path.join(UPLOAD_DIR, sessionId, "answers");
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    const filename = `q_${String(qIndex).padStart(2, "0")}_${Date.now()}.webm`;
    const filePath = path.join(sessionDir, filename);
    fs.writeFileSync(filePath, req.file.buffer);

    const interview = await Interview.findOne({ sessionId });
    if (interview) {
      interview.proctoringData.push({
        type: "answer_saved",
        qIndex: Number(qIndex),
        path: filePath,
        ts: new Date(),
      });
      await interview.save();
    }

    res.json({ success: true, message: "Video uploaded", path: filePath });
  } catch (err) {
    console.error("[AI Interview] upload-answer error:", err);
    res.status(500).json({ success: false, message: "Failed to upload video" });
  }
});

// ✅ Finalize Interview
router.post("/finalize/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const interview = await Interview.findOne({ sessionId });
    if (!interview) return res.status(404).json({ success: false, message: "Session not found" });

    interview.status = "completed";
    await interview.save();

    res.json({ success: true, message: "Interview finalized", interviewId: interview._id });
  } catch (err) {
    console.error("[AI Interview] finalize error:", err);
    res.status(500).json({ success: false, message: "Failed to finalize interview" });
  }
});

// ✅ NEW — AI Answer Analysis 
// router.post("/analyze-answer", async (req, res) => {
//   try {
//     const { question, answer } = req.body;
//     const aiRes = await axios.post("http://localhost:5000/analyze-answer", { question, answer });
//     res.json(aiRes.data);
//   } catch (err) {
//     console.error("[AI Interview] analyze-answer error:", err.message);
//     res.status(500).json({ success: false, message: "Failed to analyze answer" });
//   }

//   // code for storing answers and analyze it for final scoring.

// });

router.post("/analyze-answer", async (req, res) => {
  try {
    const { question, answer, sessionId, qIndex } = req.body;

    const aiRes = await axios.post(
      "http://localhost:5000/analyze-answer",
      { question, answer }
    );

    const score = aiRes.data.score || 0;

    // ✅ SAVE ANSWER SCORE IN DB
    if (sessionId !== undefined && qIndex !== undefined) {
      const interview = await Interview.findOne({ sessionId });

      if (interview) {
        interview.proctoringData.push({
          type: "answer_analysis",
          qIndex,
          score,
          ts: new Date(),
        });

        await interview.save();
      }
    }

    res.json(aiRes.data);
  } catch (err) {
    console.error("[AI Interview] analyze-answer error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to analyze answer",
    });
  }
});

// 
router.get("/job/:jobId", async (req, res) => {
  try {
    const interviews = await Interview.find({
      jobId: req.params.jobId,
      "proctoringData.0": { $exists: true }, // ✅ only non-empty
    });

    res.json(interviews);
  } catch (err) {
    console.error("Fetch interviews error:", err);
    res.status(500).json({ message: "Failed to fetch interviews" });
  }
});

router.post("/analyze-all", async (req, res) => {
  try {
    const { sessionId, qa_list } = req.body;

    const aiRes = await axios.post(
      "http://localhost:5000/analyze-all-answers",
      { qa_list }
    );

    const results = aiRes.data.results || [];

    const interview = await Interview.findOne({ sessionId });

    if (interview) {
      results.forEach((r, index) => {
        interview.proctoringData.push({
          type: "answer_analysis",
          qIndex: index,
          score: r.score || 50,
          ts: new Date(),
        });
      });

      await interview.save();
    }

    res.json({ success: true });

    console.log("Bulk Results:", results);

  } catch (err) {
    console.error("Bulk analyze error:", err);
    res.status(500).json({ success: false });
  }
});

// GET SINGLE INTERVIEW BY ID (DETAIL PAGE)
router.get("/:id", async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    res.json(interview);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch interview" });
  }
});


module.exports = router;
