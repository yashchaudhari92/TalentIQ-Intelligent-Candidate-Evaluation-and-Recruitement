const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cloudinary = require('../config/cloudinary.js');

const Candidate = require('../models/Candidate.js');
const { protect, authorizeRoles } = require('../middleware/authMiddleware.js');

// ================= Multer Configuration ==================
// Keep uploaded resume temporarily in memory.
// It will NOT be stored on the Render local filesystem.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
});

// ================= Upload Buffer to Cloudinary ==================
const uploadResumeToCloudinary = (buffer, originalName) => {
  return new Promise((resolve, reject) => {
    const fileNameWithoutExtension = originalName
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9-_]/g, '_');

    const uniquePublicId = `${Date.now()}-${fileNameWithoutExtension}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'talentiq/resumes',
        resource_type: 'raw',
        public_id: uniquePublicId
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
};

// ================= Upload Resume & Call Python AI Service ==================
router.post(
  '/upload-resume',
  protect,
  authorizeRoles('candidate'),
  upload.single('resume'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: 'No file uploaded'
        });
      }

      // ============================================================
      // 1. Upload Resume to Cloudinary
      // ============================================================
      let resumeUrl = null;

      try {
        const cloudinaryResult = await uploadResumeToCloudinary(
          req.file.buffer,
          req.file.originalname
        );

        resumeUrl = cloudinaryResult.secure_url;

        console.log('✅ Resume uploaded to Cloudinary:', resumeUrl);
      } catch (cloudinaryError) {
        console.error('❌ Cloudinary resume upload failed:', cloudinaryError);

        return res.status(500).json({
          message: 'Resume upload failed',
          error: cloudinaryError?.message || cloudinaryError
        });
      }

      // ============================================================
      // 2. Call Python AI Service for Resume Parsing
      // ============================================================
      const formData = new FormData();

      formData.append('file', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });

      let parsedData = {};

      try {
        /*
         * Local development:
         * AI_SERVICE_URL=http://localhost:5000
         *
         * Production:
         * AI_SERVICE_URL=https://talentiq-ai-211a.onrender.com
         */
        const aiServiceUrl =
          process.env.AI_SERVICE_URL || 'http://localhost:5000';

        const aiResponse = await axios.post(
          `${aiServiceUrl}/parse-resume`,
          formData,
          {
            headers: formData.getHeaders()
          }
        );

        parsedData = aiResponse.data || {};
      } catch (err) {
        console.error(
          '⚠️ Error calling Python /parse-resume:',
          err.message
        );

        // Preserve existing fallback behavior
        parsedData = {
          summary: 'Resume parsed (AI unavailable)',
          extractedSkills: []
        };
      }

      // ============================================================
      // 3. Merge Parsed Skills With Existing Candidate Skills
      // ============================================================
      const candidate = await Candidate.findOne({
        userId: req.user._id
      });

      const existingSkills = candidate?.skills || [];

      const newSkills = parsedData.extractedSkills || [];

      const mergedSkills = Array.from(
        new Set([...existingSkills, ...newSkills])
      );

      // ============================================================
      // 4. Save / Update Candidate
      // ============================================================
      const updatedCandidate = await Candidate.findOneAndUpdate(
        { userId: req.user._id },
        {
          name: req.user.name,
          email: req.user.email,
          resumeUrl,
          parsedData,
          skills: mergedSkills
        },
        {
          new: true,
          upsert: true
        }
      );

      // ============================================================
      // 5. Same Response Structure As Before
      // ============================================================
      res.status(200).json({
        success: true,
        message: 'Resume uploaded & parsed successfully',
        candidate: updatedCandidate
      });
    } catch (err) {
      console.error('❌ Error in /upload-resume:', err);

      res.status(500).json({
        message: 'Upload or parsing failed',
        error: err.message
      });
    }
  }
);

// ================= Get Candidate Profile ==================
router.get(
  '/profile',
  protect,
  authorizeRoles('candidate'),
  async (req, res) => {
    try {
      let candidate = await Candidate.findOne({
        userId: req.user._id
      });

      if (!candidate) {
        candidate = await Candidate.create({
          userId: req.user._id,
          name: req.user.name,
          email: req.user.email,
          education: [],
          skills: [],
          experience: [],
          resumeUrl: null,
          parsedData: {}
        });
      }

      return res.json(candidate);
    } catch (err) {
      console.error('Error in GET /profile:', err);

      res.status(500).json({
        message: 'Error fetching profile',
        error: err.message
      });
    }
  }
);

// ================= Update Candidate Profile ==================
router.put(
  '/profile',
  protect,
  authorizeRoles('candidate'),
  async (req, res) => {
    try {
      const {
        education,
        skills,
        experience
      } = req.body;

      const candidate = await Candidate.findOneAndUpdate(
        { userId: req.user._id },
        {
          education,
          skills,
          experience
        },
        {
          new: true
        }
      );

      if (!candidate) {
        return res.status(404).json({
          message: 'Profile not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        candidate
      });
    } catch (err) {
      res.status(500).json({
        message: 'Profile update failed',
        error: err.message
      });
    }
  }
);

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const path = require('path');
// const multer = require('multer');
// const fs = require('fs');
// const axios = require('axios');
// const FormData = require('form-data');
// const Candidate = require('../models/Candidate.js');
// const { protect, authorizeRoles } = require('../middleware/authMiddleware.js');

// const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     const uniqueName = Date.now() + '-' + file.originalname;
//     cb(null, uniqueName);
//   }
// });
// const upload = multer({ storage });

// // ================= Upload Resume & Call Python AI Service ==================
// router.post(
//   '/upload-resume',
//   protect,
//   authorizeRoles('candidate'),
//   upload.single('resume'),
//   async (req, res) => {
//     try {
//       if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

//       const localPath = path.join(uploadDir, req.file.filename);
//       const resumeUrl = `/uploads/resumes/${req.file.filename}`;

//       // ---- Call Python microservice for parsing ----
//       const formData = new FormData();
//       formData.append('file', fs.createReadStream(localPath));

//       let parsedData = {};
//       try {
//         const aiResponse = await axios.post(
//           'http://localhost:5000/parse-resume',
//           formData,
//           { headers: formData.getHeaders() }
//         );
//         parsedData = aiResponse.data || {};
//       } catch (err) {
//         console.error("⚠️ Error calling Python /parse-resume:", err.message);
//         parsedData = { summary: "Resume parsed (AI unavailable)", extractedSkills: [] };
//       }

//       // ---- Merge parsed skills with existing candidate skills ----
//       const candidate = await Candidate.findOne({ userId: req.user._id });
//       const existingSkills = candidate?.skills || [];

//       const newSkills = parsedData.extractedSkills || [];
//       const mergedSkills = Array.from(new Set([...existingSkills, ...newSkills]));

//       // ---- Save/update candidate ----
//       const updatedCandidate = await Candidate.findOneAndUpdate(
//         { userId: req.user._id },
//         {
//           name: req.user.name,
//           email: req.user.email,
//           resumeUrl,
//           parsedData,
//           skills: mergedSkills
//         },
//         { new: true, upsert: true }
//       );

//       res.status(200).json({
//         success: true,
//         message: 'Resume uploaded & parsed successfully',
//         candidate: updatedCandidate
//       });
//     } catch (err) {
//       console.error("❌ Error in /upload-resume:", err);
//       res.status(500).json({ message: 'Upload or parsing failed', error: err.message });
//     }
//   }
// );

// // ================= Get Candidate Profile ==================
// router.get(
//   '/profile',
//   protect,
//   authorizeRoles('candidate'),
//   async (req, res) => {
//     try {
//       let candidate = await Candidate.findOne({ userId: req.user._id });
//       if (!candidate) {
//         candidate = await Candidate.create({
//           userId: req.user._id,
//           name: req.user.name,
//           email: req.user.email,
//           education: [],
//           skills: [],
//           experience: [],
//           resumeUrl: null,
//           parsedData: {}
//         });
//       }
//       return res.json(candidate);
//     } catch (err) {
//       console.error("Error in GET /profile:", err);
//       res.status(500).json({ message: 'Error fetching profile', error: err.message });
//     }
//   }
// );

// // ================= Update Candidate Profile ==================
// router.put(
//   '/profile',
//   protect,
//   authorizeRoles('candidate'),
//   async (req, res) => {
//     try {
//       const { education, skills, experience } = req.body;
//       const candidate = await Candidate.findOneAndUpdate(
//         { userId: req.user._id },
//         { education, skills, experience },
//         { new: true }
//       );
//       if (!candidate) return res.status(404).json({ message: 'Profile not found' });
//       res.json({ success: true, message: 'Profile updated successfully', candidate });
//     } catch (err) {
//       res.status(500).json({ message: 'Profile update failed', error: err.message });
//     }
//   }
// );

// module.exports = router;
