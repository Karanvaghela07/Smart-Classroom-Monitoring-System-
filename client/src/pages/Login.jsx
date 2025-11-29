import { useState } from "react";
import api from "../api/api";
import "../styles/login.css";

const Login = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "admin",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      alert("Please enter username & password");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/login", form);

      if (res.data.success) {
        
        // ------------------------------
        // ⭐ STORE TOKEN (IMPORTANT)
        // ------------------------------
        localStorage.setItem("token", res.data.user.token);
        
        // Save user + role (same as before)
        localStorage.setItem("role", res.data.user.role);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loggedUser", JSON.stringify(res.data.user));

        // If role = student (keep your logic)
        // (NO NEED TO STORE student_id now)
        if (res.data.user.role === "student") {
          // name optional
          localStorage.setItem("name", res.data.user.name);
        }

        alert("Login Successful!");

        // Redirect to dashboard or history
        window.location.href = "/history";

      } else {
        alert(res.data.message || "Invalid credentials");
      }

    } catch (err) {
      alert("Server error – check backend connection");
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Smart Class Monitoring</h1>
        <p className="login-subtitle">Login to continue</p>

        <input
          type="text"
          name="username"
          placeholder="Enter Username"
          onChange={handleChange}
          autoComplete="off"
        />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          onChange={handleChange}
        />

        <select name="role" onChange={handleChange} value={form.role}>
          <option value="admin">Admin</option>
          <option value="student">Student</option>
        </select>

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
};

export default Login;
