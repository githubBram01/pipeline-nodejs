import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import VehicleForm from '../components/VehicleForm';
import { api } from '../api';

vi.mock('../api', () => ({
  api: {
    getVehicle: vi.fn(),
    createVehicle: vi.fn(),
    updateVehicle: vi.fn()
  }
}));

function renderNewForm() {
  return render(
    <MemoryRouter initialEntries={['/vehicles/new']}>
      <Routes>
        <Route path="/vehicles/new" element={<VehicleForm />} />
        <Route path="/vehicles/:id" element={<div data-testid="detail-page">Detail</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('VehicleForm (create)', () => {
  afterEach(() => vi.clearAllMocks());

  test('renders all form fields', () => {
    renderNewForm();
    expect(screen.getByLabelText(/make/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mileage/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/condition/i)).toBeInTheDocument();
  });

  test('shows "Add Vehicle" heading for new form', () => {
    renderNewForm();
    expect(screen.getByText(/add vehicle/i)).toBeInTheDocument();
  });

  test('submits form and navigates to vehicle detail', async () => {
    api.createVehicle.mockResolvedValue({ id: 42, make: 'Toyota', model: 'Camry', year: 2020 });
    renderNewForm();

    fireEvent.change(screen.getByLabelText(/make/i), { target: { value: 'Toyota' } });
    fireEvent.change(screen.getByLabelText(/model/i), { target: { value: 'Camry' } });
    fireEvent.click(screen.getByRole('button', { name: /create vehicle/i }));

    await waitFor(() => {
      expect(api.createVehicle).toHaveBeenCalledWith(expect.objectContaining({ make: 'Toyota', model: 'Camry' }));
    });
    await waitFor(() => {
      expect(screen.getByTestId('detail-page')).toBeInTheDocument();
    });
  });

  test('shows error message on API failure', async () => {
    api.createVehicle.mockRejectedValue(new Error('VIN already exists'));
    renderNewForm();

    fireEvent.change(screen.getByLabelText(/make/i), { target: { value: 'Ford' } });
    fireEvent.change(screen.getByLabelText(/model/i), { target: { value: 'Focus' } });
    fireEvent.click(screen.getByRole('button', { name: /create vehicle/i }));

    await waitFor(() => expect(screen.getByText(/vin already exists/i)).toBeInTheDocument());
  });
});
