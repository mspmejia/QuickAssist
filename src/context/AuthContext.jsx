import React, { createContext, useContext, useState } from 'react';
import { MOCK_PERSONNEL } from './AppContext';

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
  accounting: '#B87800',
  paramedic:  '#0B8A40',
  pilot:      '#0088FF',
  inventory:  '#AA44FF',
  medic:      '#FF6B35',
};

// Cuentas administrativas: no forman parte del roster operativo del módulo
// "Personal" (no tienen turnos ni disponibilidad), así que viven aparte.
// IDs altos (9000+) para no chocar nunca con los IDs de personal (1-20+).
const SPECIAL_ACCOUNTS = [
  { id: 9001, name: 'Carlos Méndez', email: 'admin@quickassist.com',        password: '1234', role: ROLES.ADMIN,      avatar: 'CM' },
  { id: 9002, name: 'Sofía Ramírez', email: 'contabilidad@quickassist.com', password: '1234', role: ROLES.ACCOUNTING, avatar: 'SR' },
];

// Todo el personal operativo (paramédicos, pilotos) registrado en el módulo
// "Personal" recibe acceso propio con su correo + la contraseña demo "1234".
// Esta es LA fuente única de identidad: agregar/editar a alguien en Personal
// agrega/edita también su acceso al sistema.
const PERSONNEL_ACCOUNTS = MOCK_PERSONNEL.map(p => ({
  id: p.id, name: p.name, email: p.email, password: p.password || '1234', role: p.role, avatar: p.avatar,
}));

// Roster completo de personas que pueden iniciar sesión
export const MOCK_USERS = [...SPECIAL_ACCOUNTS, ...PERSONNEL_ACCOUNTS];

// Todo el personal visible para el admin en el calendario de disponibilidad
// (incluye admin/contabilidad + todo el personal operativo)
export const ALL_STAFF = MOCK_USERS;
export const ADMIN_STAFF_LIST = MOCK_USERS;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('qa_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email, password) => {
    const found = MOCK_USERS.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
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
