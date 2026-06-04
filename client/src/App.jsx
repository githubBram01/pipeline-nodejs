import { Routes, Route, Link } from 'react-router-dom';
import VehicleList from './components/VehicleList';
import VehicleForm from './components/VehicleForm';
import VehicleDetail from './components/VehicleDetail';

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="logo">Vehicle Evaluation Platform</Link>
        <nav>
          <Link to="/vehicles/new" className="btn btn-nav">+ Add Vehicle</Link>
        </nav>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<VehicleList />} />
          <Route path="/vehicles/new" element={<VehicleForm />} />
          <Route path="/vehicles/:id/edit" element={<VehicleForm />} />
          <Route path="/vehicles/:id" element={<VehicleDetail />} />
        </Routes>
      </main>
    </div>
  );
}
