import React, { useState, useEffect, useCallback, useRef } from 'react';
import { workoutAPI } from '../api/workoutAPI';
import { useToast } from '../context/ToastContext';
import WorkoutModal from '../components/WorkoutModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const TYPES = ['All', 'Cardio', 'Strength', 'Flexibility', 'HIIT', 'Sports', 'Other'];

const TYPE_ICONS = {
  Cardio: '🏃',
  Strength: '🏋️',
  Flexibility: '🧘',
  HIIT: '⚡',
  Sports: '⚽',
  Other: '💪',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Workouts() {
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const searchTimeout = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [search]);

  const fetchWorkouts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (typeFilter !== 'All') params.type = typeFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await workoutAPI.getAll(params);
      setWorkouts(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      setError(err.message || 'Failed to load workouts');
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, typeFilter, startDate, endDate]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const handleEdit = (workout) => {
    setSelectedWorkout(workout);
    setModalMode('edit');
  };

  const handleDeleteClick = (workout) => {
    setDeleteTarget(workout);
    setShowDeleteModal(true);
  };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('All');
    setStartDate('');
    setEndDate('');
  };

  const hasFilters = search || typeFilter !== 'All' || startDate || endDate;

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>💪 All Workouts</h2>
          <p>Manage and track your fitness sessions</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setSelectedWorkout(null); setModalMode('add'); }}>
          ➕ Log Workout
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <div>
            <span className="error-text">{error}</span>
            <br />
            <button
              style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={fetchWorkouts}
            >
              Retry ↻
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="card">
        <div className="search-filter-bar" style={{ marginBottom: 0 }}>
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search by exercise name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="date"
              className="filter-select"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Start date"
              style={{ minWidth: 130 }}
            />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>to</span>
            <input
              type="date"
              className="filter-select"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="End date"
              style={{ minWidth: 130 }}
            />
          </div>

          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Workout Sessions</div>
          </div>
          {!loading && (
            <span className="count-badge">{total} {total === 1 ? 'session' : 'sessions'}</span>
          )}
        </div>

        {loading ? (
          <div className="loading-container" style={{ padding: '32px' }}>
            <div className="spinner" />
            <p className="loading-text">Loading workouts…</p>
          </div>
        ) : workouts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{hasFilters ? '🔍' : '🏋️'}</div>
            <div className="empty-title">
              {hasFilters ? 'No workouts match your filters' : 'No workouts yet'}
            </div>
            <p className="empty-text">
              {hasFilters
                ? 'Try adjusting your search or filters'
                : 'Log your first workout to get started!'}
            </p>
            {hasFilters ? (
              <button className="btn btn-secondary" onClick={clearFilters}>Clear Filters</button>
            ) : (
              <button className="btn btn-primary" onClick={() => setModalMode('add')}>➕ Log First Workout</button>
            )}
          </div>
        ) : (
          <div className="workout-table-wrapper">
            <table className="workout-table">
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Calories</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workouts.map((w) => (
                  <tr key={w._id}>
                    <td>
                      <div className="exercise-name">{w.exercise}</div>
                      {w.notes && <div className="exercise-note" title={w.notes}>{w.notes}</div>}
                    </td>
                    <td>
                      <span className={`type-badge ${w.type}`}>
                        {TYPE_ICONS[w.type]} {w.type}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {formatDate(w.date)}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {w.duration} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>min</span>
                    </td>
                    <td style={{ color: 'var(--accent)', fontWeight: 700 }}>
                      🔥 {w.calories}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-secondary btn-sm btn-icon"
                          onClick={() => handleEdit(w)}
                          title="Edit workout"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-danger btn-sm btn-icon"
                          onClick={() => handleDeleteClick(w)}
                          title="Delete workout"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <WorkoutModal
          mode={modalMode}
          workout={selectedWorkout}
          onClose={() => { setModalMode(null); setSelectedWorkout(null); }}
          onSaved={fetchWorkouts}
        />
      )}

      {showDeleteModal && deleteTarget && (
        <DeleteConfirmModal
          workout={deleteTarget}
          onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
          onDeleted={fetchWorkouts}
        />
      )}
    </div>
  );
}
