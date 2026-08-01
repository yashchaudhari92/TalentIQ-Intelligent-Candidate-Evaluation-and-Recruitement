import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
import "./charts/chartSetup";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";

export default function RecruiterHomeDashboard() {
  const token = localStorage.getItem("token");
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Trend selector
  const [trend, setTrend] = useState("monthly"); // weekly | monthly | yearly

  useEffect(() => {
    let timer = null;

    const load = async () => {
      try {
        const res = await API.get("/dashboard/recruiter", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
        setErr("");
      } catch (e) {
        setErr("Failed to load recruiter dashboard.");
      } finally {
        setLoading(false);
      }
    };

    load();
    timer = setInterval(load, 12000);

    return () => clearInterval(timer);
  }, [token]);

  // ✅ Trend-aware top stats
  const topStats = useMemo(() => {
    const s = data?.stats || {};
    const totalJobs = s.totalJobs ?? 0;
    const totalApplications = s.totalApplications ?? 0;
    const totalInterviews = s.totalInterviews ?? 0;

    const weekly = s.last7 ?? 0;
    const monthly = s.last30 ?? 0;
    const yearly = s.last365 ?? s.last365Days ?? s.lastYear ?? (monthly * 12);

    const jobsInTrend =
      trend === "weekly" ? weekly : trend === "yearly" ? yearly : monthly;

    const label =
      trend === "weekly"
        ? "Jobs (Last 7 days)"
        : trend === "yearly"
        ? "Jobs (Last 365 days)"
        : "Jobs (Last 30 days)";

    return {
      totalJobs,
      jobsInTrend,
      jobsInTrendLabel: label,
      totalApplications,
      totalInterviews,
      weekly,
      monthly,
      yearly,
    };
  }, [data, trend]);

  // ✅ Color helpers
  const barGradient = (ctx, c1, c2) => {
    const chart = ctx.chart;
    const { ctx: c, chartArea } = chart;
    if (!chartArea) return c1;
    const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    return g;
  };

  // ✅ Charts data
  const appsPerJobChart = useMemo(() => {
    const rows = data?.jobs || [];
    return {
      labels: rows.map((x) => x.title),
      datasets: [
        {
          label: "Applications",
          data: rows.map((x) => x.applications),
          borderWidth: 0,
          borderRadius: 8,
          maxBarThickness: 32,
        },
      ],
    };
  }, [data]);

  const interviewsPerJobChart = useMemo(() => {
    const rows = data?.jobs || [];
    return {
      labels: rows.map((x) => x.title),
      datasets: [
        {
          label: "Interviews",
          data: rows.map((x) => x.interviews),
          borderWidth: 0,
          borderRadius: 8,
          maxBarThickness: 32,
        },
      ],
    };
  }, [data]);

  const trendChart = useMemo(() => {
    const s = data?.stats || {};
    const arr =
      trend === "weekly"
        ? s.weeklyTrend || s.last7Trend || []
        : trend === "yearly"
        ? s.yearlyTrend || s.last365Trend || []
        : s.monthlyTrend || [];

    const fallbackMonthly = s.monthlyTrend || [];
    const useArr = arr.length ? arr : trend === "yearly" ? fallbackMonthly : arr;

    return {
      labels: useArr.map((x) => x.month || x.label || x.day || x.week || ""),
      datasets: [
        {
          label:
            trend === "weekly"
              ? "Jobs created (Daily)"
              : "Jobs created (Monthly)",
          data: useArr.map((x) => x.count ?? 0),
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 0,
          pointHoverRadius: 6,
          fill: true,
        },
      ],
    };
  }, [data, trend]);

  // ✅ Chart Options (Clean & Professional)
  const sharedBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        titleFont: { size: 13, weight: '600' },
        bodyFont: { size: 12 },
        padding: 12,
        displayColors: false,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: "rgba(148,163,184,0.1)", borderDash: [5, 5] }, ticks: { precision: 0 } },
    },
  };

  const barOptionsApps = useMemo(() => ({
    ...sharedBarOptions,
    datasets: {
      bar: {
        backgroundColor: (ctx) => barGradient(ctx, "#6366f1", "#818cf8"),
        hoverBackgroundColor: "#4f46e5",
      },
    },
  }), []);

  const barOptionsInterviews = useMemo(() => ({
    ...sharedBarOptions,
    datasets: {
      bar: {
        backgroundColor: (ctx) => barGradient(ctx, "#10b981", "#34d399"),
        hoverBackgroundColor: "#059669",
      },
    },
  }), []);

  const trendChartOptions = useMemo(() => {
    const colors = trend === "weekly" ? ["#10b981", "#34d399"] : trend === "yearly" ? ["#f59e0b", "#fbbf24"] : ["#6366f1", "#818cf8"];
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: "#0f172a", padding: 12, cornerRadius: 8 },
      },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: "rgba(148,163,184,0.1)" }, ticks: { precision: 0 } },
      },
      elements: {
        line: {
          borderColor: colors[0],
          backgroundColor: (ctx) => {
            const chart = ctx.chart;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return "rgba(99,102,241,0.05)";
            const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            g.addColorStop(0, `${colors[0]}33`);
            g.addColorStop(1, `${colors[0]}00`);
            return g;
          },
        },
      },
    };
  }, [trend]);

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
  
  if (err) return <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center">{err}</div>;

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Real-time recruitment intelligence & performance.</p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
          {["weekly", "monthly", "yearly"].map((t) => (
            <button
              key={t}
              onClick={() => setTrend(t)}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                trend === t 
                ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200" 
                : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Jobs" value={topStats.totalJobs} icon="💼" />
        <StatCard title={topStats.jobsInTrendLabel} value={topStats.jobsInTrend} icon="📈" isTrend />
        <StatCard title="Monthly Volume" value={topStats.monthly} icon="📅" />
        <StatCard title="Total Apps" value={topStats.totalApplications} icon="✉️" />
        <StatCard title="Interviews" value={topStats.totalInterviews} icon="🤝" />
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Applications Distribution">
          <div className="h-[280px]">
            <Bar data={appsPerJobChart} options={barOptionsApps} />
          </div>
        </ChartCard>

        <ChartCard title="Interview Pipeline">
          <div className="h-[280px]">
            <Bar data={interviewsPerJobChart} options={barOptionsInterviews} />
          </div>
        </ChartCard>
      </div>

      {/* TREND LINE */}
      <ChartCard title={`Creation Velocity (${trend})`}>
        <div className="h-[300px]">
          <Line data={trendChart} options={trendChartOptions} />
        </div>
      </ChartCard>

      {/* INSIGHTS TABLE */}
      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Live Job Monitoring</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Data</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                <th className="px-8 py-4">Position</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Apps</th>
                <th className="px-8 py-4 text-right">Interviews</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(data.jobs || []).map((j) => (
                <tr key={j.jobId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4 font-semibold text-slate-700">{j.title}</td>
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      j.status === 'Open' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {j.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 font-mono text-slate-500">{j.applications}</td>
                  <td className="px-8 py-4 font-mono text-slate-500 text-right">{j.interviews}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Reusable Components
function StatCard({ title, value, icon, isTrend }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-5 bg-white rounded-[1.5rem] border border-slate-200 shadow-sm relative overflow-hidden group"
    >
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</div>
      <div className="text-2xl font-black text-slate-900 leading-none">{value}</div>
      <div className="absolute top-4 right-4 text-xl opacity-20 group-hover:opacity-100 transition-opacity">
        {icon}
      </div>
      {isTrend && <div className="absolute bottom-0 left-0 h-1 w-full bg-indigo-500/20" />}
    </motion.div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
        {title}
      </h3>
      {children}
    </div>
  );
}

