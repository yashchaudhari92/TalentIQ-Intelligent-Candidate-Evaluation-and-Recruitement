
// Old Code

import React, { useState } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Spinner,
  Alert,
  Collapse,
  Form,
} from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";

export default function ApplicationList({ jobId }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // ⭐ NEW
  // const [scoreData, setScoreData] = useState(null);

  const [open, setOpen] = useState(false);
  const token = localStorage.getItem("token");

  /* -----------------------------
        FETCH APPLICATIONS
  ----------------------------- */
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await API.get(
        `/applications/job/${jobId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications(res.data);
      setMsg("");
    } catch (err) {
      setMsg("❌ Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const toggleOpen = () => {
    if (!open) fetchApplications();
    setOpen(!open);
  };

  /* -----------------------------
      FINAL SCORE
----------------------------- */
  // const viewFinalScore = async (candidateId) => {
  //   try {
  //     const res = await axios.get(
  //       `/final-score/${jobId}/${candidateId}`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     setScoreData(res.data);
  //   } catch {
  //     alert("❌ Failed to load final score");
  //   }
  // };

  /* -----------------------------
        UPDATE STATUS
  ----------------------------- */
  const updateStatus = async (appId, newStatus) => {
    try {
      await API.put(
        `/applications/${appId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg("✅ Status updated");

      setApplications((prev) =>
        prev.map((app) =>
          app._id === appId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      setMsg("❌ Failed to update status");
    }
  };

  /* -----------------------------
        UI
  ----------------------------- */
  return (
    <div>
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => (window.location.href = `/recruiter/applications/${jobId}`)}
        className="px-3 py-1 rounded-pill text-white bg-gradient-to-r from-blue-500 to-indigo-600 border-0 shadow-sm text-sm"
      >
        View Applications →
      </motion.button>


      {/* Collapse Section */}
      <Collapse in={open}>
        <div className="mt-3">

          {/* Alert */}
          <AnimatePresence>
            {msg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert
                  variant={msg.startsWith("✅") ? "success" : "danger"}
                  className="rounded-3 shadow-sm"
                >
                  {msg}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Spinner */}
          {loading && (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" />{" "}
              <span className="ms-2 text-primary">Loading…</span>
            </div>
          )}

          {/* No Applications */}
          {!loading && applications.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted"
            >
              No applications yet.
            </motion.p>
          )}

          {/* Table */}
          {!loading && applications.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-4 shadow-lg overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(12px)",
              }}
            >
              <Table hover responsive className="align-middle mb-0">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Note</th>
                    <th>Resume</th>
                    <th>AI Summary</th>
                    <th>Skills</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {applications.map((app, index) => (
                    <motion.tr
                      key={app._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{
                        backgroundColor: "rgba(230,240,255,0.4)",
                      }}
                    >
                      <td className="fw-semibold">{app.candidate?.name}</td>
                      <td>{app.candidate?.email}</td>
                      <td>{app.note || "—"}</td>

                      {/* Resume */}
                      <td>
                        {app.resumeUrl ? (
                          <a
                            href={`http://localhost:5001${app.resumeUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary fw-semibold"
                          >
                            View PDF
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* AI Summary */}
                      <td style={{ maxWidth: "220px" }} className="text-muted">
                        {app.parsedResume?.summary || "—"}
                      </td>

                      {/* Extracted Skills */}
                      <td style={{ maxWidth: "220px" }}>
                        {app.parsedResume?.extractedSkills?.length ? (
                          <div className="d-flex flex-wrap gap-1">
                            {app.parsedResume.extractedSkills.map((skill, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 rounded-pill bg-blue-100 text-blue-700 text-xs fw-semibold"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <Form.Select
                          size="sm"
                          value={app.status}
                          onChange={(e) =>
                            updateStatus(app._id, e.target.value)
                          }
                          className="shadow-sm"
                        >
                          <option value="applied">Applied</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="hired">Hired</option>
                          <option value="rejected">Rejected</option>
                        </Form.Select>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </Table>
            </motion.div>
          )}
        </div>
      </Collapse>
    </div>
  );
}
