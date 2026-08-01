// frontend/src/components/DashboardSidebar.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  HomeIcon,
  BriefcaseIcon,
  InboxIcon,
  UserCircleIcon,
  DocumentTextIcon,
  Bars3Icon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import API from "../api/axios";

const items = [
  { id: "overview", label: "Overview", icon: HomeIcon },
  { id: "jobs", label: "Jobs", icon: BriefcaseIcon },
  { id: "applied", label: "Applied", icon: DocumentTextIcon },
  { id: "mailbox", label: "Mailbox", icon: InboxIcon },
  { id: "profile", label: "Profile", icon: UserCircleIcon },
  { id: "feedback", label: "Feedback", icon: ChartBarIcon },
];

export default function DashboardSidebar({ open = true, setOpen, active, setActive }) {
  return (
    <motion.aside
      initial={{ width: open ? 240 : 72 }}
      animate={{ width: open ? 240 : 72 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="h-screen bg-gradient-to-b from-[#071226] to-[#061020] border-r border-white/6 text-slate-200"
      style={{ minWidth: open ? 240 : 72 }}
    >
      <div className="p-4 h-full flex flex-col">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-black font-bold">
            TI
          </div>
          {open && (
            <div>
              <div className="font-bold text-lg">TalentIQ</div>
              <div className="text-xs text-slate-400">AI Recruitment</div>
            </div>
          )}
          <div className="ml-auto">
            <button
              onClick={() => setOpen((s) => !s)}
              className="p-2 rounded-md hover:bg-white/4"
              aria-label="toggle"
            >
              <Bars3Icon className="w-5 h-5 text-slate-200" />
            </button>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1">
          <ul className="flex flex-col gap-1">
            {items.map((it) => {
              const Icon = it.icon;
              const isActive = active === it.id;
              return (
                <li key={it.id}>
                  <button
                    onClick={() => setActive(it.id)}
                    className={`group w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive ? "bg-gradient-to-r from-cyan-600/30 to-violet-600/20" : "hover:bg-white/3"
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${isActive ? "text-cyan-300" : "text-slate-300 group-hover:text-white"}`} />
                    {open && <span className="flex-1 text-left">{it.label}</span>}
                    {isActive && open && <span className="text-xs text-slate-400">active</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto px-3 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white">R</div>
            {open && (
              <div className="flex-1">
                <div className="text-sm font-medium">Rashi K.</div>
                <div className="text-xs text-slate-400">Candidate</div>
              </div>
            )}
            <button className="p-2 rounded-md hover:bg-white/4">•••</button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
