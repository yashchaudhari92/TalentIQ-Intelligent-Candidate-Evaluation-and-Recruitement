import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../api/axios";
import { Card, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";

export default function CandidateTest() {
  const { jobId } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate(); // ✅ FIX

  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [percent, setPercent] = useState(null);

  useEffect(() => {
    async function loadTest() {
      try {
        const res = await API.get(
          `/tests/${jobId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTest(res.data.test);
      } catch {
        setMsg("❌ Failed to load test.");
      } finally {
        setLoading(false);
      }
    }
    loadTest();
  }, [jobId, token]);

  const handleChange = (i, val) => {
    setAnswers(prev => ({ ...prev, [i]: val }));
  };

  const submitTest = async () => {
    try {
      const answersArray = (test?.questions || []).map((_, i) =>
        String(answers[i] ?? "").trim()
      );

      const res = await API.post(
        `/tests/submit/${jobId}`,
        { answers: answersArray },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const percentVal = res.data.percent;
      const passedFlag = res.data.passed;

      setPercent(percentVal);

      if (passedFlag) {
        alert(`🎉 You passed the test! Score: ${percentVal}%`);
      } else {
        alert(`❌ You failed the test. Score: ${percentVal}%`);
      }

      // ⭐ SPA REDIRECT (NO 404)
      navigate("/candidate-dashboard?tab=applied");


    } catch {
      setMsg("❌ Error submitting test.");
    }
  };

  if (loading) return <Spinner />;

  if (!test) return <Alert>No test found.</Alert>;

  return (
    <div className="container mt-4">
      <Card className="p-4 shadow-sm">
        <h3>Job Test</h3>

        {msg && <Alert>{msg}</Alert>}

        {test.questions.map((q, i) => (
          <Form.Group key={i} className="mb-3">
            <Form.Label>
              <strong>{i + 1}. {q.question}</strong>
            </Form.Label>
            <Form.Control
              type="text"
              value={answers[i] ?? ""}
              onChange={(e) => handleChange(i, e.target.value)}
            />
          </Form.Group>
        ))}

        <Button className="mt-2" onClick={submitTest}>
          Submit Test
        </Button>
      </Card>
    </div>
  );
}
