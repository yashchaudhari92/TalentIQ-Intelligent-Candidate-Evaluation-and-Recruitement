const express = require('express');
const axios = require('axios');
const Application = require('../models/Application');
const Interview = require('../models/Interview');

const router = express.Router();

router.get("/:jobId/:candidateId", async (req, res) => {
    try {
        const { jobId, candidateId } = req.params;

        // 🔹 Fetch Application
        const app = await Application.findOne({
            job: jobId,
            candidate: candidateId,
        }).populate("candidate", "email name").populate("job", "title");

        if (!app) {
            return res.status(404).json({ message: "Application not found" });
        }

        // 🔹 Fetch Interview
        const interview = await Interview.findOne({
            jobId,
            candidateId,
        });

        const answers = (interview?.answers || []).map((a) => a.answer);

        // 🔹 Extract scores safely
        const finalScore = app.finalScore || {};

        // ✅ CALL PYTHON AI SERVICE
        const aiRes = await axios.post("http://localhost:5000/generate-full-feedback", {
            summary: app.parsedResume?.summary || "",
            resumeFit: finalScore.resumeFit || 0,
            testScore: finalScore.testScore || 0,
            aiInterviewScore: finalScore.aiInterviewScore || 0,
            finalScore: finalScore.finalScore || 0,
            answers: answers,
        });

        const report = aiRes.data.report;

        // ✅ SAVE in DB
        app.feedbackReport = report;
        await app.save();

        // 🆕 SEND EMAIL
        try {
            const email = app.candidate?.email;

            if (email) {
                await axios.post("/mail/send-feedback", {
                    email,
                    report,
                    name: app.candidate?.name,
                    jobTitle: app.job?.title,
                });

                console.log("📧 Feedback email sent");
            }
        } catch (err) {
            console.log("❌ Email failed:", err.message);
        }

        return res.json({
            success: true,
            report,
        });

    } catch (err) {
        console.log("Full feedback error:", err);

        return res.json({
            success: true,
            report: {
                overallPerformance: "Average",
                strengths: "Basic understanding",
                weaknesses: "Needs improvement",
                technicalEvaluation: "Moderate",
                communicationSkills: "Good",
                recommendation: "Practice more",
                verdict: "Needs Improvement",
            },
        });
    }
});

module.exports = router;

// import express from "express";
// import Application from "../models/Application.js";
// import Interview from "../models/Interview.js";

// const router = express.Router();

// router.get("/:jobId/:candidateId", async (req, res) => {
//   try {
//     const { jobId, candidateId } = req.params;

//     // 🔹 Fetch Application
//     const app = await Application.findOne({
//       job: jobId,
//       "candidate._id": candidateId,
//     });

//     if (!app) {
//       return res.status(404).json({ message: "Application not found" });
//     }

//     // 🔹 Fetch Interview
//     const interview = await Interview.findOne({
//       jobId,
//       candidateId,
//     });

//     const answers = interview?.answers || [];

//     // 🔹 Fetch Final Score API (reuse logic if needed)
//     const finalScore = app.finalScore || {};

//     // 🔹 AI PROMPT
//     const prompt = `
// You are an expert recruiter.

// Analyze the candidate based on:

// Resume Summary:
// ${app.parsedResume?.summary}

// Scores:
// - Resume Fit: ${finalScore.resumeFit}
// - Test Score: ${finalScore.testScore}
// - AI Interview: ${finalScore.aiInterviewScore}
// - Final Score: ${finalScore.finalScore}

// Interview Answers:
// ${answers.map((a, i) => `Q${i + 1}: ${a.answer}`).join("\n")}

// Generate a professional hiring report.

// Return ONLY JSON:
// {
//   "overallPerformance": "",
//   "strengths": "",
//   "weaknesses": "",
//   "technicalEvaluation": "",
//   "communicationSkills": "",
//   "recommendation": "",
//   "verdict": "Selected / Rejected / Needs Improvement"
// }
// `;

//     const model = new genai.GenerativeModel("models/gemini-2.5-flash");
//     const result = await model.generate_content(prompt);

//     let text = result.text.trim();
//     if (text.startsWith("```")) {
//       text = text.replace(/```json|```/g, "").trim();
//     }

//     const data = JSON.parse(text);

//     res.json({ success: true, report: data });

//   } catch (err) {
//     console.log("Full feedback error:", err);

//     res.json({
//       success: true,
//       report: {
//         overallPerformance: "Average",
//         strengths: "Basic understanding",
//         weaknesses: "Needs deeper knowledge",
//         technicalEvaluation: "Moderate",
//         communicationSkills: "Good",
//         recommendation: "Practice more",
//         verdict: "Needs Improvement",
//       },
//     });
//   }
// });

// export default router;