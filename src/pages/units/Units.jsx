import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './Units.css';

const TIPO_LABELS = { basica: 'Básica', avanzada: 'Avanzada', bodega: 'Bodega Central' };
const TIPO_COLORS = { basica: '#0088FF', avanzada: '#CC0000', bodega: '#FFB400' };

const CATEGORY_LABELS = { equipment: 'Equipo', supplies: 'Insumos', meds: 'Medicamentos' };

export default function Units() {
  const { units, addUnit, updateUnit, unitInventory, despachos, movimientos, inventory, personnel, events, crearDespacho, cerrarDespacho } = useApp();
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [view, setView] = useState('units'); // 'units' | 'inventario' | 'despachos'
  const [showDespachoModal, setShowDespachoModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [despachoForm, setDespachoForm] = useState({ unitId: '', eventoId: '', firmadoPor: '', firmaPiloto: '', fechaSalida: format(new Date(), 'yyyy-MM-dd'), items: [] });
  const [unitForm, setUnitForm] = useState({ nombre: '', placa: '', tipo: 'basica', responsableId: '', activo: true });
  const [formErrors, setFormErrors] = useState({});

  const paramedicos = personnel.filter(p => ['paramedic','medic'].includes(p.role) && p.status !== 'inactive');
  const pilotos = personnel.filter(p => p.role === 'pilot' && p.status !== 'inactive');

  // Inventario de una unidad específica
  const getUnitInv = (unitId) => unitInventory.filter(ui => ui.unitId === unitId);

  // Despachos de una unidad
  const getUnitDespachos = (unitId) => despachos.filter(d => d.unitId === unitId);

  // Movimientos de una unidad
  const getUnitMovimientos = (unitId) => movimientos.filter(m => m.unitId === unitId).slice(-20).reverse();

  const getItemName = (itemId) => inventory.find(i => i.id === itemId)?.name || `Item #${itemId}`;
  const getPersonnelName = (id) => personnel.find(p => p.id === id)?.name || `#${id}`;
  const getEventName = (id) => events.find(e => e.id === id)?.name || `Evento #${id}`;

  // Crear nuevo despacho
  const handleDespacho = () => {
    const errors = {};
    if (!despachoForm.unitId)   errors.unitId   = 'Selecciona una unidad';
    if (!despachoForm.eventoId) errors.eventoId = 'Selecciona un evento';
    if (!despachoForm.firmadoPor) errors.firmadoPor = 'Selecciona paramédico responsable';
    if (!despachoForm.items.length || despachoForm.items.every(i => !i.cantidad || i.cantidad <= 0))
      errors.items = 'Agrega al menos un artículo';
    if (Object.keys(errors).length) { setFormErrors(errors); return; }
    crearDespacho({
      ...despachoForm,
      unitId: Number(despachoForm.unitId),
      eventoId: Number(despachoForm.eventoId),
      firmadoPor: Number(despachoForm.firmadoPor),
      firmaPiloto: despachoForm.firmaPiloto ? Number(despachoForm.firmaPiloto) : null,
      fechaSalida: new Date(despachoForm.fechaSalida),
      items: despachoForm.items.filter(i => i.cantidad > 0).map(i => ({ itemId: i.itemId, cantidadDespachada: Number(i.cantidad) })),
    });
    setShowDespachoModal(false);
    setDespachoForm({ unitId: '', eventoId: '', firmadoPor: '', firmaPiloto: '', fechaSalida: format(new Date(), 'yyyy-MM-dd'), items: [] });
    setFormErrors({});
  };

  const addDespachoItem = () => {
    setDespachoForm(p => ({ ...p, items: [...p.items, { itemId: inventory[0]?.id, cantidad: 1 }] }));
  };

  const updateDespachoItem = (idx, field, val) => {
    setDespachoForm(p => {
      const items = [...p.items];
      items[idx] = { ...items[idx], [field]: val };
      return { ...p, items };
    });
  };

  return (
    <div className="units-page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">🚑 Unidades</h1>
          <p className="page-subtitle">{units.filter(u=>u.tipo!=='bodega').length} unidades ambulatorias · {despachos.filter(d=>d.estado==='activo').length} despachos activos</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={() => { setShowDespachoModal(true); setFormErrors({}); }}>+ Nuevo Despacho</button>
          <button className="btn btn-primary" onClick={() => { setShowUnitModal(true); setUnitForm({ nombre:'',placa:'',tipo:'basica',responsableId:'',activo:true }); setFormErrors({}); }}>+ Nueva Unidad</button>
        </div>
      </div>

      {/* Tabs de vista */}
      <div className="units-tabs">
        {['units','inventario','despachos'].map(t => (
          <button key={t} className={`units-tab ${view === t ? 'active' : ''}`} onClick={() => setView(t)}>
            {t === 'units' ? '🚑 Unidades' : t === 'inventario' ? '▣ Inventario por unidad' : '◈ Despachos'}
          </button>
        ))}
      </div>

      {/* ── Vista: Unidades ── */}
      {view === 'units' && (
        <div className="units-grid">
          {units.map(unit => {
            const resp = unit.responsableId ? personnel.find(p => p.id === unit.responsableId) : null;
            const invCount = getUnitInv(unit.id).length;
            const activeDespacho = despachos.find(d => d.unitId === unit.id && d.estado === 'activo');
            return (
              <div key={unit.id} className={`unit-card card ${selectedUnit?.id === unit.id ? 'unit-card--selected' : ''}`}
                onClick={() => setSelectedUnit(unit.id === selectedUnit?.id ? null : unit)}>
                <div className="unit-card-header">
                  <div className="unit-type-badge" style={{ background: TIPO_COLORS[unit.tipo] + '22', color: TIPO_COLORS[unit.tipo], borderColor: TIPO_COLORS[unit.tipo] + '44' }}>
                    {unit.tipo === 'bodega' ? '▣' : '🚑'} {TIPO_LABELS[unit.tipo]}
                  </div>
                  {activeDespacho && <span className="badge badge-green" style={{ fontSize: 10 }}>En evento</span>}
                </div>
                <div className="unit-name">{unit.nombre}</div>
                {unit.placa && <div className="unit-placa">{unit.placa}</div>}
                <div className="unit-meta">
                  {resp && <div className="unit-meta-item"><span>◉</span>{resp.name}</div>}
                  {invCount > 0 && <div className="unit-meta-item"><span>▣</span>{invCount} artículos en inventario</div>}
                  {activeDespacho && <div className="unit-meta-item"><span>◈</span>Evento: {getEventName(activeDespacho.eventoId)}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Vista: Inventario por unidad ── */}
      {view === 'inventario' && (
        <div>
          {units.map(unit => {
            const inv = getUnitInv(unit.id);
            if (!inv.length) return null;
            return (
              <div key={unit.id} className="card" style={{ marginBottom: 16 }}>
                <div className="card-header-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: TIPO_COLORS[unit.tipo], fontSize: 18 }}>{unit.tipo === 'bodega' ? '▣' : '🚑'}</span>
                    <span className="card-label">{unit.nombre}</span>
                  </div>
                  <span className="badge badge-gray">{inv.length} artículos</span>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Artículo</th>
                        <th>Recibido</th>
                        <th>Actual</th>
                        <th>Consumido</th>
                        <th>Recepción</th>
                        <th>Responsable</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inv.map(ui => {
                        const item = inventory.find(i => i.id === ui.itemId);
                        const consumido = ui.cantidadRecibida - ui.cantidadActual;
                        const pct = ui.cantidadRecibida > 0 ? (ui.cantidadActual / ui.cantidadRecibida) * 100 : 100;
                        const statusColor = pct < 30 ? 'badge-red' : pct < 60 ? 'badge-yellow' : 'badge-green';
                        return (
                          <tr key={ui.id}>
                            <td><strong>{item?.name || `#${ui.itemId}`}</strong></td>
                            <td>{ui.cantidadRecibida} {item?.unit}</td>
                            <td><strong>{ui.cantidadActual}</strong> {item?.unit}</td>
                            <td style={{ color: consumido > 0 ? 'var(--red-light)' : 'var(--white-faint)' }}>{consumido > 0 ? `−${consumido}` : '—'}</td>
                            <td style={{ fontSize: 11, color: 'var(--white-faint)' }}>{ui.fechaRecepcion ? format(new Date(ui.fechaRecepcion), 'd MMM', {locale:es}) : '—'}</td>
                            <td style={{ fontSize: 12 }}>{getPersonnelName(ui.firmadoPor)}</td>
                            <td><span className={`badge ${statusColor}`} style={{fontSize:10}}>{Math.round(pct)}% disponible</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Vista: Despachos ── */}
      {view === 'despachos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...despachos].reverse().map(d => {
            const unit = units.find(u => u.id === d.unitId);
            const total = d.items.reduce((s, i) => s + i.cantidadDespachada, 0);
            return (
              <div key={d.id} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span className="card-label">{unit?.nombre}</span>
                      <span className={`badge ${d.estado === 'activo' ? 'badge-green' : 'badge-gray'}`}>{d.estado === 'activo' ? 'Activo' : 'Cerrado'}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--white-muted)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span>◈ {getEventName(d.eventoId)}</span>
                      <span>◉ {getPersonnelName(d.firmadoPor)}</span>
                      <span>📅 {format(new Date(d.fechaSalida), 'd MMM yyyy', {locale:es})}</span>
                      <span>▣ {total} artículos despachados</span>
                    </div>
                  </div>
                  {d.estado === 'activo' && (
                    <button className="btn btn-outline btn-sm" onClick={() => {
                      if (window.confirm('¿Cerrar despacho y registrar devolución de sobrantes?')) cerrarDespacho(d.id);
                    }}>
                      ✓ Cerrar despacho
                    </button>
                  )}
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {d.items.map((item, i) => (
                    <span key={i} className="badge badge-gray" style={{ fontSize: 11 }}>
                      {getItemName(item.itemId)}: {item.cantidadDespachada}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
          {!despachos.length && <p style={{textAlign:'center',color:'var(--white-faint)',padding:40,fontSize:13}}>Sin despachos registrados</p>}
        </div>
      )}

      {/* ── MODAL DESPACHO ── */}
      {showDespachoModal && (
        <div className="modal-overlay" onClick={() => setShowDespachoModal(false)}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nuevo Despacho</h2>
              <button className="btn-ghost" style={{ padding: 12 }} onClick={() => setShowDespachoModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Unidad *</label>
                  <select className={`form-input ${formErrors.unitId ? 'input-error' : ''}`} value={despachoForm.unitId} onChange={e => { setDespachoForm(p=>({...p,unitId:e.target.value})); setFormErrors(p=>({...p,unitId:''})); }}>
                    <option value="">— Seleccionar —</option>
                    {units.filter(u=>u.tipo!=='bodega').map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                  </select>
                  {formErrors.unitId && <span style={{fontSize:11,color:'var(--red-light)'}}>{formErrors.unitId}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Evento *</label>
                  <select className={`form-input ${formErrors.eventoId ? 'input-error' : ''}`} value={despachoForm.eventoId} onChange={e => { setDespachoForm(p=>({...p,eventoId:e.target.value})); setFormErrors(p=>({...p,eventoId:''})); }}>
                    <option value="">— Seleccionar —</option>
                    {events.filter(ev => ev.status !== 'completed' && ev.status !== 'cancelled').map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                  </select>
                  {formErrors.eventoId && <span style={{fontSize:11,color:'var(--red-light)'}}>{formErrors.eventoId}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Paramédico responsable *</label>
                  <select className={`form-input ${formErrors.firmadoPor ? 'input-error' : ''}`} value={despachoForm.firmadoPor} onChange={e => { setDespachoForm(p=>({...p,firmadoPor:e.target.value})); setFormErrors(p=>({...p,firmadoPor:''})); }}>
                    <option value="">— Seleccionar —</option>
                    {paramedicos.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  {formErrors.firmadoPor && <span style={{fontSize:11,color:'var(--red-light)'}}>{formErrors.firmadoPor}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Piloto</label>
                  <select className="form-input" value={despachoForm.firmaPiloto} onChange={e => setDespachoForm(p=>({...p,firmaPiloto:e.target.value}))}>
                    <option value="">— Seleccionar —</option>
                    {pilotos.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha de salida</label>
                  <input type="date" className="form-input" value={despachoForm.fechaSalida} onChange={e => setDespachoForm(p=>({...p,fechaSalida:e.target.value}))} />
                </div>
              </div>

              <div className="ficha-section-title" style={{ marginTop: 4 }}>Artículos a despachar</div>
              {formErrors.items && <p style={{fontSize:12,color:'var(--red-light)',marginBottom:8}}>{formErrors.items}</p>}
              {despachoForm.items.map((item, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 32px', gap: 8, marginBottom: 8, alignItems: 'flex-end' }}>
                  <select className="form-input" value={item.itemId} onChange={e => updateDespachoItem(idx, 'itemId', Number(e.target.value))}>
                    {inventory.map(i => <option key={i.id} value={i.id}>{i.name} (bodega: {i.quantity})</option>)}
                  </select>
                  <input type="number" min="1" className="form-input" placeholder="Cant." value={item.cantidad}
                    onChange={e => updateDespachoItem(idx, 'cantidad', e.target.value)} />
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }}
                    onClick={() => setDespachoForm(p => ({ ...p, items: p.items.filter((_,i)=>i!==idx) }))}>✕</button>
                </div>
              ))}
              <button className="btn btn-outline btn-sm" onClick={addDespachoItem} style={{ marginTop: 4 }}>+ Agregar artículo</button>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowDespachoModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleDespacho}>Crear Despacho</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL NUEVA UNIDAD ── */}
      {showUnitModal && (
        <div className="modal-overlay" onClick={() => setShowUnitModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nueva Unidad</h2>
              <button className="btn-ghost" style={{ padding: 12 }} onClick={() => setShowUnitModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input className={`form-input ${formErrors.nombre ? 'input-error':''}`} value={unitForm.nombre} placeholder="Ej: Unidad QA-05" onChange={e => setUnitForm(p=>({...p,nombre:e.target.value}))} />
                {formErrors.nombre && <span style={{fontSize:11,color:'var(--red-light)'}}>Requerido</span>}
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Placa</label>
                  <input className="form-input" value={unitForm.placa} placeholder="QA-005-E" onChange={e => setUnitForm(p=>({...p,placa:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <select className="form-input" value={unitForm.tipo} onChange={e => setUnitForm(p=>({...p,tipo:e.target.value}))}>
                    <option value="basica">Básica</option>
                    <option value="avanzada">Avanzada</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Paramédico responsable</label>
                <select className="form-input" value={unitForm.responsableId} onChange={e => setUnitForm(p=>({...p,responsableId:e.target.value}))}>
                  <option value="">— Seleccionar —</option>
                  {paramedicos.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowUnitModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => {
                if (!unitForm.nombre.trim()) { setFormErrors({nombre:'Requerido'}); return; }
                addUnit({ ...unitForm, responsableId: unitForm.responsableId ? Number(unitForm.responsableId) : null, pilotos: [] });
                setShowUnitModal(false);
              }}>Crear Unidad</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
