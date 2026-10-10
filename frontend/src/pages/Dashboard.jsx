import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { workoutAPI } from '../api/workoutAPI';
import { useToast } from '../context/ToastContext';
import WorkoutModal from '../components/WorkoutModal';

const TYPE_COLORS = {
  Cardio: '#38bdf8',
  Strength: '#fb923c',
  Flexibility: '#a78bfa',
  HIIT: '#f85149',
  Sports: '#a3e635',
  Other: '#8b949e',
};

const TYPE_ICONS = {
  Cardio: '🏃',
  Strength: '🏋️',
  Flexibility: '🧘',
  HIIT: '⚡',
  Sports: '⚽',
  Other: '💪',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '0.8rem',
      }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color, margin: '2px 0' }}>
            {entry.name}: <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [chartType, setChartType] = useState('duration');

  const fetchDashboardData = useCallback(async () => {
    setError('');
    try {
      const [statsRes, workoutsRes] = await Promise.all([
        workoutAPI.getStats(),
        workoutAPI.getAll({ limit: 5 }),
      ]);
      setStats(statsRes.data.data);
      setRecentWorkouts(workoutsRes.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Build type breakdown for pie chart
  const typeBreakdown = recentWorkouts.reduce((acc, w) => {
    acc[w.type] = (acc[w.type] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(typeBreakdown).map(([name, value]) => ({ name, value }));

  const statCards = stats ? [
    {
      label: 'Total Workouts',
      value: stats.totalWorkouts,
      sub: 'all time',
      icon: '💪',
      iconClass: 'green',
    },
    {
      label: 'Total Duration',
      value: `${stats.totalDuration}`,
      sub: 'minutes logged',
      icon: '⏱️',
      iconClass: 'blue',
    },
    {
      label: 'Calories Burned',
      value: stats.totalCalories.toLocaleString(),
      sub: 'total kcal',
      icon: '🔥',
      iconClass: 'orange',
    },
    {
      label: 'Avg Duration',
      value: `${stats.avgDuration}`,
      sub: 'minutes per session',
      icon: '📈',
      iconClass: 'purple',
    },
  ] : [];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p className="loading-text">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Overview</h2>
          <p>Your fitness activity at a glance</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          ➕ Log Workout
        </button>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="stats-grid">
          {statCards.map((card) => (
            <div key={card.label} className="stat-card">
              <div className={`stat-icon ${card.iconClass}`}>{card.icon}</div>
              <div className="stat-info">
                <div className="stat-label">{card.label}</div>
                <div className="stat-value">{card.value}</div>
                <div className="stat-sub">{card.sub}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {stats && stats.weeklyChart && (
        <div className="charts-grid">
          {/* Weekly Activity Chart */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">📊 Weekly Activity</div>
                <div className="card-subtitle">Last 7 days</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className={`btn btn-sm ${chartType === 'duration' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setChartType('duration')}
                >
                  Duration
                </button>
                <button
                  className={`btn btn-sm ${chartType === 'calories' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setChartType('calories')}
                >
                  Calories
                </button>
              </div>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.weeklyChart} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a3e635" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a3e635" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(48,54,61,0.6)" />
                  <XAxis dataKey="day" tick={{ fill: '#8b949e', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey={chartType}
                    name={chartType === 'duration' ? 'Duration (min)' : 'Calories (kcal)'}
                    stroke="#a3e635"
                    strokeWidth={2.5}
                    fill="url(#colorGrad)"
                    dot={{ fill: '#a3e635', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Workout count per day */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">📅 Sessions / Day</div>
                <div className="card-subtitle">Last 7 days</div>
              </div>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weeklyChart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(48,54,61,0.6)" />
                  <XAxis dataKey="day" tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="workouts" name="Sessions" fill="#a3e635" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Workouts */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">🕐 Recent Workouts</div>
            <div className="card-subtitle">Your latest sessions</div>
          </div>
          <a href="/workouts" style={{ fontSize: '0.82rem', color: 'var(--accent)' }}>
            View all →
          </a>
        </div>

        {recentWorkouts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏋️</div>
            <div className="empty-title">No workouts yet</div>
            <p className="empty-text">Log your first workout to see it here</p>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              ➕ Log First Workout
            </button>
          </div>
        ) : (
          <div className="recent-list">
            {recentWorkouts.map((w) => (
              <div key={w._id} className="recent-item">
                <div className="recent-icon">{TYPE_ICONS[w.type] || '💪'}</div>
                <div className="recent-info">
                  <div className="recent-name">{w.exercise}</div>
                  <div className="recent-meta">
                    {new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} &middot;{' '}
                    {w.duration} min &middot;{' '}
                    <span className={`type-badge ${w.type}`}>{w.type}</span>
                  </div>
                </div>
                <div className="recent-calories">🔥 {w.calories} kcal</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <WorkoutModal
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSaved={fetchDashboardData}
        />
      )}
    </div>
  );
}
