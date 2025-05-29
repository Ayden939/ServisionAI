import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../css/navbar.css";

function Navbar() {
  const location = useLocation();

  let links = {
    "/": { name: "Home", icon: "home" },
    "/analytics": { name: "Analytics", icon: "query_stats" },
    // "/monitor": { name: "Monitor", icon: "monitor" },
  };

  return (
    <nav id="navbar">
      <ul className="navbar-links">
        {Object.entries(links).map(([path, { name, icon }]) => (
          <li key={path}>
            <NavLink
              to={path}
              className={({ isActive }) => isActive ? "active" : ""}
            >
              <i className="material-icons-round">{icon}</i> {name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
