import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './Inventory.css';

const CATEGORY_LABELS = { equipment: 'Equipo', supplies: 'Insumos', meds: 'Medicamentos' };
const EMPTY_FORM = { name: '', category: 'equipment', quantity: '', minStock: '', unit: 'pza' };

export default function Inventory() {
  const { inventory, setInventory, updateInventory } = useApp();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterCat, setFilterCat] = useState('all');
  const [adjustItem, setAdjustItem] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [showReview, setShowReview] = useState(false);

  const getStatus = (item) => {
    if (item.quantity <= 0) return 'critical';
    if (item.quantity < item.minStock) return item.quantity < item.minStock * 0.5 ? 'critical' : 'low';
    return 'ok';
  };

  // Recalcula status pero respeta el guardado si fue editado manualmente
  const withStatus = inventory.map(i => ({ ...i, status: getStatus(i) }));
  const filtered = filterCat === 'all' ? withStatus : withStatus.filter(i => i.category === filterCat);

  const handleSave = () => {
    const qty = Number(form.quantity);
    const min = Number(form.minStock);
    if (selectedItem) {
      updateInventory(selectedItem.id, { ...form, quantity: qty, minStock: min });
    } else {
      setInventory(prev => [...prev, { ...form, id: Date.now(), quantity: qty, minStock: min, status: qty < min ? 'low' : 'ok' }]);
    }
    setShowModal(false);
    setSelectedItem(null);
    setForm(EMPTY_FORM);
  };

  const handleAdjust = (dir) => {
    const delta = Number(adjustQty) * (dir === '+' ? 1 : -1);
    const newQty = adjustItem.quantity + delta;
    if (dir === '-' && newQty < 0) {
      alert(`Stock insuficiente. Solo hay ${adjustItem.quantity} ${adjustItem.unit} disponibles. Se ajustará a 0.`);
    }
    updateInventory(adjustItem.id, { quantity: Math.max(0, newQty) });
    setAdjustItem(null);
    setAdjustQty('');
  };

  const stats = [
    { label: 'Total artículos', value: inventory.length, color: 'var(--white)' },
    { label: 'Stock crítico', value: withStatus.filter(i => i.status === 'critical').length, color: '#A80000' },
    { label: 'Stock bajo', value: withStatus.filter(i => i.status === 'low').length, color: '#B87800' },
    { label: 'Stock OK', value: withStatus.filter(i => i.status === 'ok').length, color: '#0B8A40' },
  ];

  return (
    <div className="inventory-page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventario</h1>
          <p className="page-subtitle">{inventory.length} artículos registrados · {withStatus.filter(i=>i.status==='critical').length} críticos</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={() => setShowReview(true)}>
            ✓ Revisar inventario
          </button>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => { setSelectedItem(null); setForm(EMPTY_FORM); setShowModal(true); }}>
              + Agregar Artículo
            </button>
          )}
        </div>
      </div>

      <div className="inv-stats">
        {stats.map((s, i) => (
          <div key={i} className="inv-stat card">
            <span className="inv-stat-value" style={{ color: s.color }}>{s.value}</span>
            <span className="inv-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="events-filters">
        {['all', 'equipment', 'supplies', 'meds'].map(c => (
          <button key={c} className={`filter-btn ${filterCat === c ? 'active' : ''}`} onClick={() => setFilterCat(c)}>
            {c === 'all' ? 'Todos' : CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <div className="card">
        {/* Vista tarjetas — solo móvil */}
        <div className="inv-card-list">
          {filtered.map(item => (
            <div key={item.id} className="inv-card">
              <div className="inv-card-header">
                <div className="inv-card-name">{item.name}</div>
                <span className={`badge ${item.status === 'critical' ? 'badge-red' : item.status === 'low' ? 'badge-yellow' : 'badge-green'}`}>
                  {item.status === 'critical' ? '⚠ Crítico' : item.status === 'low' ? '↓ Bajo' : '✓ Suficiente'}
                </span>
              </div>
              <div className="inv-card-body">
                <span className="badge badge-gray">{CATEGORY_LABELS[item.category]}</span>
                <div className="inv-card-stat">
                  <span className={`inv-card-stat-val inv-qty ${item.status === 'critical' ? 'critical' : item.status === 'low' ? 'low' : ''}`}>{item.quantity}</span>
                  <span className="inv-card-stat-label">{item.unit} actual</span>
                </div>
                <div style={{ color: 'var(--white-faint)', fontSize: 12 }}>mín: {item.minStock}</div>
              </div>
              {(item.notes || item.lastReview) && (
                <div style={{ fontSize: 11, color: 'var(--white-faint)', marginTop: 8, lineHeight: 1.4 }}>
                  {item.lastReview && <span>Rev: {format(new Date(item.lastReview), 'd MMM', { locale: es })}{item.reviewedBy ? ` · ${item.reviewedBy}` : ''}</span>}
                  {item.notes && <div style={{ marginTop: 2 }}>{item.notes}</div>}
                </div>
              )}
              <div className="inv-card-actions">
                <button className="btn btn-outline btn-sm" onClick={() => { setAdjustItem(item); setAdjustQty(''); }}>± Ajustar</button>
                {isAdmin && (
                  <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedItem(item); setForm({...item, quantity: String(item.quantity), minStock: String(item.minStock)}); setShowModal(true); }}>✎ Editar</button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p style={{textAlign:'center',color:'var(--white-faint)',padding:32,fontSize:13}}>Sin artículos</p>}
        </div>

        {/* Vista tabla — solo desktop */}
        <div className="inv-table-wrap">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Artículo</th>
                <th>Categoría</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>Unidad</th>
                <th>Última revisión</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong>{item.notes && <div style={{fontSize:10,color:'var(--white-faint)',marginTop:2}}>{item.notes}</div>}</td>
                  <td><span className="badge badge-gray">{CATEGORY_LABELS[item.category] || item.category}</span></td>
                  <td>
                    <span className={`inv-qty ${item.status === 'critical' ? 'critical' : item.status === 'low' ? 'low' : ''}`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td style={{color:'var(--white-faint)'}}>{item.minStock}</td>
                  <td style={{color:'var(--white-muted)'}}>{item.unit}</td>
                  <td style={{fontSize:11,color:'var(--white-faint)'}}>
                    {item.lastReview ? format(new Date(item.lastReview), 'd MMM', { locale: es }) : '—'}
                    {item.reviewedBy && <div style={{fontSize:10,marginTop:1}}>{item.reviewedBy}</div>}
                  </td>
                  <td>
                    <span className={`badge ${item.status === 'critical' ? 'badge-red' : item.status === 'low' ? 'badge-yellow' : 'badge-green'}`}>
                      {item.status === 'critical' ? '⚠ Crítico' : item.status === 'low' ? '↓ Bajo' : '✓ Suficiente'}
                    </span>
                  </td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setAdjustItem(item); setAdjustQty(''); }}>± Ajustar</button>
                      {isAdmin && (
                        <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedItem(item); setForm({...item, quantity: String(item.quantity), minStock: String(item.minStock)}); setShowModal(true); }}>✎</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </div>

      {/* FORM MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{maxWidth:480}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedItem ? 'Editar Artículo' : 'Nuevo Artículo'}</h2>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nombre del artículo *</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <select className="form-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="equipment">Equipo</option>
                    <option value="supplies">Insumos</option>
                    <option value="meds">Medicamentos</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Unidad</label>
                  <select className="form-input" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                    <option value="pza">pza</option>
                    <option value="caja">caja</option>
                    <option value="amp">amp</option>
                    <option value="tank">tank</option>
                    <option value="frasco">frasco</option>
                    <option value="juego">juego</option>
                    <option value="par">par</option>
                    <option value="rollo">rollo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Cantidad actual</label>
                  <input className="form-input" type="number" min="0" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock mínimo</label>
                  <input className="form-input" type="number" min="0" value={form.minStock} onChange={e => setForm({...form, minStock: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}>{selectedItem ? 'Guardar' : 'Agregar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ADJUST MODAL */}
      {adjustItem && (
        <div className="modal-overlay" onClick={() => setAdjustItem(null)}>
          <div className="modal" style={{maxWidth:360}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Ajustar Stock</h2>
              <button className="btn-ghost" onClick={() => setAdjustItem(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{marginBottom:8,fontSize:14}}><strong>{adjustItem.name}</strong></p>
              <p className="text-muted" style={{fontSize:13,marginBottom:16}}>Stock actual: <strong style={{color:'var(--white)'}}>{adjustItem.quantity} {adjustItem.unit}</strong></p>
              <div className="form-group">
                <label className="form-label">Cantidad a ajustar</label>
                <input className="form-input" type="number" min="1" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} placeholder="Ingresa cantidad" />
                {adjustQty && Number(adjustQty) > adjustItem.quantity && (
                  <span style={{fontSize:11,color:'#B87800'}}>⚠ Supera el stock disponible ({adjustItem.quantity} {adjustItem.unit}). Se ajustará a 0.</span>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => handleAdjust('-')} style={{borderColor:'#A80000',color:'#A80000'}}>
                − Salida
              </button>
              <button className="btn btn-primary" onClick={() => handleAdjust('+')}>
                + Entrada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL — revisión física producto por producto */}
      {showReview && (
        <ReviewChecklist
          inventory={inventory}
          updateInventory={updateInventory}
          reviewerName={user?.name}
          onClose={() => setShowReview(false)}
        />
      )}
    </div>
  );
}

// ── Revisión física del inventario: producto por producto ────────────────
function ReviewChecklist({ inventory, updateInventory, reviewerName, onClose }) {
  const [counts, setCounts] = useState(() =>
    Object.fromEntries(inventory.map(i => [i.id, { checked: false, counted: String(i.quantity) }]))
  );
  const [done, setDone] = useState(false);
  const [summary, setSummary] = useState([]);

  const setChecked = (id, checked) => setCounts(p => ({ ...p, [id]: { ...p[id], checked } }));
  const setCounted = (id, counted) => setCounts(p => ({ ...p, [id]: { ...p[id], counted } }));

  const checkedCount = Object.values(counts).filter(c => c.checked).length;

  const handleFinish = () => {
    const today = new Date();
    const discrepancies = [];
    inventory.forEach(item => {
      const c = counts[item.id];
      if (!c?.checked) return;
      const counted = Number(c.counted);
      if (!Number.isFinite(counted)) return;
      if (counted !== item.quantity) {
        discrepancies.push({ name: item.name, before: item.quantity, after: counted, unit: item.unit });
      }
      updateInventory(item.id, { quantity: Math.max(0, counted), lastReview: today, reviewedBy: reviewerName || 'Revisión de personal' });
    });
    setSummary(discrepancies);
    setDone(true);
  };

  if (done) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Revisión guardada</h2>
            <button className="btn-ghost" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body">
            <p style={{ fontSize: 13, marginBottom: 16 }}>
              Se confirmaron <strong>{checkedCount}</strong> artículo{checkedCount !== 1 ? 's' : ''}.
            </p>
            {summary.length > 0 ? (
              <>
                <p style={{ fontSize: 12, color: 'var(--white-muted)', marginBottom: 8 }}>Diferencias encontradas contra el sistema:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {summary.map((d, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 10px', background: 'var(--black-soft)', borderRadius: 'var(--radius)' }}>
                      <span>{d.name}</span>
                      <span>{d.before} → <strong>{d.after}</strong> {d.unit}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--white-muted)' }}>Sin diferencias — todo coincide con el sistema. ✓</p>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={onClose}>Listo</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Revisar inventario</h2>
            <p className="text-muted" style={{ fontSize: 12 }}>Marca cada artículo que revisaste y confirma la cantidad contada físicamente.</p>
          </div>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {inventory.map(item => {
              const c = counts[item.id];
              const differs = c.checked && c.counted !== '' && Number(c.counted) !== item.quantity;
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: c.checked ? 'rgba(203,4,24,0.04)' : 'var(--black-soft)', borderRadius: 'var(--radius)', border: `1px solid ${c.checked ? 'rgba(203,4,24,0.2)' : 'var(--black-border)'}` }}>
                  <div className="avail-filter-check" style={c.checked ? { background: 'var(--red)', borderColor: 'var(--red)' } : {}} onClick={() => setChecked(item.id, !c.checked)}>
                    {c.checked && '✓'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--white-faint)' }}>{CATEGORY_LABELS[item.category]} · sistema: {item.quantity} {item.unit}</div>
                  </div>
                  <input
                    className="form-input"
                    style={{ width: 90, padding: '6px 10px', textAlign: 'center', borderColor: differs ? '#B87800' : undefined }}
                    type="number" min="0"
                    value={c.counted}
                    onChange={e => setCounted(item.id, e.target.value)}
                    onFocus={() => !c.checked && setChecked(item.id, true)}
                  />
                  <span style={{ fontSize: 11, color: 'var(--white-faint)', width: 40 }}>{item.unit}</span>
                  {differs && <span style={{ fontSize: 10, color: '#B87800' }}>≠ sistema</span>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="modal-footer">
          <span className="text-muted" style={{ fontSize: 12 }}>{checkedCount} de {inventory.length} confirmados</span>
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleFinish} disabled={checkedCount === 0} style={checkedCount === 0 ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>
            Guardar revisión
          </button>
        </div>
      </div>
    </div>
  );
}
