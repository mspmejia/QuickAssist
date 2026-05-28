import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './Patients.css';

const EMPTY_FORM = {
  eventId: '', patientName: '', age: '', gender: 'M',
  reason: '', vitals: { bp: '', hr: '', spo2: '', temp: '', rr: '' },
  treatment: '', transport: false, transportUnit: '', hospital: '',
  outcome: '', attendedBy: '', status: 'open',
};

export default function Patients() {
  const { patients, addPatient, events, personnel } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [viewPatient, setViewPatient] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterEvent, setFilterEvent] = useState('all');

  const filtered = filterEvent === 'all' ? patients : patients.filter(p => p.eventId === Number(filterEvent));

  const handleSave = () => {
    addPatient({
      ...form,
      date: new Date(),
      eventName: events.find(e => e.id === Number(form.eventId))?.name || 'Evento',
      eventId: Number(form.eventId),
      age: Number(form.age),
    });
    setShowModal(false);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="patients-page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fichas de Atención</h1>
          <p className="page-subtitle">{patients.length} atenciones registradas</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ✚ Nueva Ficha
        </button>
      </div>

      <div className="patients-filters">
        <select className="form-input" style={{width:'auto',minWidth:200}} value={filterEvent} onChange={e => setFilterEvent(e.target.value)}>
          <option value="all">Todos los eventos</option>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
        </select>
      </div>

      <div className="patients-table card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Folio</th>
                <th>Evento</th>
                <th>Fecha</th>
                <th>Motivo</th>
                <th>Atendido por</th>
                <th>Traslado</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><span className="folio-code">{p.folio}</span></td>
                  <td style={{maxWidth:160}}>{p.eventName}</td>
                  <td>{format(new Date(p.date), 'd MMM yyyy', { locale: es })}</td>
                  <td>{p.reason}</td>
                  <td>{p.attendedBy}</td>
                  <td>
                    {p.transport
                      ? <span className="badge badge-yellow">🚑 Sí</span>
                      : <span className="badge badge-gray">No</span>}
                  </td>
                  <td>
                    <span className={`badge ${p.status === 'open' ? 'badge-red' : 'badge-gray'}`}>
                      {p.status === 'open' ? 'Abierto' : 'Cerrado'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => setViewPatient(p)}>Ver ficha</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{textAlign:'center',color:'var(--white-faint)',padding:40}}>Sin fichas registradas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW PATIENT MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{maxWidth:700}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">✚ Nueva Ficha de Atención</h2>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="ficha-section-title">Datos del Paciente</div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Evento *</label>
                  <select className="form-input" value={form.eventId} onChange={e => setForm({...form, eventId: e.target.value})}>
                    <option value="">Seleccionar evento</option>
                    {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nombre (opcional)</label>
                  <input className="form-input" placeholder="Anónimo si no aplica" value={form.patientName} onChange={e => setForm({...form, patientName: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Edad</label>
                  <input className="form-input" type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Sexo</label>
                  <select className="form-input" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>
              </div>

              <div className="ficha-section-title">Signos Vitales</div>
              <div className="vitals-grid">
                {[
                  { key: 'bp', label: 'T/A (mmHg)', placeholder: '120/80' },
                  { key: 'hr', label: 'FC (lpm)', placeholder: '80' },
                  { key: 'spo2', label: 'SpO2 (%)', placeholder: '98' },
                  { key: 'temp', label: 'Temp (°C)', placeholder: '36.5' },
                  { key: 'rr', label: 'FR (rpm)', placeholder: '16' },
                ].map(v => (
                  <div key={v.key} className="form-group">
                    <label className="form-label">{v.label}</label>
                    <input className="form-input" placeholder={v.placeholder} value={form.vitals[v.key]} onChange={e => setForm({...form, vitals: {...form.vitals, [v.key]: e.target.value}})} />
                  </div>
                ))}
              </div>

              <div className="ficha-section-title">Atención</div>
              <div className="form-group">
                <label className="form-label">Motivo de atención *</label>
                <input className="form-input" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Ej: Lipotimia, traumatismo, crisis de pánico..." />
              </div>
              <div className="form-group">
                <label className="form-label">Tratamiento aplicado</label>
                <textarea className="form-input" rows={2} value={form.treatment} onChange={e => setForm({...form, treatment: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Atendido por</label>
                <select className="form-input" value={form.attendedBy} onChange={e => setForm({...form, attendedBy: e.target.value})}>
                  <option value="">Seleccionar paramédico</option>
                  {personnel.filter(p => p.role === 'paramedic').map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>

              <div className="ficha-section-title">Traslado</div>
              <div className="transport-toggle">
                <label className="toggle-label">
                  <input type="checkbox" checked={form.transport} onChange={e => setForm({...form, transport: e.target.checked})} />
                  <span>Requiere traslado en ambulancia</span>
                </label>
              </div>
              {form.transport && (
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Unidad de traslado</label>
                    <input className="form-input" placeholder="Ej: Ambulancia QA-01" value={form.transportUnit} onChange={e => setForm({...form, transportUnit: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hospital destino</label>
                    <input className="form-input" placeholder="Nombre del hospital" value={form.hospital} onChange={e => setForm({...form, hospital: e.target.value})} />
                  </div>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Desenlace / Resultado</label>
                <input className="form-input" placeholder="Ej: Dado de alta en sitio, trasladado a hospital..." value={form.outcome} onChange={e => setForm({...form, outcome: e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}>Guardar Ficha</button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW PATIENT MODAL */}
      {viewPatient && (
        <div className="modal-overlay" onClick={() => setViewPatient(null)}>
          <div className="modal" style={{maxWidth:600}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Ficha de Atención</h2>
                <span className="folio-code">{viewPatient.folio}</span>
              </div>
              <button className="btn-ghost" onClick={() => setViewPatient(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="ficha-view-grid">
                <div className="ficha-field"><span>Evento</span><strong>{viewPatient.eventName}</strong></div>
                <div className="ficha-field"><span>Fecha</span><strong>{format(new Date(viewPatient.date), 'd MMM yyyy HH:mm', { locale: es })}</strong></div>
                <div className="ficha-field"><span>Paciente</span><strong>{viewPatient.patientName || 'Anónimo'}</strong></div>
                <div className="ficha-field"><span>Edad / Sexo</span><strong>{viewPatient.age} años / {viewPatient.gender === 'M' ? 'Masculino' : viewPatient.gender === 'F' ? 'Femenino' : 'Otro'}</strong></div>
                <div className="ficha-field"><span>Motivo</span><strong>{viewPatient.reason}</strong></div>
                <div className="ficha-field"><span>Atendido por</span><strong>{viewPatient.attendedBy}</strong></div>
              </div>
              <div className="divider" />
              <div className="ficha-section-title">Signos Vitales</div>
              <div className="vitals-display">
                {[
                  { label: 'T/A', value: viewPatient.vitals?.bp, unit: 'mmHg' },
                  { label: 'FC', value: viewPatient.vitals?.hr, unit: 'lpm' },
                  { label: 'SpO2', value: viewPatient.vitals?.spo2, unit: '%' },
                  { label: 'Temp', value: viewPatient.vitals?.temp, unit: '°C' },
                  { label: 'FR', value: viewPatient.vitals?.rr, unit: 'rpm' },
                ].map(v => (
                  <div key={v.label} className="vital-box">
                    <span className="vital-value">{v.value || '—'}</span>
                    <span className="vital-unit">{v.unit}</span>
                    <span className="vital-label">{v.label}</span>
                  </div>
                ))}
              </div>
              <div className="divider" />
              <div className="ficha-field-full"><span>Tratamiento</span><p>{viewPatient.treatment || '—'}</p></div>
              {viewPatient.transport && (
                <>
                  <div className="divider" />
                  <div className="ficha-section-title" style={{color:'#FFB400'}}>🚑 Traslado en Ambulancia</div>
                  <div className="ficha-view-grid">
                    <div className="ficha-field"><span>Unidad</span><strong>{viewPatient.transportUnit}</strong></div>
                    <div className="ficha-field"><span>Hospital</span><strong>{viewPatient.hospital}</strong></div>
                  </div>
                </>
              )}
              <div className="divider" />
              <div className="ficha-field-full"><span>Desenlace</span><p>{viewPatient.outcome || '—'}</p></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => window.print()}>🖨 Imprimir</button>
              <button className="btn btn-outline" onClick={() => setViewPatient(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
