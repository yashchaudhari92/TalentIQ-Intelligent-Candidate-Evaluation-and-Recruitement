const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: {
      type: String, // candidate’s cover letter/short note
      default: "",
    },
    status: {
      type: String,
      enum: ["applied", "reviewed", "shortlisted", "rejected", "hired"],
      default: "applied",
    },
    // ✅ Snapshot of candidate profile when they applied
    candidateSnapshot: {
      education: { type: Array, default: [] },
      skills: { type: Array, default: [] },
      experience: { type: Array, default: [] },
    },
    // ⭐ ADD
    fitScore: {
      type: Number,
      default: null, // 0–100
    },
    fitBreakdown: {
      matchedSkills: [String],
      missingSkills: [String],
      skillScore: Number,
      resumeScore: Number,
      experienceScore: Number,
      educationScore: Number,
    },
    // ⭐ ADD inside ApplicationSchema
    resumeUrl: { type: String, default: null },

    parsedResume: {
      summary: String,
      extractedSkills: [String],
      keywords: [String],
    },
    testScore: { type: Number, default: null },
    testPassed: { type: Boolean, default: false },

    feedbackReport: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", ApplicationSchema);



// const mongoose = require("mongoose");

// const ApplicationSchema = new mongoose.Schema(
//   {
//     job: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Job",
//       required: true,
//     },
//     candidate: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     note: {
//       type: String, // candidate’s cover letter/short note
//       default: "",
//     },
//     status: {
//       type: String,
//       enum: ["applied", "reviewed", "shortlisted", "rejected", "hired"],
//       default: "applied",
//     },
//     // ✅ Snapshot of candidate profile when they applied
//     candidateSnapshot: {
//       education: { type: Array, default: [] },
//       skills: { type: Array, default: [] },
//       experience: { type: Array, default: [] },
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Application", ApplicationSchema);

