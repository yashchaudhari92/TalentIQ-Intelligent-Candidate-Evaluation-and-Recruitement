module.exports = function calculateFinalFitScore({
  resumeFit = 0,
  aiRankScore = 0,
  testScore = null,
  aiInterviewScore = null,
}) {
  const weights = {
    resume: 0.30,
    aiRank: 0.20,
    test: 0.20,
    interview: 0.30,
  };

  let finalScore = 0;

  // ------------------------------
  // 🔹 RESUME SCORE
  // ------------------------------
  if (resumeFit !== null) {
    finalScore += resumeFit * weights.resume;
  }

  // ------------------------------
  // 🔹 AI RANK SCORE (optional)
  // ------------------------------
  if (aiRankScore !== null) {
    finalScore += aiRankScore * weights.aiRank;
  }

  // ------------------------------
  // 🔹 TEST SCORE (with adjustments)
  // ------------------------------
  if (testScore !== null) {
    let adjustedTest = testScore;

    if (testScore >= 80) adjustedTest += 5;   // bonus
    if (testScore < 40) adjustedTest -= 10;   // penalty

    adjustedTest = Math.max(0, Math.min(adjustedTest, 100));

    finalScore += adjustedTest * weights.test;
  }

  // ------------------------------
  // 🔹 AI INTERVIEW SCORE (most important)
  // ------------------------------
  if (aiInterviewScore !== null) {
    let adjustedInterview = aiInterviewScore;

    if (aiInterviewScore >= 85) adjustedInterview += 5;
    if (aiInterviewScore < 50) adjustedInterview -= 5;

    adjustedInterview = Math.max(0, Math.min(adjustedInterview, 100));

    finalScore += adjustedInterview * weights.interview;
  }

  // ------------------------------
  // 🔹 FINAL NORMALIZATION (FIXED SCALE → OUT OF 100)
  // ------------------------------
  return Math.round(Math.min(finalScore, 100));
};

// module.exports = function calculateFinalFitScore({
//   resumeFit = null,
//   aiRankScore = null,
//   testScore = null,
//   aiInterviewScore = null,
// }) {
//   let weights = {
//     resume: 0.30,
//     aiRank: 0.20,
//     test: 0.20,
//     interview: 0.30,
//   };

//   let score = 0;
//   let totalWeight = 0;

//   // ------------------------------
//   // 🔹 RESUME
//   // ------------------------------
//   if (resumeFit !== null) {
//     score += resumeFit * weights.resume;
//     totalWeight += weights.resume;
//   }

//   // ------------------------------
//   // 🔹 AI RANK (optional but same as resume now)
//   // ------------------------------
//   if (aiRankScore !== null) {
//     score += aiRankScore * weights.aiRank;
//     totalWeight += weights.aiRank;
//   }

//   // ------------------------------
//   // 🔹 TEST (BOOST IF PASSED)
//   // ------------------------------
//   if (testScore !== null) {
//     let adjustedTest = testScore;

//     if (testScore >= 80) adjustedTest += 5; // bonus
//     if (testScore < 40) adjustedTest -= 10; // penalty

//     score += adjustedTest * weights.test;
//     totalWeight += weights.test;
//   }

//   // ------------------------------
//   // 🔹 INTERVIEW (MOST IMPORTANT)
//   // ------------------------------
//   if (aiInterviewScore !== null) {
//     let adjustedInterview = aiInterviewScore;

//     if (aiInterviewScore >= 85) adjustedInterview += 5;
//     if (aiInterviewScore < 50) adjustedInterview -= 5;

//     score += adjustedInterview * weights.interview;
//     totalWeight += weights.interview;
//   }

//   // ------------------------------
//   // 🔹 NORMALIZE
//   // ------------------------------
//   if (totalWeight === 0) return 0;

//   const finalScore = score / totalWeight;

//   return Math.round(Math.min(finalScore, 100));
// };

// module.exports = function calculateFinalFitScore({
//   resumeFit = 0,
//   aiRankScore = 0,
//   testScore = null,
//   aiInterviewScore = null,
// }) {
//   let weights = {
//     resume: 0.30,
//     aiRank: 0.25,
//     test: 0.20,
//     interview: 0.25,
//   };

//   let activeWeight = 0;

//   if (resumeFit !== null) activeWeight += weights.resume;
//   if (aiRankScore !== null) activeWeight += weights.aiRank;
//   if (testScore !== null) activeWeight += weights.test;
//   if (aiInterviewScore !== null) activeWeight += weights.interview;

//   const normalize = (w) => (activeWeight ? w / activeWeight : 0);

//   const finalScore =
//     (resumeFit || 0) * normalize(weights.resume) +
//     (aiRankScore || 0) * normalize(weights.aiRank) +
//     (testScore || 0) * normalize(weights.test) +
//     (aiInterviewScore || 0) * normalize(weights.interview);

//   return Math.round(finalScore);
// };
