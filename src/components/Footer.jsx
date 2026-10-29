import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll to top when clicking any Quick Link
  const handleQuickLink = (path) => {
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  // Scroll directly to the core branch team section on the Team page
  const handleBranchClick = (e, branchSlug) => {
    e.preventDefault();
    const targetHash = `#${branchSlug}`;
    if (location.pathname === '/team') {
      const el = document.getElementById(branchSlug) ||
                 document.getElementById(`${branchSlug}-team`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', `/team${targetHash}`);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      navigate(`/team${targetHash}`);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '14px',
              background: '#ffffff',
              padding: '10px 20px',
              borderRadius: '14px',
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.22)',
              marginBottom: '20px'
            }}
          >
            {/* Karnavati University Logo */}
            <img
              src="/karnavati_logo.png"
              alt="Karnavati University"
              style={{
                height: '36px',
                width: 'auto',
                objectFit: 'contain',
                background: 'transparent',
                display: 'block'
              }}
            />

            <div style={{ height: '24px', width: '1px', background: 'rgba(15, 27, 60, 0.18)' }}></div>

            {/* UIT Logo */}
            <img
              src="/uit_logo.png"
              alt="UIT"
              style={{
                height: '30px',
                width: 'auto',
                objectFit: 'contain',
                background: 'transparent',
                display: 'block'
              }}
            />

            <div style={{ height: '24px', width: '1px', background: 'rgba(15, 27, 60, 0.18)' }}></div>

            {/* AAYAM Logo */}
            <img
              src="/aayam_logo.png"
              alt="AAYAM"
              style={{
                height: '36px',
                width: 'auto',
                objectFit: 'contain',
                background: 'transparent',
                display: 'block'
              }}
            />
          </div>
          <p>AAYAM UIT Student Committee — Building Leaders, Creating Impact.</p>
          <div className="footer-socials">
            {/* Instagram Link */}
            <a
              href="https://www.instagram.com/uit_students_committee?igsh=NnN3Nm9nZW02c2Q="
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            {/* Email Direct Link */}
            <a
              href="mailto:uitstudentscommittee@karnavatiuniversity.edu.in"
              className="footer-social"
              aria-label="Email"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/" onClick={() => handleQuickLink('/')}>Home</Link></li>
            <li><Link to="/events" onClick={() => handleQuickLink('/events')}>Events</Link></li>
            <li><Link to="/team" onClick={() => handleQuickLink('/team')}>Our Team</Link></li>
            <li><Link to="/gallery" onClick={() => handleQuickLink('/gallery')}>Gallery</Link></li>
            <li><Link to="/contact" onClick={() => handleQuickLink('/contact')}>Contact Us</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Our Core Branches</h4>
          <ul>
            <li><Link to="/team#management" onClick={(e) => handleBranchClick(e, 'management')}>Management</Link></li>
            <li><Link to="/team#media" onClick={(e) => handleBranchClick(e, 'media')}>Media</Link></li>
            <li><Link to="/team#technical" onClick={(e) => handleBranchClick(e, 'technical')}>Technical</Link></li>
            <li><Link to="/team#sports" onClick={(e) => handleBranchClick(e, 'sports')}>Sports</Link></li>
            <li><Link to="/team#cultural" onClick={(e) => handleBranchClick(e, 'cultural')}>Cultural</Link></li>
            <li><Link to="/team#communication" onClick={(e) => handleBranchClick(e, 'communication')}>Communication</Link></li>
            <li><Link to="/team#hospitality" onClick={(e) => handleBranchClick(e, 'hospitality')}>Hospitality</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact Us</h4>
          <div className="footer-contact-item">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            <span>Karnavati University, Uvarsad, Gandhinagar, Gujarat 382422</span>
          </div>
          <div className="footer-contact-item">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            <a href="mailto:uitstudentscommittee@karnavatiuniversity.edu.in" style={{ color: 'inherit', textDecoration: 'none', wordBreak: 'break-all' }}>
              uitstudentscommittee@karnavatiuniversity.edu.in
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 AAYAM UIT Student Committee. All Rights Reserved.</p>
        <p>Designed with <span className="heart">♥</span> for students, by students.</p>
      </div>
    </footer>
  );
}
