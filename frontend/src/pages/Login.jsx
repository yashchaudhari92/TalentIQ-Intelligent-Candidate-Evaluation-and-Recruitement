import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Lottie from "lottie-react";
import successAnim from "../assets/success.json";

// Shared cinematic environments (Hiring/Collaboration focus)
const loginImages = [
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80", 
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80",
];

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % loginImages.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await API.post("/auth/login", {
        email,
        password,
      });

      setSuccessAnimation(true);
      setTimeout(() => {
        login(data);
        navigate(data.role === "recruiter" ? "/recruiter-dashboard" : "/candidate-dashboard");
      }, 1400);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] flex overflow-hidden selection:bg-blue-600/10 font-sans">
      
      {/* SUCCESS OVERLAY */}
      <AnimatePresence>
        {successAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xl z-[100]"
          >
            <Lottie animationData={successAnim} loop={false} className="w-48 h-48" />
            <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-slate-900 tracking-tight">
              Access Granted
            </motion.h3>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT: CINEMATIC GALLERY (Matched with Register) */}
      <div className="hidden lg:flex relative w-[48%] h-screen overflow-hidden bg-slate-100 border-r border-slate-200">
        <AnimatePresence mode="wait">
          <motion.div
            key={bgIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full bg-cover bg-center grayscale-[10%] brightness-[0.85]"
            style={{ backgroundImage: `url(${loginImages[bgIndex]})` }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/30 via-transparent to-[#F8FAFC]" />
        
        <div className="absolute bottom-20 left-16 z-10">
            <div className="w-16 h-1 bg-white mb-6 shadow-xl" />
            <h1 className="text-white text-6xl font-black tracking-tighter italic leading-none mb-4 drop-shadow-2xl">TalentIQ.</h1>
            <p className="text-white/90 text-lg font-semibold tracking-tight max-w-xs drop-shadow-md">
              Intelligent Hub for Modern Recruitment.
            </p>
        </div>
      </div>

      {/* RIGHT: LOGIN FORM (Matched with Register UI) */}
      <div className="w-full lg:w-[52%] flex items-center justify-center p-8 lg:p-24 bg-[#F8FAFC] overflow-y-auto relative">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-14">
            <h2 className="text-5xl font-black text-slate-950 tracking-tighter mb-4">Welcome Back.</h2>
            <p className="text-slate-500 font-medium">Enter your credentials to access the Dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* EMAIL */}
            <div className="space-y-2 group">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-600 transition-colors">
                Email
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 
                  text-slate-900 placeholder:text-slate-300 outline-none
                  focus:border-slate-900 focus:shadow-[0_0_0_4px_rgba(0,0,0,0.02)]
                  transition-all duration-300
                "
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="space-y-2 group">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] group-focus-within:text-blue-600 transition-colors">
                  Access Key
                </label>
                <button type="button" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition underline underline-offset-4 decoration-slate-200">
                  Recovery
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="
                    w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 
                    text-slate-900 placeholder:text-slate-300 outline-none
                    focus:border-slate-900 focus:shadow-[0_0_0_4_rgba(0,0,0,0.02)]
                    transition-all duration-300
                  "
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* ERROR DISPLAY */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-50 text-red-600 text-[11px] font-bold p-4 rounded-xl border border-red-100 flex items-center gap-3"
                >
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* SUBMIT BUTTON */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full py-4.5 bg-slate-950 text-white font-bold rounded-2xl 
                  hover:bg-blue-600 shadow-xl shadow-slate-200 hover:shadow-blue-100
                  transition-all duration-500 active:scale-[0.98] disabled:opacity-50
                  flex items-center justify-center gap-3
                "
              >
                {loading ? "Verifying..." : "Sign In"}
                {!loading && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
              </button>
            </div>

            {/* REGISTER LINK */}
            <div className="text-center pt-4">
              <p className="text-slate-500 text-sm font-medium">
                New to TalentIQ? {" "}
                <Link to="/register" className="text-slate-950 font-bold hover:text-blue-600 transition-colors underline underline-offset-4 decoration-slate-200 hover:decoration-blue-200">
                  Register Now
                </Link>
              </p>
            </div>
          </form>
        </motion.div>

        {/* SUBTLE BRANDING */}
        <div className="absolute bottom-8 right-8 text-[9px] text-slate-300 font-bold uppercase tracking-[0.4em] pointer-events-none">
           v2.0 // Intelligent Hub
        </div>
      </div>
    </div>
  );
}
