

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const isLoggedIn = !!localStorage.getItem("token");
  const savedUser = JSON.parse(localStorage.getItem("user") || "null");
  const userRole = savedUser?.role;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0d0d0d]/80 backdrop-blur-lg border-b border-white/10 shadow-md" style={{zIndex:"9999"}}>
      <div className="mx-auto max-w-7xl px-4 flex justify-between items-center py-4">

        {/* Brand */}
        <Link to="/" className="text-3xl font-bold tracking-wide">
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent hover:drop-shadow-[0_0_6px_rgba(120,120,255,0.8)] transition">
            TalentIQ
          </span>
        </Link>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden flex flex-col gap-1 p-2 rounded transition"
        >
          <span
            className={`h-0.5 w-7 rounded bg-black transition-all duration-300 ${
              open ? "rotate-45 translate-y-2" : ""
            }`}
          ></span>

          <span
            className={`h-0.5 w-7 rounded bg-black transition-all duration-300 ${
              open ? "opacity-0" : ""
            }`}
          ></span>

          <span
            className={`h-0.5 w-7 rounded bg-black transition-all duration-300 ${
              open ? "-rotate-45 -translate-y-2" : ""
            }`}
          ></span>
        </button>

        {/* Menu */}
        <div
          className={`${
            open ? "block" : "hidden"
          } lg:flex absolute lg:static top-16 left-0 w-full lg:w-auto bg-[#0d0d0d]/90 lg:bg-transparent backdrop-blur-lg lg:backdrop-blur-none border-b border-white/10 lg:border-none`}
        >
          <ul className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-8 p-6 lg:p-0 text-white text-lg">

            {!isLoggedIn ? (
              <>
                <li>
                  <Link className="hover:text-blue-400 transition" to="/">Home</Link>
                </li>
                <li>
                  <Link className="hover:text-blue-400 transition nav-link" to="/about">About</Link>
                </li>
                <li>
                  <Link className="hover:text-blue-400 transition" to="/login">Login</Link>
                </li>
                <li>
                  <Link
                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md transition"
                    to="/register"
                  >
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <>
                {userRole === "candidate" && (
                  <li>
                    <Link className="hover:text-blue-400 transition" to="/candidate-dashboard">
                      Candidate Dashboard
                    </Link>
                  </li>
                )}

                {userRole === "recruiter" && (
                  <li>
                    <Link className="hover:text-blue-400 transition" to="/recruiter-dashboard">
                      Recruiter Dashboard
                    </Link>
                  </li>
                )}

                <li>
                  <button
                    className="text-red-400 hover:text-red-500 transition"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}

          </ul>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
