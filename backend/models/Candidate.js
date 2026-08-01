const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  education: [{ degree: String, institution: String, year: String }],
  skills: [String],
  experience: [{ company: String, role: String, years: Number }],
  resumeUrl: { type: String }, 
  parsedData: {
    keywords: [String],
    extractedSkills: [String],
    summary: String
  }
}, { timestamps: true });

module.exports = mongoose.model("Candidate", candidateSchema);