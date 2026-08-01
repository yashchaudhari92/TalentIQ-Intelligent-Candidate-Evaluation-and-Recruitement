import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../api/axios";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";

export default function RecruiterInterviewPage() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingLive, setStartingLive] = useState(false);

  useEffect(() => {
    async function loadInterview() {
      try {
        const res = await API.get(
          `/ai-interview/${interviewId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setInterview(res.data);
      } catch (err) {
        console.error("Failed to load interview");
      } finally {
        setLoading(false);
      }
    }
    loadInterview();
  }, [interviewId, token]);

  /* ===============================
     ⭐ NEW: START LIVE INTERVIEW
     (Does NOT affect AI interview)
     =============================== */
  const startLiveInterview = async () => {
    try {
      setStartingLive(true);

      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await API.post(
        "/interviews/create",
        {
          jobId: interview.jobId || null,
          recruiterId: user._id,
          candidateId: interview.candidateId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        navigate(`/interview/live/${res.data.sessionId}`);
      } else {
        alert("Failed to start live interview.");
      }
    } catch (err) {
      console.error("Live interview start failed", err);
      alert("Error starting live interview.");
    } finally {
      setStartingLive(false);
    }
  };

  if (loading) {
    return (
      <p className="text-center mt-10 text-indigo-600 text-lg">
        Loading interview…
      </p>
    );
  }

  if (!interview) {
    return (
      <p className="text-center mt-10 text-red-600">
        Interview not found
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 px-6 py-12">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="text-4xl font-bold text-indigo-700">
            🎥 Interview Review
          </h1>

          <p className="mt-2 text-gray-600">
            Candidate ID:{" "}
            <span className="font-medium">{interview.candidateId}</span>
          </p>

          <span
            className="inline-block mt-3 px-4 py-1 rounded-full text-sm 
            bg-green-100 text-green-700 font-semibold"
          >
            Status: {interview.status}
          </span>

          {/* ⭐ NEW: LIVE INTERVIEW BUTTON */}
          <div className="mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startLiveInterview}
              disabled={startingLive}
              className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg
              bg-gradient-to-r from-emerald-600 to-green-600 disabled:opacity-60"
            >
              {startingLive
                ? "Starting Live Interview…"
                : "🎥 Start Live Interview"}
            </motion.button>
          </div>
        </motion.div>

        {/* RECORDINGS (UNCHANGED) */}
        <div className="space-y-8">
          {interview.proctoringData
            .filter((p) => p.type === "answer_saved")
            .map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-3xl shadow-xl p-6 border border-indigo-100"
              >
                <h3 className="text-lg font-semibold text-indigo-700 mb-3">
                  Question {v.qIndex + 1}
                </h3>

                <video
                  controls
                  className="w-full rounded-2xl shadow-md border"
                  src={`http://localhost:5001/uploads/${v.path
                    .split("uploads")[1]
                    .replace(/\\/g, "/")}`}
                />
              </motion.div>
            ))}
        </div>

        {/* BACK */}
        <div className="text-center mt-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg"
          >
            ← Back to Applications
          </motion.button>
        </div>
      </div>
    </div>
  );
}
