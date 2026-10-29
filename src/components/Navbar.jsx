import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="mainNav">
        <div className="nav-inner">
          <Link to="/" className="nav-brand" style={{ display: 'inline-flex', alignItems: 'center', gap: '14px', textDecoration: 'none' }}>
            {/* Karnavati University NAAC A+ Logo */}
            <img
              src="/karnavati_logo.png"
              alt="Karnavati University"
              decoding="async"
              style={{
                height: scrolled ? '36px' : '44px',
                width: 'auto',
                objectFit: 'contain',
                background: 'transparent',
                transition: 'all 0.25s ease'
              }}
            />

            <div
              className="nav-divider"
              style={{
                width: '1px',
                height: scrolled ? '24px' : '30px',
                background: 'rgba(15, 27, 60, 0.2)',
                alignSelf: 'center',
                transition: 'all 0.25s ease'
              }}
            />

            {/* UIT Logo */}
            <img
              src="/uit_logo.png"
              alt="UIT"
              decoding="async"
              style={{
                height: scrolled ? '30px' : '36px',
                width: 'auto',
                objectFit: 'contain',
                background: 'transparent',
                transition: 'all 0.25s ease'
              }}
            />

            <div
              className="nav-divider"
              style={{
                width: '1px',
                height: scrolled ? '24px' : '30px',
                background: 'rgba(15, 27, 60, 0.2)',
                alignSelf: 'center',
                transition: 'all 0.25s ease'
              }}
            />

            {/* AAYAM Logo */}
            <img
              src="/aayam_logo.png"
              alt="AAYAM"
              decoding="async"
              style={{
                height: scrolled ? '36px' : '44px',
                width: 'auto',
                objectFit: 'contain',
                background: 'transparent',
                transition: 'all 0.25s ease'
              }}
            />
          </Link>

          <div className="nav-links">
            <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
            <Link to="/events" className={isActive('/events') ? 'active' : ''}>Events</Link>
            <Link to="/team" className={isActive('/team') ? 'active' : ''}>Our Team</Link>
            <Link to="/gallery" className={isActive('/gallery') ? 'active' : ''}>Gallery</Link>
            <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>Contact</Link>

            <div className="nav-auth-wrap" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginLeft: '12px' }}>
              {!user ? (
                <>
                  <Link to="/login" className="nav-login-btn">
                    <span>Log In</span>
                    <svg className="nav-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                    </svg>
                  </Link>
                  <Link to="/signup" className="nav-signup-btn">
                    <span>Sign Up</span>
                    <svg className="nav-signup-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </>
              ) : user.role === 'admin' ? (
                <>
                  <Link to="/admin" style={{ background: 'var(--navy)', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>👑 Admin Dashboard</Link>
                  <button onClick={handleLogoutClick} style={{ background: 'none', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '16px', fontSize: '11px', cursor: 'pointer', color: '#64748b' }}>Logout</button>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)', background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    🎓 Hi, {user.name ? user.name.split(' ')[0] : 'Student'}
                  </span>
                  <button onClick={handleLogoutClick} style={{ background: 'none', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '16px', fontSize: '11px', cursor: 'pointer', color: '#64748b' }}>Logout</button>
                </>
              )}
            </div>
          </div>

          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            id="hamburger"
            aria-label="Menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} id="mobileMenu">
        <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
        <Link to="/events" className={isActive('/events') ? 'active' : ''}>Events</Link>
        <Link to="/team" className={isActive('/team') ? 'active' : ''}>Our Team</Link>
        <Link to="/gallery" className={isActive('/gallery') ? 'active' : ''}>Gallery</Link>
        <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>Contact</Link>

        <div class="mobile-auth-section" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {!user ? (
            <>
              <Link to="/login" className="nav-login-btn" style={{ textAlign: 'center', padding: '11px', justifyContent: 'center', textDecoration: 'none', width: '100%' }}>
                <span>Log In</span>
                <svg className="nav-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                </svg>
              </Link>
              <Link to="/signup" className="nav-signup-btn" style={{ textAlign: 'center', padding: '11px', justifyContent: 'center', textDecoration: 'none', width: '100%' }}>
                <span>Sign Up</span>
                <svg className="nav-signup-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </>
          ) : user.role === 'admin' ? (
            <>
              <Link to="/admin" style={{ display: 'block', textAlign: 'center', padding: '10px', background: 'var(--navy)', color: '#fff', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', marginBottom: '8px' }}>👑 Admin Dashboard</Link>
              <button onClick={handleLogoutClick} style={{ width: '100%', padding: '8px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Logout</button>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px' }}>🎓 Logged in as {user.name}</div>
              <button onClick={handleLogoutClick} style={{ width: '100%', padding: '8px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Logout</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
