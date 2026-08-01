import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  // ✅ If no user is logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ If allowedRoles is passed and user's role is not included → redirect home
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // ✅ If user exists and role is allowed → render the protected page
  return children;
};

export default ProtectedRoute;
