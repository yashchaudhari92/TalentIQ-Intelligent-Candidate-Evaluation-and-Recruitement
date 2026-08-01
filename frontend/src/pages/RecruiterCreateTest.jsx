import React, { useState } from "react";
import axios from "axios";
import API from "../api/axios";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";

export default function RecruiterCreateTest() {
  const { jobId } = useParams();
  const token = localStorage.getItem("token");

  const [questions, setQuestions] = useState([
    { question: "", correctAnswer: "" }
  ]);
  const [passScore, setPassScore] = useState(50);
  const [msg, setMsg] = useState("");
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);


  /* -------------------------------
    📥 DOWNLOAD SAMPLE EXCEL
--------------------------------*/
  const downloadSample = () => {
    const csvContent =
      "Question,CorrectAnswer\nWhat is Java?,language\nWhat is React?,library";

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_test_questions.csv";
    a.click();
  };

  /* -------------------------------
      👀 PREVIEW EXCEL (Frontend only)
  --------------------------------*/
  const handlePreview = async () => {
  if (!file) return alert("Select file first");

  const data = await file.arrayBuffer();

  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet);

  const parsed = json.map((row) => ({
    question: row.Question || row.question,
    correctAnswer: row.CorrectAnswer || row.correctAnswer,
  }));

  setPreviewData(parsed);
};

  /* -------------------------------
      Add Question
  --------------------------------*/
  const addQuestion = () => {
    setQuestions([...questions, { question: "", correctAnswer: "" }]);
  };

  const updateQuestion = (i, field, value) => {
    const updated = [...questions];
    updated[i][field] = value;
    setQuestions(updated);
  };

  /* -------------------------------
      Upload Excel (NEW FEATURE)
  --------------------------------*/
  const uploadExcel = async () => {
    if (!file) return alert("Please select an Excel file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post(
        `/tests/upload-excel/${jobId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // ✅ Auto-fill questions UI
      setQuestions(res.data.test.questions);

      setMsg("✅ Questions imported from Excel!");
    } catch {
      setMsg("❌ Excel upload failed");
    }
  };

  /* -------------------------------
      Save Test
  --------------------------------*/
  const saveTest = async () => {
    try {
      await API.post(
        `/tests/create/${jobId}`,
        { questions, passScore },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg("✅ Test created successfully!");
    } catch {
      setMsg("❌ Failed to create test.");
    }
  };

  return (
    <motion.div
      className="container mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Card
          className="p-4 shadow-lg rounded-4"
          style={{
            background: "linear-gradient(135deg,#eef2ff,#ffffff)",
            border: "1px solid #dbe4ff"
          }}
        >
          <h2 className="fw-bold text-primary mb-3">Create Test for Job</h2>

          {/* Message */}
          <AnimatePresence>
            {msg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert
                  variant={msg.startsWith("❌") ? "danger" : "success"}
                  className="rounded-3 shadow-sm"
                >
                  {msg}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* -------------------------------
            📥 DOWNLOAD SAMPLE (NEW)
        --------------------------------*/}
          <motion.button
            onClick={downloadSample}
            className="mb-3 px-4 py-2 rounded-pill fw-semibold text-white shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: "linear-gradient(90deg,#6b7280,#4b5563)",
              border: "none"
            }}
          >
            📥 Download Sample Excel
          </motion.button>

          {/* -------------------------------
            📂 EXCEL UPLOAD (EXISTING + ENHANCED)
        --------------------------------*/}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold text-primary">
              Upload Questions (Excel)
            </Form.Label>
            <Form.Control
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </Form.Group>

          {/* 👀 PREVIEW BUTTON (NEW) */}
          <motion.button
            onClick={handlePreview}
            className="mb-3 me-2 px-4 py-2 rounded-pill fw-semibold text-white shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: "linear-gradient(90deg,#0ea5e9,#0284c7)",
              border: "none"
            }}
          >
            👀 Preview
          </motion.button>

          {/* 📂 IMPORT BUTTON (EXISTING) */}
          <motion.button
            onClick={uploadExcel}
            className="mb-4 px-4 py-2 rounded-pill fw-semibold text-white shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: "linear-gradient(90deg,#9333ea,#7c3aed)",
              border: "none"
            }}
          >
            📂 Import from Excel
          </motion.button>

          {/* -------------------------------
            👀 PREVIEW TABLE (NEW)
        --------------------------------*/}
          {previewData && previewData.length > 0 && (
            <div className="mb-4">
              <h5 className="fw-bold text-primary mb-2">Preview Questions</h5>

              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Question</th>
                      <th>Correct Answer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((q, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{q.question}</td>
                        <td>{q.correctAnswer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* QUESTIONS LIST (UNCHANGED) */}
          <AnimatePresence>
            {questions.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-3 p-3 rounded-4 shadow-sm"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  border: "1px solid #e1e8ff",
                  backdropFilter: "blur(10px)"
                }}
              >
                <h5 className="fw-semibold text-primary mb-3">
                  Question {i + 1}
                </h5>

                <Form.Group className="mb-2">
                  <Form.Label className="fw-bold">Question</Form.Label>
                  <Form.Control
                    className="shadow-sm"
                    value={q.question}
                    onChange={(e) =>
                      updateQuestion(i, "question", e.target.value)
                    }
                    placeholder="Enter question here..."
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className="fw-bold">Correct Answer</Form.Label>
                  <Form.Control
                    className="shadow-sm"
                    value={q.correctAnswer}
                    onChange={(e) =>
                      updateQuestion(i, "correctAnswer", e.target.value)
                    }
                    placeholder="Enter correct answer..."
                  />
                </Form.Group>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* ADD QUESTION BUTTON (UNCHANGED) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addQuestion}
            className="mt-2 mb-3 px-4 py-2 rounded-pill fw-semibold text-white shadow-sm"
            style={{
              background: "linear-gradient(90deg, #2563eb, #4f46e5)",
              border: "none"
            }}
          >
            + Add Question
          </motion.button>

          {/* PASS SCORE (UNCHANGED) */}
          <Form.Group className="mt-3">
            <Form.Label className="fw-bold text-primary">
              Passing Score (%)
            </Form.Label>
            <Form.Control
              type="number"
              className="shadow-sm"
              value={passScore}
              onChange={(e) => setPassScore(e.target.value)}
            />
          </Form.Group>

          {/* SAVE TEST BUTTON (UNCHANGED) */}
          <motion.button
            className="mt-4 px-4 py-2 rounded-3 fw-semibold text-white shadow"
            onClick={saveTest}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            style={{
              background: "linear-gradient(90deg,#10b981,#059669)",
              border: "none",
              fontSize: "1rem"
            }}
          >
            Save Test
          </motion.button>
        </Card>
      </motion.div>
    </motion.div>
  );
}
