import React from "react";
import { motion } from "framer-motion";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-indigo-100 text-gray-800 py-20 px-6">
      
      {/* ---------- PAGE TITLE ---------- */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-6xl text-center font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent"
      >
        Contact Us
      </motion.h1>

      <p className="text-center mt-4 text-gray-600 max-w-xl mx-auto text-lg">
        Have questions? Want a demo? We’re happy to assist you.
      </p>

      <div className="max-w-5xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ---------- CONTACT INFO ---------- */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white p-8 rounded-2xl border border-blue-100 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-blue-700">Get In Touch</h2>
          <p className="text-gray-600 mt-3">
            Our team usually responds within 24 hours.
          </p>

          <div className="mt-6 space-y-4 text-gray-700">
            <p>📧 Email: support@talentiq.com</p>
            <p>📞 Phone: +91 8805619892</p>
            <p>📍 Location: Pune, India</p>
          </div>
        </motion.div>

        {/* ---------- CONTACT FORM ---------- */}
        <motion.form
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white p-8 rounded-2xl border border-blue-100 shadow-lg space-y-4"
        >
          <div>
            <label className="text-gray-700">Your Name</label>
            <input
              type="text"
              className="w-full mt-1 p-3 rounded-lg bg-white border border-gray-300 text-gray-700"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="text-gray-700">Email Address</label>
            <input
              type="email"
              className="w-full mt-1 p-3 rounded-lg bg-white border border-gray-300 text-gray-700"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="text-gray-700">Message</label>
            <textarea
              rows={4}
              className="w-full mt-1 p-3 rounded-lg bg-white border border-gray-300 text-gray-700"
              placeholder="Type your message here..."
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold text-white shadow-lg"
          >
            Send Message
          </button>
        </motion.form>
      </div>
    </div>
  );
}
