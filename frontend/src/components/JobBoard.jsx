import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  Button,
  Form,
  Row,
  Col,
  Spinner,
  Alert,
  ProgressBar,
  Modal,
} from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  
  // Modal & Application States
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyNote, setApplyNote] = useState("");
  const [resume, setResume] = useState(null);
  const [profile, setProfile] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ---------------- LOAD JOBS ----------------
  const fetchJobs = async () => {
    try {
      const res = await API.get("/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
      setFilteredJobs(res.data);
    } catch {
      setMsg("❌ Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // ---------------- LOAD PROFILE ----------------
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await API.get(
          "/candidate/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfile(res.data);
      } catch {
        console.log("Profile load failed");
      }
    }
    loadProfile();
  }, []);

  // ---------------- PROFILE CHECK ----------------
  const isProfileIncomplete = () => {
    if (!profile) return true;
    if (!profile.education?.length) return true;
    if (!profile.skills?.length) return true;
    if (!profile.experience?.length) return true;
    if (!profile.resumeUrl && !profile.parsedData) return true;
    return false;
  };

  // ---------------- JOB FIT LOGIC ----------------
  const calculateJobFit = (job) => {
    if (!profile || !job) return null;

    const jobSkills = (job.skills || []).map((s) => s.toLowerCase());
    const candidateSkills = (profile.skills || []).map((s) => s.toLowerCase());
    const resumeSkills =
      profile.parsedData?.extractedSkills?.map((s) => s.toLowerCase()) || [];

    const matchedSkills = jobSkills.filter((s) =>
      candidateSkills.includes(s)
    );
    const missingSkills = jobSkills.filter(
      (s) => !candidateSkills.includes(s)
    );

    const skillScore = jobSkills.length
      ? (matchedSkills.length / jobSkills.length) * 50
      : 0;

    const resumeMatch = jobSkills.filter((s) =>
      resumeSkills.includes(s)
    ).length;
    const resumeScore = jobSkills.length
      ? (resumeMatch / jobSkills.length) * 25
      : 0;

    const experienceScore = profile.experience?.length ? 15 : 0;
    const educationScore = profile.education?.length ? 10 : 0;

    const total = Math.round(
      skillScore + resumeScore + experienceScore + educationScore
    );

    return {
      total,
      matchedSkills,
      missingSkills,
    };
  };

  // ---------------- SEARCH ----------------
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFilteredJobs(
      jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(value) ||
          job.location.toLowerCase().includes(value) ||
          job.skills.join(", ").toLowerCase().includes(value)
      )
    );
  };

  // ---------------- APPLY ----------------
  const applyToJob = async () => {
    if (!selectedJob) return;
    try {
      const formData = new FormData();
      formData.append("note", applyNote);
      if (resume) formData.append("resume", resume);

      await API.post(
        `/applications/apply/${selectedJob._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMsg("✅ Applied successfully!");
      handleCloseModal();
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Failed to apply");
    }
  };

  const handleOpenApply = (job) => {
    if (isProfileIncomplete()) {
      alert("⚠️ Please complete your profile before applying!");
      navigate("/candidate-dashboard?tab=profile");
      return;
    }
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleCloseModal = () => {
    setShowApplyModal(false);
    setSelectedJob(null);
    setApplyNote("");
    setResume(null);
  };

  if (loading) return (
    <div className="d-flex justify-content-center py-5">
      <Spinner animation="grow" variant="primary" />
    </div>
  );

  return (
    <div className="py-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="text-center mb-5">
        <h2 className="fw-black tracking-tight mb-2">Available <span className="text-primary">Opportunities</span></h2>
        <p className="text-muted small">Select a role to view detailed compatibility and begin your application.</p>
      </div>

      <AnimatePresence>
        {msg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Alert 
              variant={msg.includes("❌") ? "danger" : "success"}
              className="rounded-4 border-0 shadow-sm mb-4 text-center fw-bold"
            >
              {msg}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="position-relative mb-5 mx-auto" style={{ maxWidth: "700px" }}>
        <Form.Control
          type="text"
          placeholder="Search by title, location, or skills..."
          value={search}
          onChange={handleSearch}
          className="shadow-lg rounded-pill px-5 py-3 border-0"
          style={{ background: "white", fontSize: "1.1rem" }}
        />
      </div>

      <Row className="g-4 d-flex align-items-stretch">
        {filteredJobs.map((job, index) => (
          <Col xl={6} key={job._id} className="d-flex">
            <motion.div 
              className="w-100 d-flex"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-0 shadow-sm rounded-5 w-100 d-flex flex-column" style={{ background: "white" }}>
                <Card.Body className="p-4 d-flex flex-column">
                  <div className="mb-3">
                    <h4 className="fw-bold mb-1 text-dark">{job.title}</h4>
                    <div className="d-flex flex-wrap gap-2 text-muted small fw-semibold">
                      <span>📍 {job.location}</span>
                      <span>•</span>
                      <span className="text-success fw-bold">💰 {job.salary}</span>
                    </div>
                  </div>

                  <Card.Text className="text-muted mb-4" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                    {job.description}
                  </Card.Text>

                  <div className="mb-4">
                    <div className="d-flex flex-wrap gap-2">
                      {job.skills.map((s, i) => (
                        <span key={i} className="px-3 py-1 rounded-pill fw-bold"
                          style={{ fontSize: "11px", background: "rgba(99, 102, 241, 0.08)", color: "#6366f1", border: "1px solid rgba(99, 102, 241, 0.1)" }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto">
                    <Button
                      className="w-100 rounded-pill fw-bold py-3 border-0 shadow-sm"
                      style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", letterSpacing: '0.5px' }}
                      onClick={() => handleOpenApply(job)}
                    >
                      Apply Now
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* --- REFINED APPLICATION MODAL --- */}
      <Modal 
        show={showApplyModal} 
        onHide={handleCloseModal} 
        centered 
        size="lg"
        contentClassName="rounded-3 border-0 shadow-lg"
        style={{ zIndex: 9999 }} // Added higher z-index to overlay TopBar
        backdropStyle={{ zIndex: 1050 }}
      >
        <Modal.Header closeButton className="border-0 px-5 pt-5 pb-0">
          <Modal.Title className="fw-black text-dark" style={{ fontSize: "1.75rem", letterSpacing: "-1px" }}>
            Apply for {selectedJob?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-5 pb-5 pt-4">
          {selectedJob && (
            <>
              {/* Compatibility Box */}
              {calculateJobFit(selectedJob) && (
                <div 
                  className="p-4 rounded-4 mb-4 border" 
                  style={{ background: "#fcfdfe", borderColor: "#edf2f7" }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontSize: "18px" }}>📊</span>
                      <strong className="small text-uppercase tracking-widest text-muted" style={{ fontSize: '10px' }}>Compatibility Insight</strong>
                    </div>
                    <span className="badge rounded-pill px-3 py-2" style={{ background: "rgba(99, 102, 241, 0.1)", color: "#6366f1", fontWeight: "800" }}>
                      {calculateJobFit(selectedJob).total}% Match
                    </span>
                  </div>
                  
                  <ProgressBar
                    now={calculateJobFit(selectedJob).total}
                    style={{ height: "12px", borderRadius: "10px", background: "#edf2f7" }}
                    variant={calculateJobFit(selectedJob).total > 70 ? "success" : "primary"}
                    className="mb-4"
                  />
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="d-flex gap-2 align-items-start">
                        <span className="text-success fw-bold">✓</span>
                        <div>
                          <small className="d-block fw-bold text-dark" style={{ fontSize: "11px" }}>MATCHED SKILLS</small>
                          <span className="text-muted small">{calculateJobFit(selectedJob).matchedSkills.join(", ") || "No overlapping skills"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex gap-2 align-items-start">
                        <span className="text-danger fw-bold">✕</span>
                        <div>
                          <small className="d-block fw-bold text-dark" style={{ fontSize: "11px" }}>GAPS IDENTIFIED</small>
                          <span className="text-muted small">{calculateJobFit(selectedJob).missingSkills.join(", ") || "Full profile match"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Form.Group className="mb-4">
                <Form.Label className="small fw-black text-muted text-uppercase ls-1 mb-2" style={{ fontSize: "10px" }}>Personalized Note</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  className="rounded-4 p-3 border-light shadow-sm"
                  style={{ background: "#f8fafc", resize: "none" }}
                  placeholder="Explain why your experience makes you a strong candidate..."
                  value={applyNote}
                  onChange={(e) => setApplyNote(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-5">
                <Form.Label className="small fw-black text-muted text-uppercase ls-1 mb-2" style={{ fontSize: "10px" }}>Supplementary Resume (PDF)</Form.Label>
                <div className="p-3 border rounded-4 d-flex align-items-center justify-content-between" style={{ background: "#f8fafc" }}>
                  <Form.Control
                    type="file"
                    accept=".pdf"
                    className="border-0 bg-transparent small"
                    style={{ boxShadow: "none" }}
                    onChange={(e) => setResume(e.target.files[0])}
                  />
                </div>
              </Form.Group>

              <div className="d-flex gap-3">
                <Button 
                  className="flex-grow-1 rounded-pill fw-bold py-3 border-0 shadow-sm"
                  variant="success"
                  onClick={applyToJob}
                  disabled={!applyNote.trim()}
                  style={{ background: "#10b981", fontSize: "15px" }}
                >
                  Confirm Application
                </Button>
                <Button 
                  className="px-5 rounded-pill fw-bold border-0"
                  variant="light"
                  onClick={handleCloseModal}
                  style={{ background: "#f1f5f9", fontSize: "15px" }}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

