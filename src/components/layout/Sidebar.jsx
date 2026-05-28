import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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

export default function Sidebar() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleItems = NAV_ITEMS.filter(item => hasRole(...item.roles));

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">✚</div>
          {!collapsed && (
            <div className="sidebar-logo-text">
              <span className="sidebar-brand">QUICK ASSIST</span>
              <span className="sidebar-sub">Gestión Paramédica</span>
            </div>
          )}
        </div>
        <button className="sidebar-toggle btn-ghost" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {visibleItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item--active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
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
  );
}
