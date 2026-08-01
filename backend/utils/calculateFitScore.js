module.exports = function calculateFitScore(job, candidate, parsedResume = {}) {
  const jobSkills = (job.skills || []).map(s => s.toLowerCase());
  const profileSkills = (candidate.skills || []).map(s => s.toLowerCase());
  const resumeSkills = (parsedResume.extractedSkills || []).map(s =>
    s.toLowerCase()
  );

  const matchedSkills = jobSkills.filter(
    s => profileSkills.includes(s) || resumeSkills.includes(s)
  );

  const missingSkills = jobSkills.filter(s => !matchedSkills.includes(s));

  const skillScore = jobSkills.length
    ? (matchedSkills.length / jobSkills.length) * 50
    : 0;

  const resumeScore = resumeSkills.length ? 25 : 0;
  const experienceScore = candidate.experience?.length ? 15 : 0;
  const educationScore = candidate.education?.length ? 10 : 0;

  const total = Math.round(
    skillScore + resumeScore + experienceScore + educationScore
  );

  return {
    total,
    breakdown: {
      matchedSkills,
      missingSkills,
      skillScore,
      resumeScore,
      experienceScore,
      educationScore,
    },
  };
};


// module.exports = function calculateFitScore(job, candidate, parsedResume) {
//   const jobSkills = (job.skills || []).map(s => s.toLowerCase());
//   const candidateSkills = (candidate.skills || []).map(s => s.toLowerCase());
//   const resumeSkills = (parsedResume?.extractedSkills || []).map(s => s.toLowerCase());

//   const matchedSkills = jobSkills.filter(s => candidateSkills.includes(s));
//   const missingSkills = jobSkills.filter(s => !candidateSkills.includes(s));

//   // Skill match (50)
//   const skillScore = jobSkills.length
//     ? (matchedSkills.length / jobSkills.length) * 50
//     : 0;

//   // Resume match (25)
//   const resumeMatched = jobSkills.filter(s => resumeSkills.includes(s));
//   const resumeScore = jobSkills.length
//     ? (resumeMatched.length / jobSkills.length) * 25
//     : 0;

//   // Experience (15)
//   const experienceScore = candidate.experience?.length ? 15 : 0;

//   // Education (10)
//   const educationScore = candidate.education?.length ? 10 : 0;

//   const total =
//     skillScore + resumeScore + experienceScore + educationScore;

//   return {
//     total: Math.round(total),
//     breakdown: {
//       skillMatch: Math.round(skillScore),
//       resumeMatch: Math.round(resumeScore),
//       experienceMatch: experienceScore,
//       educationMatch: educationScore,
//       matchedSkills,
//       missingSkills
//     }
//   };
// };
