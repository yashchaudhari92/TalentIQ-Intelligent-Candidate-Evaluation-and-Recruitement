import React, { useState, useEffect } from "react";
import { Button, Badge } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import API from "../api/axios";

import CandidateProfile from "./CandidateProfile";
import JobBoard from "../components/JobBoard";
import AppliedJobs from "../components/AppliedJobs";
import Mailbox from "../components/Mailbox";
import CandidateHomeDashboard from "../components/CandidateHomeDashboard";
import Footer from "../components/Footer";

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get("tab") || "home";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [liveSessionId, setLiveSessionId] = useState(null);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const [applications, setApplications] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  const token = localStorage.getItem("token");

  // Dynamic Styles based on Theme
  const themeColors = {
    bg: darkMode ? "#0a0a0c" : "#f8fafc",
    card: darkMode ? "#16161e" : "#ffffff",
    border: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
    text: darkMode ? "#f1f5f9" : "#1e293b",
    textMuted: darkMode ? "#94a3b8" : "#64748b",
    accent: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
  };

  const menuItemStyle = {
    padding: "12px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: themeColors.text,
  };

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    document.body.style.background = newMode ? "#0a0a0c" : "#f8fafc";
  };

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [location.search]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed?.name) {
        localStorage.setItem("userName", parsed.name);
      }
    }
    document.body.style.background = darkMode ? "#0a0a0c" : "#f8fafc";
  }, []);

  useEffect(() => {
    const sessionId = localStorage.getItem("liveSessionId");
    if (sessionId) {
      setLiveSessionId(sessionId);
    }
  }, []);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        // const res = await API.get(
        //   "/applications/my-applications",
        //   { headers: { Authorization: `Bearer ${token}` } }
        // );
        // setApplications(res.data);
        const res = await API.get(
          "/applications/my-applications",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Response:", res.data);
        console.log("Is Array:", Array.isArray(res.data));

        setApplications(res.data);
      } catch (err) {
        console.log("Failed to fetch applications");
      }
    };
    fetchApps();
    const interval = setInterval(fetchApps, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigation = (tab) => {
    setActiveTab(tab);
    navigate(`/candidate-dashboard?tab=${tab}`);
  };

  const handleStartInterview = () => {
    navigate("/interview");
  };

  return (
    <div
      className="d-flex"
      style={{
        minHeight: "100vh",
        background: themeColors.bg,
        color: themeColors.text,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ------------ SIDEBAR ------------ */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        style={{
          width: "280px",
          background: themeColors.card,
          borderRight: `1px solid ${themeColors.border}`,
          position: "fixed",
          left: 0,
          top: 100,
          bottom: 0,
          zIndex: 1000,
          padding: "24px 16px",
        }}
      >

        <nav className="d-flex flex-column gap-1">
          <SidebarItem title="Home" active={activeTab === "home"} onClick={() => handleNavigation("home")} icon="🏠" darkMode={darkMode} />
          <SidebarItem title="Jobs" active={activeTab === "jobs"} onClick={() => handleNavigation("jobs")} icon="💼" darkMode={darkMode} />
          <SidebarItem title="Applied Jobs" active={activeTab === "applied"} onClick={() => handleNavigation("applied")} icon="📋" darkMode={darkMode} />
          <SidebarItem title="Mailbox" active={activeTab === "mail"} onClick={() => handleNavigation("mail")} icon="📨" darkMode={darkMode} />
          <SidebarItem title="Profile" active={activeTab === "profile"} onClick={() => handleNavigation("profile")} icon="👤" darkMode={darkMode} />
          <SidebarItem title="Interview" active={activeTab === "interview"} onClick={() => handleNavigation("interview")} icon="🎥" darkMode={darkMode} />
          <SidebarItem title="Feedbacks" active={activeTab === "feedback"} onClick={() => handleNavigation("feedback")} icon="📊" darkMode={darkMode} />
        </nav>
      </motion.aside>

      {/* ------------ MAIN CONTENT ------------ */}
      <div className="flex-grow-1" style={{ marginLeft: "280px" }}>
        {/* ------------ TOP BAR ------------ */}
        <header
          className="d-flex justify-content-between align-items-center px-4 py-3"
          style={{
            background: darkMode ? "rgba(22, 22, 30, 0.8)" : "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(12px)",
            position: "sticky",
            top: 0,
            zIndex: 900,
            borderBottom: `1px solid ${themeColors.border}`,
          }}
        >
          <h5 className="fw-semibold m-0 text-capitalize">{activeTab} Dashboard</h5>

          <div className="d-flex align-items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                border: "none",
                background: darkMode ? "#1f1f2b" : "#f1f5f9",
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "0.3s"
              }}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            {/* Notifications */}
            <div className="position-relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  border: "none",
                  background: darkMode ? "#1f1f2b" : "#f1f5f9",
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                🔔
                <Badge
                  bg="danger"
                  pill
                  className="position-absolute"
                  style={{ top: "-5px", right: "-5px", fontSize: "10px", padding: "4px 6px" }}
                >
                  3
                </Badge>
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "55px",
                      background: themeColors.card,
                      borderRadius: "16px",
                      width: "280px",
                      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
                      border: `1px solid ${themeColors.border}`,
                      overflow: "hidden",
                      zIndex: 1000,
                    }}
                  >
                    <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Notifications</span>
                      <span className="text-primary small" style={{ cursor: "pointer" }}>Clear all</span>
                    </div>
                    <div className="p-2">
                      <div style={menuItemStyle}>📨 2 New Messages</div>
                      <div style={menuItemStyle}>💼 New Job: Senior Dev</div>
                      <div style={menuItemStyle}>📋 Interview Result Ready</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar */}
            <div className="position-relative">
              <div
                onClick={() => setShowMenu(!showMenu)}
                style={{
                  cursor: "pointer",
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: themeColors.accent,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "16px",
                  boxShadow: "0 4px 10px rgba(99, 102, 241, 0.4)"
                }}
              >
                {localStorage.getItem("userName")
                  ? localStorage.getItem("userName").charAt(0).toUpperCase()
                  : "U"}
              </div>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "55px",
                      background: themeColors.card,
                      borderRadius: "16px",
                      width: "200px",
                      padding: "8px",
                      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
                      border: `1px solid ${themeColors.border}`,
                      zIndex: 1000,
                    }}
                  >
                    <div onClick={() => handleNavigation("profile")} style={menuItemStyle}>👤 Profile</div>
                    <div onClick={() => handleNavigation("settings")} style={menuItemStyle}>⚙️ Settings</div>
                    <hr className="my-2" style={{ borderColor: themeColors.border }} />
                    <div
                      onClick={() => {
                        localStorage.clear();
                        navigate("/login");
                      }}
                      style={{ ...menuItemStyle, color: "#ef4444" }}
                    >
                      🚪 Logout
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ------------ CONTENT AREA ------------ */}
        <main className="p-4">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "home" && <CandidateHomeDashboard />}
            {activeTab === "jobs" && <JobBoard />}
            {activeTab === "applied" && <AppliedJobs />}
            {activeTab === "mail" && <Mailbox />}
            {activeTab === "profile" && <CandidateProfile />}

            {/* 🔥 FEEDBACK TAB - MODERNIZED */}
            {/* 🔥 FEEDBACK TAB - ULTRA MODERN BENTO VERSION */}
            {/* 🔥 FEEDBACK TAB - PROFESSIONAL REVIEW VERSION */}
            {activeTab === "feedback" && (
              <div className="container-fluid px-0">
                <div className="mb-5">
                  <h2 className="fw-bold mb-2" style={{ letterSpacing: "-1px" }}>
                    Interview <span style={{ color: "#6366f1" }}>Insights</span>
                  </h2>
                  <p style={{ color: themeColors.textMuted, fontSize: "1.1rem" }}>
                    Review detailed evaluations and feedback from your recent interview sessions.
                  </p>
                </div>

                <div className="row g-4">
                  {applications.map((app, index) => (
                    <motion.div
                      key={app._id}
                      className="col-xl-4 col-md-6"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div
                        style={{
                          background: themeColors.card,
                          borderRadius: "20px",
                          border: `1px solid ${themeColors.border}`,
                          padding: "30px",
                          height: "100%",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          boxShadow: darkMode ? "0 4px 20px rgba(0,0,0,0.2)" : "0 4px 20px rgba(0,0,0,0.03)"
                        }}
                        className="d-flex flex-column"
                      >
                        {/* Header: Company/Role & Date */}
                        <div className="mb-4">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span
                              className="fw-bold small text-uppercase"
                              style={{ color: "#6366f1", letterSpacing: "1px", fontSize: "10px" }}
                            >
                              {app.job?.category || "Professional Review"}
                            </span>
                            <span className="text-muted small">
                              {new Date(app.createdAt).toLocaleDateString('en-GB')}
                            </span>
                          </div>
                          <h4 className="fw-bold m-0" style={{ fontSize: "1.4rem", color: themeColors.text }}>
                            {app.job?.title || "Technical Candidate"}
                          </h4>
                        </div>

                        {/* Status Indicator Bento Box */}
                        <div
                          className="p-3 mb-4 rounded-4 d-flex align-items-center gap-3"
                          style={{
                            background: darkMode ? "rgba(255,255,255,0.03)" : "#f8fafc",
                            border: `1px solid ${themeColors.border}`
                          }}
                        >
                          <div
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              background: app.feedbackReport ? "#10b981" : "#cbd5e1",
                              boxShadow: app.feedbackReport ? "0 0 10px #10b981" : "none"
                            }}
                          />
                          <span className="small fw-semibold" style={{ color: themeColors.text }}>
                            {app.feedbackReport ? "Report Ready for Review" : "Evaluation in Progress"}
                          </span>
                        </div>

                        {/* Key Metrics Labels (Clean Icons) */}
                        <div className="d-flex gap-2 mb-4">
                          {['Communication', 'Technical', 'Soft Skills'].map((tag) => (
                            <span
                              key={tag}
                              className="badge rounded-pill fw-medium"
                              style={{
                                background: darkMode ? "#252531" : "#f1f5f9",
                                color: themeColors.textMuted,
                                fontSize: "10px",
                                padding: "6px 10px",
                                border: `1px solid ${themeColors.border}`
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Action Section */}
                        <div className="mt-auto">
                          {app.feedbackReport ? (
                            <button
                              onClick={() => setSelectedReport(app.feedbackReport)}
                              className="w-100 py-3 rounded-3 border-0 text-white fw-bold transition-all"
                              style={{
                                // background: "#111",
                                background: darkMode ? "#fff" : "#111",
                                color: darkMode ? "#111" : "#fff",
                                fontSize: "14px"
                              }}
                              onMouseEnter={(e) => e.target.style.opacity = "0.9"}
                              onMouseLeave={(e) => e.target.style.opacity = "1"}
                            >
                              View Full Insights
                            </button>
                          ) : (
                            <div
                              className="w-100 py-3 text-center small text-muted rounded-3"
                              style={{ border: `1px dashed ${themeColors.border}` }}
                            >
                              Pending Evaluation...
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "interview" && (
              <div className="text-center py-5">
                <div
                  className="mx-auto p-5 rounded-4 shadow-sm"
                  style={{ background: themeColors.card, maxWidth: "600px", border: `1px solid ${themeColors.border}` }}
                >
                  <div style={{ fontSize: "50px" }}>🤖</div>
                  <h3 className="fw-bold mt-3">Ready for your Interview?</h3>
                  <p className="text-muted">Our AI is ready to evaluate your technical and soft skills.</p>

                  <div className="d-flex flex-column gap-3 mt-4">
                    <Button
                      variant="primary"
                      size="lg"
                      className="py-3 fw-bold rounded-3"
                      style={{ background: themeColors.accent, border: "none" }}
                      onClick={handleStartInterview}
                    >
                      Start AI Interview session
                    </Button>

                    {liveSessionId && (
                      <Button
                        variant="success"
                        size="lg"
                        className="py-3 fw-bold rounded-3"
                        onClick={() => navigate(`/interview/live/${liveSessionId}`)}
                      >
                        Join Live Proctoring 🎥
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* ✅ FEEDBACK MODAL (MODERNIZED) */}
      <AnimatePresence>
        {selectedReport && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
              padding: "20px"
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: darkMode ? "#1c1c24" : "#fff",
                borderRadius: "24px",
                width: "100%",
                maxWidth: "700px",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "32px",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                color: themeColors.text
              }}
            >
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h3 className="fw-bold m-0">Performance Analysis</h3>
                  <p className="text-muted m-0">Generated by TalentIQ AI</p>
                </div>
                <div
                  style={{
                    padding: "8px 16px",
                    borderRadius: "12px",
                    background: selectedReport.verdict === "Selected" ? "#dcfce7" : "#fee2e2",
                    color: selectedReport.verdict === "Selected" ? "#166534" : "#991b1b",
                    fontWeight: "700"
                  }}
                >
                  {selectedReport.verdict}
                </div>
              </div>

              <div className="row g-3">
                <ReportSection title="Overall Performance" value={selectedReport.overallPerformance} icon="📈" darkMode={darkMode} />
                <ReportSection title="Strengths" value={selectedReport.strengths} icon="💪" darkMode={darkMode} />
                <ReportSection title="Areas for Improvement" value={selectedReport.weaknesses} icon="🎯" darkMode={darkMode} />
                <ReportSection title="Technical Proficiency" value={selectedReport.technicalEvaluation} icon="💻" darkMode={darkMode} />
                <ReportSection title="Communication" value={selectedReport.communicationSkills} icon="🗣️" darkMode={darkMode} />
              </div>

              <div className="mt-4 p-3 rounded-4" style={{ background: darkMode ? "#252531" : "#f8fafc" }}>
                <h6 className="fw-bold mb-1">Final Recommendation</h6>
                <p className="small m-0 text-muted">{selectedReport.recommendation}</p>
              </div>

              <div className="mt-5 text-end">
                <Button
                  onClick={() => setSelectedReport(null)}
                  variant="dark"
                  className="px-4 rounded-3"
                  style={{ background: "#6366f1", border: "none" }}
                >
                  Close Report
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



    </div>
  );
}

function SidebarItem({ title, active, icon, onClick, darkMode }) {
  return (
    <motion.div
      whileHover={{ x: 5 }}
      onClick={onClick}
      className="d-flex align-items-center gap-3 px-3 py-2 rounded-3"
      style={{
        cursor: "pointer",
        background: active ? (darkMode ? "rgba(99, 102, 241, 0.15)" : "#eef2ff") : "transparent",
        color: active ? "#6366f1" : (darkMode ? "#94a3b8" : "#64748b"),
        fontWeight: active ? "600" : "500",
        transition: "0.2s ease"
      }}
    >
      <span style={{ fontSize: "18px", opacity: active ? 1 : 0.7 }}>{icon}</span>
      <span style={{ fontSize: "14px" }}>{title}</span>
      {active && (
        <motion.div
          layoutId="sidebarActive"
          style={{ width: "4px", height: "18px", background: "#6366f1", borderRadius: "2px", marginLeft: "auto" }}
        />
      )}
    </motion.div>
  );
}

function ReportSection({ title, value, icon, darkMode }) {
  return (
    <div className="col-12">
      <div
        className="p-3 rounded-4"
        style={{
          border: `1px solid ${darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
          background: darkMode ? "rgba(255,255,255,0.02)" : "#fff"
        }}
      >
        <div className="d-flex align-items-center gap-2 mb-2">
          <span>{icon}</span>
          <span className="fw-bold small text-uppercase" style={{ letterSpacing: "0.5px" }}>{title}</span>
        </div>
        <div style={{ fontSize: "14px", color: darkMode ? "#cbd5e1" : "#475569", lineHeight: "1.6" }}>
          {value || "Assessment data not available for this segment."}
        </div>
      </div>
    </div>
  );
}
