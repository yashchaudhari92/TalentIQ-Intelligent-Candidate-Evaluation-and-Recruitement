

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  loadModels,
  detectFace,
  detectMultipleFaces,
  detectPhone,
} from "./FaceDetection";
import API from "../api/axios";

export default function AIInterviewSession({ session }) {
  const { sessionId, questions } = session;

  /* ===== STATES ===== */
  const [current, setCurrent] = useState(0);
  const [recording, setRecording] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const [faceDetected, setFaceDetected] = useState(false);
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [phoneDetected, setPhoneDetected] = useState(false);

  const [assistantSpeaking, setAssistantSpeaking] = useState(false);
  const [listening, setListening] = useState(false);

  const [tabActive, setTabActive] = useState(true);
  const [alertMsg, setAlertMsg] = useState("");
  const [warnings, setWarnings] = useState(0);

  const [liveTranscript, setLiveTranscript] = useState("");
  const [editableAnswer, setEditableAnswer] = useState("");
  const [lastRecognizedText, setLastRecognizedText] = useState("");
  const [answers, setAnswers] = useState([]);

  /* ===== REFS ===== */
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const proctorIntervalRef = useRef(null);
  const token = localStorage.getItem("token");

  /* ===== INIT CAMERA ===== */
  useEffect(() => {
    const init = async () => {
      try {
        await loadModels();

        alert("Please allow Camera, Microphone & Screen Recording access.");

        const camStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });

        const combined = new MediaStream([
          ...screenStream.getVideoTracks(),
          ...camStream.getVideoTracks(),
          ...camStream.getAudioTracks(),
        ]);

        streamRef.current = combined;

        if (videoRef.current) {
          videoRef.current.srcObject = camStream;
          videoRef.current.play().catch(() => { });
        }

        setCameraReady(true);
      } catch (err) {
        console.error("Permission error:", err);
        alert("Permission denied. Please allow Camera + Mic + Screen.");
      }
    };

    init();

    document.addEventListener("visibilitychange", () => {
      const active = !document.hidden;
      setTabActive(active);
      if (!active) addWarning("⚠️ You switched tabs!");
    });

    return () => {
      recognitionRef.current?.stop();
      proctorIntervalRef.current && clearInterval(proctorIntervalRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  /* ===== ALERT SYSTEM ===== */
  const showAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(""), 3000);
  };

  const addWarning = (msg) => {
    setWarnings((prev) => {
      const newCount = prev + 1;
      showAlert(msg);

      if (newCount >= 5) {
        alert("🚫 Interview terminated due to too many violations.");
        window.location.href = "/candidate-dashboard";
      }
      return newCount;
    });
  };

  /* ===== TTS ===== */
  const speakText = (text) =>
    new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      u.pitch = 1;
      u.lang = "en-US";

      u.onstart = () => setAssistantSpeaking(true);
      u.onend = () => {
        setAssistantSpeaking(false);
        resolve();
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    });

  /* ===== PROCTORING ===== */
  const startProctoring = () => {
    proctorIntervalRef.current = setInterval(async () => {
      const v = videoRef.current;
      if (!v) return;

      const isFace = await detectFace(v);
      const manyFaces = await detectMultipleFaces(v);
      const phone = await detectPhone(v);

      setFaceDetected(isFace);
      setMultipleFaces(manyFaces);
      setPhoneDetected(phone);

      if (!isFace) {
        addWarning("🚫 Face missing!");
        await speakText("Please stay in front of the camera.");
      }

      if (manyFaces) {
        addWarning("🚫 Multiple faces detected!");
        await speakText("Only one person allowed.");
      }

      if (phone) {
        addWarning("🚫 Phone detected!");
        await speakText("Please avoid using your phone.");
      }
    }, 1500);
  };

  /* ===== RECORDING ===== */
  const startRecording = () => {
    if (!streamRef.current) return alert("Stream not ready!");

    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm;codecs=vp8,opus",
    });

    chunksRef.current = [];
    recorder.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    recorder.start();

    mediaRecorderRef.current = recorder;
    setRecording(true);

    startProctoring();
    startListening();
  };

  const stopAndUpload = async (qIndex) => {
    const rec = mediaRecorderRef.current;
    if (!rec) return;

    rec.stop();
    setRecording(false);

    await new Promise((r) => setTimeout(r, 300));

    const blob = new Blob(chunksRef.current, { type: "video/webm" });

    const fd = new FormData();
    fd.append("qIndex", qIndex);
    fd.append("answer", blob, `answer_${qIndex}.webm`);

    await API.post(
      `/ai-interview/upload-answer/${sessionId}`,
      fd,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  /* ===== SPEECH RECOGNITION ===== */
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = true;

    setLiveTranscript("");
    setEditableAnswer("");

    rec.onstart = () => setListening(true);

    rec.onresult = (event) => {
      const text = event.results[event.results.length - 1][0].transcript;
      setLiveTranscript(text);
      setEditableAnswer(text);
      setLastRecognizedText(text);
    };

    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    recognitionRef.current = rec;
    rec.start();
  };

  /* ===== SUBMIT ANSWER ===== */
  const submitAnswer = async () => {
    if (!editableAnswer.trim()) return alert("Please answer first.");

    try {
      recognitionRef.current?.stop();

      await stopAndUpload(current);

      const newAnswer = {
        question: questions[current],
        answer: editableAnswer.trim()
      };

      const updatedAnswers = [...answers, newAnswer];

      // ✅ update state
      setAnswers(updatedAnswers);

      await speakText("Answer recorded.");

      // ✅ PASS updatedAnswers
      nextQuestion(updatedAnswers);

    } catch (err) {
      console.error("❌ Submit failed:", err);
      alert("Something failed while submitting answer.");
    }
  };

  /* ===== NEXT QUESTION ===== */
  const nextQuestion = async (finalAnswers = answers) => {
    const next = current + 1;

    if (next >= questions.length) {
      try {
        await API.post(
          "/ai-interview/analyze-all",
          { sessionId, qa_list: finalAnswers },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Bulk analysis failed", err);
      }

      await API.post(`/ai-interview/finalize/${sessionId}`);
      alert("🎉 Interview finished!");
      return;
    }

    setCurrent(next);
    setLiveTranscript("");
    setEditableAnswer("");

    await speakText(questions[next]);
    startRecording();
  };

  /* ===== REMAINING CODE UNCHANGED ===== */

  /* ===== REPEAT ===== */
  const repeatQuestion = async () => {
    recognitionRef.current?.stop();
    await speakText(questions[current]);
    startRecording();
  };

  useEffect(() => {
    if (!cameraReady) return;

    const interval = setInterval(async () => {
      const isFace = await detectFace(videoRef.current);
      if (isFace) {
        clearInterval(interval);
        await speakText("Welcome to your AI interview.");
        await speakText("Let's begin.");
        await speakText(questions[0]);
        startRecording();
      }
    }, 800);

    return () => clearInterval(interval);
  }, [cameraReady]);

  const stopInterviewManually = async () => {
    try {
      recognitionRef.current?.stop();
      proctorIntervalRef.current && clearInterval(proctorIntervalRef.current);
      mediaRecorderRef.current?.stop();

      // ✅ IMPORTANT: RUN ANALYSIS FIRST
      if (answers.length >= 2) {
        await API.post(
          "/ai-interview/analyze-all",
          {
            sessionId,
            qa_list: answers,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      // ✅ THEN FINALIZE
      await API.post(
        `/ai-interview/finalize/${sessionId}`
      );

      alert("Interview stopped successfully.");
      window.location.href = "/candidate-dashboard?tab=applied";
    } catch (err) {
      alert("Failed to stop interview.");
    }
  };


  /* ===== UI ===== */
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-3xl shadow-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 "
    >
      {/* QUESTION BOX */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 rounded-2xl bg-white shadow-md border border-blue-200"
      >
        <h3 className="text-xl font-bold text-blue-600">
          Question {current + 1} / {questions.length}
        </h3>
        <p className="mt-2 text-lg text-gray-700">{questions[current]}</p>
      </motion.div>

      {/* WARNINGS */}
      {alertMsg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 mb-4 bg-red-100 text-red-700 rounded-xl text-center"
        >
          {alertMsg}
        </motion.div>
      )}

      {/* INDICATORS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6"
      >
        <Indicator label="Face" value={faceDetected ? "Detected" : "Missing"} ok={faceDetected} />
        <Indicator label="Multi-face" value={multipleFaces ? "Detected!" : "Single"} ok={!multipleFaces} />
        <Indicator label="Phone" value={phoneDetected ? "Detected!" : "Clean"} ok={!phoneDetected} />
        <Indicator label="Focus" value={tabActive ? "Focused" : "Left Tab"} ok={tabActive} />
        <Indicator label="Warnings" value={`${warnings}/5`} ok={warnings < 5} />
        <Indicator label="Mic" value={listening ? "Listening..." : "Idle"} ok={listening} />
      </motion.div>

      {/* WEBCAM BOX */}
      <motion.video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="
          w-full max-w-lg mx-auto rounded-2xl shadow-xl 
          border-4 flex justify-center
        "
        style={{
          borderColor: faceDetected ? "#16a34a" : "#dc2626",
        }}
      />

      {/* ANSWER SECTION */}
      <div className="mt-6">
        <h4 className="font-semibold text-blue-700">🎤 Live Transcript</h4>
        <p className="p-3 bg-white rounded-xl border border-blue-200 shadow-sm text-gray-700">
          {liveTranscript || "Listening..."}
        </p>

        <h4 className="mt-4 font-semibold text-blue-700">📝 Edit Answer</h4>
        <textarea
          rows="3"
          className="w-full p-3 rounded-xl border border-blue-200 shadow-sm bg-white focus:ring-2 focus:ring-blue-300"
          value={editableAnswer}
          onChange={(e) => setEditableAnswer(e.target.value)}
        />
      </div>

      {/* BUTTONS */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Button color="yellow" onClick={repeatQuestion}>
          🔁 Repeat Question
        </Button>

        {!recording ? (
          <Button color="green" onClick={startRecording}>
            🎥 Start Recording
          </Button>
        ) : (
          <Button color="red" onClick={() => stopAndUpload(current)}>
            ⏹ Stop Recording
          </Button>
        )}

        <Button color="blue" onClick={submitAnswer}>
          ✔ Submit Answer
        </Button>

        <Button color="red" onClick={stopInterviewManually}>
          🛑 Stop Interview
        </Button>

      </div>

      {assistantSpeaking && (
        <p className="mt-4 text-center text-blue-600 animate-pulse">
          🗣 Assistant speaking…
        </p>
      )}
    </motion.div>
  );
}

/* ===== INDICATOR COMPONENT ===== */
function Indicator({ label, value, ok }) {
  return (
    <div
      className={`p-3 rounded-xl shadow bg-white border text-center ${ok ? "border-green-300" : "border-red-300"
        }`}
    >
      <div className="font-semibold text-gray-700">{label}</div>
      <div className={`text-sm mt-1 ${ok ? "text-green-600" : "text-red-600"}`}>
        {value}
      </div>
    </div>
  );
}

/* ===== BUTTON COMPONENT ===== */
function Button({ children, color, onClick }) {
  const colors = {
    blue: "from-blue-600 to-indigo-600",
    red: "from-red-600 to-red-700",
    green: "from-green-600 to-green-700",
    yellow: "from-yellow-500 to-yellow-600",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-6 py-3 rounded-xl text-white font-semibold shadow-lg bg-gradient-to-r ${colors[color]} hover:opacity-90`}
    >
      {children}
    </motion.button>
  );
}
