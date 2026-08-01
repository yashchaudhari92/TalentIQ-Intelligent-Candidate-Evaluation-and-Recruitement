// backend/routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Interview = require("../models/Interview");
const Candidate = require("../models/Candidate");
const TestResult = require("../models/TestResult");

// helpers
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function monthKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`; // e.g. 2026-01
}

function safeSkillArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .flatMap((s) => (typeof s === "string" ? s.split(",") : []))
    .map((s) => s.trim())
    .filter(Boolean);
}

// =========================
// CANDIDATE DASHBOARD
// =========================
router.get(
  "/candidate",
  protect,
  authorizeRoles("candidate"),
  async (req, res) => {
    try {
      const userId = req.user._id;

      // 1) Jobs list (same as Jobs tab)
      const jobs = await Job.find().sort({ createdAt: -1 });

      // 2) Candidate profile for skill match
      const profile = await Candidate.findOne({ userId });

      const candidateSkills = safeSkillArray(profile?.skills || profile?.parsedData?.extractedSkills || []);

      // 3) Applications + job populate
      const applications = await Application.find({ candidate: userId })
        .populate("job", "title skills location salary status createdAt")
        .sort({ createdAt: -1 });

      // 4) Interviews count
      const interviews = await Interview.find({ candidateId: userId }).sort({ createdAt: -1 });

      // 5) Enhance applications: test score + match % + resume score
      const enhancedApps = await Promise.all(
        applications.map(async (app) => {
          const job = app.job;
          const jobSkills = safeSkillArray(job?.skills || []);
          const matched = jobSkills.filter((s) =>
            candidateSkills.map((x) => x.toLowerCase()).includes(s.toLowerCase())
          );
          const matchPercent = jobSkills.length
            ? Math.round((matched.length / jobSkills.length) * 100)
            : 0;

          // test score from TestResult (source of truth)
          const tr = await TestResult.findOne({
            jobId: job?._id,
            candidateId: userId,
          });

          // simple resume summary score (baseline heuristic)
          // (If you want AI scoring later, we can connect python service)
          const summaryLen = (app.parsedResume?.summary || "").trim().length;
          const resumeScore = Math.min(100, Math.round((summaryLen / 600) * 100)); // 0..100

          // interviews for this job (if interview has jobId)
          const interviewCountForJob = interviews.filter((i) => String(i.jobId) === String(job?._id)).length;

          return {
            _id: app._id,
            status: app.status,
            createdAt: app.createdAt,
            note: app.note,
            resumeUrl: app.resumeUrl,
            parsedResume: app.parsedResume,
            job: job,
            testTaken: !!tr,
            testScore: tr?.score ?? null,
            testPassed: tr?.passed ?? false,
            profileMatch: matchPercent,
            resumeScore,
            interviewsGivenForThisJob: interviewCountForJob,
          };
        })
      );

      // 6) Apply stats (last 7/30 days + monthly trend)
      const last7 = enhancedApps.filter((a) => new Date(a.createdAt) >= daysAgo(7)).length;
      const last30 = enhancedApps.filter((a) => new Date(a.createdAt) >= daysAgo(30)).length;

      const monthlyTrendMap = {};
      enhancedApps.forEach((a) => {
        const k = monthKey(a.createdAt);
        monthlyTrendMap[k] = (monthlyTrendMap[k] || 0) + 1;
      });

      const monthlyTrend = Object.keys(monthlyTrendMap)
        .sort()
        .map((k) => ({ month: k, count: monthlyTrendMap[k] }));

      // 7) status breakdown
      const statusBreakdown = enhancedApps.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {});

      res.json({
        jobs,
        applications: enhancedApps,
        stats: {
          totalApplied: enhancedApps.length,
          last7,
          last30,
          statusBreakdown,
          monthlyTrend,
          totalInterviews: interviews.length,
        },
        tips: [
          {
            title: "Resume: Make it ATS-friendly",
            bullets: [
              "Use simple headings: Skills, Projects, Experience, Education",
              "Add measurable impact: ‘reduced load time by 30%’",
              "Keep 1 page if fresher; 2 pages max",
            ],
          },
          {
            title: "How to approach HR",
            bullets: [
              "Send a short message with role + 2 strengths + portfolio link",
              "Follow up after 3–4 days politely",
              "Keep subject clear: ‘Application: MERN Developer – Yash’",
            ],
          },
        ],
      });
    } catch (err) {
      console.error("candidate dashboard error:", err);
      res.status(500).json({ message: "Dashboard load failed", error: err.message });
    }
  }
);

// =========================
// RECRUITER DASHBOARD
// =========================
router.get(
  "/recruiter",
  protect,
  authorizeRoles("recruiter"),
  async (req, res) => {
    try {
      const recruiterId = req.user._id;

      // jobs created by recruiter
      const jobs = await Job.find({ createdBy: recruiterId }).sort({ createdAt: -1 });

      const jobIds = jobs.map((j) => j._id);

      // all applications for those jobs
      const applications = await Application.find({ job: { $in: jobIds } });

      // interviews for those jobs
      const interviews = await Interview.find({ jobId: { $in: jobIds } });

      // applications per job
      const appsPerJob = {};
      applications.forEach((a) => {
        const id = String(a.job);
        appsPerJob[id] = (appsPerJob[id] || 0) + 1;
      });

      // interviews per job
      const interviewsPerJob = {};
      interviews.forEach((i) => {
        const id = String(i.jobId);
        interviewsPerJob[id] = (interviewsPerJob[id] || 0) + 1;
      });

      // job created stats
      const last7 = jobs.filter((j) => new Date(j.createdAt) >= daysAgo(7)).length;
      const last30 = jobs.filter((j) => new Date(j.createdAt) >= daysAgo(30)).length;

      const monthlyTrendMap = {};
      jobs.forEach((j) => {
        const k = monthKey(j.createdAt);
        monthlyTrendMap[k] = (monthlyTrendMap[k] || 0) + 1;
      });

      const monthlyTrend = Object.keys(monthlyTrendMap)
        .sort()
        .map((k) => ({ month: k, count: monthlyTrendMap[k] }));

      // build chart-ready job table
      const jobInsights = jobs.map((j) => ({
        jobId: j._id,
        title: j.title,
        status: j.status,
        applications: appsPerJob[String(j._id)] || 0,
        interviews: interviewsPerJob[String(j._id)] || 0,
        createdAt: j.createdAt,
      }));

      res.json({
        jobs: jobInsights,
        stats: {
          totalJobs: jobs.length,
          last7,
          last30,
          totalApplications: applications.length,
          totalInterviews: interviews.length,
          monthlyTrend,
        },
      });
    } catch (err) {
      console.error("recruiter dashboard error:", err);
      res.status(500).json({ message: "Dashboard load failed", error: err.message });
    }
  }
);

module.exports = router;
