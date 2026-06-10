import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './Inventory.css';

const CATEGORY_LABELS = { equipment: 'Equipo', supplies: 'Insumos', meds: 'Medicamentos' };
const EMPTY_FORM = { name: '', category: 'equipment', quantity: '', minStock: '', unit: 'pza' };

export default function Inventory() {
  const { inventory, setInventory, updateInventory } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterCat, setFilterCat] = useState('all');
  const [adjustItem, setAdjustItem] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');

  const getStatus = (item) => {
    if (item.quantity <= 0) return 'critical';
    if (item.quantity < item.minStock) return item.quantity < item.minStock * 0.5 ? 'critical' : 'low';
    return 'ok';
  };

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
    updateInventory(adjustItem.id, { quantity: Math.max(0, adjustItem.quantity + delta) });
    setAdjustItem(null);
    setAdjustQty('');
  };

  const stats = [
    { label: 'Total artículos', value: inventory.length, color: 'var(--white)' },
    { label: 'Stock crítico', value: withStatus.filter(i => i.status === 'critical').length, color: '#FF4444' },
    { label: 'Stock bajo', value: withStatus.filter(i => i.status === 'low').length, color: '#FFB400' },
    { label: 'Stock OK', value: withStatus.filter(i => i.status === 'ok').length, color: '#00C850' },
  ];

  return (
    <div className="inventory-page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventario</h1>
          <p className="page-subtitle">Control de equipos, insumos y medicamentos</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setSelectedItem(null); setForm(EMPTY_FORM); setShowModal(true); }}>
          + Agregar Artículo
        </button>
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
                  {item.status === 'critical' ? '⚠ Crítico' : item.status === 'low' ? '↓ Bajo' : '✓ OK'}
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
              <div className="inv-card-actions">
                <button className="btn btn-outline btn-sm" onClick={() => { setAdjustItem(item); setAdjustQty(''); }}>± Ajustar</button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedItem(item); setForm({...item, quantity: String(item.quantity), minStock: String(item.minStock)}); setShowModal(true); }}>✎ Editar</button>
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
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong></td>
                  <td><span className="badge badge-gray">{CATEGORY_LABELS[item.category] || item.category}</span></td>
                  <td>
                    <span className={`inv-qty ${item.status === 'critical' ? 'critical' : item.status === 'low' ? 'low' : ''}`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td style={{color:'var(--white-faint)'}}>{item.minStock}</td>
                  <td style={{color:'var(--white-muted)'}}>{item.unit}</td>
                  <td>
                    <span className={`badge ${item.status === 'critical' ? 'badge-red' : item.status === 'low' ? 'badge-yellow' : 'badge-green'}`}>
                      {item.status === 'critical' ? '⚠ Crítico' : item.status === 'low' ? '↓ Bajo' : '✓ OK'}
                    </span>
                  </td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setAdjustItem(item); setAdjustQty(''); }}>± Ajustar</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedItem(item); setForm({...item, quantity: String(item.quantity), minStock: String(item.minStock)}); setShowModal(true); }}>✎</button>
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
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => handleAdjust('-')} style={{borderColor:'#FF4444',color:'#FF4444'}}>
                − Salida
              </button>
              <button className="btn btn-primary" onClick={() => handleAdjust('+')}>
                + Entrada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
