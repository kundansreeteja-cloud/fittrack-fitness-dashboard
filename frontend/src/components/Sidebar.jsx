import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: '📊', label: 'Dashboard', end: true },
  { to: '/workouts', icon: '💪', label: 'Workouts' },
];

export default function Sidebar({ isOpen, onClose, dbStatus }) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">F</div>
          <div className="logo-text">
            Fit<span>Track</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="db-status">
            <div className={`db-dot ${dbStatus}`} />
            <span>
              {dbStatus === 'connected' ? 'Database connected' : dbStatus === 'disconnected' ? 'Database offline' : 'Checking DB…'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
