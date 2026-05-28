import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLE_COLORS, ROLE_LABELS } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import './Dashboard.css';

const EVENT_TYPE_LABELS = { concert: 'Concierto', sports: 'Deportes', forum: 'Foro', festival: 'Festival' };
const STATUS_LABELS = { confirmed: 'Confirmado', pending: 'Pendiente', completed: 'Completado', cancelled: 'Cancelado' };
const STATUS_BADGE = { confirmed: 'badge-green', pending: 'badge-yellow', completed: 'badge-gray', cancelled: 'badge-red' };

export default function Dashboard() {
  const { user } = useAuth();
  const { events, personnel, patients, inventory } = useApp();
  const navigate = useNavigate();

  const today = new Date();
  const upcomingEvents = events.filter(e => isAfter(new Date(e.date), today) && e.status !== 'cancelled');
  const nextEvent = upcomingEvents.sort((a,b) => new Date(a.date) - new Date(b.date))[0];
  const lowStock = inventory.filter(i => i.status === 'low' || i.status === 'critical');
  const availablePersonnel = personnel.filter(p => p.status === 'available');

  const stats = [
    { label: 'Eventos Próximos', value: upcomingEvents.length, icon: '◈', color: '#CC0000', action: () => navigate('/events') },
    { label: 'Personal Disponible', value: availablePersonnel.length, icon: '◉', color: '#00C850', action: () => navigate('/personnel') },
    { label: 'Atenciones Este Mes', value: patients.length, icon: '✚', color: '#0088FF', action: () => navigate('/patients') },
    { label: 'Alertas de Inventario', value: lowStock.length, icon: '▣', color: '#FFB400', action: () => navigate('/inventory') },
  ];

  return (
    <div className="dashboard animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{format(today, "EEEE d 'de' MMMM, yyyy", { locale: es })}</p>
        </div>
        <div className="dashboard-user-badge" style={{ borderColor: ROLE_COLORS[user.role] }}>
          <div className="dashboard-avatar" style={{ background: ROLE_COLORS[user.role] }}>{user.avatar}</div>
          <div>
            <div className="dashboard-user-name">{user.name}</div>
            <div className="dashboard-user-role">{ROLE_LABELS[user.role]}</div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="dashboard-stats">
        {stats.map((s, i) => (
          <button key={i} className="stat-card" onClick={s.action} style={{ '--accent': s.color }}>
            <div className="stat-icon" style={{ color: s.color }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-bar" style={{ background: s.color }} />
          </button>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* NEXT EVENT */}
        {nextEvent && (
          <div className="card dashboard-next-event">
            <div className="card-header-row">
              <span className="card-label">Próximo Evento</span>
              <span className={`badge ${STATUS_BADGE[nextEvent.status]}`}>{STATUS_LABELS[nextEvent.status]}</span>
            </div>
            <h2 className="next-event-name">{nextEvent.name}</h2>
            <div className="next-event-meta">
              <div className="meta-item"><span>◈</span>{format(new Date(nextEvent.date), "d MMM yyyy", { locale: es })}</div>
              <div className="meta-item"><span>⌖</span>{nextEvent.venue}</div>
              <div className="meta-item"><span>◉</span>{nextEvent.expectedAttendance?.toLocaleString()} asistentes</div>
              <div className="meta-item"><span>🚑</span>{nextEvent.ambulances} ambulancia(s)</div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/events')}>
              Ver todos los eventos →
            </button>
          </div>
        )}

        {/* UPCOMING EVENTS LIST */}
        <div className="card">
          <div className="card-header-row">
            <span className="card-label">Agenda Próxima</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/events')}>Ver todo</button>
          </div>
          <div className="agenda-list">
            {upcomingEvents.slice(0, 4).map(ev => (
              <div key={ev.id} className="agenda-item">
                <div className="agenda-date">
                  <span className="agenda-day">{format(new Date(ev.date), 'd')}</span>
                  <span className="agenda-month">{format(new Date(ev.date), 'MMM', { locale: es })}</span>
                </div>
                <div className="agenda-info">
                  <div className="agenda-name">{ev.name}</div>
                  <div className="agenda-venue">{ev.venue}</div>
                </div>
                <span className={`badge ${STATUS_BADGE[ev.status]}`}>{STATUS_LABELS[ev.status]}</span>
              </div>
            ))}
            {upcomingEvents.length === 0 && <p className="text-muted" style={{fontSize:13}}>Sin eventos próximos</p>}
          </div>
        </div>

        {/* PERSONNEL STATUS */}
        <div className="card">
          <div className="card-header-row">
            <span className="card-label">Estado del Personal</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/personnel')}>Ver todo</button>
          </div>
          <div className="personnel-list">
            {personnel.slice(0, 5).map(p => (
              <div key={p.id} className="personnel-row">
                <div className="personnel-avatar" style={{ background: ROLE_COLORS[p.role] }}>
                  {p.avatar}
                </div>
                <div className="personnel-info">
                  <div className="personnel-name">{p.name}</div>
                  <div className="personnel-role">{ROLE_LABELS[p.role]}</div>
                </div>
                <span className={`badge ${p.status === 'available' ? 'badge-green' : p.status === 'assigned' ? 'badge-yellow' : 'badge-gray'}`}>
                  {p.status === 'available' ? 'Disponible' : p.status === 'assigned' ? 'Asignado' : 'Inactivo'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* INVENTORY ALERTS */}
        {lowStock.length > 0 && (
          <div className="card dashboard-alerts">
            <div className="card-header-row">
              <span className="card-label">⚠ Alertas de Inventario</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/inventory')}>Ver inventario</button>
            </div>
            {lowStock.map(item => (
              <div key={item.id} className="alert-row">
                <span className="alert-name">{item.name}</span>
                <div className="alert-right">
                  <span className="alert-qty">{item.quantity} {item.unit}</span>
                  <span className={`badge ${item.status === 'critical' ? 'badge-red' : 'badge-yellow'}`}>
                    {item.status === 'critical' ? 'CRÍTICO' : 'BAJO'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
