import React, { useState } from 'react';
import { workoutAPI } from '../api/workoutAPI';
import { useToast } from '../context/ToastContext';

export default function DeleteConfirmModal({ workout, onClose, onDeleted }) {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await workoutAPI.delete(workout._id);
      toast('Workout deleted successfully', 'success');
      onDeleted();
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to delete workout', 'error');
      setDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h3 className="modal-title">🗑️ Delete Workout</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p className="confirm-text">
            Are you sure you want to delete{' '}
            <span className="confirm-name">"{workout?.exercise}"</span>? This action cannot be undone.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={deleting}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? '⏳ Deleting…' : '🗑️ Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
