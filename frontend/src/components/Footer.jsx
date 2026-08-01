
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#0d0d0d] text-white py-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              TalentIQ
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              AI-powered recruitment platform
            </p>
          </div>

          {/* Footer Links */}
          <div className="flex gap-6 text-sm text-slate-300">
            <Link className="hover:text-sky-400 transition" to="/about">About</Link>
            <Link className="hover:text-sky-400 transition" to="/features">Features</Link>
            <Link className="hover:text-sky-400 transition" to="/contact">Contact</Link>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mt-6 pt-4 text-center text-slate-500 text-sm">
          © {new Date().getFullYear()} TalentIQ. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
