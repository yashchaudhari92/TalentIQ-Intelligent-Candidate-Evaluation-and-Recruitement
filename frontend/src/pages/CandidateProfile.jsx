import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";

export default function CandidateProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    education: [],
    skills: [],
    experience: [],
    parsedData: {},
    resumeUrl: null,
  });

  const [skillsInput, setSkillsInput] = useState("");
  const [experienceInput, setExperienceInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await API.get("/candidate/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        setProfile({
          ...data,
          education: Array.isArray(data.education) ? data.education : [],
          skills: Array.isArray(data.skills) ? data.skills : [],
          experience: Array.isArray(data.experience) ? data.experience : [],
          parsedData: data.parsedData || {},
        });
        setSkillsInput(data.skills?.join(", ") || "");
        setExperienceInput(data.experience?.map((ex) => ex.role).join(", ") || "");
      } catch (err) {
        setMsg(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [token]);

  const calculateProfileCompletion = () => {
    let score = 0;
    if (profile.name && profile.email) score += 20;
    if (profile.education?.length > 0) score += 30;
    if (profile.skills?.length > 0) score += 20;
    if (profile.experience?.length > 0) score += 10;
    if (profile.resumeUrl) score += 20;
    return score;
  };

  const completion = calculateProfileCompletion();

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMsg("");
    const updatedSkills = skillsInput.split(",").map((s) => s.trim()).filter((s) => s);
    const updatedExperience = experienceInput.split(",").map((r) => ({ role: r.trim() })).filter((r) => r.role);

    if (profile.education.length === 0) return setMsg("Please add at least one education entry.");
    for (let edu of profile.education) {
      if (!edu.degree.trim() || !edu.institution.trim() || !edu.year.trim())
        return setMsg("All education fields are required.");
    }
    if (updatedSkills.length === 0) return setMsg("Please enter at least one skill.");

    try {
      const res = await API.put("/candidate/profile",
        { education: profile.education, skills: updatedSkills, experience: updatedExperience },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg(res.data.message);
      setProfile({ ...profile, skills: updatedSkills, experience: updatedExperience });
    } catch (err) {
      setMsg(err.response?.data?.message || "Update failed");
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return setMsg("Select a resume first!");
    const formData = new FormData();
    formData.append("resume", resumeFile);
    try {
      const res = await API.post("/candidate/upload-resume", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      setMsg(res.data.message);
      setProfile(res.data.candidate);
    } catch (err) {
      setMsg(err.response?.data?.message || "Resume upload failed");
    }
  };

  const addEducation = () => {
    setProfile({ ...profile, education: [...profile.education, { degree: "", institution: "", year: "" }] });
  };

  const updateEducation = (index, field, value) => {
    const updated = [...profile.education];
    updated[index][field] = value;
    setProfile({ ...profile, education: updated });
  };

  const removeEducation = (index) => {
    const updated = profile.education.filter((_, i) => i !== index);
    setProfile({ ...profile, education: updated });
  };

  // ---------------- UI UTILS ----------------
  const inputBase = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all";
  const readOnlyBase = "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500 cursor-not-allowed outline-none font-medium";

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] p-4 md:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-6">
        
        {/* Main Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 bg-slate-50/50">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Candidate Profile</h1>
              <p className="text-xs text-slate-500">Keep your professional details up to date.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Profile Strength</p>
                <p className="text-sm font-bold text-indigo-600">{completion}%</p>
              </div>
              <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${completion}%` }} className="h-full bg-indigo-600 rounded-full" />
              </div>
            </div>
          </div>

          <div className="p-6">
            {msg && (
              <div className={`mb-6 p-3 rounded-lg text-xs font-semibold border ${msg.toLowerCase().includes("fail") ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
                {msg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-8">
              
              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-50">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 ml-0.5">Full Name</label>
                  <input type="text" value={profile.name} readOnly className={readOnlyBase} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 ml-0.5">Email Address</label>
                  <input type="email" value={profile.email} readOnly className={readOnlyBase} />
                </div>
              </div>

              {/* Education Section */}
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                    <span className="w-1 h-4 bg-indigo-600 rounded-full"></span>
                    Academic History
                  </h3>
                  <button type="button" onClick={addEducation} className="text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100 transition-colors">
                    + Add Education
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <AnimatePresence>
                    {profile.education.map((edu, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 border border-slate-100 rounded-lg bg-slate-50/30 group relative">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Degree</label>
                            <input type="text" placeholder="B.Tech IT" value={edu.degree} onChange={(e) => updateEducation(idx, "degree", e.target.value)} className={inputBase} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Institution</label>
                            <input type="text" placeholder="University Name" value={edu.institution} onChange={(e) => updateEducation(idx, "institution", e.target.value)} className={inputBase} />
                          </div>
                          <div className="space-y-1 relative">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Year</label>
                            <div className="flex gap-2 items-center">
                              <input type="text" placeholder="2025" value={edu.year} onChange={(e) => updateEducation(idx, "year", e.target.value)} className={inputBase} />
                              <button type="button" onClick={() => removeEducation(idx)} className="text-slate-300 hover:text-red-500 p-1.5 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </section>

              {/* Skills & Experience */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                    <span className="w-1 h-4 bg-indigo-600 rounded-full"></span>
                    Technical Skills
                  </h3>
                  <textarea rows={3} value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} className={`${inputBase} resize-none leading-relaxed text-xs`} placeholder="Separated by commas..." />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                    <span className="w-1 h-4 bg-indigo-600 rounded-full"></span>
                    Work Experience
                  </h3>
                  <textarea rows={3} value={experienceInput} onChange={(e) => setExperienceInput(e.target.value)} className={`${inputBase} resize-none leading-relaxed text-xs`} placeholder="Describe your roles..." />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-8 rounded-lg text-sm shadow-sm transition-all active:scale-95">
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Resume Management Section - Slimmer Version */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left: Upload */}
            <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">Resume Management</h4>
              <p className="text-xs text-slate-500 mb-6">Upload PDF for AI analysis.</p>
              
              <form onSubmit={handleResumeUpload} className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer">
                  <input type="file" accept=".pdf" onChange={(e) => setResumeFile(e.target.files[0])} className="hidden" />
                  <div className="px-4 py-2 bg-slate-800 text-white text-[11px] font-bold rounded-lg hover:bg-slate-700 transition-all flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" /></svg>
                    Select PDF
                  </div>
                </label>
                {resumeFile && <span className="text-[10px] font-bold text-indigo-600 truncate max-w-[120px]">{resumeFile.name}</span>}
                <button type="submit" className="bg-white border border-slate-200 text-slate-600 text-[11px] font-bold px-5 py-2 rounded-lg hover:bg-slate-50 transition-all">
                  Upload
                </button>
              </form>
            </div>

            {/* Right: AI Summary */}
            {profile.parsedData && profile.parsedData.summary && (
              <div className="flex-1 p-6 bg-slate-50/50">
                <div className="inline-block bg-indigo-600 text-white px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-widest mb-3">
                  Summary
                </div>
                <p className="text-[14px] leading-relaxed text-slate-600 font-medium italic border-l-2 border-indigo-200 pl-4">
                  "{profile.parsedData.summary}"
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

