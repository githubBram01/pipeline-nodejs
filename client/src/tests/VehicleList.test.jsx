import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import VehicleList from '../components/VehicleList';
import { api } from '../api';

vi.mock('../api', () => ({
  api: {
    getVehicles: vi.fn()
  }
}));

function renderList() {
  return render(<MemoryRouter><VehicleList /></MemoryRouter>);
}

describe('VehicleList', () => {
  afterEach(() => vi.clearAllMocks());

  test('shows loading state initially', () => {
    api.getVehicles.mockReturnValue(new Promise(() => {}));
    renderList();
    expect(screen.getByText(/loading vehicles/i)).toBeInTheDocument();
  });

  test('renders vehicle cards', async () => {
    api.getVehicles.mockResolvedValue([
      { id: 1, make: 'Toyota', model: 'Camry', year: 2020, condition: 'good', mileage: 50000, evaluation_count: 2, avg_score: 8.5 },
      { id: 2, make: 'Honda', model: 'Civic', year: 2019, condition: 'excellent', mileage: 30000, evaluation_count: 0, avg_score: null }
    ]);
    renderList();
    await waitFor(() => {
      expect(screen.getByText(/2020 toyota camry/i)).toBeInTheDocument();
      expect(screen.getByText(/2019 honda civic/i)).toBeInTheDocument();
    });
  });

  test('shows empty state when no vehicles', async () => {
    api.getVehicles.mockResolvedValue([]);
    renderList();
    await waitFor(() => expect(screen.getByText(/no vehicles yet/i)).toBeInTheDocument());
  });

  test('shows error message on API failure', async () => {
    api.getVehicles.mockRejectedValue(new Error('Network error'));
    renderList();
    await waitFor(() => expect(screen.getByText(/network error/i)).toBeInTheDocument());
  });

  test('displays evaluation count for vehicles', async () => {
    api.getVehicles.mockResolvedValue([
      { id: 1, make: 'Ford', model: 'Focus', year: 2021, condition: 'fair', mileage: 20000, evaluation_count: 3, avg_score: 7.0 }
    ]);
    renderList();
    await waitFor(() => expect(screen.getByText(/3 evaluations/i)).toBeInTheDocument());
  });
});
