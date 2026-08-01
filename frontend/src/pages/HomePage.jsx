import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

// High-Resolution Professional Assets
const heroImages = [
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80", 
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80",
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay, ease: [0.215, 0.61, 0.355, 1], duration: 0.8 },
  }),
};

export default function HomePage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#0A0A0B] text-white antialiased selection:bg-blue-500/30">
      
      {/* ============================================= */}
      {/* CINEMATIC HERO SECTION */}
      {/* ============================================= */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Slider */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 2 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${heroImages[index]})` }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-black/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <span className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-bold tracking-[0.3em] uppercase text-blue-400 mb-8">
              The Future of Talent Acquisition
            </span>
            <h1 className="text-5xl lg:text-[90px] font-black tracking-tighter leading-[1.1] mb-8">
              Discover & Hire Talent <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                with Intelligence
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg lg:text-xl text-slate-400 font-light leading-relaxed mb-12">
              TalentIQ combines powerful smart resume parsing, intelligent matching, 
              secure proctored interviews and analytics — enabling smarter, faster and fairer hiring.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/register" className="w-full sm:w-auto px-10 py-5 bg-white text-black font-bold rounded-full hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                Get Started
              </Link>
              <a href="#solutions" className="w-full sm:w-auto px-10 py-5 border border-white/20 rounded-full font-bold hover:bg-white/5 transition-all">
                Explore Features
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================= */}
      {/* SMART INFRASTRUCTURE (BENTO GRID) */}
      {/* ============================================= */}
      <section id="solutions" className="py-32 px-6 lg:px-20 relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-4xl lg:text-6xl font-bold tracking-tighter mb-6">Designed for <br />Precision Hiring.</h2>
            <div className="w-20 h-1 bg-blue-600" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Bento Card */}
            <div className="md:col-span-2 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 p-12 border border-white/5 group">
              <div className="relative z-10">
                <span className="text-blue-400 font-bold uppercase tracking-widest text-xs">Matching Engine</span>
                <h3 className="text-3xl lg:text-5xl font-bold mt-4 mb-6 leading-tight">Smart Resume <br />Verification.</h3>
                <p className="text-slate-400 max-w-md">Our intelligent system accurately identifies skill sets and career trajectories to find your perfect candidate match instantly.</p>
              </div>
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/20 blur-[100px] group-hover:bg-blue-600/40 transition-all" />
            </div>

            {/* Small Bento Card */}
            <div className="rounded-[2.5rem] bg-[#111112] p-10 border border-white/5 flex flex-col justify-between hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">🔒</div>
              <div>
                <h4 className="text-xl font-bold mb-3">Secure Integrity</h4>
                <p className="text-slate-500 text-sm">Intelligent proctoring ensures a fair and secure assessment environment for every applicant.</p>
              </div>
            </div>

            {/* Square Bento Card */}
            <div className="rounded-[2.5rem] bg-[#111112] p-10 border border-white/5 flex flex-col justify-between hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">📊</div>
              <div>
                <h4 className="text-xl font-bold mb-3">Intelligent Analytics</h4>
                <p className="text-slate-500 text-sm">Visualize hiring velocity and candidate quality through comprehensive data-driven dashboards.</p>
              </div>
            </div>

            {/* Long Bento Card */}
            <div className="md:col-span-2 relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-12 border border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h4 className="text-2xl font-bold mb-4">Candidate Ranking</h4>
                  <p className="text-slate-500 text-sm mb-6">Our smart algorithms prioritize candidates based on experience, fit, and behavioral signals.</p>
                  <button className="text-blue-400 text-sm font-bold uppercase tracking-widest hover:underline">Learn More →</button>
                </div>
                <div className="flex gap-4 items-end justify-center">
                   {[60, 90, 70, 110, 80].map((h, i) => (
                     <motion.div 
                      initial={{ height: 0 }}
                      whileInView={{ height: h }}
                      key={i} 
                      className="w-8 bg-blue-600 rounded-t-lg" 
                     />
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* TECHNICAL EXCELLENCE SECTION */}
      {/* ============================================= */}
      <section className="py-24 bg-white text-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h3 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-8 italic">Engineered for Reliability.</h3>
              <p className="text-slate-600 leading-relaxed mb-10 text-lg">
                TalentIQ is built on a high-performance architecture that allows for 
                seamless processing of high-volume recruitment data. Our intelligent 
                backend services ensure that every resume and interview is handled with 
                maximum speed and security.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h5 className="font-bold text-blue-600 uppercase text-xs tracking-widest mb-2">Interface</h5>
                  <p className="text-sm font-medium">Responsive & Fluid React UI</p>
                </div>
                <div>
                  <h5 className="font-bold text-blue-600 uppercase text-xs tracking-widest mb-2">Systems</h5>
                  <p className="text-sm font-medium">Smart Data Processing Hub</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-[3rem] p-12 border border-slate-200 shadow-2xl relative overflow-hidden">
               <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <span className="font-bold">Intelligent Core</span>
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full uppercase tracking-tighter">Running</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <span className="font-bold">Secure Gateway</span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase tracking-tighter">Active</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100 opacity-50">
                    <span className="font-bold">Automated Feedback</span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-tighter">Standby</span>
                  </div>
               </div>
               <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-400/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* FINAL CALL TO ACTION */}
      {/* ============================================= */}
      <section className="py-40 relative overflow-hidden bg-[#0A0A0B]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl lg:text-8xl font-black tracking-tighter mb-12 italic">Ready to Hire?</h2>
          <Link to="/register" className="inline-block px-12 py-6 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-500 transition-all shadow-[0_20px_60px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95">
            Get Started with TalentIQ
          </Link>
          <p className="mt-12 text-slate-600 text-[10px] font-bold uppercase tracking-[0.5em]">Global Talent Intelligence Solutions</p>
        </div>
      </section>

      <footer className="py-10 border-t border-white/5 text-center text-slate-700 text-[10px] font-bold tracking-[0.2em] uppercase">
        © 2026 TalentIQ Platform — Precision in Every Step.
      </footer>
    </div>
  );
}
