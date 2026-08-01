// frontend/src/components/DashboardTopbar.jsx
import React from "react";
import { BellIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function DashboardTopbar({ onToggleSidebar, onSetActive }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/6 bg-transparent">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="p-2 rounded-md hover:bg-white/4">
          ☰
        </button>

        <div className="relative">
          <input
            onFocus={() => onSetActive && onSetActive("jobs")}
            placeholder="Search jobs, skills, companies..."
            className="w-72 md:w-96 px-4 py-2 rounded-full bg-[#071026] border border-white/6 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-cyan-500 transition"
          />
          <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-2.5 text-slate-400" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-md hover:bg-white/4">
          <BellIcon className="w-5 h-5 text-slate-300" />
          <span className="absolute -top-1 -right-1 text-xs bg-rose-500 text-white px-1 rounded-full">3</span>
        </button>

        <div className="flex items-center gap-3 bg-white/5 px-2 py-1 rounded-full">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-pink-600 flex items-center justify-center text-white">R</div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium">Rashi</div>
            <div className="text-xs text-slate-400">Candidate</div>
          </div>
        </div>
      </div>
    </header>
  );
}
