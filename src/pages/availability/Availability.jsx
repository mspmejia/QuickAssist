import React, { useState, useMemo } from 'react';
import { useAuth, ALL_STAFF, ROLE_LABELS, ROLE_COLORS } from '../../context/AuthContext';
import './Availability.css';

// ── Constantes ────────────────────────────────────────────
const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const SHIFTS = [
  { id: 'morning', label: 'Mañana',  hours: '06:00 – 14:00', color: '#FFB400' },
  { id: 'afternoon', label: 'Tarde', hours: '14:00 – 22:00', color: '#0088FF' },
  { id: 'night', label: 'Noche',     hours: '22:00 – 06:00', color: '#AA44FF' },
];

const AVAIL_TYPES = [
  { id: 'full',   label: 'Día completo', icon: '◉' },
  { id: 'shift',  label: 'Por turno',    icon: '◑' },
  { id: 'range',  label: 'Rango horas',  icon: '◷' },
];

const STAFF_ROLES = ['paramedic', 'pilot', 'medic'];

// ── Helpers ───────────────────────────────────────────────
function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function today() {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
}

function isPast(year, month, day) {
  const t = today();
  if (year < t.year) return true;
  if (year === t.year && month < t.month) return true;
  if (year === t.year && month === t.month && day < t.day) return true;
  return false;
}

// ── Componente principal ──────────────────────────────────
export default function Availability() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const t = today();

  const [viewYear, setViewYear] = useState(t.year);
  const [viewMonth, setViewMonth] = useState(t.month);
  const [adminView, setAdminView] = useState('consolidated'); // 'consolidated' | 'personal'
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // availData: { [dateKey]: { [userId]: { type, shifts?, from?, to? } } }
  const [availData, setAvailData] = useState({});

  // Filtros admin
  const staffList = ALL_STAFF.filter(s => STAFF_ROLES.includes(s.role));
  const [activeStaff, setActiveStaff] = useState(staffList.map(s => s.id));

  // Form estado
  const [formType, setFormType] = useState('full');
  const [formShifts, setFormShifts] = useState([]);
  const [formFrom, setFormFrom] = useState('08:00');
  const [formTo, setFormTo] = useState('16:00');

  const calendar = useMemo(() => buildCalendar(viewYear, viewMonth), [viewYear, viewMonth]);

  // Navegar mes
  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  // Abrir modal al click en día
  const handleDayClick = (day) => {
    if (!day || isPast(viewYear, viewMonth, day)) return;
    const key = dateKey(viewYear, viewMonth, day);
    setSelectedDay({ day, key });

    // Pre-cargar datos existentes si los hay
    const existing = availData[key]?.[user.id];
    if (existing) {
      setFormType(existing.type);
      setFormShifts(existing.shifts || []);
      setFormFrom(existing.from || '08:00');
      setFormTo(existing.to || '16:00');
    } else {
      setFormType('full');
      setFormShifts([]);
      setFormFrom('08:00');
      setFormTo('16:00');
    }
    setShowModal(true);
  };

  // Guardar disponibilidad
  const handleSave = () => {
    if (!selectedDay) return;
    setAvailData(prev => ({
      ...prev,
      [selectedDay.key]: {
        ...(prev[selectedDay.key] || {}),
        [user.id]: {
          type: formType,
          shifts: formType === 'shift' ? formShifts : undefined,
          from: formType === 'range' ? formFrom : undefined,
          to: formType === 'range' ? formTo : undefined,
        }
      }
    }));
    setShowModal(false);
  };

  // Eliminar disponibilidad
  const handleRemove = () => {
    if (!selectedDay) return;
    setAvailData(prev => {
      const updated = { ...prev };
      if (updated[selectedDay.key]) {
        const dayData = { ...updated[selectedDay.key] };
        delete dayData[user.id];
        updated[selectedDay.key] = dayData;
      }
      return updated;
    });
    setShowModal(false);
  };

  // Chips para un día en vista consolidada
  const getChipsForDay = (key) => {
    const dayData = availData[key] || {};
    return Object.entries(dayData)
      .filter(([uid]) => activeStaff.includes(Number(uid)))
      .map(([uid, entry]) => {
        const staff = ALL_STAFF.find(s => s.id === Number(uid));
        if (!staff) return null;
        const color = ROLE_COLORS[staff.role];
        let label = staff.avatar;
        if (entry.type === 'shift' && entry.shifts?.length) {
          label += ' ' + entry.shifts.map(s => s[0].toUpperCase()).join('');
        } else if (entry.type === 'range') {
          label += ` ${entry.from}-${entry.to}`;
        }
        return { color, label, uid };
      })
      .filter(Boolean);
  };

  // Chips para vista personal
  const getPersonalChip = (key) => {
    const entry = availData[key]?.[user.id];
    if (!entry) return null;
    const color = ROLE_COLORS[user.role];
    let label = '';
    if (entry.type === 'full') label = 'Disponible';
    else if (entry.type === 'shift') label = (entry.shifts || []).join(', ');
    else if (entry.type === 'range') label = `${entry.from} – ${entry.to}`;
    return { color, label };
  };

  const toggleStaff = (id) => {
    setActiveStaff(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleShift = (id) => {
    setFormShifts(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">◷ Disponibilidad</h1>
          <p className="page-subtitle">
            {isAdmin ? 'Gestión de disponibilidad del personal' : 'Marca tus días y turnos disponibles'}
          </p>
        </div>
        {isAdmin && (
          <div className="avail-view-toggle">
            <button
              className={`avail-view-btn ${adminView === 'consolidated' ? 'avail-view-btn--active' : ''}`}
              onClick={() => setAdminView('consolidated')}
            >Consolidado</button>
            <button
              className={`avail-view-btn ${adminView === 'personal' ? 'avail-view-btn--active' : ''}`}
              onClick={() => setAdminView('personal')}
            >Personal</button>
          </div>
        )}
      </div>

      <div className="avail-layout">
        {/* Calendario */}
        <div>
          {/* Controles de mes */}
          <div className="avail-controls">
            <div className="avail-month-nav">
              <button className="btn btn-outline btn-sm" onClick={prevMonth}>‹</button>
              <span className="avail-month-label">{MONTHS[viewMonth]} {viewYear}</span>
              <button className="btn btn-outline btn-sm" onClick={nextMonth}>›</button>
            </div>
          </div>

          {/* Grid */}
          <div className="avail-calendar">
            <div className="avail-weekdays">
              {WEEKDAYS.map(d => <div key={d} className="avail-weekday">{d}</div>)}
            </div>
            <div className="avail-days">
              {calendar.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="avail-day avail-day--empty" />;
                const key = dateKey(viewYear, viewMonth, day);
                const past = isPast(viewYear, viewMonth, day);
                const isToday = t.year === viewYear && t.month === viewMonth && t.day === day;
                const isSelected = selectedDay?.day === day;

                const chips = isAdmin && adminView === 'consolidated'
                  ? getChipsForDay(key)
                  : (getPersonalChip(key) ? [getPersonalChip(key)] : []);

                return (
                  <div
                    key={key}
                    className={[
                      'avail-day',
                      past ? 'avail-day--past' : '',
                      isToday ? 'avail-day--today' : '',
                      isSelected ? 'avail-day--selected' : '',
                    ].join(' ')}
                    onClick={() => handleDayClick(day)}
                  >
                    <div className="avail-day-num">{day}</div>
                    <div className="avail-day-chips">
                      {chips.map((chip, i) => (
                        <div
                          key={i}
                          className="avail-chip"
                          style={{ background: chip.color + 'cc' }}
                        >
                          {chip.label}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="avail-panel">
          {/* Leyenda / filtros (admin) */}
          {isAdmin && (
            <div className="card">
              <div className="avail-panel-title">Personal</div>
              <div className="avail-filter-list">
                {staffList.map(s => (
                  <div
                    key={s.id}
                    className={`avail-filter-item ${activeStaff.includes(s.id) ? 'avail-filter-item--active' : ''}`}
                    onClick={() => toggleStaff(s.id)}
                  >
                    <div
                      className="avail-filter-check"
                      style={activeStaff.includes(s.id)
                        ? { background: ROLE_COLORS[s.role], borderColor: ROLE_COLORS[s.role] }
                        : {}}
                    >
                      {activeStaff.includes(s.id) && '✓'}
                    </div>
                    <div
                      className="avail-legend-dot"
                      style={{ background: ROLE_COLORS[s.role] }}
                    />
                    <span style={{ flex: 1, fontSize: 12, color: 'var(--white)', fontWeight: 600 }}>{s.name}</span>
                    <span style={{ fontSize: 10, color: 'var(--white-faint)' }}>{ROLE_LABELS[s.role]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instrucciones */}
          <div className="card">
            <div className="avail-panel-title">Cómo usar</div>
            <p style={{ fontSize: 12, color: 'var(--white-muted)', lineHeight: 1.6 }}>
              Toca cualquier día futuro para marcar tu disponibilidad. Puedes elegir día completo, turnos específicos o un rango de horas.
            </p>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SHIFTS.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--white-muted)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <strong style={{ color: 'var(--white)' }}>{s.label}</strong> — {s.hours}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de marcado */}
      {showModal && selectedDay && (
        <div className="avail-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="avail-modal" onClick={e => e.stopPropagation()}>
            <div className="avail-modal-title">
              {String(selectedDay.day).padStart(2,'0')} {MONTHS[viewMonth]} {viewYear}
            </div>

            {/* Tipo de disponibilidad */}
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <div className="avail-type-grid">
                {AVAIL_TYPES.map(t => (
                  <button
                    key={t.id}
                    className={`avail-type-btn ${formType === t.id ? 'avail-type-btn--active' : ''}`}
                    onClick={() => setFormType(t.id)}
                  >
                    <span className="avail-type-icon">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Turnos */}
            {formType === 'shift' && (
              <div className="form-group">
                <label className="form-label">Turnos disponibles</label>
                <div className="avail-shifts">
                  {SHIFTS.map(s => (
                    <button
                      key={s.id}
                      className={`avail-shift-btn ${formShifts.includes(s.id) ? 'avail-shift-btn--active' : ''}`}
                      style={formShifts.includes(s.id) ? { borderColor: s.color, background: s.color + '22' } : {}}
                      onClick={() => toggleShift(s.id)}
                    >
                      <div className="avail-shift-dot" style={{ background: s.color }} />
                      <span style={{ flex: 1 }}>{s.label}</span>
                      <span style={{ fontSize: 10, color: 'var(--white-faint)' }}>{s.hours}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rango de horas */}
            {formType === 'range' && (
              <div className="form-group">
                <label className="form-label">Rango de horas</label>
                <div className="avail-time-row">
                  <div>
                    <label className="form-label" style={{ fontSize: 10 }}>Desde</label>
                    <input
                      type="time"
                      className="form-input"
                      value={formFrom}
                      onChange={e => setFormFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 10 }}>Hasta</label>
                    <input
                      type="time"
                      className="form-input"
                      value={formTo}
                      onChange={e => setFormTo(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="avail-modal-actions">
              {availData[selectedDay.key]?.[user.id] && (
                <button className="btn btn-outline btn-sm" onClick={handleRemove}
                  style={{ color: 'var(--red)', borderColor: 'var(--red)' }}>
                  Eliminar
                </button>
              )}
              <button className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
