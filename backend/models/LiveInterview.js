const mongoose = require("mongoose");

const LiveInterviewSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },

  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
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

  roomUrl: {
    type: String,
    required: true, // ✅ ONLY LIVE INTERVIEW NEEDS THIS
  },

  status: {
    type: String,
    enum: ["scheduled", "in-progress", "completed", "canceled"],
    default: "scheduled",
  },

  recordingPath: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("LiveInterview", LiveInterviewSchema);
