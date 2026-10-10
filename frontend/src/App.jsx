import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import { ToastProvider } from './context/ToastContext';
import { healthAPI } from './api/workoutAPI';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState('checking');

  // Check DB health on mount
  useEffect(() => {
    const check = async () => {
      try {
        const res = await healthAPI.check();
        setDbStatus(res.data.database === 'connected' ? 'connected' : 'disconnected');
      } catch {
        setDbStatus('disconnected');
      }
    };
    check();
    // Re-check every 30 seconds
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ToastProvider>
      <Router>
        <div className="app-layout">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            dbStatus={dbStatus}
          />
          <div className="main-content">
            <TopNav onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workouts" element={<Workouts />} />
              <Route
                path="*"
                element={
                  <div className="page-content">
                    <div className="empty-state">
                      <div className="empty-icon">🔍</div>
                      <div className="empty-title">Page not found</div>
                      <p className="empty-text">The page you're looking for doesn't exist.</p>
                      <a href="/" className="btn btn-primary" style={{ display: 'inline-flex' }}>
                        ← Back to Dashboard
                      </a>
                    </div>
                  </div>
                }
              />
            </Routes>
          </div>
        </div>
      </Router>
    </ToastProvider>
  );
}
