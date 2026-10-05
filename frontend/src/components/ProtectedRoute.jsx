import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const user = localStorage.getItem("user");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  let userData;

  try {
    userData = JSON.parse(user);
  } catch (error) {
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  // Check required role
  if (allowedRole && userData.role !== allowedRole) {
    if (userData.role === "municipality") {
      return <Navigate to="/municipality" replace />;
    }

    return <Navigate to="/user" replace />;
  }

  return children;
}

export default ProtectedRoute;