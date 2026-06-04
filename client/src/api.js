const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(payload.error || res.statusText);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getVehicles: () => request('/vehicles'),
  getVehicle: (id) => request(`/vehicles/${id}`),
  createVehicle: (data) => request('/vehicles', { method: 'POST', body: data }),
  updateVehicle: (id, data) => request(`/vehicles/${id}`, { method: 'PUT', body: data }),
  deleteVehicle: (id) => request(`/vehicles/${id}`, { method: 'DELETE' }),

  getEvaluations: (vehicleId) => request(`/vehicles/${vehicleId}/evaluations`),
  createEvaluation: (vehicleId, data) => request(`/vehicles/${vehicleId}/evaluations`, { method: 'POST', body: data }),
  updateEvaluation: (id, data) => request(`/evaluations/${id}`, { method: 'PUT', body: data }),
  deleteEvaluation: (id) => request(`/evaluations/${id}`, { method: 'DELETE' })
};
