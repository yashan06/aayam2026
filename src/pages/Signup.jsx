import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    password: '',
    roll_number: '',
    branch: '',
    year: ''
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', isSuccess: false });

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ show: false, message: '', isSuccess: false });

    try {
      const res = await fetch('/api/auth/student/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm)
      });
      const data = await res.json();

      if (data.success) {
        login(data.token, data.user);
        setAlert({ show: true, message: data.message || 'Account created successfully!', isSuccess: true });
        setTimeout(() => navigate('/'), 1200);
      } else {
        setAlert({ show: true, message: data.error || 'Signup failed.', isSuccess: false });
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
            <div className="auth-tag">JOIN AAYAM UIT</div>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Enter your details to register as a student member</p>
          </div>

          {alert.show && (
            <div className={`auth-alert ${alert.isSuccess ? 'auth-alert-succ' : 'auth-alert-err'}`} style={{ display: 'block' }}>
              {alert.isSuccess ? '✅ ' : '⚠️ '}{alert.message}
            </div>
          )}

          <form onSubmit={handleSignupSubmit}>
            <div className="form-grid-custom">
              <div className="form-group-custom full">
                <label htmlFor="stName">Full Name *</label>
                <input type="text" id="stName" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} placeholder="Aarav Sharma" required />
              </div>
              <div className="form-group-custom">
                <label htmlFor="stEmail">Student Email *</label>
                <input type="email" id="stEmail" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} placeholder="aarav@ku.edu.in" required />
              </div>
              <div className="form-group-custom">
                <label htmlFor="stPass">Password *</label>
                <input type="password" id="stPass" value={studentForm.password} onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} placeholder="At least 6 chars" required minLength={6} />
              </div>
              <div className="form-group-custom">
                <label htmlFor="stRoll">Roll Number *</label>
                <input type="text" id="stRoll" value={studentForm.roll_number} onChange={(e) => setStudentForm({ ...studentForm, roll_number: e.target.value })} placeholder="UIT2024012" required />
              </div>
              <div className="form-group-custom">
                <label htmlFor="stBranch">Branch *</label>
                <select id="stBranch" value={studentForm.branch} onChange={(e) => setStudentForm({ ...studentForm, branch: e.target.value })} required>
                  <option value="" disabled>Select Branch</option>
                  <option value="Computer Science (CSE)">CSE</option>
                  <option value="Information Technology (IT)">IT</option>
                  <option value="AI & Machine Learning">AI & ML</option>
                  <option value="Cyber Security">Cyber Security</option>
                  <option value="Mechanical Engineering">Mechanical</option>
                  <option value="ECE / EE">ECE / EE</option>
                  <option value="Civil Engineering">Civil</option>
                </select>
              </div>
              <div className="form-group-custom full">
                <label htmlFor="stYear">Academic Year *</label>
                <select id="stYear" value={studentForm.year} onChange={(e) => setStudentForm({ ...studentForm, year: e.target.value })} required>
                  <option value="" disabled>Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-btn-primary">
              {loading ? 'Creating Account...' : 'Sign Up'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </form>

          <div className="auth-footer-link">
            Already have an account? <Link to="/login">Log In Here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
