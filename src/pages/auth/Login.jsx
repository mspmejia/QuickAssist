import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-line" />
        <div className="login-bg-line" />
        <div className="login-bg-line" />
      </div>

      <div className="login-container animate-in">
        <div className="login-brand">
          <div className="login-logo">
            <span className="logo-cross">✚</span>
          </div>
          <div>
            <h1 className="login-title">QUICK ASSIST</h1>
            <p className="login-tagline">Sistema de Gestión Paramédica</p>
          </div>
        </div>

        <div className="login-divider" />

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input
              className="form-input"
              type="email"
              placeholder="usuario@quickassist.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="login-error">
              <span>⚠</span> {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? <span className="login-spinner" /> : '✚'}
            {loading ? 'Verificando...' : 'Ingresar al sistema'}
          </button>
        </form>

        {process.env.NODE_ENV === 'development' && (
          <div className="login-hints">
            <p>Accesos de prueba:</p>
            <div className="login-hint-row"><span>admin@quickassist.com</span><span>/ 1234</span></div>
            <div className="login-hint-row"><span>paramedic@quickassist.com</span><span>/ 1234</span></div>
          </div>
        )}
      </div>

      <div className="login-footer">
        <span>© 2024 Quick Assist</span>
        <span>•</span>
        <span>Servicios Paramédicos</span>
      </div>
    </div>
  );
}
