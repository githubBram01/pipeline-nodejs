import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';

const CONDITIONS = ['excellent', 'good', 'fair', 'poor'];
const CURRENT_YEAR = new Date().getFullYear();

const EMPTY_FORM = { make: '', model: '', year: CURRENT_YEAR, vin: '', mileage: 0, condition: 'good' };

export default function VehicleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    api.getVehicle(id)
      .then(v => setForm({ make: v.make, model: v.model, year: v.year, vin: v.vin || '', mileage: v.mileage, condition: v.condition }))
      .catch(err => setError(err.message));
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'year' || name === 'mileage' ? Number(value) : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const vehicle = isEdit
        ? await api.updateVehicle(id, form)
        : await api.createVehicle(form);
      navigate(`/vehicles/${vehicle.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
        {isEdit ? 'Edit Vehicle' : 'Add Vehicle'}
      </h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
          <div className="form-group">
            <label htmlFor="make">Make *</label>
            <input id="make" name="make" value={form.make} onChange={handleChange} required placeholder="Toyota" />
          </div>
          <div className="form-group">
            <label htmlFor="model">Model *</label>
            <input id="model" name="model" value={form.model} onChange={handleChange} required placeholder="Camry" />
          </div>
          <div className="form-group">
            <label htmlFor="year">Year *</label>
            <input id="year" name="year" type="number" value={form.year} onChange={handleChange}
              required min="1900" max={CURRENT_YEAR + 1} />
          </div>
          <div className="form-group">
            <label htmlFor="mileage">Mileage (km)</label>
            <input id="mileage" name="mileage" type="number" value={form.mileage} onChange={handleChange} min="0" />
          </div>
          <div className="form-group">
            <label htmlFor="vin">VIN</label>
            <input id="vin" name="vin" value={form.vin} onChange={handleChange} placeholder="Optional" />
          </div>
          <div className="form-group">
            <label htmlFor="condition">Condition</label>
            <select id="condition" name="condition" value={form.condition} onChange={handleChange}>
              {CONDITIONS.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="actions" style={{ marginTop: '0.5rem' }}>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Update Vehicle' : 'Create Vehicle'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
