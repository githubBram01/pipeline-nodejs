import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getVehicles()
      .then(setVehicles)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading vehicles...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Vehicles</h1>
        <Link to="/vehicles/new" className="btn btn-primary">+ Add Vehicle</Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: '#6b7280', padding: '3rem' }}>
          No vehicles yet.{' '}
          <Link to="/vehicles/new" style={{ color: '#2563eb' }}>Add your first vehicle</Link>.
        </div>
      ) : (
        <div className="grid">
          {vehicles.map(v => (
            <Link key={v.id} to={`/vehicles/${v.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>
                    {v.year} {v.make} {v.model}
                  </h3>
                  <span className={`badge badge-${v.condition}`}>{v.condition}</span>
                </div>
                {v.vin && (
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.4rem' }}>VIN: {v.vin}</p>
                )}
                <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>{(v.mileage || 0).toLocaleString()} km</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.8rem', color: '#6b7280' }}>
                  <span>{v.evaluation_count ?? 0} evaluation{v.evaluation_count !== 1 ? 's' : ''}</span>
                  {v.avg_score != null && (
                    <span>Avg: <strong style={{ color: '#111827' }}>{parseFloat(v.avg_score).toFixed(1)}/10</strong></span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
