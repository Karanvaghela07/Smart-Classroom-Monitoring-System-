import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../styles/layout.css";

const MainLayout = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("role");

    if (!isLoggedIn) {
      navigate("/", { replace: true });
      return;
    }

    // STUDENT RESTRICTION
    const adminOnly = [
      "/dashboard",
      "/students",
      "/add-student",
      "/history",
      "/reports",
      "/settings",
      "/about"
    ];

    if (role === "student" && adminOnly.includes(window.location.pathname)) {
      navigate("/attendance", { replace: true });
    }
  }, []);

  return (
    <div className="layout">
      <Sidebar />

      <div className="content-area">
        <Navbar />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
