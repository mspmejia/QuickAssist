import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './Companies.css';

const RUBROS = {
  seguridad:    'Seguridad',
  produccion:   'Producción',
  tecnica:      'Técnica',
  catering:     'Catering',
  construccion: 'Construcción',
  transporte:   'Transporte',
  limpieza:     'Limpieza',
  otro:         'Otro',
};

const RUBRO_COLORS = {
  seguridad:    '#CC0000',
  produccion:   '#0088FF',
  tecnica:      '#AA44FF',
  catering:     '#FFB400',
  construccion: '#FF6B35',
  transporte:   '#00C850',
  limpieza:     '#00BBCC',
  otro:         '#888888',
};

const EMPTY_FORM = { name: '', rubro: 'seguridad', contacto: '', activo: true };

export default function Companies() {
  const { companies, addCompany, updateCompany, patients } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selected,  setSelected]  = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [filterRubro, setFilterRubro] = useState('all');

  const filtered = filterRubro === 'all'
    ? companies
    : companies.filter(c => c.rubro === filterRubro);

  // Contar atenciones por empresa
  const countByCompany = (id) => patients.filter(p => p.companyId === id).length;

  const validate = (f) => {
    const e = {};
    if (!f.name?.trim()) e.name = 'Requerido';
    return e;
  };

  const openNew = () => {
    setSelected(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (c) => {
    setSelected(c);
    setForm({ name: c.name, rubro: c.rubro, contacto: c.contacto, activo: c.activo });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = () => {
    const errors = validate(form);
    if (Object.keys(errors).length) { setFormErrors(errors); return; }
    if (selected) {
      updateCompany(selected.id, form);
    } else {
      addCompany(form);
    }
    setShowModal(false);
  };

  const toggleActivo = (c) => {
    updateCompany(c.id, { activo: !c.activo });
  };

  return (
    <div className="companies-page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">◈ Empresas</h1>
          <p className="page-subtitle">{companies.length} empresas registradas · {companies.filter(c=>c.activo).length} activas</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Nueva Empresa</button>
      </div>

      {/* Filtros por rubro */}
      <div className="events-filters" style={{ marginBottom: 20 }}>
        <button className={`filter-btn ${filterRubro === 'all' ? 'active' : ''}`} onClick={() => setFilterRubro('all')}>Todas</button>
        {Object.entries(RUBROS).map(([key, label]) => (
          <button key={key} className={`filter-btn ${filterRubro === key ? 'active' : ''}`} onClick={() => setFilterRubro(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* Grid de tarjetas */}
      <div className="companies-grid">
        {filtered.map(c => (
          <div key={c.id} className={`company-card card ${!c.activo ? 'company-card--inactive' : ''}`}>
            <div className="company-card-header">
              <div className="company-avatar" style={{ background: RUBRO_COLORS[c.rubro] + '22', border: `1px solid ${RUBRO_COLORS[c.rubro]}44` }}>
                <span style={{ color: RUBRO_COLORS[c.rubro], fontSize: 18 }}>◈</span>
              </div>
              <div className="company-info">
                <div className="company-name">{c.name}</div>
                <span className="company-rubro-badge" style={{ background: RUBRO_COLORS[c.rubro] + '22', color: RUBRO_COLORS[c.rubro], border: `1px solid ${RUBRO_COLORS[c.rubro]}44` }}>
                  {RUBROS[c.rubro]}
                </span>
              </div>
              {!c.activo && <span className="badge badge-gray" style={{ fontSize: 10 }}>Inactiva</span>}
            </div>

            <div className="company-details">
              {c.contacto && (
                <div className="company-detail">
                  <span style={{ color: 'var(--white-faint)', fontSize: 11 }}>✉</span>
                  <span>{c.contacto}</span>
                </div>
              )}
              <div className="company-detail">
                <span style={{ color: 'var(--white-faint)', fontSize: 11 }}>✚</span>
                <span>{countByCompany(c.id)} atenciones registradas</span>
              </div>
            </div>

            <div className="company-actions">
              <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>✎ Editar</button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: c.activo ? 'var(--white-faint)' : '#00C850' }}
                onClick={() => toggleActivo(c)}
              >
                {c.activo ? '✕ Desactivar' : '✓ Activar'}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--white-faint)', padding: 40, fontSize: 13 }}>
            Sin empresas en esta categoría
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selected ? 'Editar Empresa' : 'Nueva Empresa'}</h2>
              <button className="btn-ghost" style={{ padding: 12 }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nombre de la empresa *</label>
                <input
                  className={`form-input ${formErrors.name ? 'input-error' : ''}`}
                  value={form.name}
                  onChange={e => { setForm({...form, name: e.target.value}); setFormErrors(p=>({...p,name:''})); }}
                  placeholder="Ej: Toledo Seguridad"
                />
                {formErrors.name && <span style={{fontSize:11,color:'var(--red-light)'}}>Campo requerido</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Rubro</label>
                <select className="form-input" value={form.rubro} onChange={e => setForm({...form, rubro: e.target.value})}>
                  {Object.entries(RUBROS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Email de contacto</label>
                <input
                  className="form-input"
                  type="email"
                  value={form.contacto}
                  onChange={e => setForm({...form, contacto: e.target.value})}
                  placeholder="contacto@empresa.com"
                />
              </div>
              <div className="form-group">
                <label className="toggle-label" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.activo} onChange={e => setForm({...form, activo: e.target.checked})} style={{ width: 16, height: 16, accentColor: 'var(--red)' }} />
                  <span style={{ fontSize: 14 }}>Empresa activa</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}>{selected ? 'Guardar cambios' : 'Crear empresa'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
