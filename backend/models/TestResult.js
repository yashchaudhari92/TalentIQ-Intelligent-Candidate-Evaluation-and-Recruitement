const mongoose = require("mongoose");

const TestResultSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },

    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Stores [{ questionIndex: 0, answer: "some text" }]
    answers: [
      {
        questionIndex: Number,
        answer: String
      }
    ],

    score: { type: Number, required: true },
    passed: { type: Boolean, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestResult", TestResultSchema);
