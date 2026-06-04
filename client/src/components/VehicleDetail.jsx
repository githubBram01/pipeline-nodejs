import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import EvaluationForm from './EvaluationForm';

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    return Promise.all([api.getVehicle(id), api.getEvaluations(id)])
      .then(([v, evals]) => { setVehicle(v); setEvaluations(evals); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [id]);

  async function handleDeleteVehicle() {
    if (!window.confirm('Delete this vehicle and all its evaluations?')) return;
    try {
      await api.deleteVehicle(id);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStatusChange(evalId, status) {
    try {
      await api.updateEvaluation(evalId, { status });
      setEvaluations(prev => prev.map(e => e.id === evalId ? { ...e, status } : e));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteEval(evalId) {
    if (!window.confirm('Delete this evaluation?')) return;
    try {
      await api.deleteEvaluation(evalId);
      setEvaluations(prev => prev.filter(e => e.id !== evalId));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!vehicle) return null;

  return (
    <div>
      <div className="card">
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <div>
            <Link to="/" style={{ color: '#6b7280', fontSize: '0.8rem', textDecoration: 'none' }}>← All Vehicles</Link>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '0.25rem' }}>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
          </div>
          <div className="actions">
            <Link to={`/vehicles/${id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
            <button onClick={handleDeleteVehicle} className="btn btn-danger btn-sm">Delete</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
          <Stat label="Condition">
            <span className={`badge badge-${vehicle.condition}`}>{vehicle.condition}</span>
          </Stat>
          <Stat label="Mileage">{(vehicle.mileage || 0).toLocaleString()} km</Stat>
          {vehicle.vin && <Stat label="VIN">{vehicle.vin}</Stat>}
          <Stat label="Evaluations">{vehicle.evaluation_count ?? 0}</Stat>
          {vehicle.avg_score != null && (
            <Stat label="Avg Score">{parseFloat(vehicle.avg_score).toFixed(1)} / 10</Stat>
          )}
        </div>
      </div>

      <div className="flex-between" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Evaluations</h2>
        <button onClick={() => setShowForm(s => !s)} className="btn btn-primary btn-sm">
          {showForm ? 'Cancel' : '+ Add Evaluation'}
        </button>
      </div>

      {showForm && (
        <EvaluationForm
          vehicleId={id}
          onSave={() => { setShowForm(false); load(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {evaluations.length === 0 && !showForm ? (
        <div className="card" style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
          No evaluations yet.
        </div>
      ) : (
        evaluations.map(ev => (
          <div key={ev.id} className="card">
            <div className="flex-between">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <strong style={{ fontSize: '0.95rem' }}>{ev.evaluator_name}</strong>
                  <span className={`badge badge-${ev.status}`}>{ev.status}</span>
                  <span style={{ background: '#1e293b', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {ev.score}/10
                  </span>
                </div>
                {ev.notes && <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>{ev.notes}</p>}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                  {new Date(ev.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="actions">
                {ev.status === 'pending' && (
                  <>
                    <button onClick={() => handleStatusChange(ev.id, 'approved')} className="btn btn-success btn-sm">
                      Approve
                    </button>
                    <button onClick={() => handleStatusChange(ev.id, 'rejected')} className="btn btn-danger btn-sm">
                      Reject
                    </button>
                  </>
                )}
                <button onClick={() => handleDeleteEval(ev.id)} className="btn btn-secondary btn-sm">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function Stat({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{children}</div>
    </div>
  );
}
