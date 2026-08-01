import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import axios from "axios";
import { Table, Button, Spinner, Alert, Form } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import ApplicationList from "./ApplicationList";
import API from "../api/axios";

const JobList = forwardRef((props, ref) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [editingJobId, setEditingJobId] = useState(null);
  const [editJobData, setEditJobData] = useState({});
  const token = localStorage.getItem("token");

  /* -----------------------------------------
      FETCH JOBS
  ----------------------------------------- */
  const fetchJobs = async () => {
    try {
      const res = await API.get("/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const jobList = res.data;

      const processed = await Promise.all(
        jobList.map(async (job) => {
          try {
            const test = await API.get(
              `/tests/${job._id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            return { ...job, hasTest: test.data?.test ? true : false };
          } catch {
            return { ...job, hasTest: false };
          }
        })
      );

      setJobs(processed);
    } catch (err) {
      setMsg("❌ Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useImperativeHandle(ref, () => ({
    fetchJobs,
  }));

  /* -----------------------------------------
      DELETE JOB
  ----------------------------------------- */
  const deleteJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      await API.delete(`/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMsg("✅ Job deleted successfully");
      fetchJobs();
    } catch {
      setMsg("❌ Error deleting job");
    }
  };

  /* -----------------------------------------
      EDIT MODE
  ----------------------------------------- */
  const startEdit = (job) => {
    setEditingJobId(job._id);
    setEditJobData({
      title: job.title,
      location: job.location,
      salary: job.salary,
      status: job.status,
      testRequired: job.testRequired || false,
    });
  };

  const cancelEdit = () => {
    setEditingJobId(null);
    setEditJobData({});
  };

  const saveEdit = async (id) => {
    try {
      await API.put(
        `/jobs/${id}`,
        editJobData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMsg("✅ Job updated successfully");
      setEditingJobId(null);
      fetchJobs();
    } catch {
      setMsg("❌ Error updating job");
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} className="text-indigo-600" />
        <p className="mt-4 text-slate-500 font-semibold text-sm">Loading job records...</p>
      </div>
    );

  return (
    <motion.div className="my-8" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Listings</h3>
      </div>

      <AnimatePresence>
        {msg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-6">
            <Alert variant={msg.startsWith("✅") ? "success" : "danger"} className="rounded-2xl border-0 shadow-sm font-medium py-3 px-5 flex items-center gap-2">
              {msg}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-white"
      >
        <Table hover responsive className="align-middle mb-0 border-0">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-0">Role Details</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-0">Location</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-0">Salary</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-0">Status</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center border-0">Action Center</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right border-0">Applications</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {jobs.map((job, index) => (
              <motion.tr key={job._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="transition-colors">
                {editingJobId === job._id ? (
                  <>
                    <td className="px-6 py-4">
                      <Form.Control type="text" value={editJobData.title} className="rounded-xl text-sm border-slate-200" onChange={(e) => setEditJobData({ ...editJobData, title: e.target.value })} />
                    </td>
                    <td className="px-6 py-4">
                      <Form.Control type="text" value={editJobData.location} className="rounded-xl text-sm border-slate-200" onChange={(e) => setEditJobData({ ...editJobData, location: e.target.value })} />
                    </td>
                    <td className="px-6 py-4">
                      <Form.Control type="text" value={editJobData.salary} className="rounded-xl text-sm border-slate-200" onChange={(e) => setEditJobData({ ...editJobData, salary: e.target.value })} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Form.Select value={editJobData.status} className="rounded-xl text-sm border-slate-200" onChange={(e) => setEditJobData({ ...editJobData, status: e.target.value })}>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                      </Form.Select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="success" className="rounded-lg px-3 py-1 font-bold text-[10px] uppercase bg-emerald-600 border-0 shadow-sm" onClick={() => saveEdit(job._id)}>Save</Button>
                        <Button size="sm" variant="secondary" className="rounded-lg px-3 py-1 font-bold text-[10px] uppercase bg-slate-200 border-0 text-slate-600" onClick={cancelEdit}>Cancel</Button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">—</td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800 text-sm">{job.title}</div>
                      <div className="text-[10px] font-medium text-slate-400 mt-0.5 tracking-tight uppercase">REF: {job._id.substring(18)}</div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 font-medium">{job.location}</td>
                    <td className="px-6 py-5 text-sm text-slate-600 font-semibold">{job.salary}</td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wide ${job.status === "open" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-wrap justify-center gap-2">
                        <Button size="sm" variant="warning" className="rounded-lg px-3 font-bold text-[10px] uppercase bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100" onClick={() => startEdit(job)}>Edit</Button>
                        <Button size="sm" variant="danger" className="rounded-lg px-3 font-bold text-[10px] uppercase bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" onClick={() => deleteJob(job._id)}>Delete</Button>
                        {job.testRequired && !job.hasTest && (
                          <Button size="sm" className="rounded-lg px-3 font-bold text-[10px] uppercase bg-indigo-600 text-white border-0 shadow-sm" onClick={() => (window.location.href = `/recruiter/create-test/${job._id}`)}>Create Test</Button>
                        )}
                        {job.testRequired && job.hasTest && (
                          <Button size="sm" className="rounded-lg px-3 font-bold text-[10px] uppercase bg-emerald-50 text-emerald-600 border border-emerald-200" onClick={() => (window.location.href = `/recruiter/view-test/${job._id}`)}>View Test</Button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <ApplicationList jobId={job._id} />
                    </td>
                  </>
                )}
              </motion.tr>
            ))}
          </tbody>
        </Table>
      </motion.div>
    </motion.div>
  );
});

export default JobList;

