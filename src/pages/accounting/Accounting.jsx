import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './Accounting.css';

const MOCK_TRANSACTIONS = [
  { id: 1, date: new Date(2024, 5, 15), description: 'Servicio - Concierto Rock en Grande', type: 'income', amount: 45000, eventId: 1, status: 'paid' },
  { id: 2, date: new Date(2024, 5, 12), description: 'Pago personal - Evento Foro Empresarial', type: 'expense', amount: 8500, eventId: 3, status: 'paid' },
  { id: 3, date: new Date(2024, 5, 10), description: 'Reposición medicamentos', type: 'expense', amount: 3200, eventId: null, status: 'paid' },
  { id: 4, date: new Date(2024, 5, 8), description: 'Servicio - Foro Empresarial Tech', type: 'income', amount: 18000, eventId: 3, status: 'paid' },
  { id: 5, date: new Date(2024, 6, 1), description: 'Anticipo - Partido Clásico Nacional', type: 'income', amount: 30000, eventId: 2, status: 'pending' },
  { id: 6, date: new Date(2024, 5, 20), description: 'Mantenimiento ambulancias', type: 'expense', amount: 6500, eventId: null, status: 'paid' },
];

const EMPTY_FORM = { description: '', type: 'income', amount: '', date: format(new Date(), 'yyyy-MM-dd'), eventId: '', status: 'pending' };

export default function Accounting() {
  const { events } = useApp();
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterType, setFilterType] = useState('all');

  const filtered = filterType === 'all' ? transactions : transactions.filter(t => t.type === filterType);
  const totalIncome = transactions.filter(t => t.type === 'income' && t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense' && t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;
  const pending = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0);

  const handleSave = () => {
    setTransactions(prev => [...prev, { ...form, id: Date.now(), amount: Number(form.amount), date: new Date(form.date), eventId: form.eventId ? Number(form.eventId) : null }]);
    setShowModal(false);
    setForm(EMPTY_FORM);
  };

  const fmtMoney = (n) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

  return (
    <div className="accounting-page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contabilidad</h1>
          <p className="page-subtitle">Registro de ingresos y egresos</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }}>
          + Nuevo Movimiento
        </button>
      </div>

      <div className="acc-stats">
        <div className="acc-stat card" style={{'--border': '#00C850'}}>
          <span className="acc-stat-label">Ingresos (pagados)</span>
          <span className="acc-stat-value income">{fmtMoney(totalIncome)}</span>
        </div>
        <div className="acc-stat card" style={{'--border': '#FF4444'}}>
          <span className="acc-stat-label">Egresos (pagados)</span>
          <span className="acc-stat-value expense">{fmtMoney(totalExpense)}</span>
        </div>
        <div className="acc-stat card" style={{'--border': balance >= 0 ? '#00C850' : '#FF4444'}}>
          <span className="acc-stat-label">Balance neto</span>
          <span className="acc-stat-value" style={{color: balance >= 0 ? '#00C850' : '#FF4444'}}>{fmtMoney(balance)}</span>
        </div>
        <div className="acc-stat card" style={{'--border': '#FFB400'}}>
          <span className="acc-stat-label">Por cobrar / pagar</span>
          <span className="acc-stat-value" style={{color:'#FFB400'}}>{fmtMoney(pending)}</span>
        </div>
      </div>

      <div className="events-filters">
        {['all', 'income', 'expense'].map(t => (
          <button key={t} className={`filter-btn ${filterType === t ? 'active' : ''}`} onClick={() => setFilterType(t)}>
            {t === 'all' ? 'Todos' : t === 'income' ? '↑ Ingresos' : '↓ Egresos'}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Tipo</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.sort((a,b) => new Date(b.date) - new Date(a.date)).map(t => (
                <tr key={t.id}>
                  <td>{format(new Date(t.date), 'd MMM yyyy', { locale: es })}</td>
                  <td>{t.description}</td>
                  <td>
                    <span className={`badge ${t.type === 'income' ? 'badge-green' : 'badge-red'}`}>
                      {t.type === 'income' ? '↑ Ingreso' : '↓ Egreso'}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: t.type === 'income' ? '#00C850' : '#FF6666' }}>
                      {t.type === 'income' ? '+' : '-'}{fmtMoney(t.amount)}
                    </strong>
                  </td>
                  <td>
                    <span className={`badge ${t.status === 'paid' ? 'badge-gray' : 'badge-yellow'}`}>
                      {t.status === 'paid' ? 'Pagado' : 'Pendiente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{maxWidth:480}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nuevo Movimiento</h2>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Descripción *</label>
                <input className="form-input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <select className="form-input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="income">Ingreso</option>
                    <option value="expense">Egreso</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Monto (MXN)</label>
                  <input className="form-input" type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha</label>
                  <input className="form-input" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="pending">Pendiente</option>
                    <option value="paid">Pagado</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Evento relacionado (opcional)</label>
                <select className="form-input" value={form.eventId} onChange={e => setForm({...form, eventId: e.target.value})}>
                  <option value="">Sin evento relacionado</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
