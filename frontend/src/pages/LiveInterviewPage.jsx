import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../api/axios";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

export default function LiveInterviewPage() {
  const { sessionId } = useParams();
  const token = localStorage.getItem("token");

  const [roomUrl, setRoomUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInterview() {
      try {
        const res = await API.get(
          `/interviews/${sessionId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.data.success || !res.data.interview?.roomUrl) {
          setError("Interview not found");
          return;
        }

        // ✅ USE REAL DAILY ROOM URL FROM BACKEND
        setRoomUrl(res.data.interview.roomUrl);
      } catch (err) {
        setError("Failed to load interview");
      } finally {
        setLoading(false);
      }
    }

    loadInterview();
  }, [sessionId, token]);

  if (loading) {
    return (
      <p className="text-center mt-10 text-lg text-white">
        Loading interview…
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center mt-10 text-red-500 text-lg">
        {error}
      </p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center p-6"
    >
      <div className="w-full max-w-6xl bg-black rounded-2xl shadow-2xl overflow-hidden">
        <iframe
          title="Live Interview"
          src={roomUrl}
          allow="camera; microphone; fullscreen; display-capture"
          className="w-full h-[550px] border-0"
        />
      </div>
    </motion.div>
  );
}
