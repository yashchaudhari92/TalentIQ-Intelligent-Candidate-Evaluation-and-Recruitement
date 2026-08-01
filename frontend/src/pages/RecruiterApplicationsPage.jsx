import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import TopCandidatesFilter from "../components/TopCandidatesFilter";
import {
  FiArrowLeft, FiFileText, FiVideo, FiCpu,
  FiCheckCircle, FiUser, FiBarChart2
} from "react-icons/fi";

export default function RecruiterApplicationsPage() {
  const { jobId } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [finalScores, setFinalScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [filteredApplications, setFilteredApplications] = useState(null);
  const [rankMap, setRankMap] = useState({});
  const [msg, setMsg] = useState("");
  const [selectedSummary, setSelectedSummary] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const fetchApplications = async () => {
    try {
      const res = await API.get(`/applications/job/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(res.data);
      return res.data;
    } catch {
      setMsg("❌ Failed to load applications");
    }
  };

  const fetchInterviews = async () => {
    try {
      const res = await API.get(`/ai-interview/job/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInterviews(res.data || []);
    } catch {
      console.log("No interviews found");
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      const apps = await fetchApplications();
      await fetchInterviews();

      if (apps) {
        for (let app of apps) {
          if (!app.candidate?._id) continue;
          try {
            const res = await API.get(
              `/final-score/${jobId}/${app.candidate._id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setFinalScores((prev) => ({ ...prev, [app.candidate._id]: res.data }));
          } catch (err) {
            console.log("Score fetch failed for", app.candidate?._id);
          }
        }
      }

      try {
        const rankRes = await API.get(`/ai/rank/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const map = {};
        (rankRes.data.ranked || []).forEach((c) => {
          const emailKey = c.email?.toLowerCase();
          if (emailKey) map[emailKey] = c.score;
        });
        setRankMap(map);
      } catch (err) {
        console.log("❌ Ranking fetch failed:", err);
      }

      try {
        const jobRes = await API.get(
          `/jobs/${jobId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // ✅ correct structure (based on your backend)
        setJobTitle(jobRes.data.title || "Job Role");

      } catch (err) {
        console.log("Job title fetch failed:", err);
        setJobTitle("Job Role"); // fallback so UI doesn't break
      }

      setLoading(false);
    };
    loadAll();
  }, [jobId, token]);

  const viewFinalScore = async (candidateId) => {
    try {
      const res = await API.get(`/final-score/${jobId}/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFinalScores((prev) => ({ ...prev, [candidateId]: res.data }));
    } catch {
      alert("❌ Failed to load final score");
    }
  };

  const updateStatus = async (appId, newStatus) => {
    try {
      await API.put(
        `/applications/${appId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications((prev) =>
        prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
      );
      setMsg("✅ Status updated successfully");
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("❌ Failed to update status");
    }
  };

  const generateFeedback = async (candidateId) => {
    try {
      await API.get(`/ai/full-feedback/${jobId}/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Feedback Generated Successfully");
    } catch (err) {
      alert("❌ Failed to generate feedback");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "hired": return "bg-green-100 text-green-700 border-green-200";
      case "shortlisted": return "bg-blue-100 text-blue-700 border-blue-200";
      case "rejected": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-indigo-600 font-medium animate-pulse">Analyzing applications...</p>
      </div>
    );

  const displayApplications = filteredApplications || applications;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl 
              bg-gradient-to-r from-indigo-500 to-purple-600 
              text-white text-sm font-semibold shadow-md 
              hover:shadow-lg hover:scale-105 transition-all duration-200 mb-2"
            >
              <FiArrowLeft className="mr-1" /> BACK TO DASHBOARD
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Job Applications For - {jobTitle}
            </h1>
          </div>
          <div className="flex items-center space-x-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
            <span className="flex h-3 w-3 rounded-full bg-green-500"></span>
            <span className="text-sm font-medium text-slate-600">{applications.length} Total Applicants</span>
          </div>
        </div>

        <AnimatePresence>
          {msg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-xl shadow-sm mb-8 flex items-center justify-center border ${msg.includes('✅') ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}
            >
              {msg}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-10">
          <TopCandidatesFilter
            applications={applications}
            finalScores={finalScores}
            rankMap={rankMap}
            onFilter={(data) => setFilteredApplications(data)}
          />
        </div>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayApplications.map((app, index) => {
            const interview = interviews.find(
              (i) => i.candidateId?.toString() === app.candidate?._id?.toString() && i.proctoringData?.length > 0
            );
            const score = finalScores[app.candidate?._id];

            return (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 flex flex-col overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-6 pb-0 flex justify-between items-start">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <FiUser size={24} />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(app.status)}`}>
                    {app.status}
                  </div>
                </div>

                {/* Candidate Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {app.candidate?.name || "Anonymous Candidate"}
                  </h3>
                  <p className="text-slate-500 text-sm mb-4">{app.candidate?.email}</p>

                  <div className="space-y-3">
                    {app.resumeUrl && (
                      <a
                        href={`http://localhost:5001${app.resumeUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        <FiFileText className="mr-2" /> View Resume
                      </a>
                    )}

                    {/* <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center">
                        <FiCpu className="mr-1" /> AI Summary
                      </p>
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {app.parsedResume?.summary || "No AI summary available."}
                      </p>
                    </div> */}

                    <div
                      onClick={() =>
                        setSelectedSummary(app.parsedResume?.summary || "No AI summary available.")
                      }
                      className="cursor-pointer"
                    >
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {app.parsedResume?.summary || "No AI summary available."}
                      </p>

                      <span className="text-xs text-indigo-500 font-semibold">
                        Read More
                      </span>
                    </div>
                  </div>

                  {/* Score Visualization */}
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    {!score ? (
                      <button
                        onClick={() => viewFinalScore(app.candidate?._id)}
                        className="w-full flex items-center justify-center py-2 px-4 rounded-xl border border-indigo-200 text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors"
                      >
                        <FiBarChart2 className="mr-2" /> Calculate AI Score
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500 font-medium">Matching Score</span>
                          <span className="text-2xl font-black text-indigo-600">{score.finalScore}<span className="text-sm font-normal text-slate-400">/100</span></span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-indigo-50/50 p-2 rounded text-center">
                            <p className="text-[10px] uppercase text-slate-400 font-bold">Resume Fit</p>
                            <p className="font-bold text-slate-700">{score.resumeFit}%</p>
                          </div>
                          <div className="bg-indigo-50/50 p-2 rounded text-center">
                            <p className="text-[10px] uppercase text-slate-400 font-bold">Interview</p>
                            <p className="font-bold text-slate-700">{score.aiInterviewScore ?? "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-auto p-6 pt-0 space-y-3">
                  <div className="relative">
                    <select
                      value={app.status}
                      onChange={(e) => updateStatus(app._id, e.target.value)}
                      className="w-full pl-3 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 appearance-none font-medium cursor-pointer"
                    >
                      <option value="applied">Mark as Applied</option>
                      <option value="shortlisted">Move to Shortlist</option>
                      <option value="hired">Confirm Hire</option>
                      <option value="rejected">Reject Candidate</option>
                    </select>
                    <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                      <FiCheckCircle size={16} />
                    </div>
                  </div>

                  {interview && (
                    <button
                      onClick={() => navigate(`/recruiter/interview/${interview._id}`)}
                      className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-100"
                    >
                      <FiVideo className="mr-2" /> Watch Interview
                    </button>
                  )}

                  <button
                    onClick={() => generateFeedback(app.candidate?._id)}
                    className="w-full py-2 text-xs font-bold text-slate-400 hover:text-purple-600 transition-colors uppercase tracking-widest"
                  >
                    Generate Deep Feedback
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {displayApplications.length === 0 && (
          <div className="text-center py-20">
            <div className="text-slate-300 mb-4 flex justify-center"><FiUser size={64} /></div>
            <h3 className="text-xl font-bold text-slate-900">No applications found</h3>
            <p className="text-slate-500">Adjust your filters to see more candidates.</p>
          </div>
        )}
      </div>

      {selectedSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white max-w-2xl w-full mx-4 rounded-2xl shadow-2xl p-6 relative">

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setSelectedSummary("")}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
            >
              ✕
            </button>

            {/* TITLE */}
            <h3 className="text-lg font-bold text-indigo-600 mb-4">
              AI Summary
            </h3>

            {/* CONTENT */}
            <div className="max-h-[60vh] overflow-y-auto pr-2 text-sm text-gray-700 leading-relaxed">
              {selectedSummary}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
