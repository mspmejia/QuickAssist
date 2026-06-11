import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import './Reports.css';

const COLORS = ['#CC0000','#00C850','#FFB400','#0088FF','#AA44FF','#FF6B35'];

// ── Tooltip común para gráficas ───────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--black-card)', border: '1px solid var(--black-border)', padding: '8px 12px', borderRadius: 4, fontSize: 12 }}>
      {label && <p style={{ color: 'var(--white-muted)', marginBottom: 4 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || 'var(--white)' }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

// ── Helpers de PDF (jsPDF cargado vía CDN en index.html o dinámico) ──
const loadJsPDF = () => new Promise((resolve, reject) => {
  if (window.jspdf) { resolve(window.jspdf.jsPDF); return; }
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  s.onload  = () => resolve(window.jspdf.jsPDF);
  s.onerror = reject;
  document.head.appendChild(s);
});

// Cabecera común para todos los PDFs
const pdfHeader = (doc, title, subtitle) => {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(245, 245, 245);
  doc.rect(0, 0, w, 28, 'F');
  doc.setFillColor(204, 0, 0);
  doc.rect(0, 0, 4, 28, 'F');
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(14); doc.setFont('helvetica', 'bold');
  doc.text('QUICK ASSIST', 12, 11);
  doc.setFontSize(8);  doc.setFont('helvetica', 'normal');
  doc.text('Gestión Paramédica', 12, 18);
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text(title, w / 2, 11, { align: 'center' });
  doc.setFontSize(9);  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, w / 2, 18, { align: 'center' });
  doc.setFontSize(8);
  doc.text(`Generado: ${format(new Date(), "d 'de' MMMM yyyy HH:mm", { locale: es })}`, w - 10, 11, { align: 'right' });
  doc.setDrawColor(204, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(10, 32, w - 10, 32);
};

// Tabla genérica
const pdfTable = (doc, headers, rows, startY) => {
  const w    = doc.internal.pageSize.getWidth();
  const colW = (w - 20) / headers.length;
  let y = startY;
  // encabezado
  doc.setFillColor(230, 230, 230);
  doc.rect(10, y, w - 20, 8, 'F');
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(7); doc.setFont('helvetica', 'bold');
  headers.forEach((h, i) => doc.text(h, 12 + i * colW, y + 5.5));
  y += 8;
  // filas
  doc.setFont('helvetica', 'normal');
  rows.forEach((row, ri) => {
    if (y > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      pdfHeader(doc, '', '');
      y = 38;
    }
    if (ri % 2 === 0) { doc.setFillColor(248, 248, 248); doc.rect(10, y, w - 20, 7, 'F'); }
    doc.setTextColor(40, 40, 40);
    row.forEach((cell, i) => {
      const txt = String(cell ?? '—');
      doc.text(txt.length > 28 ? txt.substring(0, 26) + '…' : txt, 12 + i * colW, y + 5);
    });
    y += 7;
  });
  return y + 4;
};

// Pie de página
const pdfFooter = (doc, extra = '') => {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setDrawColor(50, 50, 50);
  doc.setLineWidth(0.3);
  doc.line(10, h - 12, w - 10, h - 12);
  doc.setTextColor(130, 130, 130);
  doc.setFontSize(7);
  doc.text('QuickAssist — Documento confidencial', 10, h - 7);
  if (extra) doc.text(extra, w / 2, h - 7, { align: 'center' });
  doc.text(`Pág. ${doc.internal.getCurrentPageInfo().pageNumber}`, w - 10, h - 7, { align: 'right' });
};

// ─────────────────────────────────────────────────────────
// GENERADORES DE PDF
// ─────────────────────────────────────────────────────────

// 1. Reporte por evento
const generateEventReport = async (eventId, events, patients, personnel, companies) => {
  const JsPDF = await loadJsPDF();
  const ev = events.find(e => e.id === eventId);
  if (!ev) return;
  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, 'F');

  pdfHeader(doc, 'REPORTE DE EVENTO', ev.name.toUpperCase());

  let y = 38;
  // Info del evento
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.text('Información del evento', 10, y); y += 6;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(80, 80, 80);
  const evInfo = [
    ['Cliente', ev.client],
    ['Venue', ev.venue],
    ['Fecha', format(new Date(ev.date), "d 'de' MMMM yyyy", { locale: es })],
    ['Asistentes esperados', ev.expectedAttendance?.toLocaleString()],
    ['Ambulancias requeridas', String(ev.ambulances)],
    ['Estado', ev.status === 'confirmed' ? 'Confirmado' : ev.status === 'completed' ? 'Completado' : ev.status],
  ];
  evInfo.forEach(([k, v]) => {
    doc.setTextColor(110, 110, 110); doc.text(k + ':', 12, y);
    doc.setTextColor(30, 30, 30); doc.text(String(v || '—'), 60, y);
    y += 5;
  });
  y += 4;

  // Fichas de atención del evento
  const evPatients = patients.filter(p => p.eventId === eventId);
  const attendees   = evPatients.filter(p => p.patientType === 'attendee').length;
  const collabs     = evPatients.filter(p => p.patientType === 'collaborator').length;
  const transfers   = evPatients.filter(p => p.transport).length;

  doc.setTextColor(204, 0, 0); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.text(`Resumen de atenciones — ${evPatients.length} total`, 10, y); y += 6;

  // KPIs en fila
  const kpis = [
    ['Asistentes', attendees],
    ['Colaboradores', collabs],
    ['Traslados', transfers],
    ['Alta en sitio', evPatients.length - transfers],
  ];
  kpis.forEach(([lbl, val], i) => {
    const x = 12 + i * 48;
    doc.setFillColor(250, 250, 250); doc.rect(x, y, 44, 14, 'F');
    doc.setTextColor(204, 0, 0); doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text(String(val), x + 22, y + 8, { align: 'center' });
    doc.setTextColor(100, 100, 100); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.text(lbl, x + 22, y + 13, { align: 'center' });
  });
  y += 20;

  // Tabla de fichas
  if (evPatients.length > 0) {
    doc.setTextColor(30, 30, 30); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text('Fichas de atención', 10, y); y += 5;
    y = pdfTable(doc,
      ['Folio', 'Tipo', 'Empresa', 'Motivo', 'Atendido por', 'Traslado'],
      evPatients.map(p => [
        p.folio,
        p.patientType === 'collaborator' ? 'Colaborador' : 'Asistente',
        p.companyId ? companies.find(c => c.id === p.companyId)?.name || '—' : '—',
        p.reason || '—',
        p.attendedBy || '—',
        p.transport ? 'Sí' : 'No',
      ]),
      y
    );
  }

  // Desglose por empresa
  const byCompany = {};
  evPatients.filter(p => p.patientType === 'collaborator' && p.companyId).forEach(p => {
    const name = companies.find(c => c.id === p.companyId)?.name || `#${p.companyId}`;
    byCompany[name] = (byCompany[name] || 0) + 1;
  });
  if (Object.keys(byCompany).length > 0) {
    y += 4;
    doc.setTextColor(30, 30, 30); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text('Atenciones por empresa colaboradora', 10, y); y += 5;
    y = pdfTable(doc,
      ['Empresa', 'Atenciones'],
      Object.entries(byCompany).sort((a,b) => b[1]-a[1]).map(([name, count]) => [name, count]),
      y
    );
  }

  pdfFooter(doc, `Evento: ${ev.name}`);
  doc.save(`QA_Reporte_Evento_${ev.id}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};

// 2. Reporte por empresa
const generateCompanyReport = async (companyId, companies, patients, events, dateFrom, dateTo) => {
  const JsPDF = await loadJsPDF();
  const company = companies.find(c => c.id === companyId);
  if (!company) return;
  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, 'F');

  pdfHeader(doc, 'REPORTE DE EMPRESA COLABORADORA', company.name.toUpperCase());

  let y = 38;
  const from = dateFrom ? new Date(dateFrom) : new Date('2000-01-01');
  const to   = dateTo   ? new Date(dateTo)   : new Date();

  const compPatients = patients.filter(p =>
    p.companyId === companyId &&
    isWithinInterval(new Date(p.date), { start: from, end: to })
  );

  doc.setTextColor(80, 80, 80); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.text(`Empresa: ${company.name}  |  Rubro: ${company.rubro}  |  Período: ${format(from,'d MMM yyyy',{locale:es})} – ${format(to,'d MMM yyyy',{locale:es})}`, 10, y); y += 8;

  // KPIs
  const kpis = [
    ['Atenciones', compPatients.length],
    ['Traslados', compPatients.filter(p=>p.transport).length],
    ['Altas en sitio', compPatients.filter(p=>!p.transport).length],
  ];
  kpis.forEach(([lbl, val], i) => {
    const x = 12 + i * 62;
    doc.setFillColor(250,250,250); doc.rect(x, y, 58, 14, 'F');
    doc.setTextColor(204,0,0); doc.setFontSize(14); doc.setFont('helvetica','bold');
    doc.text(String(val), x+29, y+8, { align:'center' });
    doc.setTextColor(100,100,100); doc.setFontSize(7); doc.setFont('helvetica','normal');
    doc.text(lbl, x+29, y+13, { align:'center' });
  });
  y += 20;

  if (compPatients.length > 0) {
    doc.setTextColor(30,30,30); doc.setFontSize(9); doc.setFont('helvetica','bold');
    doc.text('Detalle de atenciones', 10, y); y += 5;
    y = pdfTable(doc,
      ['Folio','Evento','Fecha','Puesto','Motivo','Traslado','Desenlace'],
      compPatients.map(p => [
        p.folio,
        (events.find(e=>e.id===p.eventId)?.name || '—').substring(0,18),
        format(new Date(p.date), 'd/MM/yy'),
        (p.companyRole || '—').substring(0,14),
        (p.reason || '—').substring(0,14),
        p.transport ? 'Sí' : 'No',
        (p.outcome || '—').substring(0,14),
      ]),
      y
    );
  } else {
    doc.setTextColor(100,100,100); doc.setFontSize(9);
    doc.text('Sin atenciones registradas en el período seleccionado.', 10, y);
  }

  pdfFooter(doc, `Empresa: ${company.name}`);
  doc.save(`QA_Empresa_${company.name.replace(/\s/g,'_')}_${format(new Date(),'yyyyMMdd')}.pdf`);
};

// 3. Reporte consumo de inventario
const generateInventoryReport = async (eventId, events, patients, inventory, units, despachos) => {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.setFillColor(255,255,255); doc.rect(0,0,210,297,'F');

  const ev = eventId ? events.find(e => e.id === eventId) : null;
  pdfHeader(doc, 'REPORTE DE CONSUMO DE INVENTARIO', ev ? ev.name.toUpperCase() : 'TODOS LOS EVENTOS');

  let y = 38;
  const scope = eventId ? patients.filter(p => p.eventId === eventId) : patients;
  const consumption = {};
  scope.forEach(p => {
    (p.consumedItems || []).forEach(ci => {
      consumption[ci.itemId] = (consumption[ci.itemId] || 0) + ci.cantidad;
    });
  });

  const rows = Object.entries(consumption)
    .sort((a,b) => b[1]-a[1])
    .map(([itemId, consumed]) => {
      const item = inventory.find(i => i.id === Number(itemId));
      return [item?.name||`#${itemId}`, item?.category||'—', consumed, item?.unit||'', item?.quantity||0];
    });

  if (rows.length === 0) {
    doc.setTextColor(100,100,100); doc.setFontSize(9);
    doc.text('Sin consumos registrados para el período/evento seleccionado.', 10, y);
  } else {
    doc.setTextColor(30,30,30); doc.setFontSize(9); doc.setFont('helvetica','bold');
    doc.text('Artículos consumidos', 10, y); y += 5;
    y = pdfTable(doc,
      ['Artículo','Categoría','Consumido','Unidad','Stock actual'],
      rows,
      y
    );
  }

  // Stock crítico
  const critical = inventory.filter(i => i.status === 'critical' || i.status === 'low');
  if (critical.length > 0) {
    y += 6;
    doc.setTextColor(204,0,0); doc.setFontSize(9); doc.setFont('helvetica','bold');
    doc.text('⚠ Artículos con stock bajo o crítico', 10, y); y += 5;
    y = pdfTable(doc,
      ['Artículo','Stock actual','Stock mínimo','Estado'],
      critical.map(i => [i.name, i.quantity, i.minStock, i.status === 'critical' ? 'CRÍTICO' : 'BAJO']),
      y
    );
  }

  pdfFooter(doc, ev ? `Evento: ${ev.name}` : 'Reporte global');
  doc.save(`QA_Inventario_${format(new Date(),'yyyyMMdd')}.pdf`);
};

// 4. Reporte mensual de operaciones
const generateMonthlyReport = async (year, month, events, patients, personnel, companies, inventory) => {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.setFillColor(255,255,255); doc.rect(0,0,210,297,'F');

  const mStart = startOfMonth(new Date(year, month));
  const mEnd   = endOfMonth(new Date(year, month));
  const monthName = format(mStart, 'MMMM yyyy', { locale: es }).toUpperCase();

  pdfHeader(doc, 'REPORTE MENSUAL DE OPERACIONES', monthName);

  const monthEvents   = events.filter(e => isWithinInterval(new Date(e.date), { start: mStart, end: mEnd }));
  const monthPatients = patients.filter(p => isWithinInterval(new Date(p.date), { start: mStart, end: mEnd }));
  const transfers     = monthPatients.filter(p => p.transport).length;
  const collabs       = monthPatients.filter(p => p.patientType === 'collaborator').length;

  let y = 38;
  // KPI grid
  const kpis = [
    ['Eventos del mes',  monthEvents.length],
    ['Total atenciones', monthPatients.length],
    ['Colaboradores',    collabs],
    ['Traslados',        transfers],
    ['Personal activo',  personnel.filter(p=>p.status!=='inactive').length],
    ['Alertas stock',    inventory.filter(i=>i.status==='critical'||i.status==='low').length],
  ];
  kpis.forEach(([lbl, val], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x   = 12 + col * 62;
    const ky  = y + row * 18;
    doc.setFillColor(250,250,250); doc.rect(x, ky, 58, 14, 'F');
    doc.setTextColor(204,0,0); doc.setFontSize(14); doc.setFont('helvetica','bold');
    doc.text(String(val), x+29, ky+8, {align:'center'});
    doc.setTextColor(100,100,100); doc.setFontSize(7); doc.setFont('helvetica','normal');
    doc.text(lbl, x+29, ky+13, {align:'center'});
  });
  y += 40;

  // Eventos del mes
  if (monthEvents.length > 0) {
    doc.setTextColor(30,30,30); doc.setFontSize(9); doc.setFont('helvetica','bold');
    doc.text('Eventos del mes', 10, y); y += 5;
    y = pdfTable(doc,
      ['Evento','Cliente','Fecha','Asistentes','Estado'],
      monthEvents.map(ev => [
        ev.name.substring(0,22), ev.client.substring(0,16),
        format(new Date(ev.date),'d/MM/yy'),
        ev.expectedAttendance?.toLocaleString(),
        ev.status==='confirmed'?'Confirmado':ev.status==='completed'?'Completado':ev.status,
      ]),
      y
    );
  }

  // Top motivos del mes
  const reasonMap = {};
  monthPatients.forEach(p => { if (p.reason) reasonMap[p.reason] = (reasonMap[p.reason]||0)+1; });
  const topReasons = Object.entries(reasonMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
  if (topReasons.length > 0) {
    y += 4;
    doc.setTextColor(30,30,30); doc.setFontSize(9); doc.setFont('helvetica','bold');
    doc.text('Motivos de atención más frecuentes', 10, y); y += 5;
    y = pdfTable(doc, ['Motivo','Atenciones'], topReasons.map(([r,c])=>[r,c]), y);
  }

  // Top empresa colaboradora
  const compMap = {};
  monthPatients.filter(p=>p.companyId).forEach(p => {
    const name = companies.find(c=>c.id===p.companyId)?.name || `#${p.companyId}`;
    compMap[name] = (compMap[name]||0)+1;
  });
  const topComp = Object.entries(compMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
  if (topComp.length > 0) {
    y += 4;
    doc.setTextColor(30,30,30); doc.setFontSize(9); doc.setFont('helvetica','bold');
    doc.text('Atenciones por empresa colaboradora', 10, y); y += 5;
    y = pdfTable(doc, ['Empresa','Atenciones'], topComp.map(([n,c])=>[n,c]), y);
  }

  pdfFooter(doc, monthName);
  doc.save(`QA_Mensual_${format(mStart,'yyyyMM')}.pdf`);
};

// ─────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────
export default function Reports() {
  const { events, patients, personnel, inventory, companies, units, despachos } = useApp();
  const today = new Date();

  const [activeTab,      setActiveTab]      = useState('generators');
  const [generating,     setGenerating]     = useState(null);

  // Filtros para generadores
  const [selEvent,    setSelEvent]    = useState('');
  const [selCompany,  setSelCompany]  = useState('');
  const [dateFrom,    setDateFrom]    = useState('');
  const [dateTo,      setDateTo]      = useState('');
  const [selYear,     setSelYear]     = useState(today.getFullYear());
  const [selMonth,    setSelMonth]    = useState(today.getMonth());
  const [selInvEvent, setSelInvEvent] = useState('');

  const gen = async (key, fn) => {
    setGenerating(key);
    try { await fn(); } catch(e) { console.error(e); alert('Error al generar PDF. Intenta de nuevo.'); }
    setGenerating(null);
  };

  // Datos para gráficas
  const eventsByType = ['concert','sports','forum','festival'].map(t => ({
    name: t==='concert'?'Conciertos':t==='sports'?'Deportes':t==='forum'?'Foros':'Festivales',
    value: events.filter(e=>e.type===t).length,
  })).filter(e=>e.value>0);

  const patientsByType = [
    { name: 'Asistentes',    value: patients.filter(p=>p.patientType==='attendee').length    },
    { name: 'Colaboradores', value: patients.filter(p=>p.patientType==='collaborator').length },
  ];

  const topReasonData = (() => {
    const m = {};
    patients.forEach(p => { if (p.reason) m[p.reason] = (m[p.reason]||0)+1; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([name,value])=>({name:name.substring(0,18),value}));
  })();

  const companyData = companies.map(c => ({
    name: c.name.substring(0,14),
    value: patients.filter(p=>p.companyId===c.id).length,
  })).filter(c=>c.value>0).sort((a,b)=>b.value-a.value).slice(0,6);

  const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  return (
    <div className="reports-page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">◐ Reportería</h1>
          <p className="page-subtitle">Análisis operativo y generación de reportes PDF</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="report-tabs">
        {[
          ['generators','◈ Generar PDFs'],
          ['overview',  '▦ Resumen'],
          ['events',    '◈ Eventos'],
          ['patients',  '✚ Atenciones'],
          ['inventory', '▣ Inventario'],
        ].map(([key, label]) => (
          <button key={key} className={`report-tab ${activeTab===key?'active':''}`} onClick={() => setActiveTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB: GENERADORES PDF ── */}
      {activeTab === 'generators' && (
        <div className="reports-generators">

          {/* Reporte 1: Por evento */}
          <div className="card generator-card">
            <div className="generator-header">
              <div className="generator-icon" style={{ background: 'rgba(0,136,255,0.15)', color: '#0088FF' }}>◈</div>
              <div>
                <div className="generator-title">Reporte por evento</div>
                <div className="generator-desc">Atenciones, colaboradores y desglose de empresas de un evento específico. Ideal para entregar a la productora.</div>
              </div>
            </div>
            <div className="generator-controls">
              <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                <label className="form-label">Evento</label>
                <select className="form-input" value={selEvent} onChange={e => setSelEvent(e.target.value)}>
                  <option value="">— Seleccionar —</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
              </div>
              <button
                className="btn btn-primary"
                disabled={!selEvent || generating === 'event'}
                onClick={() => gen('event', () => generateEventReport(Number(selEvent), events, patients, personnel, companies))}
              >
                {generating === 'event' ? '⏳ Generando…' : '↓ Descargar PDF'}
              </button>
            </div>
            {selEvent && (
              <div className="generator-preview">
                {(() => {
                  const ev = events.find(e => e.id === Number(selEvent));
                  const evPat = patients.filter(p => p.eventId === Number(selEvent));
                  return ev ? (
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: 'var(--white-muted)' }}>📅 {format(new Date(ev.date), 'd MMM yyyy', {locale:es})}</span>
                      <span style={{ fontSize: 12, color: 'var(--white-muted)' }}>✚ {evPat.length} atenciones</span>
                      <span style={{ fontSize: 12, color: 'var(--white-muted)' }}>◉ {evPat.filter(p=>p.patientType==='collaborator').length} colaboradores</span>
                      <span style={{ fontSize: 12, color: 'var(--white-muted)' }}>🚑 {evPat.filter(p=>p.transport).length} traslados</span>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>

          {/* Reporte 2: Por empresa */}
          <div className="card generator-card">
            <div className="generator-header">
              <div className="generator-icon" style={{ background: 'rgba(255,180,0,0.15)', color: '#FFB400' }}>◉</div>
              <div>
                <div className="generator-title">Reporte por empresa colaboradora</div>
                <div className="generator-desc">Todas las atenciones de una empresa en un rango de fechas. Para entregar a la empresa sobre sus colaboradores atendidos.</div>
              </div>
            </div>
            <div className="generator-controls" style={{ flexWrap: 'wrap', gap: 10 }}>
              <div className="form-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
                <label className="form-label">Empresa</label>
                <select className="form-input" value={selCompany} onChange={e => setSelCompany(e.target.value)}>
                  <option value="">— Seleccionar —</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0, flex: '1 1 130px' }}>
                <label className="form-label">Desde</label>
                <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0, flex: '1 1 130px' }}>
                <label className="form-label">Hasta</label>
                <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
              <button
                className="btn btn-primary"
                style={{ alignSelf: 'flex-end' }}
                disabled={!selCompany || generating === 'company'}
                onClick={() => gen('company', () => generateCompanyReport(Number(selCompany), companies, patients, events, dateFrom, dateTo))}
              >
                {generating === 'company' ? '⏳ Generando…' : '↓ Descargar PDF'}
              </button>
            </div>
          </div>

          {/* Reporte 3: Inventario */}
          <div className="card generator-card">
            <div className="generator-header">
              <div className="generator-icon" style={{ background: 'rgba(170,68,255,0.15)', color: '#AA44FF' }}>▣</div>
              <div>
                <div className="generator-title">Reporte de consumo de inventario</div>
                <div className="generator-desc">Qué artículos se consumieron, en qué cantidades y cuál es el stock actual. Incluye alertas de stock crítico.</div>
              </div>
            </div>
            <div className="generator-controls">
              <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                <label className="form-label">Evento (opcional)</label>
                <select className="form-input" value={selInvEvent} onChange={e => setSelInvEvent(e.target.value)}>
                  <option value="">Todos los eventos</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
              </div>
              <button
                className="btn btn-primary"
                disabled={generating === 'inventory'}
                onClick={() => gen('inventory', () => generateInventoryReport(selInvEvent ? Number(selInvEvent) : null, events, patients, inventory, units, despachos))}
              >
                {generating === 'inventory' ? '⏳ Generando…' : '↓ Descargar PDF'}
              </button>
            </div>
          </div>

          {/* Reporte 4: Mensual */}
          <div className="card generator-card">
            <div className="generator-header">
              <div className="generator-icon" style={{ background: 'rgba(0,200,80,0.15)', color: '#00C850' }}>◐</div>
              <div>
                <div className="generator-title">Reporte mensual de operaciones</div>
                <div className="generator-desc">Resumen ejecutivo del mes: eventos, atenciones, motivos frecuentes, empresas y alertas de inventario.</div>
              </div>
            </div>
            <div className="generator-controls">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mes</label>
                <select className="form-input" value={selMonth} onChange={e => setSelMonth(Number(e.target.value))}>
                  {MONTHS.map((m,i) => <option key={i} value={i}>{m}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0, width: 90 }}>
                <label className="form-label">Año</label>
                <input type="number" className="form-input" value={selYear} min="2024" max="2030"
                  onChange={e => setSelYear(Number(e.target.value))} />
              </div>
              <button
                className="btn btn-primary"
                style={{ alignSelf: 'flex-end' }}
                disabled={generating === 'monthly'}
                onClick={() => gen('monthly', () => generateMonthlyReport(selYear, selMonth, events, patients, personnel, companies, inventory))}
              >
                {generating === 'monthly' ? '⏳ Generando…' : '↓ Descargar PDF'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="reports-grid">
          <div className="card report-card">
            <div className="report-card-title">KPIs Generales</div>
            <div className="kpi-grid">
              <div className="kpi-item"><span className="kpi-val">{events.length}</span><span className="kpi-lbl">Total Eventos</span></div>
              <div className="kpi-item"><span className="kpi-val">{events.filter(e=>e.status==='confirmed').length}</span><span className="kpi-lbl">Confirmados</span></div>
              <div className="kpi-item"><span className="kpi-val">{patients.length}</span><span className="kpi-lbl">Atenciones</span></div>
              <div className="kpi-item"><span className="kpi-val">{patients.filter(p=>p.transport).length}</span><span className="kpi-lbl">Traslados</span></div>
              <div className="kpi-item"><span className="kpi-val">{patients.filter(p=>p.patientType==='collaborator').length}</span><span className="kpi-lbl">Colaboradores</span></div>
              <div className="kpi-item"><span className="kpi-val">{inventory.filter(i=>i.status==='critical'||i.status==='low').length}</span><span className="kpi-lbl">Alertas Inv.</span></div>
            </div>
          </div>

          <div className="card report-card">
            <div className="report-card-title">Atenciones por tipo</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={patientsByType} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value})=>`${name}: ${value}`} labelLine={false}>
                  {patientsByType.map((_,i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card report-card">
            <div className="report-card-title">Eventos por tipo</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={eventsByType} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value})=>`${name}: ${value}`} labelLine={false}>
                  {eventsByType.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card report-card">
            <div className="report-card-title">Top empresas colaboradoras</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={companyData} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fill:'var(--white-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'var(--white-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" fill="#FFB400" radius={[4,4,0,0]} name="Atenciones" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── TAB: EVENTOS ── */}
      {activeTab === 'events' && (
        <div className="card">
          <div className="report-card-title" style={{ marginBottom: 16 }}>Historial de Eventos</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Evento</th><th>Cliente</th><th>Fecha</th><th>Asistentes</th><th>Personal</th><th>Ambulancias</th><th>Estado</th></tr></thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev.id}>
                    <td><strong>{ev.name}</strong></td>
                    <td>{ev.client}</td>
                    <td>{ev.date ? format(new Date(ev.date),'d/MM/yyyy') : '—'}</td>
                    <td>{ev.expectedAttendance?.toLocaleString()}</td>
                    <td>{ev.assignedPersonnel?.length || 0}</td>
                    <td>{ev.ambulances}</td>
                    <td><span className={`badge ${ev.status==='confirmed'?'badge-green':ev.status==='pending'?'badge-yellow':'badge-gray'}`} style={{fontSize:10}}>{ev.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: PACIENTES ── */}
      {activeTab === 'patients' && (
        <div className="card">
          <div className="report-card-title" style={{ marginBottom: 16 }}>Fichas de Atención</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Folio</th><th>Evento</th><th>Tipo</th><th>Empresa</th><th>Motivo</th><th>Atendido por</th><th>Traslado</th></tr></thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id}>
                    <td><span className="folio-code" style={{fontSize:11}}>{p.folio}</span></td>
                    <td style={{fontSize:11}}>{p.eventName}</td>
                    <td><span className={`badge ${p.patientType==='collaborator'?'badge-yellow':'badge-gray'}`} style={{fontSize:10}}>{p.patientType==='collaborator'?'Colaborador':'Asistente'}</span></td>
                    <td style={{fontSize:11}}>{p.companyId ? companies.find(c=>c.id===p.companyId)?.name || '—' : '—'}</td>
                    <td>{p.reason}</td>
                    <td style={{fontSize:11}}>{p.attendedBy}</td>
                    <td>{p.transport ? <span className="badge badge-yellow" style={{fontSize:10}}>🚑 Sí</span> : <span className="badge badge-gray" style={{fontSize:10}}>No</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: INVENTARIO ── */}
      {activeTab === 'inventory' && (
        <div className="card">
          <div className="report-card-title" style={{ marginBottom: 16 }}>Stock vs Mínimo Requerido</div>
          <ResponsiveContainer width="100%" height={Math.max(300, inventory.length * 18)}>
            <BarChart data={inventory.map(i => ({ name: i.name.length>20?i.name.substring(0,18)+'…':i.name, actual:i.quantity, minimo:i.minStock }))} layout="vertical" barCategoryGap="20%">
              <XAxis type="number" tick={{ fill:'var(--white-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill:'var(--white-muted)', fontSize:10 }} axisLine={false} tickLine={false} width={150} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="actual" fill="#CC0000" name="Stock actual"  radius={[0,4,4,0]} />
              <Bar dataKey="minimo" fill="rgba(255,255,255,0.1)" name="Mínimo" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
