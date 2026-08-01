import React, { useState, useEffect } from "react";
import axios from "axios";
import API from "../api/axios";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import AIInterviewSession from "../components/AIInterviewSession";

export default function InterviewPage() {
  const [session, setSession] = useState(null);
  const [jobData, setJobData] = useState(null);
  const { jobId } = useParams();
  const token = localStorage.getItem("token");

  const candidateId =
    JSON.parse(localStorage.getItem("user") || "{}")._id || "candidate_demo";

  useEffect(() => {
    async function loadJob() {
      try {
        const res = await API.get(
          `/jobs/${jobId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setJobData(res.data);
      } catch (err) {
        console.log("❌ Failed to load job data");
      }
    }
    loadJob();
  }, [jobId, token]);

  const startSession = async () => {
    try {
      const skills = jobData?.skills || ["General"];
      const summary = jobData?.description || "Interview for applied job role.";

      const res = await API.post(
        "/ai-interview/generate",
        { candidateId, skills, summary, jobId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        const cleaned = {
          ...res.data,
          questions: res.data.questions.map((q) =>
            typeof q === "string" ? q : q.question
          ),
        };
        setSession(cleaned);
      } else {
        alert("Failed to start interview session.");
      }
    } catch (err) {
      console.error("❌ Interview creation error:", err.response?.data || err.message);
      alert("Failed to create interview session.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-white p-6 md:p-12 flex justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-5xl"
      >
        {!session ? (
          <div className="space-y-12">
            
            {/* Minimalist Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-black pb-8 gap-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em] mb-2 block">
                  AI-Assisted Interview Module
                </span>
                <h1 className="text-4xl font-light text-slate-900 tracking-tight">
                  Technical <span className="font-bold text-black">Screening</span>
                </h1>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-slate-400 uppercase tracking-tighter">Auth Token Verified</p>
                <p className="text-sm font-bold text-slate-800">Ready for Initiation</p>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Left Column: Job Context */}
              <div className="lg:col-span-4 space-y-8">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Context</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Position</p>
                      <p className="text-lg font-bold text-black">{jobData?.title || "Lead Software Engineer"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Session ID</p>
                      <p className="text-sm font-mono text-slate-700">{jobId.substring(0, 14)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs leading-relaxed text-slate-600">
                    This interview is dynamically generated based on the role requirements and your professional profile.
                  </p>
                </div>
              </div>

              {/* Right Column: Protocols & Start */}
              <div className="lg:col-span-8 space-y-10">
                
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Execution Protocol</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {[
                      { n: "01", t: "Stability Check", d: "Stable environment with neutral background." },
                      { n: "02", t: "Audio Check", d: "Clear microphone input without distortion." },
                      { n: "03", t: "Visual Feed", d: "Face must be centered in the frame." },
                      { n: "04", t: "Interaction", d: "Listen to AI prompts fully before answering." }
                    ].map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <span className="font-mono text-indigo-600 font-bold text-sm">{step.n}</span>
                        <div>
                          <p className="text-sm font-bold text-black uppercase tracking-tight">{step.t}</p>
                          <p className="text-xs text-slate-500 mt-1">{step.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-100 flex flex-col items-start gap-6">
                  <button
                    onClick={startSession}
                    className="relative px-12 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] overflow-hidden group hover:bg-indigo-600 transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center gap-4">
                      Start Interview
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </button>
                  <p className="text-[10px] font-medium text-slate-400 max-w-sm">
                    By initiating, you authorize the system to record and analyze audio-visual data for recruitment purposes.
                  </p>
                </div>

              </div>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AIInterviewSession session={session} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

