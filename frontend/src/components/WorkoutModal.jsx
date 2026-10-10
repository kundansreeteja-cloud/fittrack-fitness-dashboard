import React, { useState, useEffect } from 'react';
import { workoutAPI } from '../api/workoutAPI';
import { useToast } from '../context/ToastContext';

const TYPES = ['Cardio', 'Strength', 'Flexibility', 'HIIT', 'Sports', 'Other'];

const defaultForm = {
  exercise: '',
  type: 'Cardio',
  date: new Date().toISOString().split('T')[0],
  duration: '',
  calories: '',
  notes: '',
};

function validate(form) {
  const errors = {};
  if (!form.exercise.trim()) errors.exercise = 'Exercise name is required';
  if (!form.date) errors.date = 'Date is required';
  if (!form.duration || isNaN(form.duration) || Number(form.duration) < 1)
    errors.duration = 'Duration must be a positive number (min 1 min)';
  if (Number(form.duration) > 600)
    errors.duration = 'Duration cannot exceed 600 minutes';
  if (!form.calories || isNaN(form.calories) || Number(form.calories) < 1)
    errors.calories = 'Calories must be a positive number (min 1)';
  if (Number(form.calories) > 5000)
    errors.calories = 'Calories cannot exceed 5000';
  return errors;
}

export default function WorkoutModal({ mode, workout, onClose, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && workout) {
      setForm({
        exercise: workout.exercise || '',
        type: workout.type || 'Cardio',
        date: workout.date ? workout.date.split('T')[0] : new Date().toISOString().split('T')[0],
        duration: workout.duration?.toString() || '',
        calories: workout.calories?.toString() || '',
        notes: workout.notes || '',
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [mode, workout]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        exercise: form.exercise.trim(),
        type: form.type,
        date: form.date,
        duration: Number(form.duration),
        calories: Number(form.calories),
        notes: form.notes.trim(),
      };

      if (mode === 'edit') {
        await workoutAPI.update(workout._id, payload);
        toast('Workout updated successfully!', 'success');
      } else {
        await workoutAPI.create(payload);
        toast('Workout added successfully!', 'success');
      }

      onSaved();
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to save workout', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">
            {mode === 'edit' ? '✏️ Edit Workout' : '➕ Log New Workout'}
          </h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Exercise Name <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  name="exercise"
                  value={form.exercise}
                  onChange={handleChange}
                  placeholder="e.g. Running, Bench Press"
                  maxLength={100}
                  autoFocus
                />
                {errors.exercise && <span className="form-error">{errors.exercise}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Type <span className="required">*</span>
                </label>
                <select className="form-select" name="type" value={form.type} onChange={handleChange}>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Date <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.date && <span className="form-error">{errors.date}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Duration (minutes) <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  type="number"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="e.g. 45"
                  min="1"
                  max="600"
                />
                {errors.duration && <span className="form-error">{errors.duration}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Calories Burned <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  type="number"
                  name="calories"
                  value={form.calories}
                  onChange={handleChange}
                  placeholder="e.g. 350"
                  min="1"
                  max="5000"
                />
                {errors.calories && <span className="form-error">{errors.calories}</span>}
              </div>

              <div className="form-group full-width">
                <label className="form-label">Notes (optional)</label>
                <textarea
                  className="form-textarea"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="How did the workout feel? Any personal records?"
                  maxLength={500}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? '⏳ Saving…' : mode === 'edit' ? '💾 Update Workout' : '➕ Log Workout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
