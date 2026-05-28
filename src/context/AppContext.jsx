import React, { createContext, useContext, useState } from 'react';
import { addDays, subDays } from 'date-fns';

const AppContext = createContext(null);

const today = new Date();

export const MOCK_EVENTS = [
  {
    id: 1,
    name: 'Concierto Rock en Grande',
    client: 'Producciones XYZ',
    venue: 'Foro Sol, CDMX',
    date: addDays(today, 5),
    setupDate: addDays(today, 4),
    teardownDate: addDays(today, 6),
    expectedAttendance: 45000,
    status: 'confirmed',
    type: 'concert',
    assignedPersonnel: [1, 2, 3],
    notes: 'Requiere 2 ambulancias y equipo completo',
    ambulances: 2,
  },
  {
    id: 2,
    name: 'Partido Clásico Nacional',
    client: 'Liga MX',
    venue: 'Estadio Azteca, CDMX',
    date: addDays(today, 12),
    setupDate: addDays(today, 12),
    teardownDate: addDays(today, 12),
    expectedAttendance: 80000,
    status: 'confirmed',
    type: 'sports',
    assignedPersonnel: [1, 4, 5],
    notes: 'Evento de alto riesgo, coordinación con seguridad',
    ambulances: 3,
  },
  {
    id: 3,
    name: 'Foro Empresarial Tech',
    client: 'Grupo Empresarial Norte',
    venue: 'Centro Banamex, CDMX',
    date: subDays(today, 3),
    setupDate: subDays(today, 4),
    teardownDate: subDays(today, 3),
    expectedAttendance: 5000,
    status: 'completed',
    type: 'forum',
    assignedPersonnel: [2, 3],
    notes: 'Evento corporativo, riesgo bajo',
    ambulances: 1,
  },
  {
    id: 4,
    name: 'Festival de Verano',
    client: 'Eventos del Valle',
    venue: 'Parque Bicentenario',
    date: addDays(today, 20),
    setupDate: addDays(today, 18),
    teardownDate: addDays(today, 22),
    expectedAttendance: 15000,
    status: 'pending',
    type: 'festival',
    assignedPersonnel: [],
    notes: 'Pendiente de cotización y asignación',
    ambulances: 1,
  },
];

export const MOCK_PERSONNEL = [
  { id: 1, name: 'Dr. Andrés López', role: 'paramedic', license: 'PAR-001', phone: '555-0101', email: 'alopez@qa.com', status: 'available', certifications: ['ACLS', 'BLS', 'PHTLS'], eventsCount: 24, avatar: 'AL' },
  { id: 2, name: 'Enf. María Gutiérrez', role: 'paramedic', license: 'PAR-002', phone: '555-0102', email: 'mgutierrez@qa.com', status: 'available', certifications: ['BLS', 'EMT'], eventsCount: 18, avatar: 'MG' },
  { id: 3, name: 'Tec. Roberto Sánchez', role: 'paramedic', license: 'PAR-003', phone: '555-0103', email: 'rsanchez@qa.com', status: 'assigned', certifications: ['BLS', 'EMT'], eventsCount: 31, avatar: 'RS' },
  { id: 4, name: 'Luis Peña', role: 'pilot', license: 'PIL-001', phone: '555-0104', email: 'lpena@qa.com', status: 'available', certifications: ['Ambulancias', 'Conducción Especial'], eventsCount: 42, avatar: 'LP' },
  { id: 5, name: 'Jorge Vásquez', role: 'pilot', license: 'PIL-002', phone: '555-0105', email: 'jvasquez@qa.com', status: 'inactive', certifications: ['Ambulancias'], eventsCount: 15, avatar: 'JV' },
];

export const MOCK_PATIENTS = [
  {
    id: 1,
    folio: 'QA-2024-001',
    eventId: 3,
    eventName: 'Foro Empresarial Tech',
    date: subDays(today, 3),
    patientName: 'Anónimo',
    age: 34,
    gender: 'M',
    reason: 'Lipotimia',
    vitals: { bp: '110/70', hr: 88, spo2: 97, temp: 36.5, rr: 16 },
    treatment: 'Reposo, hidratación oral, observación 30 min',
    transport: false,
    outcome: 'Dado de alta en sitio',
    attendedBy: 'Dr. Andrés López',
    status: 'closed',
  },
  {
    id: 2,
    folio: 'QA-2024-002',
    eventId: 3,
    eventName: 'Foro Empresarial Tech',
    date: subDays(today, 3),
    patientName: 'Anónimo',
    age: 58,
    gender: 'F',
    reason: 'Crisis hipertensiva',
    vitals: { bp: '180/110', hr: 95, spo2: 96, temp: 36.8, rr: 20 },
    treatment: 'Medicamento antihipertensivo, monitoreo continuo',
    transport: true,
    transportUnit: 'Ambulancia QA-01',
    hospital: 'Hospital Ángeles Pedregal',
    outcome: 'Trasladada a hospital',
    attendedBy: 'Dr. Andrés López',
    status: 'closed',
  },
];

export const MOCK_INVENTORY = [
  { id: 1, name: 'Desfibrilador DEA', category: 'equipment', quantity: 4, minStock: 2, unit: 'pza', status: 'ok' },
  { id: 2, name: 'Camilla de tijera', category: 'equipment', quantity: 6, minStock: 4, unit: 'pza', status: 'ok' },
  { id: 3, name: 'Oxígeno medicinal (tank)', category: 'equipment', quantity: 3, minStock: 4, unit: 'tank', status: 'low' },
  { id: 4, name: 'Collares cervicales (juego)', category: 'equipment', quantity: 8, minStock: 5, unit: 'juego', status: 'ok' },
  { id: 5, name: 'Vendas elásticas 4"', category: 'supplies', quantity: 45, minStock: 20, unit: 'pza', status: 'ok' },
  { id: 6, name: 'Guantes nitrilo M', category: 'supplies', quantity: 8, minStock: 10, unit: 'caja', status: 'low' },
  { id: 7, name: 'Solución Hartmann 500ml', category: 'meds', quantity: 24, minStock: 15, unit: 'pza', status: 'ok' },
  { id: 8, name: 'Adrenalina 1mg/ml', category: 'meds', quantity: 6, minStock: 10, unit: 'amp', status: 'critical' },
];

export function AppProvider({ children }) {
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [personnel, setPersonnel] = useState(MOCK_PERSONNEL);
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [inventory, setInventory] = useState(MOCK_INVENTORY);

  const addEvent = (event) => {
    setEvents(prev => [...prev, { ...event, id: Date.now() }]);
  };

  const updateEvent = (id, data) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  };

  const addPatient = (patient) => {
    const folio = `QA-2024-${String(patients.length + 1).padStart(3, '0')}`;
    setPatients(prev => [...prev, { ...patient, id: Date.now(), folio }]);
  };

  const updateInventory = (id, data) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  };

  return (
    <AppContext.Provider value={{
      events, setEvents, addEvent, updateEvent,
      personnel, setPersonnel,
      patients, setPatients, addPatient,
      inventory, setInventory, updateInventory,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
