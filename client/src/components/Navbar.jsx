import React from "react";

const Navbar = () => {
  const username = JSON.parse(localStorage.getItem("loggedUser"))?.username;

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="navbar">
      <div className="nav-title">Welcome, {username}</div>
      <button className="logout-btn" onClick={logout}>Logout</button>
    </div>
  );
};

export default Navbar;
