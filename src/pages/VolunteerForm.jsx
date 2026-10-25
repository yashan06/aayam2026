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
  const [alreadyRegisteredData, setAlreadyRegisteredData] = useState(null);
  const [isRefillMode, setIsRefillMode] = useState(false);

  // Fetch current volunteer collection mode
  const fetchMode = async () => {
    try {
      const res = await fetch('/api/volunteer-mode?t=' + Date.now());
      const data = await res.json();
      if (data && data.success) {
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
        email: formData.email.trim().toLowerCase(),
        allow_update: isRefillMode
      };

      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      // Check if user has already filled the form
      if (data && data.already_exists) {
        setAlreadyRegisteredData(data.existing_volunteer);
        setError('');
        window.scrollTo({ top: 320, behavior: 'smooth' });
        return;
      }

      if (res.ok && data.success) {
        setSubmittedData({
          ...(data.volunteer || payload),
          isUpdate: Boolean(data.is_update || isRefillMode)
        });
        setAlreadyRegisteredData(null);
        setIsRefillMode(false);
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

  const handleStartRefill = () => {
    if (alreadyRegisteredData) {
      setFormData({
        name: alreadyRegisteredData.name || formData.name,
        qid: alreadyRegisteredData.qid || formData.qid,
        sem: String(alreadyRegisteredData.sem || formData.sem || '1'),
        cls: alreadyRegisteredData.cls || formData.cls,
        cat: CATEGORIES.includes(alreadyRegisteredData.cat) ? alreadyRegisteredData.cat : 'Other',
        customCat: CATEGORIES.includes(alreadyRegisteredData.cat) ? '' : (alreadyRegisteredData.cat || ''),
        phone: alreadyRegisteredData.phone || formData.phone,
        email: alreadyRegisteredData.email || formData.email
      });
    }
    setIsRefillMode(true);
    setAlreadyRegisteredData(null);
    setError('');
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleCancelRefill = () => {
    handleReset();
    setIsRefillMode(false);
    setAlreadyRegisteredData(null);
  };

  const handleReset = () => {
    setSubmittedData(null);
    setAlreadyRegisteredData(null);
    setIsRefillMode(false);
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
    <div className="volunteer-page-root" style={{ background: 'var(--cream)', minHeight: '100vh', color: 'var(--text-dark)' }}>
      {/* 1. WEBSITE HERO BANNER (Matches Website Background & Texture) */}
      <section className="page-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="genz-floating-orb" style={{ top: '-40px', right: '10%' }}></div>
        <div className="genz-floating-orb" style={{ bottom: '-60px', left: '5%', animationDelay: '-3s' }}></div>
        <div className="page-hero-bg"></div>

        <div className="page-hero-inner">
          <div className="page-hero-content animate-in">
            {/* Logos Header */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', marginBottom: '18px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', padding: '8px 18px', borderRadius: '40px', border: '1px solid var(--border)' }}>
              <img src="/karnavati_logo.png" alt="Karnavati University" style={{ height: '36px', objectFit: 'contain' }} />
              <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>
              <img src="/uit_logo.png" alt="UIT" style={{ height: '36px', objectFit: 'contain' }} />
              <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>
              <img src="/aayam_logo.png" alt="AAYAM" style={{ height: '36px', objectFit: 'contain' }} />
            </div>

            <div className="section-tag" style={{ letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>
              ⚡ UIT STUDENTS COMMITTEE · ACADEMIC DUTY SYSTEM
            </div>
            <h1 className="page-title">
              AAYAM Volunteer <br />
              <span className="gold">Registration Portal</span>
            </h1>
            <p className="page-desc" style={{ maxWidth: '640px' }}>
              Official student volunteer data submission form. All submitted records are verified and automatically synced with the Master Volunteers directory for On-Duty (OD) Attendance validation.
            </p>
          </div>
        </div>
      </section>

      {/* 2. MAIN FORM SECTION */}
      <section style={{ padding: '40px 24px 80px', background: 'var(--cream)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* STATUS PILL BAR */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '14px 20px',
            marginBottom: '24px',
            border: mode === 'on' ? '1.5px solid #86efac' : '1.5px solid #fca5a5',
            boxShadow: '0 4px 18px rgba(15,27,60,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: mode === 'on' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                color: mode === 'on' ? '#15803d' : '#b91c1c',
                border: mode === 'on' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: mode === 'on' ? '#22c55e' : '#ef4444',
                  display: 'inline-block',
                  boxShadow: mode === 'on' ? '0 0 8px #22c55e' : 'none'
                }}></span>
                {mode === 'checking' ? 'Checking Status...' : mode === 'on' ? 'Registration Portal: ACTIVE' : 'Registration Portal: CLOSED'}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-mid)', fontWeight: 500 }}>
                {mode === 'on' ? 'Accepting volunteer submissions' : 'Submissions currently locked by admin'}
              </span>
            </div>

            <span style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '4px 10px', borderRadius: '6px', letterSpacing: '0.5px' }}>
              * ALL 7 FIELDS COMPULSORY
            </span>
          </div>

          {/* LOADING STATE */}
          {mode === 'checking' && (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '20px', border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid #e8e0d0', borderTopColor: 'var(--gold)', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }}></div>
              <p style={{ color: 'var(--text-mid)', margin: 0, fontSize: '15px' }}>Connecting to AAYAM server & verifying registration status...</p>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* REGISTRATION CLOSED STATE */}
          {mode === 'off' && (
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #fed7aa',
              borderRadius: '20px',
              padding: '50px 32px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                background: 'rgba(200, 146, 42, 0.12)',
                border: '1.5px solid var(--gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '34px'
              }}>
                🔒
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--navy)', margin: '0 0 12px', fontFamily: "'Playfair Display', serif" }}>
                Volunteer Registration is Currently Closed
              </h2>
              <p style={{ color: 'var(--text-mid)', fontSize: '15px', lineHeight: 1.7, maxWidth: '540px', margin: '0 auto 28px' }}>
                The AAYAM administrative committee has currently turned <strong>OFF</strong> the volunteer data collection mode. No responses or updates are being accepted at this moment.
              </p>
              
              <div style={{ background: 'var(--cream)', borderRadius: '12px', padding: '18px 22px', maxWidth: '520px', margin: '0 auto 32px', border: '1.5px solid var(--border)', textAlign: 'left', fontSize: '13px', color: 'var(--text-dark)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--gold)', display: 'block', marginBottom: '6px', fontSize: '14px' }}>
                  ℹ️ Important Note for Students:
                </strong>
                • If you are volunteering for an upcoming event or committee, coordinate directly with your student leads or branch coordinators.<br />
                • When the administration turns <strong>ON</strong> data collection mode, you can immediately revisit this link to register.
              </div>

              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/" className="btn-primary" style={{ padding: '12px 28px', fontSize: '14px' }}>
                  Return to Home
                </Link>
                <button
                  type="button"
                  onClick={fetchMode}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '10px',
                    background: '#ffffff',
                    color: 'var(--navy)',
                    border: '1.5px solid var(--border)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  🔄 Check Live Status
                </button>
              </div>
            </div>
          )}

          {/* 3. ALREADY REGISTERED / DUPLICATE DETECTED WARNING CARD */}
          {alreadyRegisteredData && (
            <div style={{
              background: '#ffffff',
              border: '2px solid #f59e0b',
              borderRadius: '20px',
              padding: '40px 32px',
              textAlign: 'center',
              boxShadow: '0 12px 36px rgba(245, 158, 11, 0.14)',
              marginBottom: '32px'
            }}>
              <div style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '2px solid #f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                fontSize: '34px'
              }}>
                ⚠️
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 14px',
                borderRadius: '999px',
                background: '#fef3c7',
                color: '#b45309',
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '14px'
              }}>
                YOU HAVE ALREADY FILLED THE FORM
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--navy)', margin: '0 0 10px', fontFamily: "'Playfair Display', serif" }}>
                Volunteer Registration Already Exists
              </h2>

              <p style={{ color: 'var(--text-mid)', fontSize: '15px', maxWidth: '580px', margin: '0 auto 26px', lineHeight: 1.6 }}>
                A volunteer record with KU ID <strong>{alreadyRegisteredData.qid}</strong> ({alreadyRegisteredData.name}) is already recorded in the AAYAM directory. If you made a mistake or need to update your department, you can refill and update your form below.
              </p>

              {/* Already Recorded Details Preview Card */}
              <div style={{
                background: 'var(--cream)',
                borderRadius: '14px',
                border: '1.5px solid var(--border)',
                padding: '22px 24px',
                maxWidth: '560px',
                margin: '0 auto 28px',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--navy)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  📋 Your Currently Recorded Details:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Student Name</span>
                    <strong style={{ color: 'var(--navy)', fontSize: '14px' }}>{alreadyRegisteredData.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>KU ID / Roll No</span>
                    <strong style={{ color: 'var(--gold)', fontSize: '14px', fontFamily: 'monospace' }}>{alreadyRegisteredData.qid}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Semester</span>
                    <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>Semester {alreadyRegisteredData.sem}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Class / Branch</span>
                    <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>{alreadyRegisteredData.cls}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Work Department</span>
                    <span style={{ color: '#0284c7', fontWeight: '700' }}>{alreadyRegisteredData.cat}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Mobile Number</span>
                    <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>{alreadyRegisteredData.phone || '—'}</span>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Email Address</span>
                    <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>{alreadyRegisteredData.email || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleStartRefill}
                  className="btn-primary"
                  style={{ padding: '12px 26px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  🔄 Refill / Update My Form
                </button>

                <button
                  type="button"
                  onClick={handleCancelRefill}
                  style={{
                    padding: '12px 22px',
                    borderRadius: '10px',
                    background: '#ffffff',
                    color: 'var(--navy)',
                    border: '1.5px solid var(--border)',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Enter Different KU ID
                </button>

                <Link
                  to="/"
                  style={{
                    padding: '12px 20px',
                    borderRadius: '10px',
                    background: 'var(--cream)',
                    color: 'var(--text-mid)',
                    border: '1px solid var(--border)',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                >
                  Return to Website
                </Link>
              </div>
            </div>
          )}

          {/* 4. REGISTRATION ACTIVE FORM */}
          {mode === 'on' && !submittedData && !alreadyRegisteredData && (
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: isRefillMode ? '2px solid #3b82f6' : '1.5px solid var(--border)',
              padding: '36px 32px',
              boxShadow: isRefillMode ? '0 10px 30px rgba(59, 130, 246, 0.12)' : 'var(--shadow-md)',
              transition: 'all 0.3s ease'
            }}>
              
              {/* Refill Mode Banner */}
              {isRefillMode && (
                <div style={{
                  background: '#eff6ff',
                  border: '1.5px solid #bfdbfe',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>✏️</span>
                    <div>
                      <strong style={{ color: '#1e40af', fontSize: '14px', display: 'block' }}>
                        Refill & Update Mode Active
                      </strong>
                      <span style={{ fontSize: '12.5px', color: '#2563eb' }}>
                        You are updating previously registered details for KU ID: <strong>{formData.qid}</strong>. Edit any fields below and click "Update My Registration".
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRefillMode(false)}
                    style={{ background: 'none', border: 'none', color: '#1d4ed8', fontSize: '12px', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Cancel Update
                  </button>
                </div>
              )}

              <div style={{ borderBottom: '1.5px solid var(--border)', paddingBottom: '18px', marginBottom: '26px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--navy)', margin: '0 0 6px', fontFamily: "'Playfair Display', serif" }}>
                  {isRefillMode ? 'Update Volunteer Registration' : 'Volunteer Information Form'}
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-mid)' }}>
                  {isRefillMode
                    ? 'Modify your work department, class, or contact details below to update your official record.'
                    : 'Please complete all required fields accurately. These details are used directly for official On-Duty (OD) Attendance approval.'}
                </p>
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', color: '#b91c1c', padding: '14px 18px', borderRadius: '12px', fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>⚠️</span>
                  <span style={{ fontWeight: 600 }}>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                
                {/* Field 1: Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--navy)', marginBottom: '8px' }}>
                    1. Full Student Name <span style={{ color: '#dc2626' }}>*</span>
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
                      background: '#faf8f5',
                      border: '1.5px solid #dfd7cc',
                      color: 'var(--navy)',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                    Enter your official name as registered with Karnavati University.
                  </span>
                </div>

                {/* Field 2: KU ID */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--navy)', marginBottom: '8px' }}>
                    2. KU ID / Enrollment Number <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="qid"
                    value={formData.qid}
                    onChange={handleChange}
                    placeholder="e.g. KU2407U448 or 2000016522"
                    required
                    readOnly={isRefillMode}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: isRefillMode ? '#f1f5f9' : '#faf8f5',
                      border: '1.5px solid #dfd7cc',
                      color: 'var(--navy)',
                      fontFamily: 'monospace',
                      fontSize: '15px',
                      fontWeight: '700',
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: isRefillMode ? 'not-allowed' : 'text'
                    }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                    {isRefillMode ? 'KU ID is locked during refill mode.' : 'Your official university roll or enrollment number.'}
                  </span>
                </div>

                {/* 2-Column Grid: Semester & Class */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--navy)', marginBottom: '8px' }}>
                      3. Current Semester <span style={{ color: '#dc2626' }}>*</span>
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
                        background: '#faf8f5',
                        border: '1.5px solid #dfd7cc',
                        color: 'var(--navy)',
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
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--navy)', marginBottom: '8px' }}>
                      4. Class / Branch / Division <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="cls"
                      value={formData.cls}
                      onChange={handleChange}
                      placeholder="e.g. B.Tech Cyber - 5th, AI-ML (B)"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: '#faf8f5',
                        border: '1.5px solid #dfd7cc',
                        color: 'var(--navy)',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Field 5: Work Category / Department */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--navy)', marginBottom: '8px' }}>
                    5. Work Department / Category <span style={{ color: '#dc2626' }}>*</span>
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
                      background: '#faf8f5',
                      border: '1.5px solid #dfd7cc',
                      color: 'var(--navy)',
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
                        background: '#ffffff',
                        border: '1.5px solid var(--gold)',
                        color: 'var(--navy)',
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
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--navy)', marginBottom: '8px' }}>
                      6. Mobile / WhatsApp Number <span style={{ color: '#dc2626' }}>*</span>
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
                        background: '#faf8f5',
                        border: '1.5px solid #dfd7cc',
                        color: 'var(--navy)',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--navy)', marginBottom: '8px' }}>
                      7. Student Email Address <span style={{ color: '#dc2626' }}>*</span>
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
                        background: '#faf8f5',
                        border: '1.5px solid #dfd7cc',
                        color: 'var(--navy)',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Disclaimer Callout */}
                <div style={{ padding: '14px 18px', background: 'var(--cream)', borderRadius: '10px', border: '1.5px solid var(--border)', fontSize: '12.5px', color: 'var(--text-mid)', lineHeight: 1.6 }}>
                  ⚡ <strong style={{ color: 'var(--navy)' }}>Compulsory Verification:</strong> All seven fields are mandatory. Once submitted, your profile is immediately recorded in the AAYAM Master Volunteers Database for On-Duty (OD) Attendance validation.
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '15px 32px',
                    borderRadius: '12px',
                    background: isRefillMode
                      ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                      : 'linear-gradient(135deg, #c8922a 0%, #e8a93a 50%, #c8922a 100%)',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: '800',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: isRefillMode
                      ? '0 8px 24px rgba(2, 132, 199, 0.35)'
                      : '0 8px 24px rgba(200, 146, 42, 0.35)',
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
                      <span style={{ width: '16px', height: '16px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }}></span>
                      {isRefillMode ? 'Updating Volunteer Details...' : 'Submitting Volunteer Data...'}
                    </>
                  ) : (
                    isRefillMode ? 'Update My Volunteer Registration 🔄' : 'Submit Volunteer Registration ✨'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* 5. SUBMISSION SUCCESS CARD */}
          {submittedData && (
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #86efac',
              borderRadius: '20px',
              padding: '44px 32px',
              textAlign: 'center',
              boxShadow: '0 12px 36px rgba(16, 185, 129, 0.12)'
            }}>
              <div style={{ width: '74px', height: '74px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.12)', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '36px', color: '#16a34a' }}>
                ✓
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--navy)', margin: '0 0 10px', fontFamily: "'Playfair Display', serif" }}>
                {submittedData.isUpdate ? 'Registration Updated Successfully!' : 'Registration Recorded Successfully!'}
              </h2>
              <p style={{ color: 'var(--text-mid)', fontSize: '15px', margin: '0 auto 28px', maxWidth: '540px', lineHeight: 1.6 }}>
                {submittedData.isUpdate
                  ? `Your volunteer registration details for ${submittedData.name} (${submittedData.qid}) have been successfully updated in the AAYAM Master Volunteers database.`
                  : 'Your volunteer data has been recorded and synced directly with the AAYAM Master Volunteers database. You are now officially verified for On-Duty (OD) Attendance sheet processing.'}
              </p>

              {/* Verified Student Summary Card */}
              <div style={{ background: 'var(--cream)', borderRadius: '14px', border: '1.5px solid var(--border)', padding: '24px', maxWidth: '560px', margin: '0 auto 32px', textAlign: 'left' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Student Name</span>
                    <strong style={{ color: 'var(--navy)', fontSize: '15px' }}>{submittedData.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>KU ID / Roll No.</span>
                    <strong style={{ color: 'var(--gold)', fontSize: '15px', fontFamily: 'monospace' }}>{submittedData.qid}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Semester</span>
                    <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>Semester {submittedData.sem}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Class / Branch</span>
                    <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>{submittedData.cls}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Work Department</span>
                    <span style={{ color: '#0284c7', fontWeight: '700' }}>{submittedData.cat}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Mobile / Phone</span>
                    <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>{submittedData.phone}</span>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Email Address</span>
                    <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>{submittedData.email}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-primary"
                  style={{ padding: '12px 28px', fontSize: '14px' }}
                >
                  + Register Another Volunteer
                </button>
                <Link
                  to="/"
                  style={{
                    padding: '12px 24px',
                    borderRadius: '10px',
                    background: '#ffffff',
                    color: 'var(--navy)',
                    border: '1.5px solid var(--border)',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '14px'
                  }}
                >
                  Return to Website
                </Link>
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
