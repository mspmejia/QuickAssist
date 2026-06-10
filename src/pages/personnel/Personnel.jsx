import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ROLE_COLORS, ROLE_LABELS } from '../../context/AuthContext';
import './Personnel.css';

const EMPTY_FORM = { name: '', role: 'paramedic', license: '', phone: '', email: '', status: 'available', certifications: [], avatar: '' };

export default function Personnel() {
  const { personnel, setPersonnel } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterRole, setFilterRole] = useState('all');
  const [certInput, setCertInput] = useState('');

  const filtered = filterRole === 'all' ? personnel : personnel.filter(p => p.role === filterRole);

  const handleSave = () => {
    if (selectedPerson) {
      setPersonnel(prev => prev.map(p => p.id === selectedPerson.id ? { ...p, ...form } : p));
    } else {
      setPersonnel(prev => [...prev, { ...form, id: Date.now(), eventsCount: 0, avatar: form.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() }]);
    }
    setShowModal(false);
    setSelectedPerson(null);
    setForm(EMPTY_FORM);
  };

  const openEdit = (p) => {
    setSelectedPerson(p);
    setForm(p);
    setShowModal(true);
  };

  const addCert = () => {
    if (certInput.trim()) {
      setForm(f => ({ ...f, certifications: [...(f.certifications || []), certInput.trim()] }));
      setCertInput('');
    }
  };

  const removeCert = (cert) => {
    setForm(f => ({ ...f, certifications: f.certifications.filter(c => c !== cert) }));
  };

  return (
    <div className="personnel-page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Personal</h1>
          <p className="page-subtitle">{personnel.length} colaboradores registrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setSelectedPerson(null); setForm(EMPTY_FORM); setShowModal(true); }}>
          + Agregar Personal
        </button>
      </div>

      <div className="events-filters">
        {['all', 'paramedic', 'pilot', 'admin', 'accounting', 'inventory'].map(role => (
          <button key={role} className={`filter-btn ${filterRole === role ? 'active' : ''}`} onClick={() => setFilterRole(role)}>
            {role === 'all' ? 'Todos' : ROLE_LABELS[role] || role}
          </button>
        ))}
      </div>

      <div className="personnel-grid">
        {filtered.map(p => (
          <div key={p.id} className="person-card card">
            <div className="person-card-top">
              <div className="person-avatar-lg" style={{ background: ROLE_COLORS[p.role] || '#444' }}>
                {p.avatar}
              </div>
              <div className="person-info">
                <h3 className="person-name">{p.name}</h3>
                <div className="person-role-badge" style={{ color: ROLE_COLORS[p.role] || '#aaa' }}>
                  {ROLE_LABELS[p.role] || p.role}
                </div>
              </div>
              <span className={`badge ${p.status === 'available' ? 'badge-green' : p.status === 'assigned' ? 'badge-yellow' : 'badge-gray'}`}>
                {p.status === 'available' ? 'Disponible' : p.status === 'assigned' ? 'Asignado' : 'Inactivo'}
              </span>
            </div>

            <div className="person-details">
              {p.license && <div className="person-detail"><span>🪪</span>{p.license}</div>}
              {p.phone && <div className="person-detail"><span>📱</span>{p.phone}</div>}
              {p.email && <div className="person-detail"><span>✉</span>{p.email}</div>}
              <div className="person-detail"><span>◈</span>{p.eventsCount || 0} eventos</div>
            </div>

            {p.certifications?.length > 0 && (
              <div className="person-certs">
                {p.certifications.map(c => (
                  <span key={c} className="badge badge-gray">{c}</span>
                ))}
              </div>
            )}

            <div className="person-actions">
              <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>✎ Editar</button>
              <button className="btn btn-ghost btn-sm" onClick={() => {
                const isActive = p.status !== 'inactive';
                if (isActive && !window.confirm(`¿Desactivar a ${p.name}? No aparecerá en sugerencias de eventos.`)) return;
                setPersonnel(prev => prev.map(pp => pp.id === p.id ? { ...pp, status: pp.status === 'active' || pp.status === 'available' ? 'inactive' : 'available' } : pp));
              }}>
                {p.status === 'inactive' ? '✓ Activar' : '✕ Desactivar'}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state" style={{gridColumn:'1/-1'}}>
            <span>◉</span>
            <p>No hay personal en esta categoría</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedPerson ? 'Editar Personal' : 'Nuevo Personal'}</h2>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Nombre completo *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Rol *</label>
                  <select className="form-input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                    <option value="paramedic">Paramédico</option>
                    <option value="pilot">Piloto</option>
                    <option value="admin">Administrador</option>
                    <option value="accounting">Contabilidad</option>
                    <option value="inventory">Inventario</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Licencia / No. Registro</label>
                  <input className="form-input" value={form.license} onChange={e => setForm({...form, license: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="available">Disponible</option>
                    <option value="assigned">Asignado</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo electrónico</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Certificaciones</label>
                <div className="cert-input-row">
                  <input className="form-input" placeholder="Ej: BLS, ACLS, PHTLS..." value={certInput} onChange={e => setCertInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCert()} />
                  <button className="btn btn-outline btn-sm" onClick={addCert}>+ Agregar</button>
                </div>
                {form.certifications?.length > 0 && (
                  <div className="cert-tags">
                    {form.certifications.map(c => (
                      <span key={c} className="cert-tag" onClick={() => removeCert(c)}>{c} ✕</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}>{selectedPerson ? 'Guardar' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
