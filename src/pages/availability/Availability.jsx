import React, { useState, useMemo } from 'react';
import { useAuth, ALL_STAFF, ROLE_LABELS, ROLE_COLORS } from '../../context/AuthContext';
import './Availability.css';

// ── Constantes ────────────────────────────────────────────
const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const SHIFTS = [
  { id: 'morning',   label: 'Mañana',  hours: '06:00 – 14:00', color: '#FFB400' },
  { id: 'afternoon', label: 'Tarde',   hours: '14:00 – 22:00', color: '#0088FF' },
  { id: 'night',     label: 'Noche',   hours: '22:00 – 06:00', color: '#AA44FF' },
];

const AVAIL_TYPES = [
  { id: 'full',  label: 'Día completo', icon: '◉' },
  { id: 'shift', label: 'Por turno',    icon: '◑' },
  { id: 'range', label: 'Rango horas',  icon: '◷' },
];

const STAFF_ROLES = ['paramedic', 'pilot', 'medic'];

// Vista admin: las 3 opciones
const ADMIN_VIEWS = [
  { id: 'consolidated', label: 'Consolidado' },
  { id: 'by-person',    label: 'Por persona'  },
  { id: 'personal',     label: 'Mi calendario' },
];

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

function entryLabel(entry) {
  if (!entry) return '';
  if (entry.type === 'full') return 'Disponible';
  if (entry.type === 'shift') return (entry.shifts || []).map(s => s[0].toUpperCase()).join('/');
  if (entry.type === 'range') return `${entry.from}–${entry.to}`;
  return '';
}

// ── Componente principal ──────────────────────────────────
export default function Availability() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const t = today();

  const [viewYear,  setViewYear]  = useState(t.year);
  const [viewMonth, setViewMonth] = useState(t.month);
  const [adminView, setAdminView] = useState('consolidated');
  const [selectedStaff, setSelectedStaff] = useState(null); // para vista by-person
  const [selectedDay,   setSelectedDay]   = useState(null);
  const [showModal,     setShowModal]     = useState(false);

  // availData: { [dateKey]: { [userId]: { type, shifts?, from?, to? } } }
  const [availData, setAvailData] = useState({});

  const staffList = ALL_STAFF.filter(s => STAFF_ROLES.includes(s.role));
  const [activeStaff, setActiveStaff] = useState(staffList.map(s => s.id));

  // Form estado
  const [formType,   setFormType]   = useState('full');
  const [formShifts, setFormShifts] = useState([]);
  const [formFrom,   setFormFrom]   = useState('08:00');
  const [formTo,     setFormTo]     = useState('16:00');
  // Admin editando en vista by-person o personal
  const [editingUserId, setEditingUserId] = useState(null);

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

  // ── Abrir modal ───────────────────────────────────────
  const handleDayClick = (day) => {
    if (!day || isPast(viewYear, viewMonth, day)) return;
    const key = dateKey(viewYear, viewMonth, day);

    // Determinar qué usuario estamos editando
    let uid = user.id;
    if (isAdmin && adminView === 'by-person' && selectedStaff) uid = selectedStaff.id;

    setEditingUserId(uid);
    setSelectedDay({ day, key });

    const existing = availData[key]?.[uid];
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

  // ── Guardar ───────────────────────────────────────────
  const handleSave = () => {
    if (!selectedDay) return;
    setAvailData(prev => ({
      ...prev,
      [selectedDay.key]: {
        ...(prev[selectedDay.key] || {}),
        [editingUserId]: {
          type:   formType,
          shifts: formType === 'shift' ? formShifts : undefined,
          from:   formType === 'range' ? formFrom   : undefined,
          to:     formType === 'range' ? formTo     : undefined,
        }
      }
    }));
    setShowModal(false);
  };

  const handleRemove = () => {
    if (!selectedDay) return;
    setAvailData(prev => {
      const updated = { ...prev };
      if (updated[selectedDay.key]) {
        const dayData = { ...updated[selectedDay.key] };
        delete dayData[editingUserId];
        updated[selectedDay.key] = dayData;
      }
      return updated;
    });
    setShowModal(false);
  };

  // ── Chips ─────────────────────────────────────────────
  const getChipsConsolidated = (key) => {
    const dayData = availData[key] || {};
    return Object.entries(dayData)
      .filter(([uid]) => activeStaff.includes(Number(uid)))
      .map(([uid, entry]) => {
        const s = ALL_STAFF.find(x => x.id === Number(uid));
        if (!s) return null;
        return { color: ROLE_COLORS[s.role], label: s.avatar + ' ' + entryLabel(entry) };
      })
      .filter(Boolean);
  };

  const getChipByPerson = (key) => {
    if (!selectedStaff) return [];
    const entry = availData[key]?.[selectedStaff.id];
    if (!entry) return [];
    return [{ color: ROLE_COLORS[selectedStaff.role], label: entryLabel(entry) }];
  };

  const getChipPersonal = (key) => {
    const entry = availData[key]?.[user.id];
    if (!entry) return [];
    return [{ color: ROLE_COLORS[user.role], label: entryLabel(entry) }];
  };

  const getChips = (key) => {
    if (!isAdmin) return getChipPersonal(key);
    if (adminView === 'consolidated') return getChipsConsolidated(key);
    if (adminView === 'by-person')    return getChipByPerson(key);
    if (adminView === 'personal')     return getChipPersonal(key);
    return [];
  };

  const toggleStaff  = (id) => setActiveStaff(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleShift  = (id) => setFormShifts(prev => prev.includes(id)  ? prev.filter(x => x !== id) : [...prev, id]);

  // Nombre del usuario siendo editado en el modal
  const editingUser = ALL_STAFF.find(s => s.id === editingUserId);

  // ── Render ────────────────────────────────────────────
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
            {ADMIN_VIEWS.map(v => (
              <button
                key={v.id}
                className={`avail-view-btn ${adminView === v.id ? 'avail-view-btn--active' : ''}`}
                onClick={() => setAdminView(v.id)}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="avail-layout">
        {/* ── Columna calendario ── */}
        <div>
          {/* Controles de mes */}
          <div className="avail-controls">
            <div className="avail-month-nav">
              <button className="btn btn-outline btn-sm" onClick={prevMonth}>‹</button>
              <span className="avail-month-label">{MONTHS[viewMonth]} {viewYear}</span>
              <button className="btn btn-outline btn-sm" onClick={nextMonth}>›</button>
            </div>

            {/* Selector de persona en vista by-person */}
            {isAdmin && adminView === 'by-person' && (
              <select
                className="form-input"
                style={{ fontSize: 13, padding: '7px 12px' }}
                value={selectedStaff?.id || ''}
                onChange={e => {
                  const s = staffList.find(x => x.id === Number(e.target.value));
                  setSelectedStaff(s || null);
                }}
              >
                <option value="">— Seleccionar persona —</option>
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({ROLE_LABELS[s.role]})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Aviso si by-person sin selección */}
          {isAdmin && adminView === 'by-person' && !selectedStaff && (
            <div className="card" style={{ textAlign: 'center', color: 'var(--white-muted)', fontSize: 13, padding: '32px 20px' }}>
              Selecciona una persona para ver y editar su disponibilidad
            </div>
          )}

          {/* Grid del calendario */}
          {(!isAdmin || adminView !== 'by-person' || selectedStaff) && (
            <div className="avail-calendar">
              <div className="avail-weekdays">
                {WEEKDAYS.map(d => <div key={d} className="avail-weekday">{d}</div>)}
              </div>
              <div className="avail-days">
                {calendar.map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} className="avail-day avail-day--empty" />;
                  const key  = dateKey(viewYear, viewMonth, day);
                  const past = isPast(viewYear, viewMonth, day);
                  const isToday    = t.year === viewYear && t.month === viewMonth && t.day === day;
                  const isSelected = selectedDay?.day === day;
                  const chips = getChips(key);

                  return (
                    <div
                      key={key}
                      className={[
                        'avail-day',
                        past        ? 'avail-day--past'     : '',
                        isToday     ? 'avail-day--today'    : '',
                        isSelected  ? 'avail-day--selected' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => handleDayClick(day)}
                    >
                      <div className="avail-day-num">{day}</div>
                      <div className="avail-day-chips">
                        {chips.map((chip, i) => (
                          <div key={i} className="avail-chip" style={{ background: chip.color + 'cc' }}>
                            {chip.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Panel lateral ── */}
        <div className="avail-panel">

          {/* Vista consolidada: filtros de personal */}
          {isAdmin && adminView === 'consolidated' && (
            <div className="card">
              <div className="avail-panel-title">Filtrar personal</div>
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
                    <div className="avail-legend-dot" style={{ background: ROLE_COLORS[s.role] }} />
                    <span style={{ flex: 1, fontSize: 12, color: 'var(--white)', fontWeight: 600 }}>{s.name}</span>
                    <span style={{ fontSize: 10, color: 'var(--white-faint)' }}>{ROLE_LABELS[s.role]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vista by-person: resumen del mes de la persona seleccionada */}
          {isAdmin && adminView === 'by-person' && selectedStaff && (
            <div className="card">
              <div className="avail-panel-title">Resumen — {selectedStaff.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  background: ROLE_COLORS[selectedStaff.role],
                  fontWeight: 700, fontSize: 12, color: 'white'
                }}>{selectedStaff.avatar}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--white)' }}>{selectedStaff.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--white-faint)' }}>{ROLE_LABELS[selectedStaff.role]}</div>
                </div>
              </div>
              {/* Conteo de días marcados en el mes visible */}
              {(() => {
                const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
                let count = 0;
                for (let d = 1; d <= daysInMonth; d++) {
                  const k = dateKey(viewYear, viewMonth, d);
                  if (availData[k]?.[selectedStaff.id]) count++;
                }
                return (
                  <div style={{ fontSize: 12, color: 'var(--white-muted)' }}>
                    <span style={{ color: 'var(--white)', fontWeight: 700, fontSize: 22 }}>{count}</span>
                    {' '}días marcados en {MONTHS[viewMonth]}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Vista personal del admin: su propio resumen */}
          {isAdmin && adminView === 'personal' && (
            <div className="card">
              <div className="avail-panel-title">Mi disponibilidad</div>
              <div style={{ fontSize: 12, color: 'var(--white-muted)' }}>
                Editando como <span style={{ color: 'var(--white)', fontWeight: 600 }}>{user.name}</span>
              </div>
            </div>
          )}

          {/* Leyenda de turnos (siempre visible) */}
          <div className="card">
            <div className="avail-panel-title">Turnos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SHIFTS.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--white-muted)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <strong style={{ color: 'var(--white)' }}>{s.label}</strong>
                  <span style={{ marginLeft: 'auto', fontSize: 11 }}>{s.hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instrucciones */}
          <div className="card">
            <div className="avail-panel-title">Cómo usar</div>
            <p style={{ fontSize: 12, color: 'var(--white-muted)', lineHeight: 1.6 }}>
              {isAdmin && adminView === 'consolidated' && 'Vista general de todo el equipo. Usa los filtros para mostrar u ocultar personas. Haz click en un día para editar tu propia disponibilidad.'}
              {isAdmin && adminView === 'by-person'    && 'Selecciona una persona del menú y toca cualquier día para editar su disponibilidad directamente.'}
              {isAdmin && adminView === 'personal'     && 'Vista de tu propio calendario. Toca un día futuro para marcar tu disponibilidad.'}
              {!isAdmin && 'Toca cualquier día futuro para marcar tu disponibilidad. Puedes elegir día completo, turnos específicos o un rango de horas.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Modal de marcado ── */}
      {showModal && selectedDay && (
        <div className="avail-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="avail-modal" onClick={e => e.stopPropagation()}>
            <div className="avail-modal-title">
              {String(selectedDay.day).padStart(2, '0')} {MONTHS[viewMonth]} {viewYear}
            </div>

            {/* Indicador de quién se está editando (solo admin en by-person) */}
            {isAdmin && adminView === 'by-person' && editingUser && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px', borderRadius: 'var(--radius)',
                background: ROLE_COLORS[editingUser.role] + '22',
                border: `1px solid ${ROLE_COLORS[editingUser.role]}44`,
                marginBottom: 16, fontSize: 12
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: ROLE_COLORS[editingUser.role],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 10, color: 'white'
                }}>{editingUser.avatar}</div>
                <span style={{ color: 'var(--white)', fontWeight: 600 }}>{editingUser.name}</span>
                <span style={{ color: 'var(--white-faint)', marginLeft: 'auto' }}>{ROLE_LABELS[editingUser.role]}</span>
              </div>
            )}

            {/* Tipo */}
            <div className="form-group">
              <label className="form-label">Tipo de disponibilidad</label>
              <div className="avail-type-grid">
                {AVAIL_TYPES.map(tp => (
                  <button
                    key={tp.id}
                    className={`avail-type-btn ${formType === tp.id ? 'avail-type-btn--active' : ''}`}
                    onClick={() => setFormType(tp.id)}
                  >
                    <span className="avail-type-icon">{tp.icon}</span>
                    {tp.label}
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

            {/* Rango */}
            {formType === 'range' && (
              <div className="form-group">
                <label className="form-label">Rango de horas</label>
                <div className="avail-time-row">
                  <div>
                    <label className="form-label" style={{ fontSize: 10 }}>Desde</label>
                    <input type="time" className="form-input" value={formFrom} onChange={e => setFormFrom(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 10 }}>Hasta</label>
                    <input type="time" className="form-input" value={formTo} onChange={e => setFormTo(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            <div className="avail-modal-actions">
              {availData[selectedDay.key]?.[editingUserId] && (
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
