import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map as MapIcon, ShieldCheck } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar glass-panel">
      <div className="nav-brand">
        <ShieldCheck size={24} className="nav-logo" />
        <span>HoneyPot Control</span>
      </div>
      <div className="nav-links">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <LayoutDashboard size={18} /> Analytics Dashboard
        </NavLink>
        <NavLink 
          to="/map" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <MapIcon size={18} /> Global Threat Map
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
