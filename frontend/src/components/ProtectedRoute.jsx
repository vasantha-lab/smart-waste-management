import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const user = localStorage.getItem("user");
  const userData = user ? 
  JSON.parse(user) : null;
  if (allowedRole && userData?.role !== allowedRole) {
  return <Navigate to="/user" replace />;
}

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;