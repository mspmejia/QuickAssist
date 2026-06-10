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
  // Usuarios con login
  { id: 1,  name: 'Carlos Méndez',       role: ROLES.ADMIN,     avatar: 'CM' },
  { id: 3,  name: 'Diego Torres',         role: ROLES.PARAMEDIC, avatar: 'DT' },
  { id: 4,  name: 'Luis Hernández',       role: ROLES.PILOT,     avatar: 'LH' },
  { id: 5,  name: 'Ana Velásquez',        role: ROLES.MEDIC,     avatar: 'AV' },
  // Personal operativo de AppContext
  { id: 11, name: 'Dr. Andrés López',     role: ROLES.PARAMEDIC, avatar: 'AL' },
  { id: 12, name: 'Enf. María Gutiérrez', role: ROLES.PARAMEDIC, avatar: 'MG' },
  { id: 13, name: 'Tec. Roberto Sánchez', role: ROLES.PARAMEDIC, avatar: 'RS' },
  { id: 14, name: 'Luis Peña',            role: ROLES.PILOT,     avatar: 'LP' },
  { id: 15, name: 'Jorge Vásquez',        role: ROLES.PILOT,     avatar: 'JV' },
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
