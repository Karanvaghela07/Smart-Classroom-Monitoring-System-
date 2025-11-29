import { Link } from "react-router-dom";

const Sidebar = () => {
  const role = localStorage.getItem("role");

  return (
    <div className="sidebar">
      <h2>Smart Class</h2>

      <ul>
        {role === "admin" && (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/attendance">Attendance</Link></li>
            <li><Link to="/students">Students</Link></li>
            <li><Link to="/add-student">Add Student</Link></li>
            <li><Link to="/history">History</Link></li>
            <li><Link to="/reports">Reports</Link></li>
            <li><Link to="/settings">Settings</Link></li>
            <li><Link to="/about">About</Link></li>
          </>
        )}

        {role === "student" && (
          <>
            <li><Link to="/history">History</Link></li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
