import React from 'react';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/': 'Dashboard',
  '/workouts': 'Workouts',
};

export default function TopNav({ onMenuToggle }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'FitTrack';

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="topnav">
      <div className="topnav-left">
        <button className="menu-toggle" onClick={onMenuToggle} aria-label="Toggle menu">
          ☰
        </button>
        <span className="page-title">{title}</span>
      </div>
      <div className="topnav-right">
        <span className="topnav-date">📅 {dateStr}</span>
      </div>
    </header>
  );
}
