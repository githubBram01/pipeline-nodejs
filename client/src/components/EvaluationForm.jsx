import { useState } from 'react';
import { api } from '../api';

export default function EvaluationForm({ vehicleId, onSave, onCancel }) {
  const [form, setForm] = useState({ evaluator_name: '', score: 7, notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'score' ? Number(value) : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.createEvaluation(vehicleId, form);
      onSave();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ border: '2px solid #dbeafe', marginBottom: '1rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>New Evaluation</h3>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
          <div className="form-group">
            <label htmlFor="eval-name">Evaluator Name *</label>
            <input
              id="eval-name"
              name="evaluator_name"
              value={form.evaluator_name}
              onChange={handleChange}
              required
              placeholder="Jane Smith"
            />
          </div>
          <div className="form-group">
            <label htmlFor="eval-score">Score (1–10) *</label>
            <input
              id="eval-score"
              name="score"
              type="number"
              value={form.score}
              onChange={handleChange}
              required
              min="1"
              max="10"
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="eval-notes">Notes</label>
          <textarea
            id="eval-notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Optional notes about the vehicle condition..."
          />
        </div>
        <div className="actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Evaluation'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
