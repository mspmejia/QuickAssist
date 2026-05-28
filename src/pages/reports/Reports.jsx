import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import './Reports.css';

const COLORS = ['#CC0000', '#00C850', '#FFB400', '#0088FF', '#AA44FF'];

export default function Reports() {
  const { events, patients, personnel, inventory } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  const eventsByType = ['concert','sports','forum','festival'].map(t => ({
    name: t === 'concert' ? 'Conciertos' : t === 'sports' ? 'Deportes' : t === 'forum' ? 'Foros' : 'Festivales',
    value: events.filter(e => e.type === t).length,
  })).filter(e => e.value > 0);

  const eventsByStatus = ['confirmed','pending','completed','cancelled'].map(s => ({
    name: s === 'confirmed' ? 'Confirmados' : s === 'pending' ? 'Pendientes' : s === 'completed' ? 'Completados' : 'Cancelados',
    value: events.filter(e => e.status === s).length,
  })).filter(e => e.value > 0);

  const personnelByRole = [
    { name: 'Paramédicos', value: personnel.filter(p => p.role === 'paramedic').length },
    { name: 'Pilotos', value: personnel.filter(p => p.role === 'pilot').length },
    { name: 'Admin', value: personnel.filter(p => p.role === 'admin').length },
  ].filter(r => r.value > 0);

  const inventoryAlerts = inventory.map(i => ({
    name: i.name.length > 20 ? i.name.substring(0, 18) + '…' : i.name,
    actual: i.quantity,
    minimo: i.minStock,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: 'var(--black-card)', border: '1px solid var(--black-border)', padding: '8px 12px', borderRadius: 4, fontSize: 12 }}>
          <p style={{ color: 'var(--white-muted)', marginBottom: 4 }}>{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color || 'var(--white)' }}>{p.name}: <strong>{p.value}</strong></p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="reports-page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reportería</h1>
          <p className="page-subtitle">Métricas y análisis operativo</p>
        </div>
        <button className="btn btn-outline" onClick={() => window.print()}>🖨 Exportar</button>
      </div>

      <div className="report-tabs">
        {['overview', 'events', 'patients', 'inventory'].map(tab => (
          <button key={tab} className={`report-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'overview' ? '▦ Resumen' : tab === 'events' ? '◈ Eventos' : tab === 'patients' ? '✚ Pacientes' : '▣ Inventario'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="reports-grid">
          <div className="card report-card">
            <div className="report-card-title">KPIs Generales</div>
            <div className="kpi-grid">
              <div className="kpi-item"><span className="kpi-val">{events.length}</span><span className="kpi-lbl">Total Eventos</span></div>
              <div className="kpi-item"><span className="kpi-val">{events.filter(e=>e.status==='confirmed').length}</span><span className="kpi-lbl">Confirmados</span></div>
              <div className="kpi-item"><span className="kpi-val">{patients.length}</span><span className="kpi-lbl">Atenciones</span></div>
              <div className="kpi-item"><span className="kpi-val">{patients.filter(p=>p.transport).length}</span><span className="kpi-lbl">Traslados</span></div>
              <div className="kpi-item"><span className="kpi-val">{personnel.filter(p=>p.status==='available').length}</span><span className="kpi-lbl">Disponibles</span></div>
              <div className="kpi-item"><span className="kpi-val">{inventory.filter(i=>i.status==='critical'||i.status==='low').length}</span><span className="kpi-lbl">Alertas Inv.</span></div>
            </div>
          </div>

          <div className="card report-card">
            <div className="report-card-title">Eventos por Tipo</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={eventsByType} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name, value}) => `${name}: ${value}`} labelLine={false}>
                  {eventsByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card report-card">
            <div className="report-card-title">Personal por Rol</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={personnelByRole} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fill: 'var(--white-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--white-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#CC0000" radius={[4,4,0,0]} name="Personal" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card report-card">
            <div className="report-card-title">Estado de Eventos</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={eventsByStatus} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fill: 'var(--white-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--white-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4,4,0,0]} name="Eventos">
                  {eventsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="card">
          <div className="report-card-title" style={{marginBottom:16}}>Historial de Eventos</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Evento</th><th>Cliente</th><th>Fecha</th><th>Asistentes</th><th>Personal</th><th>Ambulancias</th><th>Estado</th></tr></thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev.id}>
                    <td><strong>{ev.name}</strong></td>
                    <td>{ev.client}</td>
                    <td>{ev.date ? new Date(ev.date).toLocaleDateString('es-MX') : '—'}</td>
                    <td>{ev.expectedAttendance?.toLocaleString()}</td>
                    <td>{ev.assignedPersonnel?.length || 0}</td>
                    <td>{ev.ambulances}</td>
                    <td><span className={`badge ${ev.status === 'confirmed' ? 'badge-green' : ev.status === 'pending' ? 'badge-yellow' : 'badge-gray'}`}>{ev.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="card">
          <div className="report-card-title" style={{marginBottom:16}}>Fichas de Atención</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Folio</th><th>Evento</th><th>Motivo</th><th>Atendido por</th><th>Traslado</th></tr></thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id}>
                    <td><span style={{color:'var(--red)',fontWeight:700}}>{p.folio}</span></td>
                    <td>{p.eventName}</td>
                    <td>{p.reason}</td>
                    <td>{p.attendedBy}</td>
                    <td>{p.transport ? <span className="badge badge-yellow">🚑 Sí</span> : <span className="badge badge-gray">No</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="card">
          <div className="report-card-title" style={{marginBottom:16}}>Stock vs Mínimo Requerido</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inventoryAlerts} layout="vertical" barCategoryGap="20%">
              <XAxis type="number" tick={{ fill: 'var(--white-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'var(--white-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={140} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="actual" fill="#CC0000" name="Stock actual" radius={[0,4,4,0]} />
              <Bar dataKey="minimo" fill="rgba(255,255,255,0.1)" name="Mínimo" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
