
// IMP Code Below

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Spinner, Alert } from "react-bootstrap";
import { motion } from "framer-motion";
import API from "../api/axios";

export default function AppliedJobs() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const token = localStorage.getItem("token");

  const fetchApplications = async () => {
    try {
      const res = await API.get(
        "/applications/my-applications",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const apps = res.data;

      // Enhance test & score data
      const enhanced = await Promise.all(
        apps.map(async (app) => {
          const jobId = app.job?._id;

          let test = null;
          try {
            const testRes = await API.get(
              `/tests/${jobId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            test = testRes.data.test;
          } catch {}

          let result = {};
          try {
            const r = await API.get(
              `/tests/result/${jobId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            result = r.data;
          } catch {}

          return {
            ...app,
            testRequired: !!test,
            testTaken: result.taken ?? false,
            testPassed: result.passed ?? false,
            testScore: result.score ?? null,
          };
        })
      );

      setApplications(enhanced);
    } catch {
      setMsg("❌ Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  if (loading)
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </div>
    );

  return (
    <div className="my-3">
      <h3 className="fw-bold text-center mb-4">My Applications</h3>

      {msg && <Alert variant="danger">{msg}</Alert>}

      {applications.length === 0 ? (
        <p className="text-center mt-4 text-muted fs-5">
          You haven't applied to any jobs yet.
        </p>
      ) : (
        applications.map((app) => (
          <motion.div
            key={app._id}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="mb-4"
          >
            <Card
              className="border-0 shadow-lg"
              style={{
                background: "rgba(255,255,255,0.65)",
                backdropFilter: "blur(10px)",
                borderRadius: "18px",
              }}
            >
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <Card.Title className="fw-bold">{app.job?.title}</Card.Title>

                  {/* STATUS BADGE */}
                  <span
                    className="px-3 py-1 rounded-pill text-white"
                    style={{
                      background:
                        app.status === "shortlisted"
                          ? "linear-gradient(to right, #22c55e, #16a34a)"
                          : "linear-gradient(to right, #6366f1, #8b5cf6)",
                      fontSize: "12px",
                    }}
                  >
                    {app.status}
                  </span>
                </div>

                <Card.Subtitle className="text-muted mb-2">
                  📍 {app.job?.location} • 💰 {app.job?.salary}
                </Card.Subtitle>

                <div className="mt-3">
                  <p className="mb-1">
                    <strong>Your Note:</strong> {app.note || "—"}
                  </p>

                  {app.testScore !== null && (
                    <p className="mb-1">
                      <strong>Test Score:</strong>{" "}
                      <span
                        className="px-2 py-1 rounded-pill text-white"
                        style={{
                          background:
                            app.testScore >= 60
                              ? "linear-gradient(to right, #22c55e, #16a34a)"
                              : "linear-gradient(to right, #ef4444, #dc2626)",
                          fontSize: "12px",
                        }}
                      >
                        {app.testScore}%
                      </span>
                    </p>
                  )}
                </div>

                {/* TEST NEEDED & NOT TAKEN */}
                {app.testRequired && !app.testTaken && (
                  <button
                    className="btn btn-primary mt-3 px-4"
                    onClick={() => (window.location.href = `/test/${app.job._id}`)}
                  >
                    📝 Take Required Test
                  </button>
                )}

                {/* FAILED TEST */}
                {app.testRequired && app.testTaken && !app.testPassed && (
                  <Alert variant="warning" className="mt-3">
                    ❌ You failed the test. You cannot start the interview.
                  </Alert>
                )}

                {/* PASSED & SHORTLISTED */}
                {app.testRequired &&
                  app.testPassed &&
                  app.status === "shortlisted" && (
                    <button
                      className="btn btn-success mt-3 px-4"
                      onClick={() =>
                        (window.location.href = `/interview/${app.job._id}`)
                      }
                    >
                      🎯 Start AI Interview
                    </button>
                  )}

                {/* NO TEST REQUIRED */}
                {!app.testRequired && app.status === "shortlisted" && (
                  <button
                    className="btn btn-success mt-3 px-4"
                    onClick={() =>
                      (window.location.href = `/interview/${app.job._id}`)
                    }
                  >
                    🎯 Start AI Interview
                  </button>
                )}
              </Card.Body>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );
}
