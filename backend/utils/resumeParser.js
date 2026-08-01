// const fs = require('fs');
// const path = require('path');
// const pdf = require('pdf-parse');
// const natural = require('natural');

// // simple keyword dictionary for skills (you can expand this)
// const SKILL_KEYWORDS = [
//   "javascript", "node", "react", "express", "mongodb",
//   "python", "java", "c++", "machine learning", "ai",
//   "html", "css", "docker", "aws", "git"
// ];

// // Helper function to extract keywords
// function extractKeywords(text) {
//   const tokenizer = new natural.WordTokenizer();
//   const words = tokenizer.tokenize(text.toLowerCase());
//   const freq = {};
//   words.forEach(w => {
//     if (!natural.stopwords.includes(w) && w.length > 2) {
//       freq[w] = (freq[w] || 0) + 1;
//     }
//   });

//   // top 15 frequent words as keywords
//   return Object.entries(freq)
//     .sort((a, b) => b[1] - a[1])
//     .slice(0, 15)
//     .map(([word]) => word);
// }

// // ----------- Helper to detect skills from dictionary ----------
// function extractSkills(text) {
//   const lower = text.toLowerCase();
//   return SKILL_KEYWORDS.filter(skill => lower.includes(skill));
// }

// // ----------- Helper to guess experience summary ----------
// function extractSummary(text) {
//   // crude summary: first 3 sentences
//   const sentences = text.split(/[\.\n]/).filter(s => s.trim().length > 0);
//   return sentences.slice(0, 3).join(". ") + ".";
// }

// /**
//  * Parse resume PDF and return structured data
//  * @param {string} filePath relative path like "/uploads/resumes/filename.pdf"
//  */
// async function parseResume(filePath) {
//   const absolute = path.join(__dirname, "..", filePath);
//   const pdfBuffer = fs.readFileSync(absolute);
//   const data = await pdf(pdfBuffer);
//   const text = data.text;

//   return {
//     keywords: extractKeywords(text),
//     extractedSkills: extractSkills(text),
//     summary: extractSummary(text)
//   };
// }

// module.exports = { parseResume };
