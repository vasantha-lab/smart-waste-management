import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={
          <ProtectedRoute allowedRole = "municipality">
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/municipality" element={
          <ProtectedRoute allowedRole="municipality">
          <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/user" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
          } />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;