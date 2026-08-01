import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../api/axios";
import { useParams } from "react-router-dom";
import { Table, Spinner, Alert } from "react-bootstrap";
import { motion } from "framer-motion";

export default function RecruiterViewTest() {
  const { jobId } = useParams();
  const token = localStorage.getItem("token");

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        // 1️⃣ Get all applications for this job
        const appsRes = await API.get(
          `/applications/job/${jobId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const apps = appsRes.data;

        // 2️⃣ For each candidate, fetch test result
        const enriched = await Promise.all(
          apps.map(async (app) => {
            try {
              const testRes = await API.get(
                `/tests/result/${jobId}/${app.candidate._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              return {
                ...app,
                test: testRes.data,
              };
            } catch {
              return { ...app, test: { taken: false } };
            }
          })
        );

        setApplications(enriched);
      } catch (err) {
        setMsg("❌ Failed to load test results");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [jobId, token]);

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );

  return (
    <motion.div
      className="container mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h3 className="fw-bold mb-4 text-primary">Test Results</h3>

      {msg && <Alert variant="danger">{msg}</Alert>}

      <Table hover responsive className="shadow-sm rounded-3">
        <thead className="table-dark">
          <tr>
            <th>Candidate</th>
            <th>Email</th>
            <th>Test Taken</th>
            <th>Score</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {applications.map((app) => (
            <tr key={app._id}>
              <td>{app.candidate?.name}</td>
              <td>{app.candidate?.email}</td>

              <td>{app.test?.taken ? "✅ Yes" : "❌ No"}</td>

              <td>
                {app.test?.taken ? (
                  <span className="fw-bold">{app.test.score}%</span>
                ) : (
                  "—"
                )}
              </td>

              <td>
                {app.test?.taken ? (
                  app.test.passed ? (
                    <span className="badge bg-success">Passed</span>
                  ) : (
                    <span className="badge bg-danger">Failed</span>
                  )
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </motion.div>
  );
}
