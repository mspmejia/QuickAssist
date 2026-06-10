import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import './AppLayout.css';

const SECTION_LABELS = {
  '/dashboard':    'Dashboard',
  '/events':       'Eventos',
  '/patients':     'Fichas de Atención',
  '/personnel':    'Personal',
  '/inventory':    'Inventario',
  '/accounting':   'Contabilidad',
  '/reports':      'Reportería',
  '/availability': 'Disponibilidad',
};

export default function AppLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const sectionLabel = SECTION_LABELS[location.pathname] || 'Quick Assist';

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-layout">
      <Sidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />
      <main className="app-main">
        <header className="app-mobile-header">
          <button
            className="app-hamburger btn-ghost"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <div className="app-mobile-logo">
            <span className="app-mobile-section">{sectionLabel}</span>
          </div>
        </header>
        <div className="app-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
