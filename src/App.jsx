import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Events from './pages/events/Events';
import Patients from './pages/patients/Patients';
import Personnel from './pages/personnel/Personnel';
import Inventory from './pages/inventory/Inventory';
import Accounting from './pages/accounting/Accounting';
import Reports from './pages/reports/Reports';
import Availability from './pages/availability/Availability';
import Companies from './pages/companies/Companies';
import Units from './pages/units/Units';
import './index.css';

// Protege rutas que solo ciertos roles deben poder abrir (aunque no estén
// en el menú, no deben ser accesibles escribiendo la URL directamente).
function RequireRole({ roles, children }) {
  const { hasRole } = useAuth();
  if (!hasRole(...roles)) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard"    element={<Dashboard />} />
              <Route path="/events"       element={<Events />} />
              <Route path="/patients"     element={<Patients />} />
              <Route path="/personnel"    element={<RequireRole roles={['admin','accounting']}><Personnel /></RequireRole>} />
              <Route path="/inventory"    element={<Inventory />} />
              <Route path="/accounting"   element={<RequireRole roles={['admin','accounting']}><Accounting /></RequireRole>} />
              <Route path="/reports"      element={<RequireRole roles={['admin','accounting']}><Reports /></RequireRole>} />
              <Route path="/availability" element={<Availability />} />
              <Route path="/companies"   element={<RequireRole roles={['admin']}><Companies /></RequireRole>} />
              <Route path="/units"       element={<RequireRole roles={['admin']}><Units /></RequireRole>} />
            </Route>
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
