import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Mailbox() {
  const [messages, setMessages] = useState([]);
  const [applications, setApplications] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  /* -----------------------------
      LOAD MAIL + APPLICATIONS
  ----------------------------- */
  useEffect(() => {
    async function loadAll() {
      try {
        const [mailRes, appRes] = await Promise.all([
          API.get("/mail", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          API.get("/applications/my-applications", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setMessages(mailRes.data || []);
        setApplications(appRes.data || []);
      } catch (err) {
        console.error("Mailbox load failed", err);
      }
    }
    loadAll();
  }, [token]);

  if (!messages.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4 opacity-20">📂</div>
        <div className="text-slate-400 font-medium tracking-wide">
          Your inbox is clear. No messages yet.
        </div>
      </div>
    );
  }

  return (
    <div className="py-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="mb-6">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Inbox</h3>
        <p className="text-slate-500 text-sm">Manage communications and next steps for your applications.</p>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {messages.map((m, i) => {
            // Find related application (by job title match)
            const relatedApp = applications.find(
              (a) =>
                m.body?.includes(a.job?.title) ||
                m.body?.includes(a.job?._id)
            );

            return (
              <motion.div
                key={m._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-lg text-slate-900 tracking-tight">
                      {m.title}
                    </div>
                    {relatedApp && (
                      <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
                        {relatedApp.job?.title}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {m.body}
                  </p>

                  {/* ===============================
                      ACTION BUTTONS (TRUSTED LOGIC)
                  =============================== */}
                  {relatedApp && relatedApp.status === "shortlisted" && (
                    <div className="pt-3 border-t border-slate-50 flex items-center gap-3">
                      {/* TEST REQUIRED & NOT TAKEN */}
                      {relatedApp.testRequired && !relatedApp.testTaken && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            navigate(`/test/${relatedApp.job._id}`)
                          }
                          className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
                        >
                          📝 Complete Required Test
                        </motion.button>
                      )}

                      {/* FAILED TEST */}
                      {relatedApp.testRequired &&
                        relatedApp.testTaken &&
                        !relatedApp.testPassed && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl border border-red-100">
                            <span className="text-sm text-red-600 font-bold">
                              ✕ Assessment criteria not met. Interview phase locked.
                            </span>
                          </div>
                        )}

                      {/* PASSED TEST or NO TEST REQUIRED */}
                      {((relatedApp.testRequired && relatedApp.testPassed) || !relatedApp.testRequired) && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            navigate(`/interview/${relatedApp.job._id}`)
                          }
                          className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700"
                        >
                          🎯 Start Automated Interview
                        </motion.button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
