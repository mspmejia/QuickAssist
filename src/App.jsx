import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/events" element={<Events />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/personnel" element={<Personnel />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/accounting" element={<Accounting />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
