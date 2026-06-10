import React, { createContext, useContext, useState } from 'react';
import { addDays, subDays } from 'date-fns';

const AppContext = createContext(null);
const today = new Date();
const d = (n) => addDays(today, n);
const s = (n) => subDays(today, n);

// ── HELPERS ───────────────────────────────────────────────
const mkDate = (daysOffset) => {
  const dt = addDays(today, daysOffset);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
};

// ── 20 EVENTOS ────────────────────────────────────────────
export const MOCK_EVENTS = [
  { id: 1,  name: 'Concierto Rock en Grande',       client: 'Producciones XYZ',        venue: 'Foro Sol, CDMX',               date: d(5),   setupDate: d(4),   teardownDate: d(6),   expectedAttendance: 45000, status: 'confirmed', type: 'concert',  assignedPersonnel: [1,2,3],     notes: 'Requiere 2 ambulancias y equipo completo',            ambulances: 2 },
  { id: 2,  name: 'Partido Clásico Nacional',        client: 'Liga MX',                 venue: 'Estadio Azteca, CDMX',         date: d(12),  setupDate: d(12),  teardownDate: d(12),  expectedAttendance: 80000, status: 'confirmed', type: 'sports',   assignedPersonnel: [1,4,5],     notes: 'Evento de alto riesgo, coordinación con seguridad',   ambulances: 3 },
  { id: 3,  name: 'Foro Empresarial Tech',           client: 'Grupo Empresarial Norte', venue: 'Centro Banamex, CDMX',         date: s(3),   setupDate: s(4),   teardownDate: s(3),   expectedAttendance: 5000,  status: 'completed', type: 'forum',    assignedPersonnel: [2,3],       notes: 'Evento corporativo, riesgo bajo',                     ambulances: 1 },
  { id: 4,  name: 'Festival de Verano',              client: 'Eventos del Valle',        venue: 'Parque Bicentenario',          date: d(20),  setupDate: d(18),  teardownDate: d(22),  expectedAttendance: 15000, status: 'pending',   type: 'festival', assignedPersonnel: [],          notes: 'Pendiente de cotización y asignación',               ambulances: 1 },
  { id: 5,  name: 'Copa América Semifinal',          client: 'CONCACAF',                 venue: 'Estadio Universitario, MTY',   date: d(8),   setupDate: d(7),   teardownDate: d(9),   expectedAttendance: 42000, status: 'confirmed', type: 'sports',   assignedPersonnel: [1,3,4,5],   notes: 'Protocolo FIFA activo, 3 puntos médicos',            ambulances: 3 },
  { id: 6,  name: 'Festival Indie GDL',              client: 'Ocesa',                    venue: 'C3 Stage, Guadalajara',        date: d(15),  setupDate: d(14),  teardownDate: d(16),  expectedAttendance: 8000,  status: 'confirmed', type: 'concert',  assignedPersonnel: [2,4],       notes: 'Evento al aire libre, prever calor',                 ambulances: 1 },
  { id: 7,  name: 'Congreso Nacional de Medicina',   client: 'FEMEDE',                   venue: 'World Trade Center, CDMX',     date: s(10),  setupDate: s(11),  teardownDate: s(10),  expectedAttendance: 3500,  status: 'completed', type: 'forum',    assignedPersonnel: [1,2,5],     notes: 'Médicos en asistencia, riesgo muy bajo',             ambulances: 1 },
  { id: 8,  name: 'Gran Premio de la Ciudad',        client: 'Fórmula E México',         venue: 'Autodromo Hermanos Rodríguez', date: d(30),  setupDate: d(28),  teardownDate: d(31),  expectedAttendance: 55000, status: 'pending',   type: 'sports',   assignedPersonnel: [],          notes: 'Requiere coordinación con cuerpo de bomberos',       ambulances: 4 },
  { id: 9,  name: 'Concierto Pop Verano',            client: 'Live Nation',              venue: 'Palacio de los Deportes',      date: d(3),   setupDate: d(2),   teardownDate: d(4),   expectedAttendance: 20000, status: 'confirmed', type: 'concert',  assignedPersonnel: [2,3,5],     notes: 'Artista internacional, alta taquilla',               ambulances: 2 },
  { id: 10, name: 'Maratón CDMX 2026',              client: 'SEDESA CDMX',              venue: 'Circuito Centro Histórico',    date: d(25),  setupDate: d(25),  teardownDate: d(25),  expectedAttendance: 30000, status: 'confirmed', type: 'sports',   assignedPersonnel: [1,3,4],     notes: '42 km, 12 puntos de atención médica distribuidos',   ambulances: 5 },
  { id: 11, name: 'Festival Gastronómico',           client: 'Turismo CDMX',             venue: 'Bosque de Chapultepec',        date: s(20),  setupDate: s(21),  teardownDate: s(19),  expectedAttendance: 12000, status: 'completed', type: 'festival', assignedPersonnel: [2,4],       notes: 'Sin incidentes',                                     ambulances: 1 },
  { id: 12, name: 'Lucha Libre CMLL',               client: 'CMLL',                     venue: 'Arena México',                 date: s(5),   setupDate: s(5),   teardownDate: s(5),   expectedAttendance: 6500,  status: 'completed', type: 'sports',   assignedPersonnel: [3,5],       notes: 'Evento semanal, protocolo estándar',                ambulances: 1 },
  { id: 13, name: 'Expo Salud 2026',                client: 'IMSS',                     venue: 'Expo Guadalajara',             date: d(45),  setupDate: d(44),  teardownDate: d(47),  expectedAttendance: 7000,  status: 'pending',   type: 'forum',    assignedPersonnel: [],          notes: 'Feria de salud, alto riesgo lipotimias',             ambulances: 2 },
  { id: 14, name: 'Concierto Banda Regional',       client: 'Televicentro',             venue: 'Auditorio Nacional',           date: s(15),  setupDate: s(16),  teardownDate: s(15),  expectedAttendance: 10000, status: 'completed', type: 'concert',  assignedPersonnel: [1,2,3,4],   notes: 'Sin incidentes mayores',                             ambulances: 2 },
  { id: 15, name: 'Torneo de Boxeo',                client: 'Producciones Zanfer',      venue: 'Arena Ciudad de México',       date: d(10),  setupDate: d(10),  teardownDate: d(10),  expectedAttendance: 8000,  status: 'confirmed', type: 'sports',   assignedPersonnel: [1,3,5],     notes: 'Combate estelar, médico ringside obligatorio',      ambulances: 2 },
  { id: 16, name: 'Festival Rock 90s',              client: 'OCESA',                    venue: 'Foro Pegaso, Toluca',          date: d(18),  setupDate: d(17),  teardownDate: d(19),  expectedAttendance: 25000, status: 'confirmed', type: 'concert',  assignedPersonnel: [2,4,5],     notes: 'Headliners internacionales, montaje complejo',      ambulances: 2 },
  { id: 17, name: 'Cumbre Tajín',                   client: 'Gobierno Veracruz',        venue: 'Papantla, Veracruz',           date: d(35),  setupDate: d(33),  teardownDate: d(37),  expectedAttendance: 40000, status: 'pending',   type: 'festival', assignedPersonnel: [],          notes: 'Festival multicultural, 3 días, campamento médico',  ambulances: 3 },
  { id: 18, name: 'Liga MX Jornada 22',             client: 'Club América',             venue: 'Estadio Azteca',               date: s(2),   setupDate: s(2),   teardownDate: s(2),   expectedAttendance: 70000, status: 'completed', type: 'sports',   assignedPersonnel: [1,2,3,4,5], notes: 'Derby capitalino, máxima seguridad',                 ambulances: 4 },
  { id: 19, name: 'Concierto Sinfónico al Aire',    client: 'UNAM Cultura',             venue: 'Estadio Olímpico UNAM',        date: d(7),   setupDate: d(6),   teardownDate: d(7),   expectedAttendance: 18000, status: 'confirmed', type: 'concert',  assignedPersonnel: [3,5],       notes: 'Público familiar, riesgo bajo',                     ambulances: 1 },
  { id: 20, name: 'Foro de Innovación Empresarial', client: 'COPARMEX',                 venue: 'Camino Real Polanco',          date: s(7),   setupDate: s(8),   teardownDate: s(7),   expectedAttendance: 2000,  status: 'completed', type: 'forum',    assignedPersonnel: [2,5],       notes: 'Evento de bajo riesgo, concluido sin novedades',    ambulances: 1 },
];

// ── 20 PERSONAL ───────────────────────────────────────────
export const MOCK_PERSONNEL = [
  { id: 1,  name: 'Dr. Andrés López',         role: 'paramedic', license: 'PAR-001', phone: '55-1001-0001', email: 'alopez@qa.com',       status: 'available', certifications: ['ACLS','BLS','PHTLS'],               eventsCount: 47, avatar: 'AL' },
  { id: 2,  name: 'Enf. María Gutiérrez',     role: 'paramedic', license: 'PAR-002', phone: '55-1001-0002', email: 'mgutierrez@qa.com',   status: 'available', certifications: ['BLS','EMT'],                        eventsCount: 32, avatar: 'MG' },
  { id: 3,  name: 'Tec. Roberto Sánchez',     role: 'paramedic', license: 'PAR-003', phone: '55-1001-0003', email: 'rsanchez@qa.com',     status: 'assigned',  certifications: ['BLS','EMT','RCP Avanzado'],         eventsCount: 58, avatar: 'RS' },
  { id: 4,  name: 'Luis Peña',                role: 'pilot',     license: 'PIL-001', phone: '55-1001-0004', email: 'lpena@qa.com',        status: 'available', certifications: ['Ambulancias','Conducción Especial'], eventsCount: 74, avatar: 'LP' },
  { id: 5,  name: 'Jorge Vásquez',            role: 'pilot',     license: 'PIL-002', phone: '55-1001-0005', email: 'jvasquez@qa.com',     status: 'inactive',  certifications: ['Ambulancias'],                      eventsCount: 21, avatar: 'JV' },
  { id: 6,  name: 'Dra. Claudia Herrera',     role: 'paramedic', license: 'PAR-004', phone: '55-1001-0006', email: 'cherrera@qa.com',     status: 'available', certifications: ['ACLS','BLS','PHTLS','ATLS'],        eventsCount: 39, avatar: 'CH' },
  { id: 7,  name: 'Tec. Felipe Morales',      role: 'paramedic', license: 'PAR-005', phone: '55-1001-0007', email: 'fmorales@qa.com',     status: 'available', certifications: ['BLS','EMT'],                        eventsCount: 15, avatar: 'FM' },
  { id: 8,  name: 'Enf. Patricia Ríos',       role: 'paramedic', license: 'PAR-006', phone: '55-1001-0008', email: 'prios@qa.com',        status: 'assigned',  certifications: ['BLS','PHTLS'],                      eventsCount: 28, avatar: 'PR' },
  { id: 9,  name: 'Dr. Samuel Ortiz',         role: 'paramedic', license: 'PAR-007', phone: '55-1001-0009', email: 'sortiz@qa.com',       status: 'available', certifications: ['ACLS','BLS','RCP Avanzado'],        eventsCount: 33, avatar: 'SO' },
  { id: 10, name: 'Tec. Karen Salinas',       role: 'paramedic', license: 'PAR-008', phone: '55-1001-0010', email: 'ksalinas@qa.com',     status: 'available', certifications: ['BLS','EMT'],                        eventsCount: 11, avatar: 'KS' },
  { id: 11, name: 'Marco Reyes',              role: 'pilot',     license: 'PIL-003', phone: '55-1001-0011', email: 'mreyes@qa.com',       status: 'available', certifications: ['Ambulancias','Conducción Especial'], eventsCount: 55, avatar: 'MR' },
  { id: 12, name: 'Óscar Mendoza',            role: 'pilot',     license: 'PIL-004', phone: '55-1001-0012', email: 'omendoza@qa.com',     status: 'available', certifications: ['Ambulancias'],                      eventsCount: 43, avatar: 'OM' },
  { id: 13, name: 'Enf. Lucía Vargas',        role: 'paramedic', license: 'PAR-009', phone: '55-1001-0013', email: 'lvargas@qa.com',      status: 'available', certifications: ['BLS','EMT','Trauma'],               eventsCount: 22, avatar: 'LV' },
  { id: 14, name: 'Dr. Héctor Fuentes',       role: 'paramedic', license: 'PAR-010', phone: '55-1001-0014', email: 'hfuentes@qa.com',     status: 'assigned',  certifications: ['ACLS','BLS','PHTLS'],               eventsCount: 61, avatar: 'HF' },
  { id: 15, name: 'Tec. Daniela Castro',      role: 'paramedic', license: 'PAR-011', phone: '55-1001-0015', email: 'dcastro@qa.com',      status: 'available', certifications: ['BLS','RCP Básico'],                 eventsCount: 8,  avatar: 'DC' },
  { id: 16, name: 'Ramón Espinoza',           role: 'pilot',     license: 'PIL-005', phone: '55-1001-0016', email: 'respinoza@qa.com',    status: 'available', certifications: ['Ambulancias','Manejo Defensivo'],   eventsCount: 37, avatar: 'RE' },
  { id: 17, name: 'Enf. Adriana Leal',        role: 'paramedic', license: 'PAR-012', phone: '55-1001-0017', email: 'aleal@qa.com',        status: 'available', certifications: ['BLS','EMT','Pediatría'],            eventsCount: 19, avatar: 'AL2'},
  { id: 18, name: 'Dr. Iván Contreras',       role: 'paramedic', license: 'PAR-013', phone: '55-1001-0018', email: 'icontreras@qa.com',   status: 'inactive',  certifications: ['ACLS','BLS'],                       eventsCount: 44, avatar: 'IC' },
  { id: 19, name: 'Gerardo Núñez',            role: 'pilot',     license: 'PIL-006', phone: '55-1001-0019', email: 'gnunez@qa.com',       status: 'assigned',  certifications: ['Ambulancias','Conducción Especial'], eventsCount: 29, avatar: 'GN' },
  { id: 20, name: 'Tec. Sofía Delgado',       role: 'paramedic', license: 'PAR-014', phone: '55-1001-0020', email: 'sdelgado@qa.com',     status: 'available', certifications: ['BLS','EMT'],                        eventsCount: 6,  avatar: 'SD' },
];

// ── EMPRESAS COLABORADORAS ────────────────────────────────
export const MOCK_COMPANIES = [
  { id: 1, name: 'Toledo Seguridad',     rubro: 'seguridad',   contacto: 'gerencia@toledo.mx',     activo: true  },
  { id: 2, name: 'Assa Producciones',    rubro: 'produccion',  contacto: 'ops@assa.mx',            activo: true  },
  { id: 3, name: 'Blessure Audio',       rubro: 'tecnica',     contacto: 'info@blessure.mx',       activo: true  },
  { id: 4, name: 'Luces & Escena',       rubro: 'tecnica',     contacto: 'tech@lucesescena.mx',    activo: true  },
  { id: 5, name: 'Catering Premier',     rubro: 'catering',    contacto: 'pedidos@cateringp.mx',   activo: true  },
  { id: 6, name: 'StageSet Estructuras', rubro: 'construccion',contacto: 'obras@stageset.mx',      activo: true  },
  { id: 7, name: 'ProClean Servicios',   rubro: 'limpieza',    contacto: 'servicio@proclean.mx',   activo: true  },
  { id: 8, name: 'TransEvento',          rubro: 'transporte',  contacto: 'flota@transevento.mx',   activo: false },
];

// ── UNIDADES AMBULATORIAS ─────────────────────────────────
export const MOCK_UNITS = [
  { id: 1, nombre: 'Unidad QA-01', placa: 'QA-001-A', tipo: 'basica',   responsableId: 1, pilotos: [4],  activo: true  },
  { id: 2, nombre: 'Unidad QA-02', placa: 'QA-002-B', tipo: 'basica',   responsableId: 2, pilotos: [11], activo: true  },
  { id: 3, nombre: 'Unidad QA-03', placa: 'QA-003-C', tipo: 'avanzada', responsableId: 6, pilotos: [12], activo: true  },
  { id: 4, nombre: 'Unidad QA-04', placa: 'QA-004-D', tipo: 'avanzada', responsableId: 9, pilotos: [16], activo: true  },
  { id: 5, nombre: 'Bodega Central', placa: null,      tipo: 'bodega',   responsableId: null, pilotos: [], activo: true },
];

// ── INVENTARIO BODEGA GENERAL ─────────────────────────────
export const MOCK_INVENTORY = [
  { id: 1,  name: 'Desfibrilador DEA',           category: 'equipment', quantity: 4,   minStock: 2,  unit: 'pza',   status: 'ok',       lastReview: s(5),  reviewedBy: 'Dr. Andrés López',     notes: 'Batería al 90%' },
  { id: 2,  name: 'Camilla de tijera',            category: 'equipment', quantity: 6,   minStock: 4,  unit: 'pza',   status: 'ok',       lastReview: s(5),  reviewedBy: 'Tec. Roberto Sánchez', notes: '' },
  { id: 3,  name: 'Oxígeno medicinal (tank)',     category: 'equipment', quantity: 3,   minStock: 4,  unit: 'tank',  status: 'low',      lastReview: s(3),  reviewedBy: 'Enf. María Gutiérrez', notes: 'Solicitar recarga urgente' },
  { id: 4,  name: 'Collares cervicales (juego)',  category: 'equipment', quantity: 8,   minStock: 5,  unit: 'juego', status: 'ok',       lastReview: s(10), reviewedBy: 'Dr. Andrés López',     notes: 'Tallas S/M/L completas' },
  { id: 5,  name: 'Vendas elásticas 4"',          category: 'supplies',  quantity: 45,  minStock: 20, unit: 'pza',   status: 'ok',       lastReview: s(7),  reviewedBy: 'Tec. Felipe Morales',  notes: '' },
  { id: 6,  name: 'Guantes nitrilo M',            category: 'supplies',  quantity: 8,   minStock: 10, unit: 'caja',  status: 'low',      lastReview: s(3),  reviewedBy: 'Tec. Karen Salinas',   notes: 'Pedir 20 cajas' },
  { id: 7,  name: 'Solución Hartmann 500ml',      category: 'meds',      quantity: 24,  minStock: 15, unit: 'pza',   status: 'ok',       lastReview: s(7),  reviewedBy: 'Dr. Samuel Ortiz',     notes: '' },
  { id: 8,  name: 'Adrenalina 1mg/ml',            category: 'meds',      quantity: 6,   minStock: 10, unit: 'amp',   status: 'critical', lastReview: s(2),  reviewedBy: 'Dra. Claudia Herrera', notes: 'URGENTE reabastecer' },
  { id: 9,  name: 'Glucómetro + tiras',           category: 'equipment', quantity: 5,   minStock: 3,  unit: 'kit',   status: 'ok',       lastReview: s(8),  reviewedBy: 'Enf. Patricia Ríos',   notes: '200 tiras disponibles' },
  { id: 10, name: 'Oxímetro de pulso',            category: 'equipment', quantity: 12,  minStock: 6,  unit: 'pza',   status: 'ok',       lastReview: s(10), reviewedBy: 'Tec. Roberto Sánchez', notes: '' },
  { id: 11, name: 'Tensiómetro manual',           category: 'equipment', quantity: 8,   minStock: 4,  unit: 'pza',   status: 'ok',       lastReview: s(12), reviewedBy: 'Dr. Andrés López',     notes: 'Calibración pendiente 2 unidades' },
  { id: 12, name: 'Laringoscopio + palas',        category: 'equipment', quantity: 3,   minStock: 2,  unit: 'set',   status: 'ok',       lastReview: s(6),  reviewedBy: 'Dra. Claudia Herrera', notes: 'Pilas nuevas' },
  { id: 13, name: 'Mascarillas N95',              category: 'supplies',  quantity: 60,  minStock: 30, unit: 'pza',   status: 'ok',       lastReview: s(4),  reviewedBy: 'Enf. Lucía Vargas',    notes: '' },
  { id: 14, name: 'Jeringas 10ml',                category: 'supplies',  quantity: 150, minStock: 80, unit: 'pza',   status: 'ok',       lastReview: s(9),  reviewedBy: 'Tec. Felipe Morales',  notes: '' },
  { id: 15, name: 'Midazolam 5mg/ml',             category: 'meds',      quantity: 4,   minStock: 8,  unit: 'amp',   status: 'critical', lastReview: s(1),  reviewedBy: 'Dr. Héctor Fuentes',   notes: 'Control estupefacientes' },
  { id: 16, name: 'Morfina 10mg/ml',              category: 'meds',      quantity: 3,   minStock: 6,  unit: 'amp',   status: 'critical', lastReview: s(1),  reviewedBy: 'Dr. Héctor Fuentes',   notes: 'Control estupefacientes' },
  { id: 17, name: 'Sábanas desechables',          category: 'supplies',  quantity: 80,  minStock: 40, unit: 'pza',   status: 'ok',       lastReview: s(14), reviewedBy: 'Tec. Karen Salinas',   notes: '' },
  { id: 18, name: 'Tablero espinal largo',        category: 'equipment', quantity: 4,   minStock: 2,  unit: 'pza',   status: 'ok',       lastReview: s(20), reviewedBy: 'Tec. Roberto Sánchez', notes: 'Incluye correas y bloques' },
  { id: 19, name: 'Solución Glucosada 5% 500ml',  category: 'meds',      quantity: 18,  minStock: 12, unit: 'pza',   status: 'ok',       lastReview: s(7),  reviewedBy: 'Dr. Samuel Ortiz',     notes: '' },
  { id: 20, name: 'Kit de parto de emergencia',   category: 'equipment', quantity: 2,   minStock: 2,  unit: 'kit',   status: 'ok',       lastReview: s(30), reviewedBy: 'Dra. Claudia Herrera', notes: 'Revisar vencimiento insumos' },
];

// ── INVENTARIO POR UNIDAD ─────────────────────────────────
// { unitId, itemId, cantidadActual, cantidadRecibida, fechaRecepcion, firmadoPor }
export const MOCK_UNIT_INVENTORY = [
  // QA-01 (evento id:3 completado)
  { id: 1,  unitId: 1, itemId: 5,  cantidadRecibida: 10, cantidadActual: 7,  fechaRecepcion: s(4),  firmadoPor: 1 },
  { id: 2,  unitId: 1, itemId: 6,  cantidadRecibida: 2,  cantidadActual: 2,  fechaRecepcion: s(4),  firmadoPor: 1 },
  { id: 3,  unitId: 1, itemId: 7,  cantidadRecibida: 4,  cantidadActual: 3,  fechaRecepcion: s(4),  firmadoPor: 1 },
  { id: 4,  unitId: 1, itemId: 8,  cantidadRecibida: 2,  cantidadActual: 1,  fechaRecepcion: s(4),  firmadoPor: 1 },
  { id: 5,  unitId: 1, itemId: 13, cantidadRecibida: 20, cantidadActual: 18, fechaRecepcion: s(4),  firmadoPor: 1 },
  // QA-02
  { id: 6,  unitId: 2, itemId: 5,  cantidadRecibida: 8,  cantidadActual: 8,  fechaRecepcion: s(6),  firmadoPor: 2 },
  { id: 7,  unitId: 2, itemId: 7,  cantidadRecibida: 3,  cantidadActual: 3,  fechaRecepcion: s(6),  firmadoPor: 2 },
  { id: 8,  unitId: 2, itemId: 14, cantidadRecibida: 30, cantidadActual: 28, fechaRecepcion: s(6),  firmadoPor: 2 },
  // QA-03 activa para próximo evento
  { id: 9,  unitId: 3, itemId: 5,  cantidadRecibida: 12, cantidadActual: 12, fechaRecepcion: s(1),  firmadoPor: 6 },
  { id: 10, unitId: 3, itemId: 8,  cantidadRecibida: 3,  cantidadActual: 3,  fechaRecepcion: s(1),  firmadoPor: 6 },
  { id: 11, unitId: 3, itemId: 19, cantidadRecibida: 6,  cantidadActual: 6,  fechaRecepcion: s(1),  firmadoPor: 6 },
];

// ── DESPACHOS ─────────────────────────────────────────────
// Admin despacha artículos de bodega general a una unidad para un evento
export const MOCK_DESPACHOS = [
  {
    id: 1, unitId: 1, eventoId: 3, fechaSalida: s(4), fechaRegreso: s(3), estado: 'cerrado',
    firmadoPor: 1, firmaPiloto: 4,
    items: [
      { itemId: 5,  cantidadDespachada: 10 },
      { itemId: 6,  cantidadDespachada: 2  },
      { itemId: 7,  cantidadDespachada: 4  },
      { itemId: 8,  cantidadDespachada: 2  },
      { itemId: 13, cantidadDespachada: 20 },
    ],
  },
  {
    id: 2, unitId: 2, eventoId: 7, fechaSalida: s(11), fechaRegreso: s(10), estado: 'cerrado',
    firmadoPor: 2, firmaPiloto: 11,
    items: [
      { itemId: 5,  cantidadDespachada: 8  },
      { itemId: 7,  cantidadDespachada: 3  },
      { itemId: 14, cantidadDespachada: 30 },
    ],
  },
  {
    id: 3, unitId: 3, eventoId: 9, fechaSalida: d(2), fechaRegreso: null, estado: 'activo',
    firmadoPor: 6, firmaPiloto: 12,
    items: [
      { itemId: 5,  cantidadDespachada: 12 },
      { itemId: 8,  cantidadDespachada: 3  },
      { itemId: 19, cantidadDespachada: 6  },
    ],
  },
];

// ── MOVIMIENTOS DE STOCK ──────────────────────────────────
// Trazabilidad completa: entrada / salida / consumo-ficha / devolucion
export const MOCK_MOVIMIENTOS = [
  { id: 1,  tipo: 'despacho',      itemId: 5,  cantidad: 10, unitId: 1, eventoId: 3,  fichaId: null, fecha: s(4),  usuarioId: 1,  nota: 'Despacho evento Foro Tech' },
  { id: 2,  tipo: 'despacho',      itemId: 7,  cantidad: 4,  unitId: 1, eventoId: 3,  fichaId: null, fecha: s(4),  usuarioId: 1,  nota: 'Despacho evento Foro Tech' },
  { id: 3,  tipo: 'consumo',       itemId: 7,  cantidad: 1,  unitId: 1, eventoId: 3,  fichaId: 2,   fecha: s(3),  usuarioId: 1,  nota: 'Tx: hidratación IV paciente' },
  { id: 4,  tipo: 'consumo',       itemId: 8,  cantidad: 1,  unitId: 1, eventoId: 3,  fichaId: 6,   fecha: s(3),  usuarioId: 1,  nota: 'Tx: adrenalina reacción alérgica' },
  { id: 5,  tipo: 'consumo',       itemId: 5,  cantidad: 3,  unitId: 1, eventoId: 3,  fichaId: null,fecha: s(3),  usuarioId: 1,  nota: 'Consumo general vendas' },
  { id: 6,  tipo: 'devolucion',    itemId: 5,  cantidad: 7,  unitId: 1, eventoId: 3,  fichaId: null, fecha: s(3),  usuarioId: 1,  nota: 'Devolución a bodega general' },
  { id: 7,  tipo: 'despacho',      itemId: 14, cantidad: 30, unitId: 2, eventoId: 7,  fichaId: null, fecha: s(11), usuarioId: 1,  nota: 'Despacho Congreso Medicina' },
  { id: 8,  tipo: 'consumo',       itemId: 14, cantidad: 2,  unitId: 2, eventoId: 7,  fichaId: 13,  fecha: s(10), usuarioId: 2,  nota: 'Tx: jeringas lipotimia' },
  { id: 9,  tipo: 'entrada',       itemId: 8,  cantidad: 10, unitId: null, eventoId: null, fichaId: null, fecha: s(15), usuarioId: 1, nota: 'Compra adrenalina — factura #1482' },
  { id: 10, tipo: 'entrada',       itemId: 6,  cantidad: 20, unitId: null, eventoId: null, fichaId: null, fecha: s(8),  usuarioId: 1, nota: 'Compra guantes nitrilo' },
  { id: 11, tipo: 'despacho',      itemId: 5,  cantidad: 12, unitId: 3, eventoId: 9,  fichaId: null, fecha: s(1),  usuarioId: 1,  nota: 'Despacho Concierto Pop Verano' },
  { id: 12, tipo: 'despacho',      itemId: 8,  cantidad: 3,  unitId: 3, eventoId: 9,  fichaId: null, fecha: s(1),  usuarioId: 1,  nota: 'Despacho Concierto Pop Verano' },
];

// ── 16 FICHAS DE ATENCIÓN (con tipo paciente y empresa) ───
export const MOCK_PATIENTS = [
  { id: 1,  folio: 'QA-2026-001', eventId: 3,  eventName: 'Foro Empresarial Tech',       date: s(3),  patientType: 'attendee',      companyId: null, companyRole: null,           patientName: 'Anónimo', age: 34, gender: 'M', reason: 'Lipotimia',              vitals: { bp: '110/70',  hr: 88,  spo2: 97, temp: 36.5, rr: 16 }, treatment: 'Reposo, hidratación oral, observación 30 min',               consumedItems: [{itemId:5,cantidad:1}],                    transport: false, outcome: 'Alta en sitio',       attendedBy: 'Dr. Andrés López',     status: 'closed', unitId: 1 },
  { id: 2,  folio: 'QA-2026-002', eventId: 3,  eventName: 'Foro Empresarial Tech',       date: s(3),  patientType: 'collaborator',  companyId: 2,    companyRole: 'Coordinadora AV', patientName: 'Anónimo', age: 58, gender: 'F', reason: 'Crisis hipertensiva',    vitals: { bp: '180/110', hr: 95,  spo2: 96, temp: 36.8, rr: 20 }, treatment: 'Antihipertensivo, monitoreo continuo',                       consumedItems: [{itemId:7,cantidad:1},{itemId:14,cantidad:2}], transport: true,  outcome: 'Traslado a hospital', attendedBy: 'Dr. Andrés López',     status: 'closed', unitId: 1, transportUnit: 'QA-01', hospital: 'Hospital Ángeles' },
  { id: 3,  folio: 'QA-2026-003', eventId: 12, eventName: 'Lucha Libre CMLL',            date: s(5),  patientType: 'attendee',      companyId: null, companyRole: null,           patientName: 'Anónimo', age: 22, gender: 'M', reason: 'Traumatismo facial',     vitals: { bp: '125/80',  hr: 102, spo2: 98, temp: 36.2, rr: 18 }, treatment: 'Limpieza de herida, sutura 3 puntos, tétanos',               consumedItems: [{itemId:5,cantidad:2},{itemId:14,cantidad:1}], transport: false, outcome: 'Alta en sitio',       attendedBy: 'Tec. Roberto Sánchez', status: 'closed', unitId: 2 },
  { id: 4,  folio: 'QA-2026-004', eventId: 12, eventName: 'Lucha Libre CMLL',            date: s(5),  patientType: 'collaborator',  companyId: 1,    companyRole: 'Guardia de seguridad', patientName: 'Anónimo', age: 45, gender: 'F', reason: 'Esguince tobillo', vitals: { bp: '118/76',  hr: 78,  spo2: 99, temp: 36.4, rr: 14 }, treatment: 'Vendaje compresivo, hielo, elevación',                       consumedItems: [{itemId:5,cantidad:3}],                    transport: false, outcome: 'Alta en sitio',       attendedBy: 'Enf. María Gutiérrez', status: 'closed', unitId: 2 },
  { id: 5,  folio: 'QA-2026-005', eventId: 14, eventName: 'Concierto Banda Regional',    date: s(15), patientType: 'attendee',      companyId: null, companyRole: null,           patientName: 'Anónimo', age: 19, gender: 'M', reason: 'Intoxicación etílica',   vitals: { bp: '100/60',  hr: 115, spo2: 95, temp: 37.1, rr: 22 }, treatment: 'Hidratación IV, observación, glucosa',                       consumedItems: [{itemId:7,cantidad:1},{itemId:19,cantidad:1}], transport: false, outcome: 'Alta en sitio',       attendedBy: 'Dra. Claudia Herrera', status: 'closed', unitId: 1 },
  { id: 6,  folio: 'QA-2026-006', eventId: 14, eventName: 'Concierto Banda Regional',    date: s(15), patientType: 'collaborator',  companyId: 3,    companyRole: 'Técnico de sonido', patientName: 'Anónimo', age: 31, gender: 'F', reason: 'Reacción alérgica',  vitals: { bp: '105/65',  hr: 98,  spo2: 94, temp: 37.3, rr: 24 }, treatment: 'Adrenalina 0.3mg IM, antihistamínico, observación',          consumedItems: [{itemId:8,cantidad:1},{itemId:14,cantidad:2}], transport: true,  outcome: 'Traslado a hospital', attendedBy: 'Dr. Andrés López',     status: 'closed', unitId: 1, transportUnit: 'QA-01', hospital: 'Hospital General' },
  { id: 7,  folio: 'QA-2026-007', eventId: 18, eventName: 'Liga MX Jornada 22',          date: s(2),  patientType: 'attendee',      companyId: null, companyRole: null,           patientName: 'Anónimo', age: 55, gender: 'M', reason: 'Dolor torácico',         vitals: { bp: '155/95',  hr: 88,  spo2: 95, temp: 36.9, rr: 20 }, treatment: 'ECG, AAS 300mg, monitoreo, traslado urgente',                consumedItems: [{itemId:7,cantidad:1},{itemId:14,cantidad:3}], transport: true,  outcome: 'Traslado a hospital', attendedBy: 'Dr. Andrés López',     status: 'closed', unitId: 1, transportUnit: 'QA-01', hospital: 'Hospital Médica Sur' },
  { id: 8,  folio: 'QA-2026-008', eventId: 18, eventName: 'Liga MX Jornada 22',          date: s(2),  patientType: 'collaborator',  companyId: 1,    companyRole: 'Supervisor de acceso', patientName: 'Anónimo', age: 28, gender: 'M', reason: 'Contusión craneal', vitals: { bp: '130/85',  hr: 90,  spo2: 98, temp: 36.6, rr: 16 }, treatment: 'Inmovilización cervical, evaluación neurológica, traslado',  consumedItems: [{itemId:5,cantidad:2},{itemId:4,cantidad:1}], transport: true,  outcome: 'Traslado a hospital', attendedBy: 'Tec. Roberto Sánchez', status: 'closed', unitId: 3, transportUnit: 'QA-03', hospital: 'Hospital Ángeles' },
  { id: 9,  folio: 'QA-2026-009', eventId: 18, eventName: 'Liga MX Jornada 22',          date: s(2),  patientType: 'attendee',      companyId: null, companyRole: null,           patientName: 'Anónimo', age: 16, gender: 'M', reason: 'Lipotimia',              vitals: { bp: '95/60',   hr: 72,  spo2: 98, temp: 36.3, rr: 14 }, treatment: 'Posición Trendelenburg, hidratación oral',                   consumedItems: [{itemId:5,cantidad:1}],                    transport: false, outcome: 'Alta en sitio',       attendedBy: 'Enf. María Gutiérrez', status: 'closed', unitId: 2 },
  { id: 10, folio: 'QA-2026-010', eventId: 18, eventName: 'Liga MX Jornada 22',          date: s(2),  patientType: 'collaborator',  companyId: 1,    companyRole: 'Auxiliar seguridad', patientName: 'Anónimo', age: 42, gender: 'F', reason: 'Aplastamiento leve',  vitals: { bp: '120/80',  hr: 88,  spo2: 99, temp: 36.5, rr: 16 }, treatment: 'Evaluación de extremidades, vendaje, alta',                  consumedItems: [{itemId:5,cantidad:2}],                    transport: false, outcome: 'Alta en sitio',       attendedBy: 'Dr. Samuel Ortiz',     status: 'closed', unitId: 2 },
  { id: 11, folio: 'QA-2026-011', eventId: 11, eventName: 'Festival Gastronómico',       date: s(20), patientType: 'attendee',      companyId: null, companyRole: null,           patientName: 'Anónimo', age: 67, gender: 'M', reason: 'Hiperglucemia',          vitals: { bp: '140/90',  hr: 82,  spo2: 97, temp: 36.7, rr: 18 }, treatment: 'Glucómetro, hidratación, ajuste insulina, alta',             consumedItems: [{itemId:9,cantidad:1}],                    transport: false, outcome: 'Alta en sitio',       attendedBy: 'Dra. Claudia Herrera', status: 'closed', unitId: 1 },
  { id: 12, folio: 'QA-2026-012', eventId: 11, eventName: 'Festival Gastronómico',       date: s(20), patientType: 'collaborator',  companyId: 5,    companyRole: 'Cocinero', patientName: 'Anónimo', age: 8, gender: 'M', reason: 'Quemadura leve mano',      vitals: { bp: '100/65',  hr: 105, spo2: 99, temp: 36.4, rr: 22 }, treatment: 'Enfriamiento con agua fría, apósito estéril',                consumedItems: [{itemId:5,cantidad:2},{itemId:13,cantidad:1}],transport: false, outcome: 'Alta en sitio',       attendedBy: 'Enf. Patricia Ríos',   status: 'closed', unitId: 1 },
  { id: 13, folio: 'QA-2026-013', eventId: 20, eventName: 'Foro de Innovación',          date: s(7),  patientType: 'attendee',      companyId: null, companyRole: null,           patientName: 'Anónimo', age: 51, gender: 'F', reason: 'Lipotimia',              vitals: { bp: '108/68',  hr: 76,  spo2: 98, temp: 36.6, rr: 16 }, treatment: 'Reposo, hidratación oral',                                   consumedItems: [],                                         transport: false, outcome: 'Alta en sitio',       attendedBy: 'Enf. Lucía Vargas',    status: 'closed', unitId: 2 },
  { id: 14, folio: 'QA-2026-014', eventId: 7,  eventName: 'Congreso Medicina',           date: s(10), patientType: 'attendee',      companyId: null, companyRole: null,           patientName: 'Anónimo', age: 72, gender: 'M', reason: 'Mareo y náuseas',        vitals: { bp: '135/88',  hr: 70,  spo2: 96, temp: 36.9, rr: 18 }, treatment: 'Antieméticos, hidratación, observación 1h',                  consumedItems: [{itemId:7,cantidad:1}],                    transport: false, outcome: 'Alta en sitio',       attendedBy: 'Dr. Héctor Fuentes',   status: 'closed', unitId: 2 },
  { id: 15, folio: 'QA-2026-015', eventId: 9,  eventName: 'Concierto Pop Verano',        date: d(3),  patientType: 'attendee',      companyId: null, companyRole: null,           patientName: 'Anónimo', age: 25, gender: 'F', reason: 'Contusión pie',          vitals: { bp: '118/74',  hr: 84,  spo2: 99, temp: 36.3, rr: 15 }, treatment: 'Radiografía descartada, vendaje, muletas',                   consumedItems: [{itemId:5,cantidad:2}],                    transport: false, outcome: 'Alta en sitio',       attendedBy: 'Tec. Felipe Morales',  status: 'open',   unitId: 3 },
  { id: 16, folio: 'QA-2026-016', eventId: 9,  eventName: 'Concierto Pop Verano',        date: d(3),  patientType: 'collaborator',  companyId: 3,    companyRole: 'Técnico iluminación', patientName: 'Anónimo', age: 33, gender: 'M', reason: 'Ansiedad / pánico', vitals: { bp: '145/92',  hr: 120, spo2: 98, temp: 36.8, rr: 26 }, treatment: 'Respiración guiada, lorazepam 1mg VO, observación',          consumedItems: [],                                         transport: false, outcome: 'Alta en sitio',       attendedBy: 'Dr. Samuel Ortiz',     status: 'open',   unitId: 3 },
];

// ── DISPONIBILIDAD ────────────────────────────────────────
export const MOCK_AVAIL_DATA = {
  [mkDate(1)]:  { 1: { type: 'full' }, 4: { type: 'shift', shifts: ['morning','afternoon'] } },
  [mkDate(2)]:  { 2: { type: 'shift', shifts: ['morning'] }, 14: { type: 'full' } },
  [mkDate(3)]:  { 1: { type: 'full' }, 3: { type: 'shift', shifts: ['afternoon','night'] } },
  [mkDate(5)]:  { 1: { type: 'full' }, 2: { type: 'full' }, 4: { type: 'full' }, 11: { type: 'full' } },
  [mkDate(7)]:  { 3: { type: 'range', from: '08:00', to: '18:00' }, 12: { type: 'full' } },
  [mkDate(8)]:  { 1: { type: 'full' }, 4: { type: 'full' }, 6: { type: 'shift', shifts: ['morning'] }, 3: { type: 'full' }, 11: { type: 'full' } },
  [mkDate(10)]: { 2: { type: 'shift', shifts: ['afternoon','night'] }, 7: { type: 'full' }, 12: { type: 'full' } },
  [mkDate(12)]: { 1: { type: 'full' }, 4: { type: 'full' }, 8: { type: 'full' }, 3: { type: 'full' }, 11: { type: 'full' } },
  [mkDate(14)]: { 2: { type: 'range', from: '07:00', to: '15:00' }, 9: { type: 'full' } },
  [mkDate(15)]: { 1: { type: 'full' }, 4: { type: 'full' }, 13: { type: 'shift', shifts: ['morning','afternoon'] } },
  [mkDate(17)]: { 2: { type: 'full' }, 6: { type: 'full' }, 14: { type: 'shift', shifts: ['night'] }, 3: { type: 'full' } },
  [mkDate(18)]: { 1: { type: 'full' }, 4: { type: 'full' }, 7: { type: 'full' }, 11: { type: 'full' } },
  [mkDate(20)]: { 2: { type: 'full' }, 8: { type: 'full' }, 12: { type: 'full' } },
  [mkDate(22)]: { 1: { type: 'range', from: '09:00', to: '21:00' }, 4: { type: 'full' }, 3: { type: 'full' } },
  [mkDate(25)]: { 1: { type: 'full' }, 2: { type: 'full' }, 4: { type: 'full' }, 6: { type: 'full' }, 3: { type: 'full' }, 11: { type: 'full' } },
  [mkDate(30)]: { 2: { type: 'full' }, 8: { type: 'full' }, 11: { type: 'full' }, 12: { type: 'full' } },
};

// ── PROVIDER ──────────────────────────────────────────────
export function AppProvider({ children }) {
  const [events,         setEvents]         = useState(MOCK_EVENTS);
  const [personnel,      setPersonnel]       = useState(MOCK_PERSONNEL);
  const [patients,       setPatients]        = useState(MOCK_PATIENTS);
  const [inventory,      setInventory]       = useState(MOCK_INVENTORY);
  const [availData,      setAvailData]       = useState(MOCK_AVAIL_DATA);
  const [companies,      setCompanies]       = useState(MOCK_COMPANIES);
  const [units,          setUnits]           = useState(MOCK_UNITS);
  const [unitInventory,  setUnitInventory]   = useState(MOCK_UNIT_INVENTORY);
  const [despachos,      setDespachos]       = useState(MOCK_DESPACHOS);
  const [movimientos,    setMovimientos]     = useState(MOCK_MOVIMIENTOS);

  // ── Eventos ──────────────────────────────────────────
  const addEvent    = (ev) => setEvents(p => [...p, { ...ev, id: Date.now() }]);
  const updateEvent = (id, data) => setEvents(p => p.map(e => e.id === id ? { ...e, ...data } : e));

  // ── Pacientes ─────────────────────────────────────────
  const addPatient = (patient) => {
    const folio = `QA-2026-${String(patients.length + 1).padStart(3, '0')}`;
    const newPatient = { ...patient, id: Date.now(), folio };
    setPatients(p => [...p, newPatient]);
    // Registrar movimientos de consumo automáticamente
    if (patient.consumedItems?.length && patient.unitId) {
      const nuevosMovs = patient.consumedItems
        .filter(ci => ci.cantidad > 0)
        .map((ci, i) => ({
          id: Date.now() + i,
          tipo: 'consumo',
          itemId: ci.itemId,
          cantidad: ci.cantidad,
          unitId: patient.unitId,
          eventoId: patient.eventId,
          fichaId: newPatient.id,
          fecha: new Date(),
          usuarioId: null,
          nota: `Consumo en atención ${folio}`,
        }));
      setMovimientos(p => [...p, ...nuevosMovs]);
      // Descontar del inventario de unidad
      setUnitInventory(p => p.map(ui => {
        const consumo = patient.consumedItems.find(ci => ci.itemId === ui.itemId && ui.unitId === patient.unitId);
        if (!consumo) return ui;
        return { ...ui, cantidadActual: Math.max(0, ui.cantidadActual - consumo.cantidad) };
      }));
    }
    return newPatient;
  };

  // ── Inventario bodega general ─────────────────────────
  const updateInventory = (id, data) => setInventory(p => p.map(i => i.id === id ? { ...i, ...data } : i));
  const addInventoryItem = (item) => setInventory(p => [...p, { ...item, id: Date.now() }]);

  // ── Despachos ─────────────────────────────────────────
  const crearDespacho = (despacho) => {
    const nuevo = { ...despacho, id: Date.now(), estado: 'activo' };
    setDespachos(p => [...p, nuevo]);
    // Crear inventario en la unidad
    const nuevosUnitItems = despacho.items.map((item, i) => ({
      id: Date.now() + i,
      unitId: despacho.unitId,
      itemId: item.itemId,
      cantidadRecibida: item.cantidadDespachada,
      cantidadActual: item.cantidadDespachada,
      fechaRecepcion: despacho.fechaSalida,
      firmadoPor: despacho.firmadoPor,
    }));
    setUnitInventory(p => [...p, ...nuevosUnitItems]);
    // Registrar movimientos de despacho
    const nuevosMovs = despacho.items.map((item, i) => ({
      id: Date.now() + 100 + i,
      tipo: 'despacho',
      itemId: item.itemId,
      cantidad: item.cantidadDespachada,
      unitId: despacho.unitId,
      eventoId: despacho.eventoId,
      fichaId: null,
      fecha: despacho.fechaSalida,
      usuarioId: despacho.firmadoPor,
      nota: `Despacho a ${units.find(u => u.id === despacho.unitId)?.nombre}`,
    }));
    setMovimientos(p => [...p, ...nuevosMovs]);
  };

  const cerrarDespacho = (despachoId) => {
    setDespachos(p => p.map(d => d.id === despachoId ? { ...d, estado: 'cerrado', fechaRegreso: new Date() } : d));
  };

  // ── Empresas ──────────────────────────────────────────
  const addCompany    = (c) => setCompanies(p => [...p, { ...c, id: Date.now() }]);
  const updateCompany = (id, data) => setCompanies(p => p.map(c => c.id === id ? { ...c, ...data } : c));

  // ── Unidades ──────────────────────────────────────────
  const addUnit    = (u) => setUnits(p => [...p, { ...u, id: Date.now() }]);
  const updateUnit = (id, data) => setUnits(p => p.map(u => u.id === id ? { ...u, ...data } : u));

  return (
    <AppContext.Provider value={{
      // Datos existentes
      events, setEvents, addEvent, updateEvent,
      personnel, setPersonnel,
      patients, setPatients, addPatient,
      inventory, setInventory, updateInventory, addInventoryItem,
      availData, setAvailData,
      // Nuevos
      companies, setCompanies, addCompany, updateCompany,
      units, setUnits, addUnit, updateUnit,
      unitInventory, setUnitInventory,
      despachos, setDespachos, crearDespacho, cerrarDespacho,
      movimientos, setMovimientos,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
