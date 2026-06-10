import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const ROLES = {
  ADMIN:      'admin',
  ACCOUNTING: 'accounting',
  PARAMEDIC:  'paramedic',
  PILOT:      'pilot',
  INVENTORY:  'inventory',
  MEDIC:      'medic',
};

export const ROLE_LABELS = {
  admin:      'Administrador',
  accounting: 'Contabilidad',
  paramedic:  'Paramédico',
  pilot:      'Piloto',
  inventory:  'Inventario',
  medic:      'Médico',
};

export const ROLE_COLORS = {
  admin:      '#CC0000',
  accounting: '#FFB400',
  paramedic:  '#00C850',
  pilot:      '#0088FF',
  inventory:  '#AA44FF',
  medic:      '#FF6B35',
};

// Usuarios con acceso a la app (pueden hacer login)
const MOCK_USERS = [
  { id: 1, name: 'Carlos Méndez',       email: 'admin@quickassist.com',        password: '1234', role: ROLES.ADMIN,      avatar: 'CM' },
  { id: 2, name: 'Sofía Ramírez',        email: 'contabilidad@quickassist.com', password: '1234', role: ROLES.ACCOUNTING, avatar: 'SR' },
  { id: 3, name: 'Diego Torres',         email: 'paramedic@quickassist.com',    password: '1234', role: ROLES.PARAMEDIC,  avatar: 'DT' },
  { id: 4, name: 'Luis Hernández',       email: 'piloto@quickassist.com',       password: '1234', role: ROLES.PILOT,      avatar: 'LH' },
  { id: 5, name: 'Ana Velásquez',        email: 'medico@quickassist.com',       password: '1234', role: ROLES.MEDIC,      avatar: 'AV' },
];

// Todo el personal operativo visible para el admin en el calendario de disponibilidad
// Incluye los usuarios de login (ids 1-5) + personal operativo de AppContext (ids 11-15)
// Solo el admin puede ver y gestionar este listado completo
export const ALL_STAFF = MOCK_USERS;

export const ADMIN_STAFF_LIST = [
  { id: 1,  name: 'Carlos Méndez',        role: ROLES.ADMIN,     avatar: 'CM' },
  { id: 3,  name: 'Diego Torres',          role: ROLES.PARAMEDIC, avatar: 'DT' },
  { id: 4,  name: 'Luis Hernández',        role: ROLES.PILOT,     avatar: 'LH' },
  { id: 5,  name: 'Ana Velásquez',         role: ROLES.MEDIC,     avatar: 'AV' },
  // IDs coinciden exactamente con MOCK_PERSONNEL en AppContext
  { id: 6,  name: 'Dra. Claudia Herrera',  role: ROLES.PARAMEDIC, avatar: 'CH' },
  { id: 7,  name: 'Tec. Felipe Morales',   role: ROLES.PARAMEDIC, avatar: 'FM' },
  { id: 8,  name: 'Enf. Patricia Ríos',    role: ROLES.PARAMEDIC, avatar: 'PR' },
  { id: 9,  name: 'Dr. Samuel Ortiz',      role: ROLES.PARAMEDIC, avatar: 'SO' },
  { id: 10, name: 'Tec. Karen Salinas',    role: ROLES.PARAMEDIC, avatar: 'KS' },
  { id: 11, name: 'Marco Reyes',           role: ROLES.PILOT,     avatar: 'MR' },
  { id: 12, name: 'Óscar Mendoza',         role: ROLES.PILOT,     avatar: 'OM' },
  { id: 13, name: 'Enf. Lucía Vargas',     role: ROLES.PARAMEDIC, avatar: 'LV' },
  { id: 14, name: 'Dr. Héctor Fuentes',    role: ROLES.PARAMEDIC, avatar: 'HF' },
  { id: 15, name: 'Tec. Daniela Castro',   role: ROLES.PARAMEDIC, avatar: 'DC' },
  { id: 16, name: 'Ramón Espinoza',        role: ROLES.PILOT,     avatar: 'RE' },
  { id: 17, name: 'Enf. Adriana Leal',     role: ROLES.PARAMEDIC, avatar: 'AL2'},
  { id: 18, name: 'Dr. Iván Contreras',    role: ROLES.PARAMEDIC, avatar: 'IC' },
  { id: 19, name: 'Gerardo Núñez',         role: ROLES.PILOT,     avatar: 'GN' },
  { id: 20, name: 'Tec. Sofía Delgado',    role: ROLES.PARAMEDIC, avatar: 'SD' },
  // Paramédicos con login (ids 1-5 ya incluidos arriba excepto admin/medic/accounting)
  { id: 101, name: 'Dr. Andrés López',     role: ROLES.PARAMEDIC, avatar: 'AL' },
  { id: 102, name: 'Enf. María Gutiérrez', role: ROLES.PARAMEDIC, avatar: 'MG' },
  { id: 103, name: 'Tec. Roberto Sánchez', role: ROLES.PARAMEDIC, avatar: 'RS' },
  { id: 104, name: 'Luis Peña',            role: ROLES.PILOT,     avatar: 'LP' },
  { id: 105, name: 'Jorge Vásquez',        role: ROLES.PILOT,     avatar: 'JV' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('qa_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email, password) => {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...safeUser } = found;
      setUser(safeUser);
      localStorage.setItem('qa_user', JSON.stringify(safeUser));
      return { success: true };
    }
    return { success: false, error: 'Credenciales incorrectas' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('qa_user');
  };

  const hasRole = (...roles) => roles.includes(user?.role);

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
