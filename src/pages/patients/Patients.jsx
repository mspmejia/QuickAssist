import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './Patients.css';

const EMPTY_FORM = {
  eventId: '', patientName: '', age: '', gender: 'M',
  patientType: 'attendee', companyId: '', companyRole: '',
  reason: '', vitals: { bp: '', hr: '', spo2: '', temp: '', rr: '' },
  treatment: '', transport: false, transportUnit: '', hospital: '',
  outcome: '', attendedBy: '', status: 'open',
  unitId: '', consumedItems: [],
};

const COMPANY_RUBROS = {
  seguridad: 'Seguridad', produccion: 'Producción', tecnica: 'Técnica',
  catering: 'Catering', construccion: 'Construcción', transporte: 'Transporte',
  limpieza: 'Limpieza', otro: 'Otro',
};

export default function Patients() {
  const { patients, addPatient, events, personnel, companies, units, inventory, unitInventory } = useApp();
  const [showModal,   setShowModal]   = useState(false);
  const [viewPatient, setViewPatient] = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [formErrors,  setFormErrors]  = useState({});
  const [filterEvent, setFilterEvent] = useState('all');
  const [filterType,  setFilterType]  = useState('all');

  // Filtro combinado
  const filtered = patients.filter(p => {
    const matchEvent = filterEvent === 'all' || p.eventId === Number(filterEvent);
    const matchType  = filterType  === 'all' || p.patientType === filterType;
    return matchEvent && matchType;
  });

  // Inventario disponible en la unidad seleccionada
  const unitInvItems = form.unitId
    ? unitInventory.filter(ui => ui.unitId === Number(form.unitId) && ui.cantidadActual > 0)
    : [];

  const getItemName = (id) => inventory.find(i => i.id === id)?.name || `#${id}`;
  const getItemUnit = (id) => inventory.find(i => i.id === id)?.unit || '';
  const getCompanyName = (id) => companies.find(c => c.id === id)?.name || '';

  // Consumo: agregar / actualizar / quitar item
  const addConsumedItem = () => {
    const first = unitInvItems[0];
    if (!first) return;
    setForm(p => ({ ...p, consumedItems: [...p.consumedItems, { itemId: first.itemId, cantidad: 1 }] }));
  };

  const updateConsumedItem = (idx, field, val) => {
    setForm(p => {
      const items = [...p.consumedItems];
      items[idx] = { ...items[idx], [field]: field === 'cantidad' ? Number(val) : Number(val) };
      return { ...p, consumedItems: items };
    });
  };

  const removeConsumedItem = (idx) => {
    setForm(p => ({ ...p, consumedItems: p.consumedItems.filter((_,i) => i !== idx) }));
  };

  const handleSave = () => {
    const errors = {};
    if (!form.eventId)        errors.eventId  = 'Selecciona un evento';
    if (!form.reason?.trim()) errors.reason   = 'Ingresa el motivo';
    if (form.patientType === 'collaborator' && !form.companyId) errors.companyId = 'Selecciona la empresa';
    if (Object.keys(errors).length) { setFormErrors(errors); return; }
    setFormErrors({});
    addPatient({
      ...form,
      date: new Date(),
      eventName: events.find(e => e.id === Number(form.eventId))?.name || 'Evento',
      eventId:   Number(form.eventId),
      age:       Number(form.age),
      companyId: form.companyId ? Number(form.companyId) : null,
      unitId:    form.unitId ? Number(form.unitId) : null,
    });
    setShowModal(false);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="patients-page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">✚ Fichas de Atención</h1>
          <p className="page-subtitle">
            {patients.length} atenciones · {patients.filter(p=>p.patientType==='collaborator').length} colaboradores · {patients.filter(p=>p.transport).length} traslados
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormErrors({}); setForm(EMPTY_FORM); setShowModal(true); }}>
          ✚ Nueva Ficha
        </button>
      </div>

      {/* Filtros */}
      <div className="patients-filters" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <select className="form-input" style={{ width: 'auto', minWidth: 200 }} value={filterEvent} onChange={e => setFilterEvent(e.target.value)}>
          <option value="all">Todos los eventos</option>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
        </select>
        <div className="events-filters" style={{ margin: 0, flex: 1 }}>
          {[['all','Todos'],['attendee','Asistentes'],['collaborator','Colaboradores']].map(([v,l]) => (
            <button key={v} className={`filter-btn ${filterType===v?'active':''}`} onClick={() => setFilterType(v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="patients-table card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Folio</th>
                <th>Evento</th>
                <th>Tipo</th>
                <th>Empresa</th>
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
                  <td style={{ maxWidth: 140 }}>{p.eventName}</td>
                  <td>
                    {p.patientType === 'collaborator'
                      ? <span className="badge badge-yellow" style={{fontSize:10}}>Colaborador</span>
                      : <span className="badge badge-gray"   style={{fontSize:10}}>Asistente</span>}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--white-muted)', maxWidth: 120 }}>
                    {p.companyId ? getCompanyName(p.companyId) : '—'}
                  </td>
                  <td>{p.reason}</td>
                  <td style={{ fontSize: 12 }}>{p.attendedBy || '—'}</td>
                  <td>{p.transport ? <span className="badge badge-yellow" style={{fontSize:10}}>🚑 Sí</span> : <span className="badge badge-gray" style={{fontSize:10}}>No</span>}</td>
                  <td><span className={`badge ${p.status==='open'?'badge-red':'badge-gray'}`} style={{fontSize:10}}>{p.status==='open'?'Abierto':'Cerrado'}</span></td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => setViewPatient(p)}>Ver</button></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--white-faint)', padding: 40 }}>Sin fichas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL NUEVA FICHA ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">✚ Nueva Ficha de Atención</h2>
              <button className="btn-ghost" style={{ padding: 12 }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">

              {/* ── Tipo de paciente ── */}
              <div className="ficha-section-title">Tipo de paciente</div>
              <div className="patient-type-grid">
                {[['attendee','Asistente al evento','◉'],['collaborator','Colaborador','◈']].map(([val,label,icon]) => (
                  <button key={val}
                    className={`patient-type-btn ${form.patientType===val?'patient-type-btn--active':''}`}
                    onClick={() => setForm(p=>({...p,patientType:val,companyId:'',companyRole:''}))}>
                    <span className="patient-type-icon">{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* ── Empresa (solo si colaborador) ── */}
              {form.patientType === 'collaborator' && (
                <div className="form-grid-2" style={{ marginBottom: 0 }}>
                  <div className="form-group">
                    <label className="form-label">Empresa *</label>
                    <select className={`form-input ${formErrors.companyId?'input-error':''}`}
                      value={form.companyId}
                      onChange={e => { setForm(p=>({...p,companyId:e.target.value})); setFormErrors(p=>({...p,companyId:''})); }}>
                      <option value="">— Seleccionar empresa —</option>
                      {companies.filter(c=>c.activo).map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({COMPANY_RUBROS[c.rubro]})</option>
                      ))}
                    </select>
                    {formErrors.companyId && <span style={{fontSize:11,color:'var(--red-light)'}}>{formErrors.companyId}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rol / Puesto</label>
                    <input className="form-input" placeholder="Ej: Jefe de seguridad, Técnico de sonido"
                      value={form.companyRole}
                      onChange={e => setForm(p=>({...p,companyRole:e.target.value}))} />
                  </div>
                </div>
              )}

              {/* ── Datos del paciente ── */}
              <div className="ficha-section-title" style={{ marginTop: 8 }}>Datos del paciente</div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Evento *</label>
                  <select className={`form-input ${formErrors.eventId?'input-error':''}`}
                    value={form.eventId}
                    onChange={e => { setForm(p=>({...p,eventId:e.target.value})); setFormErrors(p=>({...p,eventId:''})); }}>
                    <option value="">Seleccionar evento</option>
                    {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                  </select>
                  {formErrors.eventId && <span style={{fontSize:11,color:'var(--red-light)'}}>{formErrors.eventId}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Unidad ambulatoria</label>
                  <select className="form-input" value={form.unitId}
                    onChange={e => setForm(p=>({...p,unitId:e.target.value,consumedItems:[]}))}>
                    <option value="">— Sin unidad —</option>
                    {units.filter(u=>u.tipo!=='bodega').map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nombre (opcional)</label>
                  <input className="form-input" placeholder="Anónimo si no aplica"
                    value={form.patientName} onChange={e => setForm(p=>({...p,patientName:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Sexo</label>
                  <select className="form-input" value={form.gender} onChange={e => setForm(p=>({...p,gender:e.target.value}))}>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Edad</label>
                  <input className="form-input" type="number" value={form.age}
                    onChange={e => setForm(p=>({...p,age:e.target.value}))} />
                </div>
              </div>

              {/* ── Signos vitales ── */}
              <div className="ficha-section-title">Signos Vitales</div>
              <div className="vitals-grid">
                {[
                  { key: 'bp',   label: 'T/A (mmHg)', placeholder: '120/80' },
                  { key: 'hr',   label: 'FC (lpm)',    placeholder: '80'     },
                  { key: 'spo2', label: 'SpO2 (%)',    placeholder: '98'     },
                  { key: 'temp', label: 'Temp (°C)',   placeholder: '36.5'   },
                  { key: 'rr',   label: 'FR (rpm)',    placeholder: '16'     },
                ].map(v => (
                  <div key={v.key} className="form-group">
                    <label className="form-label">{v.label}</label>
                    <input className="form-input" placeholder={v.placeholder}
                      value={form.vitals[v.key]}
                      onChange={e => setForm(p=>({...p,vitals:{...p.vitals,[v.key]:e.target.value}}))} />
                  </div>
                ))}
              </div>

              {/* ── Atención ── */}
              <div className="ficha-section-title">Atención</div>
              <div className="form-group">
                <label className="form-label">Motivo de atención *</label>
                <input className={`form-input ${formErrors.reason?'input-error':''}`}
                  value={form.reason}
                  onChange={e => { setForm(p=>({...p,reason:e.target.value})); setFormErrors(p=>({...p,reason:''})); }}
                  placeholder="Ej: Lipotimia, traumatismo, crisis de pánico..." />
                {formErrors.reason && <span style={{fontSize:11,color:'var(--red-light)'}}>{formErrors.reason}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Tratamiento aplicado</label>
                <textarea className="form-input" rows={2} value={form.treatment}
                  onChange={e => setForm(p=>({...p,treatment:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Atendido por</label>
                <select className="form-input" value={form.attendedBy}
                  onChange={e => setForm(p=>({...p,attendedBy:e.target.value}))}>
                  <option value="">Seleccionar paramédico</option>
                  {personnel.filter(p=>['paramedic','medic'].includes(p.role)).map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* ── Insumos usados ── */}
              <div className="ficha-section-title">
                Insumos utilizados
                {form.unitId && <span style={{fontSize:11,color:'var(--white-faint)',marginLeft:8,textTransform:'none',letterSpacing:0}}>
                  — Unidad: {units.find(u=>u.id===Number(form.unitId))?.nombre}
                </span>}
              </div>
              {!form.unitId && (
                <p style={{fontSize:12,color:'var(--white-faint)',marginBottom:12}}>
                  Selecciona una unidad para registrar el consumo de insumos.
                </p>
              )}
              {form.unitId && (
                <div className="consumed-items-list">
                  {form.consumedItems.map((ci, idx) => {
                    const uiItem = unitInvItems.find(ui => ui.itemId === ci.itemId);
                    const maxQty = uiItem?.cantidadActual || 99;
                    return (
                      <div key={idx} className="consumed-item-row">
                        <select className="form-input" style={{flex:2}}
                          value={ci.itemId}
                          onChange={e => updateConsumedItem(idx, 'itemId', Number(e.target.value))}>
                          {unitInvItems.map(ui => (
                            <option key={ui.itemId} value={ui.itemId}>
                              {getItemName(ui.itemId)} (disp: {ui.cantidadActual} {getItemUnit(ui.itemId)})
                            </option>
                          ))}
                        </select>
                        <input type="number" min="1" max={maxQty} className="form-input" style={{flex:'0 0 80px'}}
                          value={ci.cantidad}
                          onChange={e => updateConsumedItem(idx, 'cantidad', e.target.value)} />
                        <span style={{fontSize:11,color:'var(--white-faint)',alignSelf:'center'}}>{getItemUnit(ci.itemId)}</span>
                        <button className="btn btn-ghost btn-sm" style={{color:'var(--red)',padding:'6px 8px'}}
                          onClick={() => removeConsumedItem(idx)}>✕</button>
                      </div>
                    );
                  })}
                  {unitInvItems.length > 0 ? (
                    <button className="btn btn-outline btn-sm" onClick={addConsumedItem} style={{marginTop:4}}>
                      + Agregar insumo
                    </button>
                  ) : (
                    <p style={{fontSize:12,color:'var(--white-faint)'}}>Esta unidad no tiene inventario disponible.</p>
                  )}
                </div>
              )}

              {/* ── Traslado ── */}
              <div className="ficha-section-title">Traslado</div>
              <div className="transport-toggle">
                <label className="toggle-label">
                  <input type="checkbox" checked={form.transport}
                    onChange={e => setForm(p=>({...p,transport:e.target.checked}))} />
                  <span>Requiere traslado en ambulancia</span>
                </label>
              </div>
              {form.transport && (
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Unidad de traslado</label>
                    <input className="form-input" placeholder="Ej: QA-01"
                      value={form.transportUnit} onChange={e => setForm(p=>({...p,transportUnit:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hospital destino</label>
                    <input className="form-input" placeholder="Nombre del hospital"
                      value={form.hospital} onChange={e => setForm(p=>({...p,hospital:e.target.value}))} />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Desenlace / Resultado</label>
                <input className="form-input" placeholder="Ej: Alta en sitio, trasladado..."
                  value={form.outcome} onChange={e => setForm(p=>({...p,outcome:e.target.value}))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}>Guardar Ficha</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL VER FICHA ── */}
      {viewPatient && (
        <div className="modal-overlay" onClick={() => setViewPatient(null)}>
          <div className="modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Ficha de Atención</h2>
                <span className="folio-code">{viewPatient.folio}</span>
              </div>
              <button className="btn-ghost" style={{ padding: 12 }} onClick={() => setViewPatient(null)}>✕</button>
            </div>
            <div className="modal-body">

              {/* Badge tipo paciente */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {viewPatient.patientType === 'collaborator'
                  ? <span className="badge badge-yellow">◈ Colaborador</span>
                  : <span className="badge badge-gray">◉ Asistente al evento</span>}
                {viewPatient.companyId && (
                  <span className="badge badge-gray">{getCompanyName(viewPatient.companyId)}{viewPatient.companyRole ? ` · ${viewPatient.companyRole}` : ''}</span>
                )}
                {viewPatient.unitId && (
                  <span className="badge badge-gray">🚑 {units.find(u=>u.id===viewPatient.unitId)?.nombre}</span>
                )}
              </div>

              <div className="ficha-view-grid">
                <div className="ficha-field"><span>Evento</span><strong>{viewPatient.eventName}</strong></div>
                <div className="ficha-field"><span>Fecha</span><strong>{format(new Date(viewPatient.date), 'd MMM yyyy HH:mm', {locale:es})}</strong></div>
                <div className="ficha-field"><span>Paciente</span><strong>{viewPatient.patientName || 'Anónimo'}</strong></div>
                <div className="ficha-field"><span>Edad / Sexo</span><strong>{viewPatient.age} años / {viewPatient.gender==='M'?'Masculino':viewPatient.gender==='F'?'Femenino':'Otro'}</strong></div>
                <div className="ficha-field"><span>Motivo</span><strong>{viewPatient.reason}</strong></div>
                <div className="ficha-field"><span>Atendido por</span><strong>{viewPatient.attendedBy || '—'}</strong></div>
              </div>

              <div className="divider" />
              <div className="ficha-section-title">Signos Vitales</div>
              <div className="vitals-display">
                {[
                  { label:'T/A', value:viewPatient.vitals?.bp,   unit:'mmHg' },
                  { label:'FC',  value:viewPatient.vitals?.hr,   unit:'lpm'  },
                  { label:'SpO2',value:viewPatient.vitals?.spo2, unit:'%'    },
                  { label:'Temp',value:viewPatient.vitals?.temp, unit:'°C'   },
                  { label:'FR',  value:viewPatient.vitals?.rr,   unit:'rpm'  },
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

              {/* Insumos usados */}
              {viewPatient.consumedItems?.length > 0 && (
                <>
                  <div className="divider" />
                  <div className="ficha-section-title" style={{color:'#AA44FF'}}>▣ Insumos utilizados</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {viewPatient.consumedItems.map((ci, i) => (
                      <span key={i} className="badge badge-gray" style={{fontSize:11}}>
                        {getItemName(ci.itemId)}: {ci.cantidad} {getItemUnit(ci.itemId)}
                      </span>
                    ))}
                  </div>
                </>
              )}

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
              <span className={`badge ${viewPatient.status==='open'?'badge-red':'badge-gray'}`}>{viewPatient.status==='open'?'Abierto':'Cerrado'}</span>
              <button className="btn btn-outline" onClick={() => setViewPatient(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
