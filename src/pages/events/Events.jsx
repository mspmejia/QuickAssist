import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import './Events.css';

const STATUS_LABELS = { confirmed: 'Confirmado', pending: 'Pendiente', completed: 'Completado', cancelled: 'Cancelado' };
const STATUS_BADGE = { confirmed: 'badge-green', pending: 'badge-yellow', completed: 'badge-gray', cancelled: 'badge-red' };
const TYPE_LABELS = { concert: '🎵 Concierto', sports: '⚽ Deportes', forum: '🎙 Foro', festival: '🎪 Festival' };

const EMPTY_FORM = {
  name: '', client: '', venue: '', date: '', setupDate: '', teardownDate: '',
  expectedAttendance: '', type: 'concert', status: 'pending', ambulances: 1, notes: '',
};

export default function Events() {
  const { events, addEvent, updateEvent, personnel } = useApp();
  const { hasRole } = useAuth();
  const [view, setView] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterStatus, setFilterStatus] = useState('all');
  const [enrollTab, setEnrollTab] = useState('event');

  const canEdit = hasRole('admin');

  const filtered = filterStatus === 'all' ? events : events.filter(e => e.status === filterStatus);
  const sorted = [...filtered].sort((a,b) => new Date(a.date) - new Date(b.date));

  const handleSave = () => {
    if (selectedEvent) {
      updateEvent(selectedEvent.id, { ...form, expectedAttendance: Number(form.expectedAttendance), ambulances: Number(form.ambulances) });
    } else {
      addEvent({ ...form, expectedAttendance: Number(form.expectedAttendance), ambulances: Number(form.ambulances), assignedPersonnel: [] });
    }
    setShowModal(false);
    setSelectedEvent(null);
    setForm(EMPTY_FORM);
  };

  const openEdit = (ev) => {
    setSelectedEvent(ev);
    setForm({ ...ev, date: ev.date ? format(new Date(ev.date), 'yyyy-MM-dd') : '', setupDate: ev.setupDate ? format(new Date(ev.setupDate), 'yyyy-MM-dd') : '', teardownDate: ev.teardownDate ? format(new Date(ev.teardownDate), 'yyyy-MM-dd') : '' });
    setShowModal(true);
  };

  const assignPersonnel = (eventId, personId) => {
    const ev = events.find(e => e.id === eventId);
    const already = ev.assignedPersonnel.includes(personId);
    updateEvent(eventId, {
      assignedPersonnel: already
        ? ev.assignedPersonnel.filter(id => id !== personId)
        : [...ev.assignedPersonnel, personId],
    });
  };

  return (
    <div className="events-page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Eventos</h1>
          <p className="page-subtitle">{events.length} eventos registrados</p>
        </div>
        <div className="events-header-actions">
          <div className="view-toggle">
            <button className={`btn btn-ghost btn-sm ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>▦ Lista</button>
            <button className={`btn btn-ghost btn-sm ${view === 'calendar' ? 'active' : ''}`} onClick={() => setView('calendar')}>◈ Calendario</button>
          </div>
          {canEdit && (
            <button className="btn btn-primary" onClick={() => { setSelectedEvent(null); setForm(EMPTY_FORM); setShowModal(true); }}>
              + Nuevo Evento
            </button>
          )}
        </div>
      </div>

      {/* FILTERS */}
      <div className="events-filters">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button key={s} className={`filter-btn ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
            {s === 'all' ? 'Todos' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {view === 'list' ? (
        <div className="events-list">
          {sorted.map(ev => (
            <div key={ev.id} className="event-card card">
              <div className="event-card-top">
                <div className="event-card-left">
                  <div className="event-date-badge">
                    <span className="edb-day">{format(new Date(ev.date), 'd')}</span>
                    <span className="edb-month">{format(new Date(ev.date), 'MMM', { locale: es })}</span>
                  </div>
                  <div>
                    <h3 className="event-name">{ev.name}</h3>
                    <div className="event-meta-row">
                      <span>{TYPE_LABELS[ev.type] || ev.type}</span>
                      <span>•</span>
                      <span>{ev.client}</span>
                      <span>•</span>
                      <span>⌖ {ev.venue}</span>
                    </div>
                  </div>
                </div>
                <div className="event-card-right">
                  <span className={`badge ${STATUS_BADGE[ev.status]}`}>{STATUS_LABELS[ev.status]}</span>
                  {canEdit && (
                    <div className="event-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(ev)}>✎ Editar</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedEvent(ev); setShowAssignModal(true); }}>◉ Personal</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="event-card-bottom">
                <div className="event-detail"><span>👥</span>{ev.expectedAttendance?.toLocaleString()} asistentes</div>
                <div className="event-detail"><span>🚑</span>{ev.ambulances} ambulancia(s)</div>
                <div className="event-detail"><span>◉</span>{ev.assignedPersonnel?.length || 0} personal asignado</div>
                <div className="event-detail"><span>📅</span>Montaje: {ev.setupDate ? format(new Date(ev.setupDate), 'd MMM', { locale: es }) : 'N/D'}</div>
                <div className="event-detail"><span>📅</span>Desmontaje: {ev.teardownDate ? format(new Date(ev.teardownDate), 'd MMM', { locale: es }) : 'N/D'}</div>
              </div>
              {ev.notes && <div className="event-notes">📝 {ev.notes}</div>}
            </div>
          ))}
          {sorted.length === 0 && (
            <div className="empty-state">
              <span>◈</span>
              <p>No hay eventos en esta categoría</p>
            </div>
          )}
        </div>
      ) : (
        <CalendarView events={events} />
      )}

      {/* EVENT MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedEvent ? 'Editar Evento' : 'Nuevo Evento'}</h2>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Nombre del Evento *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nombre del evento" />
                </div>
                <div className="form-group">
                  <label className="form-label">Cliente *</label>
                  <input className="form-input" value={form.client} onChange={e => setForm({...form, client: e.target.value})} placeholder="Nombre del cliente" />
                </div>
                <div className="form-group">
                  <label className="form-label">Sede / Venue *</label>
                  <input className="form-input" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} placeholder="Lugar del evento" />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <select className="form-input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="concert">Concierto</option>
                    <option value="sports">Deportes</option>
                    <option value="forum">Foro</option>
                    <option value="festival">Festival</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha del Evento *</label>
                  <input className="form-input" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="completed">Completado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha de Montaje</label>
                  <input className="form-input" type="date" value={form.setupDate} onChange={e => setForm({...form, setupDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha de Desmontaje</label>
                  <input className="form-input" type="date" value={form.teardownDate} onChange={e => setForm({...form, teardownDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Asistentes Esperados</label>
                  <input className="form-input" type="number" value={form.expectedAttendance} onChange={e => setForm({...form, expectedAttendance: e.target.value})} placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Ambulancias Requeridas</label>
                  <input className="form-input" type="number" min="1" value={form.ambulances} onChange={e => setForm({...form, ambulances: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notas</label>
                <textarea className="form-input" rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Indicaciones especiales, requerimientos..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {selectedEvent ? 'Guardar Cambios' : 'Crear Evento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN PERSONNEL MODAL */}
      {showAssignModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Asignar Personal</h2>
                <p className="text-muted" style={{fontSize:12}}>{selectedEvent.name}</p>
              </div>
              <button className="btn-ghost" onClick={() => setShowAssignModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="enroll-tabs">
                {['event', 'setup', 'teardown'].map(tab => (
                  <button key={tab} className={`enroll-tab ${enrollTab === tab ? 'active' : ''}`} onClick={() => setEnrollTab(tab)}>
                    {tab === 'event' ? '◈ Evento' : tab === 'setup' ? '▲ Montaje' : '▼ Desmontaje'}
                  </button>
                ))}
              </div>
              <p className="text-muted" style={{fontSize:12,marginBottom:12}}>
                Selecciona el personal para {enrollTab === 'event' ? 'el evento' : enrollTab === 'setup' ? 'montaje' : 'desmontaje'}:
              </p>
              <div className="assign-list">
                {personnel.map(p => {
                  const assigned = selectedEvent.assignedPersonnel?.includes(p.id);
                  return (
                    <div key={p.id} className={`assign-row ${assigned ? 'assigned' : ''}`} onClick={() => assignPersonnel(selectedEvent.id, p.id)}>
                      <div className="assign-checkbox">{assigned ? '✓' : ''}</div>
                      <div className="assign-name">{p.name}</div>
                      <div className="assign-role text-muted">{p.role === 'paramedic' ? 'Paramédico' : 'Piloto'}</div>
                      <span className={`badge ${p.status === 'available' ? 'badge-green' : 'badge-yellow'}`}>
                        {p.status === 'available' ? 'Disponible' : 'Asignado'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="modal-footer">
              <span className="text-muted" style={{fontSize:12}}>
                {selectedEvent.assignedPersonnel?.length || 0} persona(s) asignada(s)
              </span>
              <button className="btn btn-primary" onClick={() => setShowAssignModal(false)}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarView({ events }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const getEventsForDay = (day) => {
    return events.filter(ev => {
      const d = new Date(ev.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  return (
    <div className="calendar-view card">
      <div className="cal-header">
        <button className="btn btn-ghost" onClick={() => setCurrentMonth(new Date(year, month - 1))}>◀</button>
        <h3 className="cal-month">{format(currentMonth, 'MMMM yyyy', { locale: es }).toUpperCase()}</h3>
        <button className="btn btn-ghost" onClick={() => setCurrentMonth(new Date(year, month + 1))}>▶</button>
      </div>
      <div className="cal-weekdays">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
          <div key={d} className="cal-weekday">{d}</div>
        ))}
      </div>
      <div className="cal-grid">
        {cells.map((day, i) => {
          const dayEvents = day ? getEventsForDay(day) : [];
          const isToday = day && new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
          return (
            <div key={i} className={`cal-cell ${!day ? 'empty' : ''} ${isToday ? 'today' : ''}`}>
              {day && <span className="cal-day-num">{day}</span>}
              {dayEvents.map(ev => (
                <div key={ev.id} className={`cal-event-dot status-${ev.status}`} title={ev.name}>
                  {ev.name.substring(0, 14)}{ev.name.length > 14 ? '…' : ''}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
