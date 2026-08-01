import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

// High-end cinematic hiring & tech environments
const aboutImages = [
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80",
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay, ease: [0.22, 1, 0.36, 1], duration: 1 },
  }),
};

export default function About() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % aboutImages.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#080809] text-white antialiased font-sans overflow-x-hidden">
      
      {/* ---------------- BACKGROUND DEPTH LAYERS ---------------- */}
      <div className="absolute inset-0 z-0 h-screen lg:h-[90vh] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.6, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${aboutImages[index]})` }}
          />
        </AnimatePresence>
        {/* Rich Layered Overlays for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080809]/40 via-transparent to-[#080809]" />
        <div className="absolute inset-0 bg-[#080809]/20" />
      </div>

      {/* ---------------- HERO CONTENT (FROSTED CONTRAST BOX) ---------------- */}
      <section className="relative z-10 min-h-screen flex items-center justify-center pt-24 pb-20 px-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="w-full max-w-[900px] text-center"
        >
          {/* Frosted Layer ensuring white text pops on any image */}
          <div className="p-12 lg:p-20 rounded-[4rem]  shadow-[0_32px_64px_rgba(0,0,0,0.4)]">
            
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-10">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.4em]">Our Vision & Identity</span>
            </motion.div>

            <h1 className="text-6xl lg:text-[100px] font-black tracking-tighter leading-[0.85] text-white mb-8">
              About <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                TalentIQ.
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg lg:text-xl text-slate-300 font-light leading-relaxed mb-12">
              Transforming recruitment with automation, smart analytics, and intelligent hiring infrastructures.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <Link
                to="/register"
                className="px-12 py-5 bg-white text-black font-bold rounded-2xl transition-all hover:bg-indigo-500 hover:text-white shadow-2xl active:scale-95 flex items-center gap-2"
              >
                Get Started
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ---------------- IDENTITY SECTIONS (MODERN OBSIDIAN) ---------------- */}
      <section className="relative z-10 py-12 px-6 lg:px-20 -mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-[#121214] p-12 lg:p-16 rounded-[3rem] border border-white/5 group hover:border-indigo-500/30 transition-all duration-500"
          >
            <div className="w-16 h-1 bg-indigo-500 mb-8 group-hover:w-24 transition-all duration-500" />
            <h2 className="text-3xl font-bold text-white mb-6 tracking-tighter">Who We Are</h2>
            <p className="text-slate-400 leading-relaxed font-light text-lg">
              TalentIQ is a modern HR-Tech platform focused on using intelligent systems to simplify recruitment.
              Our tools make hiring smarter, fair, and automation-driven for companies of all sizes.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            custom={0.2}
            className="bg-gradient-to-br from-[#121214] to-black p-12 lg:p-16 rounded-[3rem] border border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500"
          >
            <div className="relative z-10">
              <div className="w-16 h-1 bg-purple-500 mb-8 group-hover:w-24 transition-all duration-500" />
              <h2 className="text-3xl font-bold mb-6 tracking-tighter text-white">Our Mission</h2>
              <p className="text-slate-400 leading-relaxed font-light text-lg">
                To revolutionize hiring using automation, intelligent skill evaluation,
                smart resume analysis, and secure interview monitoring.
              </p>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]" />
          </motion.div>
        </div>
      </section>

      {/* ---------------- FEATURES SYSTEM ---------------- */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto text-center mb-24">
            <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter">
              Powerful Intelligence.
            </h2>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[
            { icon: "📄", title: "Smart Resume Parsing", desc: "Extract skills & experience instantly.", accent: "group-hover:text-blue-400" },
            { icon: "📝", title: "Test Evaluation", desc: "Auto-generate & auto-score MCQs.", accent: "group-hover:text-indigo-400" },
            { icon: "🎥", title: "Secure Proctoring", desc: "Live tracking & monitoring tools.", accent: "group-hover:text-purple-400" },
            { icon: "🎯", title: "Candidate Ranking", desc: "Intelligent ranking for best-role match.", accent: "group-hover:text-fuchsia-400" },
            { icon: "📈", title: "Visual Insights", desc: "Visual analytics & dashboards.", accent: "group-hover:text-rose-400" },
            { icon: "⚡", title: "End-to-End Workflow", desc: "Job posting to final hire integration.", accent: "group-hover:text-orange-400" },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              custom={i * 0.1}
              className="group p-12 rounded-[2.5rem] bg-[#121214] border border-white/5 hover:bg-black transition-all duration-500"
            >
              <div className="text-5xl mb-8 group-hover:scale-110 transition-transform duration-500">{f.icon}</div>
              <h4 className={`text-xl font-bold text-white mb-4 tracking-tight transition-colors ${f.accent}`}>
                {f.title}
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed font-light">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------- SIGNATURE ---------------- */}
      <footer className="relative z-10 py-16 border-t border-white/5 text-center">
        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.8em]">
           TalentIQ Intelligence // Established 2026
        </p>
      </footer>
    </div>
  );
}
