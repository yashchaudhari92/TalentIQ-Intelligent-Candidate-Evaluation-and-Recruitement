const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: false, // ✅ optional
    default: null,
  },

  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  sessionId: {
    type: String,
    required: true,
    unique: true,
  },

  status: {
    type: String,
    enum: ["scheduled", "in-progress", "completed", "canceled"],
    default: "scheduled",
  },

  recordingPath: {
    type: String,
  },

  proctoringData: {
    type: Array,
    default: [],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Interview", InterviewSchema);


// const mongoose = require("mongoose");

// const InterviewSchema = new mongoose.Schema({
//   jobId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Job",
//     required: false, // ✅ make optional
//     default: null,
//   },
//   recruiterId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//   },
//   candidateId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   sessionId: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   roomUrl: {
//     type: String,
//     required: false,
//   },
//   status: {
//     type: String,
//     enum: ["scheduled", "in-progress", "completed", "canceled"],
//     default: "scheduled",
//   },
//   recordingPath: {
//     type: String,
//   },
//   proctoringData: {
//     type: Array,
//     default: [],
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },


// });

// module.exports = mongoose.model("Interview", InterviewSchema);


