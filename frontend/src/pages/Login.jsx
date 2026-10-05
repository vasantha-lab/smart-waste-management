import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // Save logged-in user
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login successful!");

      // Redirect according to role
      if (data.user.role === "municipality") {
        navigate("/municipality");
      } else {
        navigate("/user");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to connect to server");
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>Login</h1>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            Login
          </button>

          <p>
            Don't have an account?{" "}
            <a href="/signup">Sign Up</a>
          </p>
        </form>
      </div>
    </main>
  );
}

export default Login;