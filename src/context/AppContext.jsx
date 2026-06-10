import React, { createContext, useContext, useState } from 'react';
import { addDays, subDays } from 'date-fns';

const AppContext = createContext(null);
const today = new Date();
const d = (n) => addDays(today, n);
const s = (n) => subDays(today, n);

// ── 20 EVENTOS ────────────────────────────────────────────
export const MOCK_EVENTS = [
  { id: 1,  name: 'Concierto Rock en Grande',      client: 'Producciones XYZ',         venue: 'Foro Sol, CDMX',              date: d(5),   setupDate: d(4),   teardownDate: d(6),   expectedAttendance: 45000, status: 'confirmed', type: 'concert',  assignedPersonnel: [1,2,3],    notes: 'Requiere 2 ambulancias y equipo completo',           ambulances: 2 },
  { id: 2,  name: 'Partido Clásico Nacional',       client: 'Liga MX',                  venue: 'Estadio Azteca, CDMX',        date: d(12),  setupDate: d(12),  teardownDate: d(12),  expectedAttendance: 80000, status: 'confirmed', type: 'sports',   assignedPersonnel: [1,4,5],    notes: 'Evento de alto riesgo, coordinación con seguridad',  ambulances: 3 },
  { id: 3,  name: 'Foro Empresarial Tech',          client: 'Grupo Empresarial Norte',  venue: 'Centro Banamex, CDMX',        date: s(3),   setupDate: s(4),   teardownDate: s(3),   expectedAttendance: 5000,  status: 'completed', type: 'forum',    assignedPersonnel: [2,3],      notes: 'Evento corporativo, riesgo bajo',                    ambulances: 1 },
  { id: 4,  name: 'Festival de Verano',             client: 'Eventos del Valle',         venue: 'Parque Bicentenario',         date: d(20),  setupDate: d(18),  teardownDate: d(22),  expectedAttendance: 15000, status: 'pending',   type: 'festival', assignedPersonnel: [],         notes: 'Pendiente de cotización y asignación',              ambulances: 1 },
  { id: 5,  name: 'Copa América Semifinal',         client: 'CONCACAF',                  venue: 'Estadio Universitario, MTY',  date: d(8),   setupDate: d(7),   teardownDate: d(9),   expectedAttendance: 42000, status: 'confirmed', type: 'sports',   assignedPersonnel: [1,3,4,5],  notes: 'Protocolo FIFA activo, 3 puntos médicos',           ambulances: 3 },
  { id: 6,  name: 'Festival Indie GDL',             client: 'Ocesa',                     venue: 'C3 Stage, Guadalajara',       date: d(15),  setupDate: d(14),  teardownDate: d(16),  expectedAttendance: 8000,  status: 'confirmed', type: 'concert',  assignedPersonnel: [2,4],      notes: 'Evento al aire libre, prever calor',                ambulances: 1 },
  { id: 7,  name: 'Congreso Nacional de Medicina',  client: 'FEMEDE',                    venue: 'World Trade Center, CDMX',    date: s(10),  setupDate: s(11),  teardownDate: s(10),  expectedAttendance: 3500,  status: 'completed', type: 'forum',    assignedPersonnel: [1,2,5],    notes: 'Médicos en asistencia, riesgo muy bajo',            ambulances: 1 },
  { id: 8,  name: 'Gran Premio de la Ciudad',       client: 'Fórmula E México',          venue: 'Autodromo Hermanos Rodríguez',date: d(30),  setupDate: d(28),  teardownDate: d(31),  expectedAttendance: 55000, status: 'pending',   type: 'sports',   assignedPersonnel: [],         notes: 'Requiere coordinación con cuerpo de bomberos',      ambulances: 4 },
  { id: 9,  name: 'Concierto Pop Verano',           client: 'Live Nation',               venue: 'Palacio de los Deportes',     date: d(3),   setupDate: d(2),   teardownDate: d(4),   expectedAttendance: 20000, status: 'confirmed', type: 'concert',  assignedPersonnel: [2,3,5],    notes: 'Artista internacional, alta taquilla',              ambulances: 2 },
  { id: 10, name: 'Maratón CDMX 2026',             client: 'SEDESA CDMX',               venue: 'Circuito Centro Histórico',   date: d(25),  setupDate: d(25),  teardownDate: d(25),  expectedAttendance: 30000, status: 'confirmed', type: 'sports',   assignedPersonnel: [1,3,4],    notes: '42 km, 12 puntos de atención médica distribuidos',  ambulances: 5 },
  { id: 11, name: 'Festival Gastronómico',          client: 'Turismo CDMX',              venue: 'Bosque de Chapultepec',       date: s(20),  setupDate: s(21),  teardownDate: s(19),  expectedAttendance: 12000, status: 'completed', type: 'festival', assignedPersonnel: [2,4],      notes: 'Sin incidentes',                                    ambulances: 1 },
  { id: 12, name: 'Lucha Libre CMLL',              client: 'CMLL',                      venue: 'Arena México',                date: s(5),   setupDate: s(5),   teardownDate: s(5),   expectedAttendance: 6500,  status: 'completed', type: 'sports',   assignedPersonnel: [3,5],      notes: 'Evento semanal, protocolo estándar',               ambulances: 1 },
  { id: 13, name: 'Expo Salud 2026',               client: 'IMSS',                      venue: 'Expo Guadalajara',            date: d(45),  setupDate: d(44),  teardownDate: d(47),  expectedAttendance: 7000,  status: 'pending',   type: 'forum',    assignedPersonnel: [],         notes: 'Feria de salud, paradójicamente alto riesgo lipotimias',ambulances: 2 },
  { id: 14, name: 'Concierto Banda Regional',      client: 'Televicentro',              venue: 'Auditorio Nacional',          date: s(15),  setupDate: s(16),  teardownDate: s(15),  expectedAttendance: 10000, status: 'completed', type: 'concert',  assignedPersonnel: [1,2,3,4],  notes: 'Sin incidentes mayores',                            ambulances: 2 },
  { id: 15, name: 'Torneo de Boxeo',               client: 'Producciones Zanfer',       venue: 'Arena Ciudad de México',      date: d(10),  setupDate: d(10),  teardownDate: d(10),  expectedAttendance: 8000,  status: 'confirmed', type: 'sports',   assignedPersonnel: [1,3,5],    notes: 'Combate estelar, médico ringside obligatorio',     ambulances: 2 },
  { id: 16, name: 'Festival Rock 90s',             client: 'OCESA',                     venue: 'Foro Pegaso, Toluca',         date: d(18),  setupDate: d(17),  teardownDate: d(19),  expectedAttendance: 25000, status: 'confirmed', type: 'concert',  assignedPersonnel: [2,4,5],    notes: 'Headliners internacionales, montaje complejo',     ambulances: 2 },
  { id: 17, name: 'Cumbre Tajín',                  client: 'Gobierno Veracruz',         venue: 'Papantla, Veracruz',          date: d(35),  setupDate: d(33),  teardownDate: d(37),  expectedAttendance: 40000, status: 'pending',   type: 'festival', assignedPersonnel: [],         notes: 'Festival multicultural, 3 días, campamento médico', ambulances: 3 },
  { id: 18, name: 'Liga MX Jornada 22',            client: 'Club América',              venue: 'Estadio Azteca',              date: s(2),   setupDate: s(2),   teardownDate: s(2),   expectedAttendance: 70000, status: 'completed', type: 'sports',   assignedPersonnel: [1,2,3,4,5],notes: 'Derby capitalino, máxima seguridad',               ambulances: 4 },
  { id: 19, name: 'Concierto Sinfónico al Aire',   client: 'UNAM Cultura',              venue: 'Estadio Olímpico UNAM',       date: d(7),   setupDate: d(6),   teardownDate: d(7),   expectedAttendance: 18000, status: 'confirmed', type: 'concert',  assignedPersonnel: [3,5],      notes: 'Público familiar, riesgo bajo',                    ambulances: 1 },
  { id: 20, name: 'Foro de Innovación Empresarial',client: 'COPARMEX',                  venue: 'Camino Real Polanco',         date: s(7),   setupDate: s(8),   teardownDate: s(7),   expectedAttendance: 2000,  status: 'completed', type: 'forum',    assignedPersonnel: [2,5],      notes: 'Evento de bajo riesgo, concluido sin novedades',   ambulances: 1 },
];

// ── 20 PERSONAL ───────────────────────────────────────────
export const MOCK_PERSONNEL = [
  { id: 1,  name: 'Dr. Andrés López',         role: 'paramedic', license: 'PAR-001', phone: '55-1001-0001', email: 'alopez@qa.com',       status: 'available', certifications: ['ACLS','BLS','PHTLS'],              eventsCount: 47, avatar: 'AL' },
  { id: 2,  name: 'Enf. María Gutiérrez',     role: 'paramedic', license: 'PAR-002', phone: '55-1001-0002', email: 'mgutierrez@qa.com',   status: 'available', certifications: ['BLS','EMT'],                       eventsCount: 32, avatar: 'MG' },
  { id: 3,  name: 'Tec. Roberto Sánchez',     role: 'paramedic', license: 'PAR-003', phone: '55-1001-0003', email: 'rsanchez@qa.com',     status: 'assigned',  certifications: ['BLS','EMT','RCP Avanzado'],        eventsCount: 58, avatar: 'RS' },
  { id: 4,  name: 'Luis Peña',                role: 'pilot',     license: 'PIL-001', phone: '55-1001-0004', email: 'lpena@qa.com',        status: 'available', certifications: ['Ambulancias','Conducción Especial'],eventsCount: 74, avatar: 'LP' },
  { id: 5,  name: 'Jorge Vásquez',            role: 'pilot',     license: 'PIL-002', phone: '55-1001-0005', email: 'jvasquez@qa.com',     status: 'inactive',  certifications: ['Ambulancias'],                     eventsCount: 21, avatar: 'JV' },
  { id: 6,  name: 'Dra. Claudia Herrera',     role: 'paramedic', license: 'PAR-004', phone: '55-1001-0006', email: 'cherrera@qa.com',     status: 'available', certifications: ['ACLS','BLS','PHTLS','ATLS'],       eventsCount: 39, avatar: 'CH' },
  { id: 7,  name: 'Tec. Felipe Morales',      role: 'paramedic', license: 'PAR-005', phone: '55-1001-0007', email: 'fmorales@qa.com',     status: 'available', certifications: ['BLS','EMT'],                       eventsCount: 15, avatar: 'FM' },
  { id: 8,  name: 'Enf. Patricia Ríos',       role: 'paramedic', license: 'PAR-006', phone: '55-1001-0008', email: 'prios@qa.com',        status: 'assigned',  certifications: ['BLS','PHTLS'],                     eventsCount: 28, avatar: 'PR' },
  { id: 9,  name: 'Dr. Samuel Ortiz',         role: 'paramedic', license: 'PAR-007', phone: '55-1001-0009', email: 'sortiz@qa.com',       status: 'available', certifications: ['ACLS','BLS','RCP Avanzado'],       eventsCount: 33, avatar: 'SO' },
  { id: 10, name: 'Tec. Karen Salinas',       role: 'paramedic', license: 'PAR-008', phone: '55-1001-0010', email: 'ksalinas@qa.com',     status: 'available', certifications: ['BLS','EMT'],                       eventsCount: 11, avatar: 'KS' },
  { id: 11, name: 'Marco Reyes',              role: 'pilot',     license: 'PIL-003', phone: '55-1001-0011', email: 'mreyes@qa.com',       status: 'available', certifications: ['Ambulancias','Conducción Especial'],eventsCount: 55, avatar: 'MR' },
  { id: 12, name: 'Óscar Mendoza',            role: 'pilot',     license: 'PIL-004', phone: '55-1001-0012', email: 'omendoza@qa.com',     status: 'available', certifications: ['Ambulancias'],                     eventsCount: 43, avatar: 'OM' },
  { id: 13, name: 'Enf. Lucía Vargas',        role: 'paramedic', license: 'PAR-009', phone: '55-1001-0013', email: 'lvargas@qa.com',      status: 'available', certifications: ['BLS','EMT','Trauma'],              eventsCount: 22, avatar: 'LV' },
  { id: 14, name: 'Dr. Héctor Fuentes',       role: 'paramedic', license: 'PAR-010', phone: '55-1001-0014', email: 'hfuentes@qa.com',     status: 'assigned',  certifications: ['ACLS','BLS','PHTLS'],              eventsCount: 61, avatar: 'HF' },
  { id: 15, name: 'Tec. Daniela Castro',      role: 'paramedic', license: 'PAR-011', phone: '55-1001-0015', email: 'dcastro@qa.com',      status: 'available', certifications: ['BLS','RCP Básico'],                eventsCount: 8,  avatar: 'DC' },
  { id: 16, name: 'Ramón Espinoza',           role: 'pilot',     license: 'PIL-005', phone: '55-1001-0016', email: 'respinoza@qa.com',    status: 'available', certifications: ['Ambulancias','Manejo Defensivo'],  eventsCount: 37, avatar: 'RE' },
  { id: 17, name: 'Enf. Adriana Leal',        role: 'paramedic', license: 'PAR-012', phone: '55-1001-0017', email: 'aleal@qa.com',        status: 'available', certifications: ['BLS','EMT','Pediatría'],           eventsCount: 19, avatar: 'AL2'},
  { id: 18, name: 'Dr. Iván Contreras',       role: 'paramedic', license: 'PAR-013', phone: '55-1001-0018', email: 'icontreras@qa.com',   status: 'inactive',  certifications: ['ACLS','BLS'],                      eventsCount: 44, avatar: 'IC' },
  { id: 19, name: 'Gerardo Núñez',            role: 'pilot',     license: 'PIL-006', phone: '55-1001-0019', email: 'gnunez@qa.com',       status: 'assigned',  certifications: ['Ambulancias','Conducción Especial'],eventsCount: 29, avatar: 'GN' },
  { id: 20, name: 'Tec. Sofía Delgado',       role: 'paramedic', license: 'PAR-014', phone: '55-1001-0020', email: 'sdelgado@qa.com',     status: 'available', certifications: ['BLS','EMT'],                       eventsCount: 6,  avatar: 'SD' },
];

// ── 20 FICHAS DE ATENCIÓN ─────────────────────────────────
export const MOCK_PATIENTS = [
  { id: 1,  folio: 'QA-2026-001', eventId: 3,  eventName: 'Foro Empresarial Tech',       date: s(3),  patientName: 'Anónimo', age: 34, gender: 'M', reason: 'Lipotimia',             vitals: { bp: '110/70',  hr: 88,  spo2: 97, temp: 36.5, rr: 16 }, treatment: 'Reposo, hidratación oral, observación 30 min',               transport: false, outcome: 'Alta en sitio',         attendedBy: 'Dr. Andrés López',     status: 'closed' },
  { id: 2,  folio: 'QA-2026-002', eventId: 3,  eventName: 'Foro Empresarial Tech',       date: s(3),  patientName: 'Anónimo', age: 58, gender: 'F', reason: 'Crisis hipertensiva',   vitals: { bp: '180/110', hr: 95,  spo2: 96, temp: 36.8, rr: 20 }, treatment: 'Antihipertensivo, monitoreo continuo',                       transport: true,  outcome: 'Traslado a hospital',   attendedBy: 'Dr. Andrés López',     status: 'closed',  transportUnit: 'QA-01', hospital: 'Hospital Ángeles' },
  { id: 3,  folio: 'QA-2026-003', eventId: 12, eventName: 'Lucha Libre CMLL',            date: s(5),  patientName: 'Anónimo', age: 22, gender: 'M', reason: 'Traumatismo facial',    vitals: { bp: '125/80',  hr: 102, spo2: 98, temp: 36.2, rr: 18 }, treatment: 'Limpieza de herida, sutura 3 puntos, tetanos',               transport: false, outcome: 'Alta en sitio',         attendedBy: 'Tec. Roberto Sánchez', status: 'closed' },
  { id: 4,  folio: 'QA-2026-004', eventId: 12, eventName: 'Lucha Libre CMLL',            date: s(5),  patientName: 'Anónimo', age: 45, gender: 'F', reason: 'Esguince tobillo',      vitals: { bp: '118/76',  hr: 78,  spo2: 99, temp: 36.4, rr: 14 }, treatment: 'Vendaje compresivo, hielo, elevación',                       transport: false, outcome: 'Alta en sitio',         attendedBy: 'Enf. María Gutiérrez', status: 'closed' },
  { id: 5,  folio: 'QA-2026-005', eventId: 14, eventName: 'Concierto Banda Regional',    date: s(15), patientName: 'Anónimo', age: 19, gender: 'M', reason: 'Intoxicación etílica', vitals: { bp: '100/60',  hr: 115, spo2: 95, temp: 37.1, rr: 22 }, treatment: 'Hidratación IV, observación, glucosa',                       transport: false, outcome: 'Alta en sitio',         attendedBy: 'Dra. Claudia Herrera', status: 'closed' },
  { id: 6,  folio: 'QA-2026-006', eventId: 14, eventName: 'Concierto Banda Regional',    date: s(15), patientName: 'Anónimo', age: 31, gender: 'F', reason: 'Reacción alérgica',    vitals: { bp: '105/65',  hr: 98,  spo2: 94, temp: 37.3, rr: 24 }, treatment: 'Adrenalina 0.3mg IM, antihistamínico, observación',          transport: true,  outcome: 'Traslado a hospital',   attendedBy: 'Dr. Andrés López',     status: 'closed',  transportUnit: 'QA-02', hospital: 'Hospital General' },
  { id: 7,  folio: 'QA-2026-007', eventId: 18, eventName: 'Liga MX Jornada 22',          date: s(2),  patientName: 'Anónimo', age: 55, gender: 'M', reason: 'Dolor torácico',       vitals: { bp: '155/95',  hr: 88,  spo2: 95, temp: 36.9, rr: 20 }, treatment: 'ECG, AAS 300mg, monitoreo, traslado urgente',                transport: true,  outcome: 'Traslado a hospital',   attendedBy: 'Dr. Andrés López',     status: 'closed',  transportUnit: 'QA-01', hospital: 'Hospital Médica Sur' },
  { id: 8,  folio: 'QA-2026-008', eventId: 18, eventName: 'Liga MX Jornada 22',          date: s(2),  patientName: 'Anónimo', age: 28, gender: 'M', reason: 'Contusión craneal',    vitals: { bp: '130/85',  hr: 90,  spo2: 98, temp: 36.6, rr: 16 }, treatment: 'Inmovilización cervical, evaluación neurológica, traslado',  transport: true,  outcome: 'Traslado a hospital',   attendedBy: 'Tec. Roberto Sánchez', status: 'closed',  transportUnit: 'QA-03', hospital: 'Hospital Ángeles' },
  { id: 9,  folio: 'QA-2026-009', eventId: 18, eventName: 'Liga MX Jornada 22',          date: s(2),  patientName: 'Anónimo', age: 16, gender: 'M', reason: 'Lipotimia',             vitals: { bp: '95/60',   hr: 72,  spo2: 98, temp: 36.3, rr: 14 }, treatment: 'Posición de Trendelenburg, hidratación oral',                transport: false, outcome: 'Alta en sitio',         attendedBy: 'Enf. María Gutiérrez', status: 'closed' },
  { id: 10, folio: 'QA-2026-010', eventId: 18, eventName: 'Liga MX Jornada 22',          date: s(2),  patientName: 'Anónimo', age: 42, gender: 'F', reason: 'Aplastamiento leve',   vitals: { bp: '120/80',  hr: 88,  spo2: 99, temp: 36.5, rr: 16 }, treatment: 'Evaluación de extremidades, vendaje, alta',                  transport: false, outcome: 'Alta en sitio',         attendedBy: 'Dr. Samuel Ortiz',     status: 'closed' },
  { id: 11, folio: 'QA-2026-011', eventId: 11, eventName: 'Festival Gastronómico',       date: s(20), patientName: 'Anónimo', age: 67, gender: 'M', reason: 'Hiperglucemia',        vitals: { bp: '140/90',  hr: 82,  spo2: 97, temp: 36.7, rr: 18 }, treatment: 'Glucómetro, hidratación, ajuste insulina, alta',             transport: false, outcome: 'Alta en sitio',         attendedBy: 'Dra. Claudia Herrera', status: 'closed' },
  { id: 12, folio: 'QA-2026-012', eventId: 11, eventName: 'Festival Gastronómico',       date: s(20), patientName: 'Anónimo', age: 8,  gender: 'M', reason: 'Cuerpo extraño nariz', vitals: { bp: '100/65',  hr: 105, spo2: 99, temp: 36.4, rr: 22 }, treatment: 'Extracción con pinza Bayonet, sin complicaciones',            transport: false, outcome: 'Alta en sitio',         attendedBy: 'Enf. Patricia Ríos',   status: 'closed' },
  { id: 13, folio: 'QA-2026-013', eventId: 20, eventName: 'Foro de Innovación Empresarial',date:s(7), patientName: 'Anónimo', age: 51, gender: 'F', reason: 'Lipotimia',            vitals: { bp: '108/68',  hr: 76,  spo2: 98, temp: 36.6, rr: 16 }, treatment: 'Reposo, hidratación oral',                                   transport: false, outcome: 'Alta en sitio',         attendedBy: 'Enf. Lucía Vargas',    status: 'closed' },
  { id: 14, folio: 'QA-2026-014', eventId: 7,  eventName: 'Congreso Nacional de Medicina',date:s(10),patientName: 'Anónimo', age: 72, gender: 'M', reason: 'Mareo y náuseas',      vitals: { bp: '135/88',  hr: 70,  spo2: 96, temp: 36.9, rr: 18 }, treatment: 'Antieméticos, hidratación, observación 1h',                  transport: false, outcome: 'Alta en sitio',         attendedBy: 'Dr. Héctor Fuentes',   status: 'closed' },
  { id: 15, folio: 'QA-2026-015', eventId: 9,  eventName: 'Concierto Pop Verano',        date: d(3),  patientName: 'Anónimo', age: 25, gender: 'F', reason: 'Contusión pie',        vitals: { bp: '118/74',  hr: 84,  spo2: 99, temp: 36.3, rr: 15 }, treatment: 'Radiografía descartada, vendaje, muletas',                   transport: false, outcome: 'Alta en sitio',         attendedBy: 'Tec. Felipe Morales',  status: 'open'   },
  { id: 16, folio: 'QA-2026-016', eventId: 9,  eventName: 'Concierto Pop Verano',        date: d(3),  patientName: 'Anónimo', age: 33, gender: 'M', reason: 'Ansiedad / pánico',    vitals: { bp: '145/92',  hr: 120, spo2: 98, temp: 36.8, rr: 26 }, treatment: 'Técnica de respiración, lorazepam 1mg VO, observación',      transport: false, outcome: 'Alta en sitio',         attendedBy: 'Dr. Samuel Ortiz',     status: 'open'   },
];

// ── 20 INVENTARIO ─────────────────────────────────────────
export const MOCK_INVENTORY = [
  { id: 1,  name: 'Desfibrilador DEA',              category: 'equipment', quantity: 4,   minStock: 2,  unit: 'pza',    status: 'ok',       lastReview: s(5),  reviewedBy: 'Dr. Andrés López',     notes: 'Batería al 90%, electrodos vigentes' },
  { id: 2,  name: 'Camilla de tijera',              category: 'equipment', quantity: 6,   minStock: 4,  unit: 'pza',    status: 'ok',       lastReview: s(5),  reviewedBy: 'Tec. Roberto Sánchez', notes: 'Todas en buen estado' },
  { id: 3,  name: 'Oxígeno medicinal (tank)',       category: 'equipment', quantity: 3,   minStock: 4,  unit: 'tank',   status: 'low',      lastReview: s(3),  reviewedBy: 'Enf. María Gutiérrez', notes: 'Solicitar recarga urgente' },
  { id: 4,  name: 'Collares cervicales (juego)',    category: 'equipment', quantity: 8,   minStock: 5,  unit: 'juego',  status: 'ok',       lastReview: s(10), reviewedBy: 'Dr. Andrés López',     notes: 'Tallas S/M/L completas' },
  { id: 5,  name: 'Vendas elásticas 4"',            category: 'supplies',  quantity: 45,  minStock: 20, unit: 'pza',    status: 'ok',       lastReview: s(7),  reviewedBy: 'Tec. Felipe Morales',  notes: '' },
  { id: 6,  name: 'Guantes nitrilo M',              category: 'supplies',  quantity: 8,   minStock: 10, unit: 'caja',   status: 'low',      lastReview: s(3),  reviewedBy: 'Karen Salinas',        notes: 'Pedir 20 cajas' },
  { id: 7,  name: 'Solución Hartmann 500ml',        category: 'meds',      quantity: 24,  minStock: 15, unit: 'pza',    status: 'ok',       lastReview: s(7),  reviewedBy: 'Dr. Samuel Ortiz',     notes: 'Vence en 8 meses' },
  { id: 8,  name: 'Adrenalina 1mg/ml',              category: 'meds',      quantity: 6,   minStock: 10, unit: 'amp',    status: 'critical', lastReview: s(2),  reviewedBy: 'Dra. Claudia Herrera', notes: 'URGENTE reabastecer antes del próximo evento' },
  { id: 9,  name: 'Glucómetro + tiras',             category: 'equipment', quantity: 5,   minStock: 3,  unit: 'kit',    status: 'ok',       lastReview: s(8),  reviewedBy: 'Enf. Patricia Ríos',   notes: '200 tiras disponibles' },
  { id: 10, name: 'Oxímetro de pulso',              category: 'equipment', quantity: 12,  minStock: 6,  unit: 'pza',    status: 'ok',       lastReview: s(10), reviewedBy: 'Tec. Roberto Sánchez', notes: '' },
  { id: 11, name: 'Tensiómetro manual',             category: 'equipment', quantity: 8,   minStock: 4,  unit: 'pza',    status: 'ok',       lastReview: s(12), reviewedBy: 'Dr. Andrés López',     notes: 'Calibración pendiente en 2 unidades' },
  { id: 12, name: 'Laringoscopio + palas',          category: 'equipment', quantity: 3,   minStock: 2,  unit: 'set',    status: 'ok',       lastReview: s(6),  reviewedBy: 'Dra. Claudia Herrera', notes: 'Pilas nuevas instaladas' },
  { id: 13, name: 'Mascarillas N95',                category: 'supplies',  quantity: 60,  minStock: 30, unit: 'pza',    status: 'ok',       lastReview: s(4),  reviewedBy: 'Enf. Lucía Vargas',    notes: '' },
  { id: 14, name: 'Jeringas 10ml',                  category: 'supplies',  quantity: 150, minStock: 80, unit: 'pza',    status: 'ok',       lastReview: s(9),  reviewedBy: 'Tec. Felipe Morales',  notes: '' },
  { id: 15, name: 'Midazolam 5mg/ml',               category: 'meds',      quantity: 4,   minStock: 8,  unit: 'amp',    status: 'critical', lastReview: s(1),  reviewedBy: 'Dr. Héctor Fuentes',   notes: 'Bajo control de estupefacientes, reabastecimiento en proceso' },
  { id: 16, name: 'Morfina 10mg/ml',                category: 'meds',      quantity: 3,   minStock: 6,  unit: 'amp',    status: 'critical', lastReview: s(1),  reviewedBy: 'Dr. Héctor Fuentes',   notes: 'Bajo control de estupefacientes' },
  { id: 17, name: 'Sábanas desechables',            category: 'supplies',  quantity: 80,  minStock: 40, unit: 'pza',    status: 'ok',       lastReview: s(14), reviewedBy: 'Karen Salinas',        notes: '' },
  { id: 18, name: 'Tablero espinal largo',          category: 'equipment', quantity: 4,   minStock: 2,  unit: 'pza',    status: 'ok',       lastReview: s(20), reviewedBy: 'Tec. Roberto Sánchez', notes: 'Incluye correas y bloques de cabeza' },
  { id: 19, name: 'Solución Glucosada 5% 500ml',    category: 'meds',      quantity: 18,  minStock: 12, unit: 'pza',    status: 'ok',       lastReview: s(7),  reviewedBy: 'Dr. Samuel Ortiz',     notes: '' },
  { id: 20, name: 'Kit de parto de emergencia',     category: 'equipment', quantity: 2,   minStock: 2,  unit: 'kit',    status: 'ok',       lastReview: s(30), reviewedBy: 'Dra. Claudia Herrera', notes: 'Revisar vencimiento de insumos internos' },
];

// ── DISPONIBILIDAD: 20 entradas distribuidas en el mes ────
const mkDate = (daysOffset) => {
  const d = addDays(today, daysOffset);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

export const MOCK_AVAIL_DATA = {
  [mkDate(1)]:  { 1: { type: 'full' }, 4: { type: 'shift', shifts: ['morning','afternoon'] } },
  [mkDate(2)]:  { 2: { type: 'shift', shifts: ['morning'] }, 14: { type: 'full' } },
  [mkDate(3)]:  { 1: { type: 'full' }, 3: { type: 'shift', shifts: ['afternoon','night'] }, 3: { type: 'full' } },
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
  [mkDate(24)]: { 2: { type: 'shift', shifts: ['morning'] }, 9: { type: 'full' }, 13: { type: 'full' } },
  [mkDate(25)]: { 1: { type: 'full' }, 2: { type: 'full' }, 4: { type: 'full' }, 6: { type: 'full' }, 3: { type: 'full' }, 11: { type: 'full' } },
  [mkDate(27)]: { 7: { type: 'full' }, 12: { type: 'shift', shifts: ['afternoon','night'] } },
  [mkDate(29)]: { 1: { type: 'full' }, 4: { type: 'full' }, 3: { type: 'full' } },
  [mkDate(30)]: { 2: { type: 'full' }, 8: { type: 'full' }, 11: { type: 'full' }, 12: { type: 'full' } },
  [mkDate(32)]: { 1: { type: 'full' }, 9: { type: 'range', from: '08:00', to: '16:00' }, 4: { type: 'full' } },
};

// ── PROVIDER ──────────────────────────────────────────────
export function AppProvider({ children }) {
  const [events,    setEvents]    = useState(MOCK_EVENTS);
  const [personnel, setPersonnel] = useState(MOCK_PERSONNEL);
  const [patients,  setPatients]  = useState(MOCK_PATIENTS);
  const [inventory, setInventory] = useState(MOCK_INVENTORY);
  const [availData, setAvailData] = useState(MOCK_AVAIL_DATA);

  const addEvent    = (event)    => setEvents(prev => [...prev, { ...event, id: Date.now() }]);
  const updateEvent = (id, data) => setEvents(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));

  const addPatient = (patient) => {
    const folio = `QA-2026-${String(patients.length + 1).padStart(3, '0')}`;
    setPatients(prev => [...prev, { ...patient, id: Date.now(), folio }]);
  };

  const updateInventory = (id, data) => setInventory(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));

  return (
    <AppContext.Provider value={{
      events, setEvents, addEvent, updateEvent,
      personnel, setPersonnel,
      patients, setPatients, addPatient,
      inventory, setInventory, updateInventory,
      availData, setAvailData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
