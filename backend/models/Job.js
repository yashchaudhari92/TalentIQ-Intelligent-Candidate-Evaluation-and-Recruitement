const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: {
      type: [String], // Array of requirements
      default: [],
    },
    skills: {
      type: [String], // Array of required skills
      default: [],
    },
    location: {
      type: String,
      default: "Remote",
    },
    salary: {
      type: String, // Can store as range "40k-60k" or number
      default: "Not disclosed",
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    
    // ⭐ NEW
    testRequired: { type: Boolean, default: false },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Recruiter who created the job
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);
