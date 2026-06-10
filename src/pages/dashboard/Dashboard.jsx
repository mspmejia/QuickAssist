import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLE_COLORS, ROLE_LABELS } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { format, isAfter, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import './Dashboard.css';

const STATUS_BADGE  = { confirmed:'badge-green', pending:'badge-yellow', completed:'badge-gray', cancelled:'badge-red' };
const STATUS_LABELS = { confirmed:'Confirmado', pending:'Pendiente', completed:'Completado', cancelled:'Cancelado' };

// Mini barra de progreso
const Bar = ({ value, max, color }) => (
  <div style={{ background: 'var(--black-border)', borderRadius: 2, height: 6, flex: 1 }}>
    <div style={{ width: `${max > 0 ? Math.round((value/max)*100) : 0}%`, background: color, height: 6, borderRadius: 2, transition: 'width .4s ease' }} />
  </div>
);

// Mini dona SVG
const Donut = ({ pct, color, size = 48 }) => {
  const r = (size / 2) - 5;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--black-border)" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
    </svg>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const { events, personnel, patients, inventory, companies, units, despachos } = useApp();
  const navigate = useNavigate();
  const today = new Date();

  const [statPeriod, setStatPeriod] = useState('mes'); // 'mes' | 'total'

  // ── Datos base ─────────────────────────────────────────
  const upcomingEvents     = events.filter(e => isAfter(new Date(e.date), today) && e.status !== 'cancelled');
  const nextEvent          = [...upcomingEvents].sort((a,b) => new Date(a.date) - new Date(b.date))[0];
  const lowStock           = inventory.filter(i => i.status === 'low' || i.status === 'critical');
  const availablePersonnel = personnel.filter(p => p.status === 'available');

  // Pacientes del mes actual vs total
  const monthStart = startOfMonth(today);
  const monthEnd   = endOfMonth(today);
  const patientsThisMonth = patients.filter(p =>
    isWithinInterval(new Date(p.date), { start: monthStart, end: monthEnd })
  );
  const activePeriod = statPeriod === 'mes' ? patientsThisMonth : patients;

  // ── Widget 1: Atenciones por tipo ─────────────────────
  const totalPat       = activePeriod.length;
  const attendees      = activePeriod.filter(p => p.patientType === 'attendee').length;
  const collaborators  = activePeriod.filter(p => p.patientType === 'collaborator').length;
  const transfers      = activePeriod.filter(p => p.transport).length;
  const attendeePct    = totalPat > 0 ? Math.round((attendees     / totalPat) * 100) : 0;
  const collaboratorPct= totalPat > 0 ? Math.round((collaborators / totalPat) * 100) : 0;

  // ── Widget 2: Top empresas ────────────────────────────
  const companyCounts = companies.map(c => ({
    ...c,
    count: activePeriod.filter(p => p.companyId === c.id).length,
  })).filter(c => c.count > 0).sort((a,b) => b.count - a.count).slice(0, 5);
  const maxCompanyCount = companyCounts[0]?.count || 1;

  // ── Widget 3: Motivos frecuentes ──────────────────────
  const reasonMap = {};
  activePeriod.forEach(p => {
    if (!p.reason) return;
    const key = p.reason.trim();
    reasonMap[key] = (reasonMap[key] || 0) + 1;
  });
  const topReasons = Object.entries(reasonMap)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 6)
    .map(([reason, count]) => ({ reason, count }));
  const maxReasonCount = topReasons[0]?.count || 1;

  // ── Widget 4: Consumo de inventario ───────────────────
  const itemConsumption = {};
  activePeriod.forEach(p => {
    (p.consumedItems || []).forEach(ci => {
      itemConsumption[ci.itemId] = (itemConsumption[ci.itemId] || 0) + ci.cantidad;
    });
  });
  const topConsumed = Object.entries(itemConsumption)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 5)
    .map(([itemId, consumed]) => {
      const item = inventory.find(i => i.id === Number(itemId));
      return { name: item?.name || `#${itemId}`, unit: item?.unit || '', consumed, stock: item?.quantity || 0 };
    });

  // ── Stat cards ────────────────────────────────────────
  const stats = [
    { label: 'Eventos próximos',    value: upcomingEvents.length,     icon: '◈', color: '#CC0000', action: () => navigate('/events')    },
    { label: 'Personal disponible', value: availablePersonnel.length, icon: '◉', color: '#00C850', action: () => navigate('/personnel') },
    { label: statPeriod==='mes' ? 'Atenciones este mes' : 'Total atenciones', value: totalPat, icon: '✚', color: '#0088FF', action: () => navigate('/patients') },
    { label: 'Alertas de inventario', value: lowStock.length,         icon: '▣', color: '#FFB400', action: () => navigate('/inventory') },
  ];

  return (
    <div className="dashboard animate-in">
      {/* ── Header ── */}
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

      {/* ── Stat cards ── */}
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

      {/* ── Toggle período ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 12, color: 'var(--white-faint)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estadísticas:</span>
        <div className="view-toggle" style={{ width: 'auto' }}>
          <button className={`btn btn-ghost btn-sm ${statPeriod==='mes'?'active':''}`} onClick={() => setStatPeriod('mes')}>Este mes</button>
          <button className={`btn btn-ghost btn-sm ${statPeriod==='total'?'active':''}`} onClick={() => setStatPeriod('total')}>Histórico</button>
        </div>
        <span style={{ fontSize: 12, color: 'var(--white-faint)' }}>{activePeriod.length} atenciones en período</span>
      </div>

      {/* ── Grid principal ── */}
      <div className="dashboard-grid-main">

        {/* Columna izquierda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Próximo evento */}
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
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/events')}>Ver todos los eventos →</button>
            </div>
          )}

          {/* Widget 1 — Atenciones por tipo */}
          <div className="card">
            <div className="card-header-row">
              <span className="card-label">Atenciones por tipo</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/patients')}>Ver fichas</button>
            </div>
            {totalPat === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--white-faint)' }}>Sin atenciones en el período</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Donas */}
                <div className="dash-type-row">
                  <div className="dash-type-item">
                    <Donut pct={attendeePct} color="#0088FF" />
                    <div>
                      <div className="dash-type-value">{attendees}</div>
                      <div className="dash-type-label">Asistentes</div>
                      <div className="dash-type-pct">{attendeePct}%</div>
                    </div>
                  </div>
                  <div className="dash-type-divider" />
                  <div className="dash-type-item">
                    <Donut pct={collaboratorPct} color="#FFB400" />
                    <div>
                      <div className="dash-type-value">{collaborators}</div>
                      <div className="dash-type-label">Colaboradores</div>
                      <div className="dash-type-pct">{collaboratorPct}%</div>
                    </div>
                  </div>
                  <div className="dash-type-divider" />
                  <div className="dash-type-item">
                    <Donut pct={totalPat > 0 ? Math.round((transfers/totalPat)*100) : 0} color="#CC0000" />
                    <div>
                      <div className="dash-type-value">{transfers}</div>
                      <div className="dash-type-label">Traslados</div>
                      <div className="dash-type-pct">{totalPat > 0 ? Math.round((transfers/totalPat)*100) : 0}%</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Widget 2 — Motivos frecuentes */}
          <div className="card">
            <div className="card-header-row">
              <span className="card-label">Motivos frecuentes</span>
            </div>
            {topReasons.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--white-faint)' }}>Sin datos en el período</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {topReasons.map(({ reason, count }, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--white-faint)', width: 16, textAlign: 'right', flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1, fontSize: 12, color: 'var(--white)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reason}</div>
                    <Bar value={count} max={maxReasonCount} color="#0088FF" />
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--white)', width: 20, textAlign: 'right', flexShrink: 0 }}>{count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Agenda */}
          <div className="card">
            <div className="card-header-row">
              <span className="card-label">Agenda Próxima</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/events')}>Ver todo ({upcomingEvents.length})</button>
            </div>
            <div className="agenda-list">
              {upcomingEvents.slice(0, 7).map(ev => (
                <div key={ev.id} className="agenda-item">
                  <div className="agenda-date">
                    <span className="agenda-day">{format(new Date(ev.date), 'd')}</span>
                    <span className="agenda-month">{format(new Date(ev.date), 'MMM', { locale: es })}</span>
                  </div>
                  <div className="agenda-info">
                    <div className="agenda-name">{ev.name}</div>
                    <div className="agenda-venue">{ev.venue}</div>
                  </div>
                  <span className={`badge ${STATUS_BADGE[ev.status]}`} style={{ fontSize: 10 }}>{STATUS_LABELS[ev.status]}</span>
                </div>
              ))}
              {upcomingEvents.length === 0 && <p className="text-muted" style={{ fontSize: 13 }}>Sin eventos próximos</p>}
            </div>
          </div>

          {/* Widget 3 — Empresas con más atenciones */}
          <div className="card">
            <div className="card-header-row">
              <span className="card-label">Empresas — atenciones</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/companies')}>Ver empresas</button>
            </div>
            {companyCounts.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--white-faint)' }}>Sin colaboradores atendidos en el período</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {companyCounts.map((c, i) => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--white-faint)', width: 16, textAlign: 'right', flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1, fontSize: 12, color: 'var(--white)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                    <Bar value={c.count} max={maxCompanyCount} color="#FFB400" />
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--white)', width: 20, textAlign: 'right', flexShrink: 0 }}>{c.count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Widget 4 — Consumo de inventario */}
          <div className="card">
            <div className="card-header-row">
              <span className="card-label">Consumo de inventario</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/inventory')}>Ver inventario</button>
            </div>
            {topConsumed.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--white-faint)' }}>Sin consumos registrados en el período</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {topConsumed.map((item, i) => {
                  const stockPct = item.stock > 0 ? Math.round((item.stock / (item.stock + item.consumed)) * 100) : 0;
                  const stockColor = stockPct < 30 ? '#CC0000' : stockPct < 60 ? '#FFB400' : '#00C850';
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: 12, color: 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{item.name}</span>
                        <span style={{ fontSize: 11, color: 'var(--white-faint)', flexShrink: 0, marginLeft: 8 }}>−{item.consumed} {item.unit} · stock: {item.stock}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Bar value={item.stock} max={item.stock + item.consumed} color={stockColor} />
                        <span style={{ fontSize: 10, color: stockColor, fontWeight: 700, width: 32, textAlign: 'right', flexShrink: 0 }}>{stockPct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Estado del personal */}
          <div className="card">
            <div className="card-header-row">
              <span className="card-label">Estado del Personal</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/personnel')}>Ver todo ({personnel.length})</button>
            </div>
            <div className="personnel-list">
              {personnel.slice(0, 5).map(p => (
                <div key={p.id} className="personnel-row">
                  <div className="personnel-avatar" style={{ background: ROLE_COLORS[p.role] }}>{p.avatar}</div>
                  <div className="personnel-info">
                    <div className="personnel-name">{p.name}</div>
                    <div className="personnel-role">{ROLE_LABELS[p.role]}</div>
                  </div>
                  <span className={`badge ${p.status==='available'?'badge-green':p.status==='assigned'?'badge-yellow':'badge-gray'}`} style={{ fontSize: 10 }}>
                    {p.status==='available'?'Disponible':p.status==='assigned'?'Asignado':'Inactivo'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Alertas de inventario */}
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
                    <span className={`badge ${item.status==='critical'?'badge-red':'badge-yellow'}`} style={{ fontSize: 10 }}>
                      {item.status==='critical'?'CRÍTICO':'BAJO'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
