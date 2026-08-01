
import React from "react";
import { motion } from "framer-motion";

const colors = {
  cyan: "from-cyan-400 to-cyan-600 shadow-cyan-500/20",
  violet: "from-indigo-500 to-violet-600 shadow-indigo-500/20",
  green: "from-emerald-400 to-green-600 shadow-emerald-500/20",
  rose: "from-rose-400 to-rose-600 shadow-rose-500/20",
  amber: "from-amber-400 to-amber-600 shadow-amber-500/20",
};

export default function StatCard({ title, value, hint, color = "cyan" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="rounded-3xl p-6 shadow-sm border border-slate-100 bg-white relative overflow-hidden transition-all hover:shadow-lg"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-grow">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {title}
          </div>
          <div className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
            {value}
          </div>
          {hint && (
            <div className="text-[11px] font-medium text-slate-500 mt-2 flex items-center gap-1">
              <span className="opacity-50">●</span> {hint}
            </div>
          )}
        </div>

        <div 
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white shadow-lg overflow-hidden`}
        >
          {/* Subtle background pattern inside the icon box */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)]" />
          <span className="text-lg font-black tracking-tighter relative z-10">
            {String(value).charAt(0) === '0' && String(value).length > 1 ? value : value}
          </span>
        </div>
      </div>

      {/* Background Decorative Blur */}
      <div 
        className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-3xl opacity-10 bg-gradient-to-br ${colors[color]}`}
        aria-hidden="true"
      />
    </motion.div>
  );
}
