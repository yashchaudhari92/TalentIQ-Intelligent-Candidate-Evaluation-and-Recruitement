import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Alert, Spinner, Form, Button, Card, Row, Col } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";

export default function RankedCandidates() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [ranked, setRanked] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const token = localStorage.getItem("token");

  // filters
  const [minExperience, setMinExperience] = useState(0);
  const [minSkillMatch, setMinSkillMatch] = useState(0);
  const [minEduScore, setMinEduScore] = useState(0);

  // sorting
  const [sortField, setSortField] = useState("score");
  const [sortOrder, setSortOrder] = useState("desc");

  /* -------------------------------
     FETCH JOBS
  --------------------------------*/
  const fetchJobs = async () => {
    try {
      const res = await API.get("/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
    } catch {
      setMsg("❌ Failed to fetch jobs");
    }
  };

  /* -------------------------------
     FETCH RANKED CANDIDATES
  --------------------------------*/
  const fetchRanked = async () => {
    if (!selectedJob) return;
    setLoading(true);

    try {
      const res = await API.get(
        `/ai/rank/${selectedJob}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRanked(res.data.ranked || []);
      setMsg("");
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Failed to fetch rankings");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------
     FILTERS + SORT
  --------------------------------*/
  useEffect(() => {
    let result = [...ranked];

    result = result.filter(
      (c) =>
        c.expYears >= minExperience &&
        c.skillCoverage >= minSkillMatch &&
        c.eduScore >= minEduScore
    );

    // sorting logic
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortOrder === "asc") return valA > valB ? 1 : -1;
      else return valA < valB ? 1 : -1;
    });

    setFiltered(result);
  }, [ranked, minExperience, minSkillMatch, minEduScore, sortField, sortOrder]);

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <motion.div
      className="my-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="p-4 rounded-4 shadow-lg border"
        style={{
          background: "linear-gradient(135deg, #eef3ff, #ffffff)",
          borderColor: "#dbe4ff",
        }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h3 className="fw-bold text-primary mb-3">AI-Powered Candidate Ranking</h3>

        {/* Message Box */}
        <AnimatePresence>
          {msg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert
                variant={msg.startsWith("❌") ? "danger" : "success"}
                className="rounded-3"
              >
                {msg}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ******** JOB SELECT + BUTTON ******** */}
        <motion.div
          className="d-flex gap-3 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Form.Select
            className="shadow-sm"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
          >
            <option value="">-- Select Job --</option>
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} ({job.location})
              </option>
            ))}
          </Form.Select>

          <Button
            onClick={fetchRanked}
            disabled={!selectedJob}
            className="px-4 fw-semibold"
            style={{
              background: "linear-gradient(90deg,#4f46e5,#7c3aed)",
              border: "none",
            }}
          >
            Rank Candidates
          </Button>
        </motion.div>

        {/* ******** FILTERS PANEL ******** */}
        {ranked.length > 0 && (
          <motion.div
            className="p-3 rounded-4 shadow-sm mb-4"
            style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(8px)",
              border: "1px solid #e0e7ff",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold text-primary">Min Experience (yrs)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={minExperience}
                    className="shadow-sm"
                    onChange={(e) => setMinExperience(Number(e.target.value))}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold text-primary">Min Skill Match (%)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="100"
                    value={minSkillMatch}
                    className="shadow-sm"
                    onChange={(e) => setMinSkillMatch(Number(e.target.value))}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold text-primary">Min Education Score</Form.Label>
                  <Form.Select
                    value={minEduScore}
                    className="shadow-sm"
                    onChange={(e) => setMinEduScore(Number(e.target.value))}
                  >
                    <option value={0}>Any</option>
                    <option value={20}>High School+</option>
                    <option value={40}>Diploma+</option>
                    <option value={60}>Bachelor+</option>
                    <option value={80}>Master+</option>
                    <option value={100}>PhD</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mt-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold text-primary">Sort By</Form.Label>
                  <Form.Select
                    value={sortField}
                    className="shadow-sm"
                    onChange={(e) => setSortField(e.target.value)}
                  >
                    <option value="score">Score</option>
                    <option value="skillCoverage">Skill Match %</option>
                    <option value="expYears">Experience (yrs)</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold text-primary">Order</Form.Label>
                  <Form.Select
                    value={sortOrder}
                    className="shadow-sm"
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </motion.div>
        )}

        {/* ******** RESULTS TABLE ******** */}
        {loading && (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-4 shadow overflow-hidden"
          >
            <Table hover responsive className="align-middle mb-0">
              <thead className="bg-primary text-white">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Score</th>
                  <th>Skill Match %</th>
                  <th>Experience (yrs)</th>
                  <th>Matched Skills</th>
                  <th>Missing Skills</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((c, i) => (
                  <motion.tr
                    key={c.candidateId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{
                      backgroundColor: "rgba(230,240,255,0.5)",
                      transition: { duration: 0.2 },
                    }}
                  >
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td className="fw-bold text-primary">{c.score}</td>
                    <td>{c.skillCoverage}%</td>
                    <td>{c.expYears}</td>
                    <td>{c.matchedSkills.join(", ") || "—"}</td>
                    <td>{c.missingSkills.join(", ") || "—"}</td>
                  </motion.tr>
                ))}
              </tbody>
            </Table>
          </motion.div>
        )}

        {!loading && selectedJob && filtered.length === 0 && (
          <p className="text-center text-muted mt-3">No candidates match the filters.</p>
        )}
      </motion.div>
    </motion.div>
  );
}
