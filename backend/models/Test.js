const mongoose = require("mongoose");

const TestSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },

  questions: [
    {
      question: { type: String, required: true },
      correctAnswer: { type: String, required: true }
    }
  ],

  passScore: { type: Number, default: 50 }
});

module.exports = mongoose.model("Test", TestSchema);
