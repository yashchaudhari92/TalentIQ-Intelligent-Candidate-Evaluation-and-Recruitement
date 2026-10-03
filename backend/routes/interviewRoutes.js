const express = require("express");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const dotenv = require("dotenv");
const LiveInterview = require("../models/LiveInterview");

dotenv.config();

const router = express.Router();

/* ==================================================
   CREATE LIVE INTERVIEW (Daily.co)
================================================== */
router.post("/create", async (req, res) => {
  try {
    const { jobId, candidateId, recruiterId } = req.body;

    if (!jobId || !candidateId || !recruiterId) {
      return res.status(400).json({
        success: false,
        message: "jobId, candidateId and recruiterId are required",
      });
    }

    const sessionId = uuidv4();

    // Create Daily.co room
    const dailyRes = await axios.post(
      "https://api.daily.co/v1/rooms",
      {
        name: sessionId,
        properties: {
          enable_chat: true,
          enable_screenshare: true,
          start_audio_off: false,
          start_video_off: false,
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Save interview
    const interview = await LiveInterview.create({
      jobId,
      recruiterId,
      candidateId,
      sessionId,
      roomUrl: dailyRes.data.url,
      status: "scheduled",
    });

    res.status(201).json({
      success: true,
      sessionId,
      roomUrl: interview.roomUrl,
      interview,
    });
  } catch (error) {
    console.error(
      "[Live Interview Create Error]",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to create live interview",
    });
  }
});

/* ==================================================
   GET LIVE INTERVIEW
================================================== */
router.get("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const interview = await LiveInterview.findOne({ sessionId });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Live interview not found",
      });
    }

    res.json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error("[Get Interview Error]", error);

    res.status(500).json({
      success: false,
    });
  }
});

module.exports = router;



// const express = require("express");
// const fs = require("fs");
// const path = require("path");
// const { v4: uuidv4 } = require("uuid");
// const axios = require("axios");
// const dotenv = require("dotenv");
// const LiveInterview = require("../models/LiveInterview");

// dotenv.config();
// const router = express.Router();

// // --------------------------------------------------
// // Ensure uploads directory exists
// // --------------------------------------------------
// const UPLOAD_DIR = path.join(
//   __dirname,
//   "..",
//   process.env.BASE_UPLOAD_PATH || "uploads/interviews"
// );

// if (!fs.existsSync(UPLOAD_DIR)) {
//   fs.mkdirSync(UPLOAD_DIR, { recursive: true });
// }

// /* ==================================================
//    1️⃣ CREATE LIVE INTERVIEW (Daily.co)
// ================================================== */
// router.post("/create", async (req, res) => {
//   try {
//     const { jobId, candidateId, recruiterId } = req.body;

//     if (!jobId || !candidateId || !recruiterId) {
//       return res.status(400).json({
//         success: false,
//         message: "jobId, candidateId and recruiterId are required",
//       });
//     }

//     const sessionId = uuidv4();

//     // ✅ Create Daily.co room
//     const dailyRes = await axios.post(
//       "https://api.daily.co/v1/rooms",
//       {
//         name: sessionId,
//         properties: {
//           enable_chat: true,
//           enable_screenshare: true,
//           start_audio_off: false,
//           start_video_off: false,
//           exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
//         },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     // ✅ Save Live Interview
//     const interview = await LiveInterview.create({
//       jobId,
//       recruiterId,
//       candidateId,
//       sessionId,
//       roomUrl: dailyRes.data.url,
//       status: "scheduled",
//     });

//     res.status(201).json({
//       success: true,
//       sessionId,
//       roomUrl: interview.roomUrl,
//       interview,
//     });
//   } catch (error) {
//     console.error("[Live Interview Create Error]", error.response?.data || error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create live interview",
//     });
//   }
// });

// /* ==================================================
//    2️⃣ UPLOAD VIDEO CHUNKS (OPTIONAL RECORDING)
// ================================================== */
// router.post("/upload-chunk/:sessionId", async (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const chunkDir = path.join(UPLOAD_DIR, sessionId);

//     if (!fs.existsSync(chunkDir)) {
//       fs.mkdirSync(chunkDir, { recursive: true });
//     }

//     const chunkFile = `${Date.now()}_${Math.random()
//       .toString(36)
//       .slice(2)}.webm`;

//     const chunkPath = path.join(chunkDir, chunkFile);
//     const writeStream = fs.createWriteStream(chunkPath);

//     req.pipe(writeStream);

//     req.on("end", () => {
//       res.json({ success: true, message: "Chunk uploaded" });
//     });
//   } catch (error) {
//     console.error("[Upload Chunk Error]", error);
//     res.status(500).json({ success: false });
//   }
// });

// /* ==================================================
//    3️⃣ FINALIZE RECORDING
// ================================================== */
// router.post("/finalize/:sessionId", async (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const chunkDir = path.join(UPLOAD_DIR, sessionId);
//     const outputPath = path.join(UPLOAD_DIR, `${sessionId}.webm`);

//     if (!fs.existsSync(chunkDir)) {
//       return res.status(404).json({
//         success: false,
//         message: "No chunks found",
//       });
//     }

//     const files = fs.readdirSync(chunkDir).sort();
//     const writeStream = fs.createWriteStream(outputPath);

//     for (const file of files) {
//       writeStream.write(fs.readFileSync(path.join(chunkDir, file)));
//       fs.unlinkSync(path.join(chunkDir, file));
//     }

//     writeStream.end();
//     fs.rmdirSync(chunkDir);

//     await LiveInterview.findOneAndUpdate(
//       { sessionId },
//       { status: "completed", recordingPath: outputPath }
//     );

//     res.json({ success: true, outputPath });
//   } catch (error) {
//     console.error("[Finalize Error]", error);
//     res.status(500).json({ success: false });
//   }
// });

// /* ==================================================
//    4️⃣ GET LIVE INTERVIEW BY SESSION ID
// ================================================== */
// router.get("/:sessionId", async (req, res) => {
//   try {
//     const { sessionId } = req.params;

//     const interview = await LiveInterview.findOne({ sessionId });
//     if (!interview) {
//       return res.status(404).json({
//         success: false,
//         message: "Live interview not found",
//       });
//     }

//     res.json({
//       success: true,
//       interview,
//     });
//   } catch (error) {
//     console.error("[Get Interview Error]", error);
//     res.status(500).json({ success: false });
//   }
// });

// module.exports = router;
