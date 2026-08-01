module.exports = function calculateAIInterviewScore(interview) {
  if (!interview || !Array.isArray(interview.proctoringData)) {
    return null;
  }

  // ------------------------------
  // 🔹 GET EVENTS
  // ------------------------------
  const answerEvents = interview.proctoringData.filter(
    (e) => e.type === "answer_analysis"
  );

  const recordedEvents = interview.proctoringData.filter(
    (e) => e.type === "answer_saved"
  );

  // ------------------------------
  // ❌ STRICT CONDITION
  // ------------------------------
  if (recordedEvents.length === 0 || answerEvents.length === 0) {
    return null; // ❗ BOTH required
  }

  // ------------------------------
  // 🔹 VALIDATE COUNT MATCH (IMPORTANT)
  // ------------------------------
  const validAnswers = Math.min(answerEvents.length, recordedEvents.length);

  if (validAnswers < 2) {
    return null; // ❗ avoid fake scoring
  }

  // ------------------------------
  // 🔹 ANSWER SCORE
  // ------------------------------
  const totalAnswerScore = answerEvents
    .slice(0, validAnswers)
    .reduce((sum, e) => sum + (e.score || 0), 0);

  const avgAnswerScore = totalAnswerScore / validAnswers;

  // ------------------------------
  // 🔹 COMPLETION FACTOR
  // ------------------------------
  const completionFactor = Math.min(validAnswers / 8, 1);

  // ------------------------------
  // 🔹 BEHAVIOR SCORE
  // ------------------------------
  let behaviorScore = 100;
  let counts = {};

  interview.proctoringData.forEach((event) => {
    const type = event.type;
    counts[type] = (counts[type] || 0) + 1;

    let penalty = 0;

    switch (type) {
      case "face_missing":
        penalty = 3 * counts[type];
        break;
      case "multiple_faces":
        penalty = 6 * counts[type];
        break;
      case "phone_detected":
        penalty = 10 * counts[type];
        break;
      case "tab_switch":
        penalty = 1.5 * counts[type];
        break;
      case "interview_terminated":
        penalty = 30;
        break;
      default:
        penalty = 1 * counts[type];
    }

    behaviorScore -= penalty;
  });

  behaviorScore = Math.max(behaviorScore, 40);

  // ------------------------------
  // 🔹 CONSISTENCY BONUS
  // ------------------------------
  let consistencyBonus = 0;

  if (validAnswers >= 5) {
    const scores = answerEvents.slice(0, validAnswers).map((e) => e.score || 0);

    const variance =
      scores.reduce((sum, s) => sum + Math.pow(s - avgAnswerScore, 2), 0) /
      scores.length;

    if (variance < 50) consistencyBonus = 5;
  }

  // ------------------------------
  // 🔹 FINAL SCORE
  // ------------------------------
  const finalScore =
    avgAnswerScore * 0.7 * completionFactor +
    behaviorScore * 0.25 +
    consistencyBonus;

  return Math.round(Math.min(finalScore, 100));
};

// module.exports = function calculateAIInterviewScore(interview) {
//   if (!interview || !Array.isArray(interview.proctoringData)) {
//     return null;
//   }

//   // ------------------------------
//   // 🔹 ANSWER EVENTS
//   // ------------------------------
//   const answerEvents = interview.proctoringData.filter(
//     (e) => e.type === "answer_analysis"
//   );

//   // ❌ NO ANSWERS → NO SCORE
//   if (answerEvents.length === 0) {
//     return null;
//   }

//   // ------------------------------
//   // 🔹 ANSWER SCORE (BASE)
//   // ------------------------------
//   const totalAnswerScore = answerEvents.reduce(
//     (sum, e) => sum + (e.score || 0),
//     0
//   );

//   const avgAnswerScore = totalAnswerScore / answerEvents.length;

//   // ------------------------------
//   // 🔹 INCOMPLETE INTERVIEW PENALTY
//   // ------------------------------
//   let completionFactor = 1;

//   if (answerEvents.length < 3) {
//     completionFactor = 0.4; // heavy penalty
//   } else if (answerEvents.length < 5) {
//     completionFactor = 0.7; // medium penalty
//   } else {
//     completionFactor = Math.min(answerEvents.length / 8, 1); // ideal 8 Qs
//   }

//   // ------------------------------
//   // 🔹 BEHAVIOR SCORING
//   // ------------------------------
//   let behaviorScore = 100;
//   let counts = {};

//   interview.proctoringData.forEach((event) => {
//     const type = event.type;
//     counts[type] = (counts[type] || 0) + 1;

//     let penalty = 0;

//     switch (type) {
//       case "face_missing":
//         penalty = 3 * counts[type];
//         break;

//       case "multiple_faces":
//         penalty = 6 * counts[type];
//         break;

//       case "phone_detected":
//         penalty = 10 * counts[type];
//         break;

//       case "tab_switch":
//         penalty = 1.5 * counts[type];
//         break;

//       case "interview_terminated":
//         penalty = 30;
//         break;

//       default:
//         penalty = 1 * counts[type];
//     }

//     behaviorScore -= penalty;
//   });

//   behaviorScore = Math.max(behaviorScore, 40);

//   // ------------------------------
//   // 🔹 CONSISTENCY BONUS
//   // ------------------------------
//   let consistencyBonus = 0;

//   if (answerEvents.length >= 5) {
//     const scores = answerEvents.map((e) => e.score || 0);

//     const variance =
//       scores.reduce((sum, s) => sum + Math.pow(s - avgAnswerScore, 2), 0) /
//       scores.length;

//     if (variance < 50) consistencyBonus = 5;
//   }

//   // ------------------------------
//   // 🔹 FINAL SCORE
//   // ------------------------------
//   const finalScore =
//     avgAnswerScore * 0.7 * completionFactor + // main logic
//     behaviorScore * 0.25 +                    // behavior impact
//     consistencyBonus;                         // bonus

//   return Math.round(Math.min(finalScore, 100));
// };

// module.exports = function calculateAIInterviewScore(interview) {
//   if (!interview || !Array.isArray(interview.proctoringData)) {
//     return null;
//   }

//   let behaviorScore = 100;
//   let counts = {};

//   // ------------------------------
//   // 🔹 BEHAVIOR SCORING (LESS HARSH)
//   // ------------------------------
//   interview.proctoringData.forEach((event) => {
//     const type = event.type;
//     counts[type] = (counts[type] || 0) + 1;

//     let penalty = 0;

//     switch (type) {
//       case "face_missing":
//         penalty = 3 * counts[type];
//         break;

//       case "multiple_faces":
//         penalty = 6 * counts[type];
//         break;

//       case "phone_detected":
//         penalty = 10 * counts[type];
//         break;

//       case "tab_switch":
//         penalty = 1.5 * counts[type];
//         break;

//       case "interview_terminated":
//         penalty = 30;
//         break;

//       default:
//         penalty = 1 * counts[type];
//     }

//     behaviorScore -= penalty;
//   });

//   behaviorScore = Math.max(behaviorScore, 20); // never 0 → realistic

//   // ------------------------------
//   // 🔹 ANSWER QUALITY (MAIN FOCUS)
//   // ------------------------------
//   const answerEvents = interview.proctoringData.filter(
//     (e) => e.type === "answer_analysis"
//   );

//   let answerScore = 0;

//   if (answerEvents.length > 0) {
//     const total = answerEvents.reduce((sum, e) => sum + (e.score || 0), 0);
//     answerScore = total / answerEvents.length;
//   }

//   // ------------------------------
//   // 🔹 CONSISTENCY BONUS
//   // ------------------------------
//   let consistencyBonus = 0;

//   if (answerEvents.length >= 5) {
//     const scores = answerEvents.map((e) => e.score || 0);
//     const variance =
//       scores.reduce((sum, s) => sum + Math.pow(s - answerScore, 2), 0) /
//       scores.length;

//     if (variance < 50) consistencyBonus = 5; // stable answers
//   }

//   // ------------------------------
//   // 🔹 FINAL SCORE (ANSWERS HEAVY)
//   // ------------------------------
//   const finalScore =
//     behaviorScore * 0.25 +   // ↓ reduced
//     answerScore * 0.70 +     // ↑ main
//     consistencyBonus;        // bonus

//   return Math.round(Math.min(finalScore, 100));
// };
