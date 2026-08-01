import "bootstrap/dist/css/bootstrap.min.css";
import { Routes, Route, useLocation } from "react-router-dom";

import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CandidateDashboard from "./pages/CandidateDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import InterviewPage from "./pages/InterviewPage";
import ProtectedRoute from "./components/ProtectedRoute";
import RecruiterCreateTest from "./pages/RecruiterCreateTest";
import RecruiterApplicationsPage from "./pages/RecruiterApplicationsPage";
import CandidateTest from "./pages/CandidateTest";
import ResumeViewer from "./pages/ResumeViewer";
import About from "./pages/About";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import RecruiterInterviewPage from "./pages/RecruiterInterviewPage";
import LiveInterviewPage from "./pages/LiveInterviewPage";
import RecruiterViewTest from "./pages/RecruiterViewTest";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import "./App.css";

function App() {
  const location = useLocation();

  // pages where footer should NOT appear
  const hideFooterRoutes = [
    "/candidate-dashboard",
    "/recruiter-dashboard"
  ];

  const shouldHideFooter = hideFooterRoutes.some(route =>
    location.pathname.startsWith(route)
  );

  return (
    <>
      <Navbar />

      <div style={{ paddingTop: "100px", minHeight: "calc(100vh - 160px)" }}>
        <Routes>
          {/* ---------- Public Routes ---------- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/contact" element={<Contact />} />

          {/* ---------- Protected Routes ---------- */}
          <Route
            path="/candidate-dashboard"
            element={
              <ProtectedRoute allowedRoles={["candidate"]}>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recruiter-dashboard"
            element={
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recruiter/applications/:jobId"
            element={
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <RecruiterApplicationsPage />
              </ProtectedRoute>
            }
          />

          {/* ⭐ TEST ROUTES ⭐ */}
          <Route
            path="/recruiter/create-test/:jobId"
            element={<RecruiterCreateTest />}
          />
          <Route path="/test/:jobId" element={<CandidateTest />} />
          <Route path="/resume/:applicationId" element={<ResumeViewer />} />

          {/* ---------- AI Interview ---------- */}
          <Route
            path="/interview/:jobId"
            element={
              <ProtectedRoute allowedRoles={["candidate"]}>
                <InterviewPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recruiter/interview/:interviewId"
            element={<RecruiterInterviewPage />}
          />

          <Route
            path="/interview/live/:sessionId"
            element={<LiveInterviewPage />}
          />

          <Route
            path="/recruiter/view-test/:jobId"
            element={<RecruiterViewTest />}
          />

          {/* ---------- 404 ---------- */}
          <Route
            path="*"
            element={
              <h2 className="text-center mt-5">
                404 – Page Not Found
              </h2>
            }
          />
        </Routes>
      </div>

      {/* ✅ Footer (hidden on dashboards) */}
      {!shouldHideFooter && <Footer />}
    </>
  );
}

export default App;

// import "bootstrap/dist/css/bootstrap.min.css";
// // import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { Routes, Route, useLocation } from "react-router-dom";
// import HomePage from "./pages/HomePage";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import CandidateDashboard from "./pages/CandidateDashboard";
// import RecruiterDashboard from "./pages/RecruiterDashboard";
// import InterviewPage from "./pages/InterviewPage"; // ✅ Import Interview Page
// import ProtectedRoute from "./components/ProtectedRoute";
// import RecruiterCreateTest from "./pages/RecruiterCreateTest";
// import RecruiterApplicationsPage from "./pages/RecruiterApplicationsPage";
// import CandidateTest from "./pages/CandidateTest";
// import ResumeViewer from "./pages/ResumeViewer";
// import About from "./pages/About";
// import Features from "./pages/Features";
// import Contact from "./pages/Contact";
// import RecruiterInterviewPage from "./pages/RecruiterInterviewPage";
// import LiveInterviewPage from "./pages/LiveInterviewPage";
// import RecruiterViewTest from "./pages/RecruiterViewTest";


// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";

// import "./App.css";

// function App() {

//   const location = useLocation();

//   // pages where footer should NOT appear
//   const hideFooterRoutes = [
//     "/candidate-dashboard",
//     "/recruiter-dashboard"
//   ];

//   const shouldHideFooter = hideFooterRoutes.some(route =>
//     location.pathname.startsWith(route)
//   );

//   return (
//     <Router>
//       <Navbar />

//       <div style={{ paddingTop: "100px", minHeight: "calc(100vh - 160px)" }}>
//         <Routes>
//           {/* ---------- Public Routes ---------- */}
//           <Route path="/" element={<HomePage />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/about" element={<About />} />
//           <Route path="/features" element={<Features />} />
//           <Route path="/contact" element={<Contact />} />



//           {/* ---------- Protected Routes ---------- */}
//           <Route
//             path="/candidate-dashboard"
//             element={
//               <ProtectedRoute allowedRoles={["candidate"]}>
//                 <CandidateDashboard />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/recruiter-dashboard"
//             element={
//               <ProtectedRoute allowedRoles={["recruiter"]}>
//                 <RecruiterDashboard />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/recruiter/applications/:jobId"
//             element={
//               <ProtectedRoute allowedRoles={["recruiter"]}>
//                 <RecruiterApplicationsPage />
//               </ProtectedRoute>
//             }
//           />


//           {/* ⭐ NEW TEST ROUTES ⭐ */}
//           <Route path="/recruiter/create-test/:jobId" element={<RecruiterCreateTest />} />
//           <Route path="/test/:jobId" element={<CandidateTest />} />
//           <Route path="/resume/:applicationId" element={<ResumeViewer />} />


//           {/* ---------- AI Interview (linked to specific job) ---------- */}
//           <Route
//             path="/interview/:jobId"
//             element={
//               <ProtectedRoute allowedRoles={["candidate"]}>
//                 <InterviewPage />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/recruiter/interview/:interviewId"
//             element={<RecruiterInterviewPage />}
//           />

//           <Route path="/interview/live/:sessionId" element={<LiveInterviewPage />} />

//           <Route
//             path="/recruiter/view-test/:jobId"
//             element={<RecruiterViewTest />}
//           />

//           {/* ---------- Fallback (404) ---------- */}
//           <Route
//             path="*"
//             element={<h2 className="text-center mt-5">404 – Page Not Found</h2>}
//           />
//         </Routes>
//       </div>

//       {/* Footer */}
//       {/* <Footer /> */}
//       {!shouldHideFooter && <Footer />}
//     </Router>
//   );
// }

// export default App;
