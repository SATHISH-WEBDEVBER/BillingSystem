import React from "react";
import { useLocation, useNavigate } from "react-router-dom"; // NEW HOOKS
import { Icons } from "./Icons";
import "../styles/navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // Get current URL path

  const menuItems = [
    { id: "/", label: "Home", icon: <Icons.Home /> },
    { id: "/billing", label: "Billing", icon: <Icons.Bill /> },
    { id: "/return", label: "Returns", icon: <Icons.Return /> },
    { id: "/history", label: "History", icon: <Icons.History /> },
    { id: "/summary", label: "Report", icon: <Icons.Summary /> },
  ];

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <span style={{marginRight:"10px", fontSize:"20px"}}>⚡</span>
        <span>Billing App</span>
      </div>

      <div className="nav-links">
        {menuItems.map((item) => (
          <button
            key={item.id}
            // Check if current path matches item.id
            className={`nav-item ${location.pathname === item.id ? "active" : ""}`}
            onClick={() => navigate(item.id)}
          >
            <div className="nav-icon">{item.icon}</div>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}