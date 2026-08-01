const express = require("express");
const router = express.Router();
const sendMail = require("../utils/sendMail");
const PDFDocument = require("pdfkit");
const streamBuffers = require("stream-buffers");

// SEND FEEDBACK MAIL
router.post("/send-feedback", async (req, res) => {
  try {
    const { email, report, name, jobTitle } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    // ---------------------------
    // 🎨 HTML EMAIL TEMPLATE
    // ---------------------------
    const verdictColor =
      report.verdict === "Selected"
        ? "#16a34a"
        : report.verdict === "Rejected"
        ? "#dc2626"
        : "#f59e0b";

    const html = `
    <div style="font-family: Arial; background:#f3f4f6; padding:20px">
      <div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:10px">

        <h2 style="color:#4f46e5">TalentIQ Feedback Report</h2>

        <p>Hi <b>${name || "Candidate"}</b>,</p>
        <p>Here is your feedback for the role of <b>${jobTitle || "the applied job"}</b>.</p>

        <hr/>

        <p><b>Overall:</b> ${report.overallPerformance}</p>
        <p><b>Strengths:</b> ${report.strengths}</p>
        <p><b>Weaknesses:</b> ${report.weaknesses}</p>
        <p><b>Technical:</b> ${report.technicalEvaluation}</p>
        <p><b>Communication:</b> ${report.communicationSkills}</p>
        <p><b>Recommendation:</b> ${report.recommendation}</p>

        <h3 style="color:${verdictColor}">
          Verdict: ${report.verdict}
        </h3>

        <hr/>
        <p style="font-size:12px;color:gray">
          This is an AI-generated evaluation by TalentIQ.
        </p>

      </div>
    </div>
    `;

    // ---------------------------
    // 📄 GENERATE PDF
    // ---------------------------
    const bufferStream = new streamBuffers.WritableStreamBuffer();

    const doc = new PDFDocument();
    doc.pipe(bufferStream);

    doc.fontSize(16).text("TalentIQ Feedback Report", { underline: true });
    doc.moveDown();

    doc.text(`Candidate: ${name || "N/A"}`);
    doc.text(`Job Role: ${jobTitle || "N/A"}`);
    doc.moveDown();

    doc.text(`Overall: ${report.overallPerformance}`);
    doc.text(`Strengths: ${report.strengths}`);
    doc.text(`Weaknesses: ${report.weaknesses}`);
    doc.text(`Technical: ${report.technicalEvaluation}`);
    doc.text(`Communication: ${report.communicationSkills}`);
    doc.text(`Recommendation: ${report.recommendation}`);
    doc.text(`Verdict: ${report.verdict}`);

    doc.end();

    // wait for buffer
    await new Promise((resolve) => doc.on("end", resolve));

    const pdfBuffer = bufferStream.getContents();

    // ---------------------------
    // 📧 SEND MAIL
    // ---------------------------
    await sendMail({
      to: email,
      subject: "Your TalentIQ Feedback Report",
      html,
      attachments: [
        {
          filename: "FeedbackReport.pdf",
          content: pdfBuffer,
        },
      ],
    });

    res.json({ success: true });

  } catch (err) {
    console.log("Mail error:", err);
    res.status(500).json({ message: "Mail failed" });
  }
});

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const sendMail = require("../utils/sendMail");

// // SEND FEEDBACK MAIL
// router.post("/send-feedback", async (req, res) => {
//   try {
//     const { email, report } = req.body;

//     if (!email) {
//       return res.status(400).json({ message: "Email required" });
//     }

//     const message = `
// 📊 Feedback Report

// Overall Performance:
// ${report.overallPerformance}

// Strengths:
// ${report.strengths}

// Weaknesses:
// ${report.weaknesses}

// Technical Evaluation:
// ${report.technicalEvaluation}

// Communication Skills:
// ${report.communicationSkills}

// Recommendation:
// ${report.recommendation}

// Verdict: ${report.verdict}
// `;

//     await sendMail(email, "Your Interview Feedback Report", message);

//     res.json({ success: true, message: "Email sent successfully" });

//   } catch (err) {
//     console.log("Mail error:", err);
//     res.status(500).json({ message: "Mail failed" });
//   }
// });

// module.exports = router;