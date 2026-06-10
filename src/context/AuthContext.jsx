import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const ROLES = {
  ADMIN: 'admin',
  ACCOUNTING: 'accounting',
  PARAMEDIC: 'paramedic',
  PILOT: 'pilot',
  INVENTORY: 'inventory',
  MEDIC: 'medic',
};

export const ROLE_LABELS = {
  admin: 'Administrador',
  accounting: 'Contabilidad',
  paramedic: 'Paramédico',
  pilot: 'Piloto',
  inventory: 'Inventario',
  medic: 'Médico',
};

export const ROLE_COLORS = {
  admin: '#CC0000',
  accounting: '#FFB400',
  paramedic: '#00C850',
  pilot: '#0088FF',
  inventory: '#AA44FF',
  medic: '#FF6B35',
};

const MOCK_USERS = [
  { id: 1, name: 'Carlos Méndez',   email: 'admin@quickassist.com',          password: '1234', role: ROLES.ADMIN,      avatar: 'CM' },
  { id: 2, name: 'Sofía Ramírez',   email: 'contabilidad@quickassist.com',   password: '1234', role: ROLES.ACCOUNTING, avatar: 'SR' },
  { id: 3, name: 'Diego Torres',    email: 'paramedic@quickassist.com',      password: '1234', role: ROLES.PARAMEDIC,  avatar: 'DT' },
  { id: 4, name: 'Luis Hernández',  email: 'piloto@quickassist.com',         password: '1234', role: ROLES.PILOT,      avatar: 'LH' },
  { id: 5, name: 'Ana Velásquez',   email: 'medico@quickassist.com',         password: '1234', role: ROLES.MEDIC,      avatar: 'AV' },
];

export const ALL_STAFF = MOCK_USERS;

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
