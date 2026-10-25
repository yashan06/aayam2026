import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  "Management",
  "Media",
  "Technical",
  "Creatives",
  "Sports",
  "Cultural",
  "Communication",
  "Hospitality",
  "Decor",
  "Promotion",
  "Other"
];

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function VolunteerForm() {
  const [mode, setMode] = useState('checking'); // 'checking' | 'on' | 'off'
  const [formData, setFormData] = useState({
    name: '',
    qid: '',
    sem: '1',
    cls: '',
    cat: 'Management',
    customCat: '',
    phone: '',
    email: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedData, setSubmittedData] = useState(null);

  // Fetch current volunteer collection mode
  const fetchMode = async () => {
    try {
      const res = await fetch('/api/volunteer-mode?t=' + Date.now());
      const data = await res.json();
      if (data.success) {
        setMode(data.mode);
      } else {
        setMode('off');
      }
    } catch (e) {
      console.error('Error fetching volunteer mode:', e);
      setMode('off');
    }
  };

  useEffect(() => {
    fetchMode();
    const interval = setInterval(fetchMode, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'qid') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Strict validation for all compulsory fields
    if (!formData.name.trim()) {
      setError('Full Student Name is compulsory.');
      return;
    }
    if (!formData.qid.trim()) {
      setError('KU ID / Enrollment Number is compulsory.');
      return;
    }
    if (!formData.sem) {
      setError('Semester selection is compulsory.');
      return;
    }
    if (!formData.cls.trim()) {
      setError('Class / Branch / Division is compulsory.');
      return;
    }
    
    let resolvedCat = formData.cat;
    if (formData.cat === 'Other') {
      if (!formData.customCat.trim()) {
        setError('Please specify your custom work category / department.');
        return;
      }
      resolvedCat = formData.customCat.trim();
    }

    const cleanPhone = formData.phone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('A valid 10-digit Mobile / WhatsApp Number is compulsory.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      setError('A valid Student Email Address is compulsory.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        qid: formData.qid.trim().toUpperCase(),
        sem: parseInt(formData.sem, 10),
        cls: formData.cls.trim(),
        cat: resolvedCat,
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase()
      };

      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmittedData(data.volunteer || payload);
      } else {
        setError(data.error || 'Failed to submit registration. Please verify all fields.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('Network connection error. Please make sure the server is reachable and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setFormData({
      name: '',
      qid: '',
      sem: '1',
      cls: '',
      cat: 'Management',
      customCat: '',
      phone: '',
      email: ''
    });
    setError('');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top right, #111827, #07090e 80%)', color: '#f3f4f6', padding: '100px 20px 60px' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        
        {/* Top Header Card */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px',
          padding: '30px 24px',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(16px)',
          borderRadius: '20px',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <img src="/karnavati_logo.png" alt="KU" style={{ height: '44px', objectFit: 'contain' }} />
            <img src="/uit_logo.png" alt="UIT" style={{ height: '44px', objectFit: 'contain' }} />
            <img src="/aayam_logo.png" alt="AAYAM" style={{ height: '44px', objectFit: 'contain' }} />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '14px', background: mode === 'on' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', border: mode === 'on' ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)', color: mode === 'on' ? '#4ade80' : '#f87171' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: mode === 'on' ? '#22c55e' : '#ef4444', display: 'inline-block', boxShadow: mode === 'on' ? '0 0 10px #22c55e' : 'none' }}></span>
            {mode === 'checking' ? 'Checking Status...' : mode === 'on' ? 'Data Collection Mode: ACTIVE' : 'Data Collection Mode: CLOSED'}
          </div>

          <h1 style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: '800', margin: '0 0 10px', color: '#fff', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ffffff 40%, #d4af37 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AAYAM Volunteer Registration Portal
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
            Official Karnavati University & UIT student volunteer data submission form. All entered details are verified and linked directly to the AAYAM OD Attendance Sheet generator.
          </p>
        </div>

        {/* LOADING STATE */}
        {mode === 'checking' && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212, 175, 55, 0.2)', borderTopColor: '#d4af37', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }}></div>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '15px' }}>Checking data collection mode from server...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* REGISTRATION CLOSED STATE */}
        {mode === 'off' && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '20px',
            padding: '48px 28px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '32px' }}>
              🔒
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: '0 0 12px' }}>
              Volunteer Registration Is Currently Closed
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.7, maxWidth: '540px', margin: '0 auto 28px' }}>
              The AAYAM administrative committee has currently turned <strong>OFF</strong> the volunteer data collection mode. No responses or updates are being accepted at this moment.
            </p>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '16px', maxWidth: '480px', margin: '0 auto 30px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'left', fontSize: '13px', color: '#cbd5e1' }}>
              <strong style={{ color: '#f59e0b', display: 'block', marginBottom: '6px' }}>ℹ️ Important Information for Students:</strong>
              • If you are an active volunteer for an upcoming festival or symposium, coordinate with your branch head.<br />
              • Once the administration turns <strong>ON</strong> data collection mode, you can revisit this page immediately.
            </div>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/" style={{ padding: '12px 24px', borderRadius: '10px', background: 'linear-gradient(135deg, #d4af37, #b89628)', color: '#000', fontWeight: '700', textDecoration: 'none', fontSize: '14px', transition: 'all 0.2s' }}>
                Return to Home
              </Link>
              <button onClick={fetchMode} style={{ padding: '12px 24px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
                🔄 Check Live Status
              </button>
            </div>
          </div>
        )}

        {/* REGISTRATION ACTIVE STATE */}
        {mode === 'on' && !submittedData && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '20px',
            padding: '36px 30px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0 }}>Volunteer Registration Form</h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>Please complete all required fields with accurate university details.</p>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 10px', borderRadius: '6px' }}>
                * ALL FIELDS COMPULSORY
              </span>
            </div>

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#fca5a5', padding: '14px 18px', borderRadius: '12px', fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Field 1: Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#e2e8f0', marginBottom: '8px' }}>
                  1. Full Student Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Yashan Oswal"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Enter your official name as registered with Karnavati University.
                </span>
              </div>

              {/* Field 2: KU ID */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#e2e8f0', marginBottom: '8px' }}>
                  2. KU ID / Enrollment Number <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="qid"
                  value={formData.qid}
                  onChange={handleChange}
                  placeholder="e.g. KU2407U448 or 2000016522"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fbbf24',
                    fontFamily: 'monospace',
                    fontSize: '15px',
                    fontWeight: '700',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Unique university identifier. Used as your primary key for OD Sheets.
                </span>
              </div>

              {/* 2-Column Grid: Semester & Class */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#e2e8f0', marginBottom: '8px' }}>
                    3. Current Semester <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    name="sem"
                    value={formData.sem}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    {SEMESTERS.map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#e2e8f0', marginBottom: '8px' }}>
                    4. Class / Branch / Division <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="cls"
                    value={formData.cls}
                    onChange={handleChange}
                    placeholder="e.g. B.Tech Cyber, AI-ML (B), CSE DS"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Field 5: Work Category / Department */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#e2e8f0', marginBottom: '8px' }}>
                  5. Work Department / Category <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  name="cat"
                  value={formData.cat}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                {formData.cat === 'Other' && (
                  <input
                    type="text"
                    name="customCat"
                    value={formData.customCat}
                    onChange={handleChange}
                    placeholder="Type custom work department..."
                    required
                    style={{
                      width: '100%',
                      marginTop: '10px',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                )}
              </div>

              {/* 2-Column Grid: Phone & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#e2e8f0', marginBottom: '8px' }}>
                    6. Mobile / WhatsApp Number <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#e2e8f0', marginBottom: '8px' }}>
                    7. Student Email Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. student@ku.edu.in"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Disclaimer */}
              <div style={{ padding: '14px 16px', background: 'rgba(212, 175, 55, 0.08)', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.2)', fontSize: '12px', color: '#fef08a', lineHeight: 1.6 }}>
                ⚡ <strong>Note:</strong> All seven fields are compulsory. Once submitted, your profile is immediately added to the Master Volunteers Database for On-Duty (OD) Attendance validation.
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '15px 28px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #d4af37 0%, #f3e5ab 50%, #b89628 100%)',
                  color: '#0a0d14',
                  fontSize: '15px',
                  fontWeight: '800',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 24px rgba(212, 175, 55, 0.35)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? (
                  <>
                    <span style={{ width: '16px', height: '16px', border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }}></span>
                    Submitting Volunteer Data...
                  </>
                ) : (
                  'Submit Volunteer Registration ✨'
                )}
              </button>
            </form>
          </div>
        )}

        {/* SUBMISSION SUCCESS CARD */}
        {submittedData && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            borderRadius: '20px',
            padding: '40px 30px',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
          }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)', border: '2px solid rgba(34, 197, 94, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '34px', color: '#4ade80' }}>
              ✓
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', margin: '0 0 10px' }}>
              Registration Recorded Successfully!
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '15px', margin: '0 auto 28px', maxWidth: '520px', lineHeight: 1.6 }}>
              Your volunteer data has been recorded and synced with the AAYAM Master Volunteers database. You are now verified for official event On-Duty (OD) sheet generation.
            </p>

            {/* Student Summary Card */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', padding: '22px', maxWidth: '540px', margin: '0 auto 30px', textAlign: 'left' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Student Name</span>
                  <strong style={{ color: '#fff', fontSize: '15px' }}>{submittedData.name}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>KU ID / Roll No.</span>
                  <strong style={{ color: '#fbbf24', fontSize: '15px', fontFamily: 'monospace' }}>{submittedData.qid}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Semester</span>
                  <span style={{ color: '#e2e8f0' }}>Semester {submittedData.sem}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Class / Branch</span>
                  <span style={{ color: '#e2e8f0' }}>{submittedData.cls}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Work Department</span>
                  <span style={{ color: '#38bdf8', fontWeight: '600' }}>{submittedData.cat}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Mobile / Phone</span>
                  <span style={{ color: '#e2e8f0' }}>{submittedData.phone}</span>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Email Address</span>
                  <span style={{ color: '#e2e8f0' }}>{submittedData.email}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleReset}
                style={{
                  padding: '12px 24px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #d4af37, #b89628)',
                  color: '#000',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                + Register Another Volunteer
              </button>
              <Link
                to="/"
                style={{
                  padding: '12px 24px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.15)',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Return to Website
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
