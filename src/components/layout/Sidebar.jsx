import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ROLE_LABELS, ROLE_COLORS } from '../../context/AuthContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '▦', label: 'Dashboard', roles: ['admin', 'accounting', 'paramedic', 'pilot', 'inventory'] },
  { to: '/events', icon: '◈', label: 'Eventos', roles: ['admin', 'paramedic', 'pilot'] },
  { to: '/patients', icon: '✚', label: 'Fichas de Atención', roles: ['admin', 'paramedic'] },
  { to: '/personnel', icon: '◉', label: 'Personal', roles: ['admin', 'accounting'] },
  { to: '/inventory', icon: '▣', label: 'Inventario', roles: ['admin', 'inventory', 'paramedic'] },
  { to: '/accounting', icon: '◎', label: 'Contabilidad', roles: ['admin', 'accounting'] },
  { to: '/reports', icon: '◐', label: 'Reportería', roles: ['admin', 'accounting'] },
];

const MOBILE_BREAKPOINT = 768;

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

  // Detectar cambio de tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cerrar sidebar al navegar en mobile
  useEffect(() => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleItems = NAV_ITEMS.filter(item => hasRole(...item.roles));

  const sidebarClass = [
    'sidebar',
    !isMobile && collapsed ? 'sidebar--collapsed' : '',
    isMobile && mobileOpen ? 'sidebar--mobile-open' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* Overlay oscuro al abrir en mobile */}
      {isMobile && mobileOpen && (
        <div className="sidebar-overlay" onClick={onMobileClose} />
      )}

      <aside className={sidebarClass}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">✚</div>
            {(!collapsed || isMobile) && (
              <div className="sidebar-logo-text">
                <span className="sidebar-brand">QUICK ASSIST</span>
                <span className="sidebar-sub">Gestión Paramédica</span>
              </div>
            )}
          </div>
          {/* En mobile: botón cerrar; en desktop: botón colapsar */}
          {isMobile ? (
            <button className="sidebar-toggle btn-ghost" onClick={onMobileClose}>
              ✕
            </button>
          ) : (
            <button className="sidebar-toggle btn-ghost" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? '▶' : '◀'}
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {visibleItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item--active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {(!collapsed || isMobile) && <span className="sidebar-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {(!collapsed || isMobile) && (
            <div className="sidebar-user">
              <div className="sidebar-avatar" style={{ background: ROLE_COLORS[user?.role] }}>
                {user?.avatar}
              </div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user?.name}</span>
                <span className="sidebar-user-role">{ROLE_LABELS[user?.role]}</span>
              </div>
            </div>
          )}
          <button className="sidebar-logout btn-ghost" onClick={handleLogout} title="Cerrar sesión">
            ⏻
          </button>
        </div>
      </aside>
    </>
  );
}
