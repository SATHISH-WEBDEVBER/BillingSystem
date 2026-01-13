import React from "react";
// Import hooks from React Router to handle navigation and detect the current page
import { useLocation, useNavigate } from "react-router-dom"; // NEW HOOKS
import { Icons } from "./Icons";
import "../styles/navbar.css";

export default function Navbar() {
  // Hook to programmatically navigate to different routes (pages)
  const navigate = useNavigate();
  // Hook to get the current URL location object (used for highlighting active tab)
  const location = useLocation(); // Get current URL path

  // Configuration array for navigation menu items
  const menuItems = [
    { id: "/", label: "Home", icon: <Icons.Home /> },
    { id: "/billing", label: "Billing", icon: <Icons.Bill /> },
    { id: "/return", label: "Returns", icon: <Icons.Return /> },
    { id: "/history", label: "History", icon: <Icons.History /> },
    // { id: "/summary", label: "Report", icon: <Icons.Summary /> },
  ];

  return (
    <nav className="navbar">
      {/* Logo Section */}
      <div className="nav-logo">
        <span style={{marginRight:"10px", fontSize:"20px"}}>⚡</span>
        <span>Billing App</span>
      </div>

      {/* Navigation Links Section */}
      <div className="nav-links">
        {/* Map through the menuItems array to render navigation buttons dynamically */}
        {menuItems.map((item) => (
          <button
            key={item.id}
            // Check if current path matches item.id
            // Apply 'active' class if the current URL matches the menu item ID
            className={`nav-item ${location.pathname === item.id ? "active" : ""}`}
            // Navigate to the selected route when clicked
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