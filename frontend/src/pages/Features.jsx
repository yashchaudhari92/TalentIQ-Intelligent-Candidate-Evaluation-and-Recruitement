import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

// Premium Cinematic Textures & Workspaces
const featureBgImages = [
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

export default function Features() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % featureBgImages.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: "📄",
      title: "Smart Resume Parsing",
      desc: "Instantly extracts professional skills, deep experience, and education history.",
      accent: "bg-blue-500"
    },
    {
      icon: "🎯",
      title: "Intelligent Ranking",
      desc: "Sophisticated scoring systems to identify and shortlist top-tier talent instantly.",
      accent: "bg-indigo-500"
    },
    {
      icon: "📝",
      title: "Automated Skill Testing",
      desc: "Generates intelligent assessments and auto-scores technical proficiency.",
      accent: "bg-purple-500"
    },
    {
      icon: "🎥",
      title: "Secure Proctoring",
      desc: "Monitors engagement and environment integrity to ensure a fair hiring process.",
      accent: "bg-fuchsia-500"
    },
    {
      icon: "📊",
      title: "Intelligent Analytics",
      desc: "Deep visual data insights for smarter, evidence-based hiring decisions.",
      accent: "bg-rose-500"
    },
    {
      icon: "⚡",
      title: "Seamless Workflow",
      desc: "End-to-end integration from job creation to the final intelligent offer.",
      accent: "bg-orange-500"
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#030303] text-white antialiased font-sans overflow-x-hidden">
      
      {/* ---------------- BACKGROUND DEPTH LAYERS ---------------- */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${featureBgImages[index]})` }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030303]/80 to-[#030303]" />
        
        {/* Organic Mesh Glows */}
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-indigo-600/20 blur-[140px] rounded-full" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-purple-600/10 blur-[140px] rounded-full" />
      </div>

      {/* ---------------- HERO SECTION (MODERN GLOW) ---------------- */}
      <section className="relative z-10 pt-48 pb-24 px-6 text-center">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-[0.4em] uppercase text-indigo-400 mb-8 backdrop-blur-md">
            Capabilities // v2.0
          </div>
          <h1 className="text-6xl lg:text-[110px] font-black tracking-tighter leading-[0.85] mb-10">
            System <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400">
              Intelligence.
            </span>
          </h1>
          <p className="max-w-xl mx-auto text-lg text-slate-400 font-light leading-relaxed">
            Experience the future of recruitment through smart automation and intelligent assessment infrastructures.
          </p>
        </motion.div>
      </section>

      {/* ---------------- BENTO GRID (GLASS INTERACTIVE) ---------------- */}
      <section className="relative z-10 py-24 px-6 lg:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileInView="visible"
              initial="hidden"
              viewport={{ once: true }}
              variants={fadeInUp}
              custom={i * 0.1}
              className="group relative p-1 bg-gradient-to-b from-white/10 to-transparent rounded-[2.5rem] transition-all duration-500 hover:scale-[1.02]"
            >
              <div className="relative h-full bg-[#080809] p-10 rounded-[2.4rem] overflow-hidden">
                {/* Accent Background Blur */}
                <div className={`absolute -right-10 -top-10 w-32 h-32 ${f.accent} opacity-0 group-hover:opacity-10 blur-[60px] transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className="text-5xl mb-8 group-hover:scale-110 transition-transform duration-500">{f.icon}</div>
                  <h3 className="text-2xl font-bold mb-4 tracking-tight text-white/90 italic">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-light">{f.desc}</p>
                </div>

                {/* Micro-interaction Border */}
                <div className={`absolute bottom-0 left-0 h-1 w-0 ${f.accent} group-hover:w-full transition-all duration-700 ease-in-out`} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------- MODERN CTA (OBSIDIAN STYLE) ---------------- */}
      <section className="relative z-10 py-40 flex justify-center px-6">
        <motion.div 
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 40 }}
          className="w-full max-w-5xl p-16 rounded-[4rem] bg-gradient-to-br from-[#111112] to-[#080809] border border-white/5 text-center relative overflow-hidden shadow-3xl"
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
          
          <h2 className="text-4xl lg:text-7xl font-black tracking-tighter mb-8 text-white/90">
            Contact for any queries 
          </h2>
          
          <div className="flex flex-wrap justify-center gap-6 mt-12">
            <Link
              to="/contact"
              className="px-12 py-5 bg-white text-black font-bold rounded-2xl hover:bg-indigo-500 hover:text-white transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.05)] active:scale-95"
            >
              Contact Specialist
            </Link>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 border-t border-white/5 pt-10">
             <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                   <div key={i} className="w-8 h-8 rounded-full border border-black bg-slate-800" />
                ))}
             </div>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Deployments Active</p>
          </div>
        </motion.div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.8em]">
          TalentIQ // Systems Core // 2026
        </p>
      </footer>
    </div>
  );
}
