import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";

export default function JobForm({ onJobCreated }) {
  const [job, setJob] = useState({
    title: "",
    description: "",
    requirements: "",
    skills: "",
    location: "",
    salary: "",
    status: "open",
    testRequired: false,
  });

  const [msg, setMsg] = useState("");
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/jobs", job, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMsg("✅ Job created successfully!");

      setJob({
        title: "",
        description: "",
        requirements: "",
        skills: "",
        location: "",
        salary: "",
        status: "open",
        testRequired: false,
      });

      if (onJobCreated) onJobCreated();
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Job creation failed");
    }
  };

  const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200";
  const labelClass = "text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block ml-1";

  return (
    <div className="w-full py-10 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden"
      >
        {/* Header Section */}
        <div className="bg-slate-50 border-b border-slate-100 p-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Post a New Opportunity</h2>
            <p className="text-sm text-slate-500 font-medium">Define the role and find the perfect candidate.</p>
          </div>
          <div className="hidden sm:block">
            <div className="bg-indigo-600/10 p-3 rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-8 lg:p-12">
          <AnimatePresence>
            {msg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mb-8 p-4 rounded-2xl text-sm font-bold border flex items-center gap-3 ${
                  msg.startsWith("✅") 
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                  : "bg-red-50 text-red-600 border-red-100"
                }`}
              >
                <span>{msg.startsWith("✅") ? "✨" : "⚠️"}</span>
                {msg}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Row 1: Title */}
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-1">
                <label className={labelClass}>Job Title</label>
                <input
                  type="text"
                  value={job.title}
                  onChange={(e) => setJob({ ...job, title: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Senior Product Designer"
                  required
                />
              </div>
            </div>

            {/* Row 2: Description & Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className={labelClass}>Job Description</label>
                <textarea
                  rows={4}
                  value={job.description}
                  onChange={(e) => setJob({ ...job, description: e.target.value })}
                  className={`${inputClass} resize-none`}
                  placeholder="What will they be working on?"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Key Requirements</label>
                <textarea
                  rows={4}
                  value={job.requirements}
                  onChange={(e) => setJob({ ...job, requirements: e.target.value })}
                  className={`${inputClass} resize-none`}
                  placeholder="What qualifications are needed?"
                />
              </div>
            </div>

            {/* Row 3: Skills */}
            <div className="space-y-1">
              <label className={labelClass}>Technical Skills (Comma separated)</label>
              <input
                type="text"
                value={job.skills}
                onChange={(e) => setJob({ ...job, skills: e.target.value })}
                className={inputClass}
                placeholder="React, Tailwind CSS, Node.js, AWS..."
              />
            </div>

            {/* Row 4: Location, Salary, Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className={labelClass}>Location</label>
                <input
                  type="text"
                  value={job.location}
                  onChange={(e) => setJob({ ...job, location: e.target.value })}
                  className={inputClass}
                  placeholder="Remote, Mumbai..."
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Salary Range</label>
                <input
                  type="text"
                  value={job.salary}
                  onChange={(e) => setJob({ ...job, salary: e.target.value })}
                  className={inputClass}
                  placeholder="₹12L - ₹18L"
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Posting Status</label>
                <select
                  value={job.status}
                  onChange={(e) => setJob({ ...job, status: e.target.value })}
                  className={inputClass}
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Switch: Skill Test */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">Skill Assessment</p>
                <p className="text-xs text-slate-500">Require an AI-powered skill test before the interview process.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={job.testRequired}
                  onChange={(e) => setJob({ ...job, testRequired: e.target.checked })}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Action Section */}
            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full sm:w-auto px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3"
              >
                Create Job Posting
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
