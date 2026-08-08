import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', isSuccess: false });

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ show: false, message: '', isSuccess: false });

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.identifier, username: formData.identifier, password: formData.password })
      });
      const data = await res.json();

      if (data.success) {
        login(data.token, data.user);
        setAlert({ show: true, message: data.message || 'Login successful!', isSuccess: true });
        setTimeout(() => {
          if (data.user && data.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }, 1200);
      } else {
        setAlert({ show: true, message: data.error || 'Invalid credentials.', isSuccess: false });
        setLoading(false);
      }
    } catch (err) {
      setAlert({ show: true, message: 'Network error. Server could not be reached.', isSuccess: false });
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ backgroundImage: "url('/auth_bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center center' }}>
      <div className="auth-bg-overlay"></div>

      <header className="auth-header-nav">
        <Link to="/" className="nav-brand" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'transparent', textDecoration: 'none' }}>
          <img src="/karnavati_logo.png" alt="Karnavati University" style={{ height: '36px', objectFit: 'contain', background: 'transparent' }} />
          <div style={{ height: '20px', width: '1px', background: 'rgba(255,255,255,0.3)' }}></div>
          <img src="/uit_logo.png" alt="UIT" style={{ height: '36px', objectFit: 'contain', background: 'transparent' }} />
          <div style={{ height: '20px', width: '1px', background: 'rgba(255,255,255,0.3)' }}></div>
          <img src="/aayam_logo.png" alt="AAYAM" style={{ height: '36px', objectFit: 'contain', background: 'transparent' }} />
        </Link>

        <Link to="/" style={{ color: '#fff', fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ← Back to Home
        </Link>
      </header>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-title-area">
            <div className="auth-tag">WELCOME BACK</div>
            <h1 className="auth-title">Account Login</h1>
            <p className="auth-subtitle">Enter your email or username and password</p>
          </div>

          {alert.show && (
            <div className={`auth-alert ${alert.isSuccess ? 'auth-alert-succ' : 'auth-alert-err'}`} style={{ display: 'block' }}>
              {alert.isSuccess ? '✅ ' : '⚠️ '}{alert.message}
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div className="form-group-custom">
              <label htmlFor="loginIdentifier">Email or Username *</label>
              <input
                type="text"
                id="loginIdentifier"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                placeholder="student@ku.edu.in or admin"
                required
              />
            </div>
            <div className="form-group-custom">
              <label htmlFor="loginPassword">Password *</label>
              <input
                type="password"
                id="loginPassword"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="auth-btn-primary">
              {loading ? 'Authenticating...' : 'Log In'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </form>

          <div className="auth-footer-link">
            Don't have an account? <Link to="/signup">Sign Up Here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
