import React from "react";
import { useParams } from "react-router-dom";

export default function ResumeViewer() {
  const { url } = useParams();
  const resumeUrl = decodeURIComponent(url);

  return (
    <div className="container mt-4">
      <h3>Resume Viewer</h3>
      <iframe
        src={`http://localhost:5001${resumeUrl}`}
        width="100%"
        height="700px"
        style={{ border: "none" }}
        title="Resume PDF"
      ></iframe>
    </div>
  );
}
