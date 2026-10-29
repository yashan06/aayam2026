import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// 9 official team category sections
const TEAM_SECTIONS = [
  { id: 'President', title: 'President', subtitle: 'STUDENT BODY LEADERSHIP & APEX DIRECTION' },
  { id: 'Head', title: 'Head', subtitle: 'EXECUTIVE LEADERSHIP & COMMITTEE HEADS' },
  { id: 'Management Team', title: 'Management Team', subtitle: 'OPERATIONS, LOGISTICS & PLANNING' },
  { id: 'Sports Team', title: 'Sports Team', subtitle: 'TOURNAMENTS, ATHLETICS & FITNESS' },
  { id: 'Cultural Team', title: 'Cultural Team', subtitle: 'PERFORMING ARTS, MUSIC & FESTIVALS' },
  { id: 'Media Team', title: 'Media Team', subtitle: 'PHOTOGRAPHY, CREATIVE DESIGN & BRANDING' },
  { id: 'Communication Team', title: 'Communication Team', subtitle: 'PUBLIC RELATIONS, OUTREACH & STUDENT ENGAGEMENT' },
  { id: 'Technical Team', title: 'Technical Team', subtitle: 'WEB DEVELOPMENT, HACKATHONS & TECH LABS' },
  { id: 'Hospitality Team', title: 'Hospitality Team', subtitle: 'GUEST WELCOME, RECEPTION & VIP MANAGEMENT' }
];

// In-memory cache for instant navigation without loading delays
let cachedTeamList = null;

export default function Team() {
  const location = useLocation();
  const [teamList, setTeamList] = useState(() => cachedTeamList || []);
  const [loading, setLoading] = useState(() => !cachedTeamList);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchTeam();
  }, []);

  // Smooth scroll to targeted branch section when hash exists in URL
  useEffect(() => {
    if (!loading && location.hash) {
      const cleanHash = decodeURIComponent(location.hash.slice(1)).toLowerCase().trim();
      const scrollToTarget = () => {
        const el = document.getElementById(cleanHash) ||
                   document.getElementById(`${cleanHash}-team`) ||
                   document.getElementById(cleanHash.replace(/-team$/, ''));
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
      const timer = setTimeout(scrollToTarget, 120);
      return () => clearTimeout(timer);
    }
  }, [loading, location.hash]);

  const fetchTeam = async () => {
    try {
      const res = await fetch(`/api/team?_t=${Date.now()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.team)) {
        cachedTeamList = data.team;
        setTeamList(data.team);
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to normalize category matching
  const getMembersByCategory = (catId) => {
    return teamList.filter(m => {
      const c = (m.category || '').toLowerCase().trim();
      const role = (m.role || '').toLowerCase().trim();
      const target = catId.toLowerCase().trim();
      if (target === 'president') {
        return c === 'president' || c === 'presidents' || role === 'president';
      }
      if (target === 'head') {
        return (c === 'head' || c === 'leadership' || c === 'executive') && c !== 'president' && role !== 'president';
      }
      if (target === 'management team') {
        return c === 'management team' || c === 'management' || (c === 'branch_head' && (m.branch_title || '').toLowerCase().includes('management'));
      }
      if (target === 'sports team') {
        return c === 'sports team' || c === 'sports' || (c === 'branch_head' && (m.branch_title || '').toLowerCase().includes('sports'));
      }
      if (target === 'cultural team') {
        return c === 'cultural team' || c === 'cultural' || (c === 'branch_head' && (m.branch_title || '').toLowerCase().includes('cultural'));
      }
      if (target === 'media team') {
        return (c === 'media team' || c === 'media' || c === 'media & design' || (c === 'branch_head' && (m.branch_title || '').toLowerCase().includes('media'))) && !c.includes('communication');
      }
      if (target === 'communication team') {
        return c === 'communication team' || c === 'communication' || c === 'pr' || c === 'communications' || (c === 'branch_head' && (m.branch_title || '').toLowerCase().includes('communication'));
      }
      if (target === 'technical team') {
        return c === 'technical team' || c === 'technical' || c === 'tech' || (c === 'branch_head' && (m.branch_title || '').toLowerCase().includes('technical'));
      }
      if (target === 'hospitality team') {
        return c === 'hospitality team' || c === 'hospitality' || (c === 'branch_head' && (m.branch_title || '').toLowerCase().includes('hospitality'));
      }
      return c === target;
    });
  };

  return (
    <>
      {/* CSS Animations & Styles */}
      <style>{`
        @keyframes teamFadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes modalPopInCenter {
          0% {
            opacity: 0;
            transform: scale(0.85) translateY(24px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .team-member-card {
          animation: teamFadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .team-member-card:hover {
          transform: translateY(-8px);
        }

        .team-avatar-img {
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .team-member-card:hover .team-avatar-img {
          transform: scale(1.08);
          box-shadow: 0 10px 28px rgba(197, 160, 89, 0.45);
          border-color: #e5be70 !important;
        }

        .social-link-btn {
          transition: all 0.2s ease;
        }
        .social-link-btn:hover {
          transform: scale(1.15);
          background: #C5A059 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(197, 160, 89, 0.4);
        }

        /* Modal Contact Action Cards (Bespoke UX & Perfect Alignment) */
        .contact-action-card {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .contact-action-card.email-card:hover {
          transform: translateY(-2px);
          border-color: #C5A059 !important;
          box-shadow: 0 6px 20px rgba(197, 160, 89, 0.22) !important;
        }
        .contact-action-card.linkedin-card:hover {
          transform: translateY(-2px);
          background: #0a66c2 !important;
          border-color: #0a66c2 !important;
          color: #ffffff !important;
          box-shadow: 0 6px 18px rgba(10, 102, 194, 0.25) !important;
        }
        .contact-action-card.linkedin-card:hover svg {
          fill: #ffffff !important;
        }
        .contact-action-card.instagram-card:hover {
          transform: translateY(-2px);
          background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%) !important;
          border-color: transparent !important;
          color: #ffffff !important;
          box-shadow: 0 6px 18px rgba(220, 39, 67, 0.25) !important;
        }
        .contact-action-card.instagram-card:hover svg {
          stroke: #ffffff !important;
        }

        /* Top-Right Floating Circle Close Button */
        .modal-top-close-btn {
          position: absolute;
          top: 18px;
          right: 18px;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #ffffff;
          border: 1.5px solid #e2d7c5;
          color: var(--navy);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(15, 27, 60, 0.12);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 10;
        }

        .modal-top-close-btn:hover {
          transform: rotate(90deg) scale(1.12);
          background: #C5A059;
          border-color: #C5A059;
          color: #ffffff;
          box-shadow: 0 6px 20px rgba(197, 160, 89, 0.45);
        }

        /* Bottom Close Pill Button */
        .modal-bottom-close-btn {
          width: 100%;
          padding: 13px 24px;
          background: linear-gradient(135deg, #7c5235 0%, #5a3922 100%);
          color: #ffffff;
          border: none;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 6px 20px rgba(124, 82, 53, 0.3);
          transition: all 0.25s ease;
        }

        .modal-bottom-close-btn:hover {
          transform: translateY(-2deg);
          box-shadow: 0 10px 25px rgba(124, 82, 53, 0.45);
          background: linear-gradient(135deg, #8d5e3d 0%, #684227 100%);
        }
      `}</style>

      {/* HERO SECTION */}
      <section className="events-hero" style={{ padding: '70px 20px 40px', textAlign: 'center', background: 'var(--cream)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* OUR TEAM Title - Increased font size so it's bold, clear & prominent */}
          <div style={{
            color: '#C5A059',
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '4px',
            textTransform: 'uppercase',
            marginBottom: '14px',
            fontFamily: "'Playfair Display', serif"
          }}>
            OUR TEAM
          </div>
          {/* Subheading - Slightly reduced size for clean visual hierarchy */}
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(26px, 3.2vw, 36px)',
            fontWeight: 700,
            color: 'var(--navy)',
            margin: '0 0 14px',
            lineHeight: 1.25
          }}>
            The Minds Behind <span className="text-gold italic">AAYAM</span>
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-mid)', fontWeight: 500, maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Meet the dedicated student leaders, committee heads, and departmental pillars driving innovation and impact at UIT.
          </p>
        </div>
      </section>

      {/* RENDER ALL 6 TEAM CATEGORIES */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--navy)', fontWeight: 600 }}>
          Loading Team Members...
        </div>
      ) : (
        TEAM_SECTIONS.map((sec, index) => {
          const members = getMembersByCategory(sec.id);
          const isEven = index % 2 === 0;
          const sectionSlug = sec.id.toLowerCase().replace(/\s+/g, '-');
          const shortSlug = sec.id.toLowerCase().replace(/\s+team$/i, '');

          return (
            <section
              key={sec.id}
              id={sectionSlug}
              style={{
                padding: '60px 24px 80px',
                background: isEven ? 'var(--cream)' : 'var(--cream-dark)',
                borderTop: index > 0 ? '1px solid var(--border)' : 'none',
                scrollMarginTop: '110px'
              }}
            >
              {/* Invisible anchor target for short slugs e.g. #media, #sports, #communication */}
              {shortSlug !== sectionSlug && (
                <span id={shortSlug} style={{ display: 'block', position: 'relative', top: '-110px', visibility: 'hidden' }} />
              )}
              <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                
                {/* Category Header with Decorative Underline Rule */}
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                  <div style={{ color: '#C5A059', fontSize: '11px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
                    {sec.subtitle}
                  </div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '34px', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
                    {sec.title}
                  </h2>
                  <div style={{ width: '60px', height: '3px', background: '#C5A059', margin: '12px auto 0', borderRadius: '2px' }} />
                </div>

                {members.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '14px' }}>
                    No members added to {sec.title} yet.
                  </div>
                ) : (
                  /* Centered Responsive Avatar Grid */
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '40px 24px',
                    justifyContent: 'center'
                  }}>
                    {members.map((item, itemIdx) => (
                      <div
                        key={item.id}
                        className="team-member-card"
                        onClick={() => setSelectedMember(item)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          animationDelay: `${itemIdx * 0.08}s`
                        }}
                      >
                        
                        {/* REAL STUDENT HEADSHOT PHOTO AVATAR (SQUARE SHAPE) */}
                        <div style={{ position: 'relative', marginBottom: '14px' }}>
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="team-avatar-img"
                              style={{
                                width: '124px',
                                height: '124px',
                                borderRadius: '16px',
                                objectFit: 'cover',
                                border: '2.5px solid #C5A059',
                                boxShadow: '0 6px 18px rgba(15,27,60,0.12)'
                              }}
                            />
                          ) : (
                            <div
                              className="team-avatar-img"
                              style={{
                                width: '124px',
                                height: '124px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #0f1b3c 0%, #1a2a55 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '48px',
                                color: '#ffffff',
                                border: '2.5px solid #C5A059',
                                boxShadow: '0 6px 18px rgba(15,27,60,0.12)'
                              }}
                            >
                              👤
                            </div>
                          )}
                        </div>

                        {/* STUDENT NAME (PRIMARY - BOLD SERIF) */}
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 800, color: 'var(--navy)', margin: '0 0 4px' }}>
                          {item.name}
                        </h3>

                        {/* ROLE / DESIGNATION (SUBTITLE - UPPERCASE GOLD) */}
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#C5A059', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                          {item.role || item.branch_title || 'MEMBER'}
                        </div>

                        {/* SHORT BIO / RESPONSIBILITIES */}
                        {item.description && (
                          <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: '0 0 10px', maxWidth: '180px' }}>
                            {item.description}
                          </p>
                        )}
                        {/* LINKEDIN, INSTAGRAM & EMAIL SOCIAL LINKS */}
                        {(Boolean(item.linkedin_url && item.linkedin_url.trim()) ||
                          Boolean(item.instagram_url && item.instagram_url.trim()) ||
                          Boolean(item.email && item.email.trim())) && (
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}
                            onClick={(e) => e.stopPropagation()} // Prevent card popup if clicking links directly
                          >
                            {/* LinkedIn Link */}
                            {Boolean(item.linkedin_url && item.linkedin_url.trim()) && (
                              <a
                                href={item.linkedin_url.trim()}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`LinkedIn Profile of ${item.name}`}
                                className="social-link-btn"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  background: '#f4ede2',
                                  color: 'var(--navy)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  textDecoration: 'none',
                                  border: '1px solid #e2d7c5'
                                }}
                              >
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                                </svg>
                              </a>
                            )}

                            {/* Instagram Link */}
                            {Boolean(item.instagram_url && item.instagram_url.trim()) && (
                              <a
                                href={item.instagram_url.trim()}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Instagram Profile of ${item.name}`}
                                className="social-link-btn"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  background: '#f4ede2',
                                  color: '#d62976',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  textDecoration: 'none',
                                  border: '1px solid #e2d7c5'
                                }}
                              >
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                                </svg>
                              </a>
                            )}

                            {/* Email Link */}
                            {Boolean(item.email && item.email.trim()) && (
                              <a
                                href={`mailto:${item.email.trim()}`}
                                aria-label={`Send email to ${item.name}`}
                                className="social-link-btn"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  background: '#f4ede2',
                                  color: 'var(--navy)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  textDecoration: 'none',
                                  border: '1px solid #e2d7c5'
                                }}
                              >
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                  <polyline points="22,6 12,13 2,6"/>
                                </svg>
                              </a>
                            )}
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })
      )}

      {/* ========================================================================= */}
      {/* PERFECTLY CENTERED MEMBER DETAILS MODAL POPUP WITH PREMIUM CLOSE UI/UX */}
      {/* ========================================================================= */}
      {selectedMember && (
        <div
          onClick={() => setSelectedMember(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 27, 60, 0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            boxSizing: 'border-box',
            overflowY: 'auto'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside the card
            style={{
              background: '#faf6f0',
              borderRadius: '28px',
              padding: '36px 28px 28px',
              maxWidth: '480px',
              width: '100%',
              maxHeight: '88vh',
              overflowY: 'auto',
              border: '1.5px solid #e2d7c5',
              boxShadow: '0 25px 70px rgba(0,0,0,0.5), 0 0 0 1px rgba(197, 160, 89, 0.25)',
              textAlign: 'center',
              position: 'relative',
              margin: 'auto',
              animation: 'modalPopInCenter 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            {/* PREMIUM TOP-RIGHT FLOATING CIRCULAR CLOSE BUTTON (UX IMPROVED) */}
            <button
              type="button"
              onClick={() => setSelectedMember(null)}
              className="modal-top-close-btn"
              aria-label="Close Profile Modal"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* Profile Avatar Image */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
              {selectedMember.image ? (
                <img
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '18px',
                    objectFit: 'cover',
                    border: '3px solid #C5A059',
                    boxShadow: '0 10px 28px rgba(197, 160, 89, 0.35)'
                  }}
                />
              ) : (
                <div style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #0f1b3c 0%, #1a2a55 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  fontSize: '54px',
                  color: '#ffffff',
                  border: '3px solid #C5A059',
                  boxShadow: '0 10px 30px rgba(197, 160, 89, 0.4)'
                }}>
                  👤
                </div>
              )}
            </div>

            {/* Full Name */}
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '26px',
              fontWeight: 800,
              color: 'var(--navy)',
              margin: '0 0 6px',
              lineHeight: 1.2
            }}>
              {selectedMember.name}
            </h2>

            {/* Role Badge */}
            <div style={{
              display: 'inline-block',
              background: '#f4ede2',
              border: '1px solid #e2d7c5',
              color: '#C5A059',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              padding: '6px 18px',
              borderRadius: '20px',
              marginBottom: '10px'
            }}>
              {selectedMember.role || 'Member'}
            </div>

            {/* Team Category Pill */}
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '20px' }}>
              TEAM: <span style={{ color: 'var(--navy)', textTransform: 'uppercase' }}>{selectedMember.category || 'AAYAM Member'}</span>
            </div>

            {/* Short Bio / Description */}
            {selectedMember.description && (
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '18px 20px',
                border: '1.5px solid #e8dfd1',
                fontSize: '14px',
                color: '#334155',
                lineHeight: 1.7,
                textAlign: 'left',
                marginBottom: '24px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#C5A059', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
                  About & Responsibilities
                </div>
                {selectedMember.description}
              </div>
            )}

            {/* CONNECT & CONTACT SECTION (HIGH-END UI/UX & PERFECT ALIGNMENT) */}
            {(Boolean(selectedMember.email && selectedMember.email.trim()) ||
              Boolean(selectedMember.linkedin_url && selectedMember.linkedin_url.trim()) ||
              Boolean(selectedMember.instagram_url && selectedMember.instagram_url.trim())) && (
              <div style={{ marginTop: '18px', marginBottom: '22px' }}>
                {/* Divider Heading */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  marginBottom: '14px'
                }}>
                  <div style={{ flex: 1, height: '1px', background: '#e2d7c5' }} />
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    letterSpacing: '1.8px',
                    color: '#C5A059',
                    textTransform: 'uppercase'
                  }}>
                    Get In Touch
                  </span>
                  <div style={{ flex: 1, height: '1px', background: '#e2d7c5' }} />
                </div>

                {/* 1. Official Email Card (Only if email is provided) */}
                {Boolean(selectedMember.email && selectedMember.email.trim()) && (
                  <a
                    href={'mailto:' + selectedMember.email.trim()}
                    aria-label={'Send email to ' + selectedMember.name}
                    className="contact-action-card email-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: '#ffffff',
                      borderRadius: '14px',
                      border: '1.5px solid #e8dfd1',
                      textDecoration: 'none',
                      marginBottom: (Boolean(selectedMember.linkedin_url && selectedMember.linkedin_url.trim()) || Boolean(selectedMember.instagram_url && selectedMember.instagram_url.trim())) ? '12px' : '0',
                      boxShadow: '0 2px 8px rgba(15, 27, 60, 0.04)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: '#fbf6ee',
                        border: '1px solid #eadbc2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#C5A059',
                        flexShrink: 0
                      }}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </div>
                      <div style={{ textAlign: 'left', minWidth: 0 }}>
                        <div style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          letterSpacing: '1px',
                          color: '#8c734b',
                          textTransform: 'uppercase',
                          marginBottom: '2px'
                        }}>
                          Official Email
                        </div>
                        <div style={{
                          fontSize: '13.5px',
                          fontWeight: 700,
                          color: 'var(--navy)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {selectedMember.email.trim()}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      background: 'var(--navy)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0,
                      marginLeft: '8px'
                    }}>
                      Mail ↗
                    </div>
                  </a>
                )}

                {/* 2. Symmetrical LinkedIn & Instagram Grid */}
                {(Boolean(selectedMember.linkedin_url && selectedMember.linkedin_url.trim()) || Boolean(selectedMember.instagram_url && selectedMember.instagram_url.trim())) && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: (Boolean(selectedMember.linkedin_url && selectedMember.linkedin_url.trim()) && Boolean(selectedMember.instagram_url && selectedMember.instagram_url.trim())) ? '1fr 1fr' : '1fr',
                    gap: '10px'
                  }}>
                    {/* LinkedIn Button */}
                    {Boolean(selectedMember.linkedin_url && selectedMember.linkedin_url.trim()) && (
                      <a
                        href={selectedMember.linkedin_url.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={'LinkedIn Profile of ' + selectedMember.name}
                        className="contact-action-card linkedin-card"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          background: '#ffffff',
                          border: '1.5px solid #d4dfec',
                          color: '#0a66c2',
                          fontSize: '13px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          boxShadow: '0 2px 8px rgba(15, 27, 60, 0.04)'
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                        </svg>
                        <span>LinkedIn</span>
                        <span style={{ fontSize: '11px', opacity: 0.7 }}>↗</span>
                      </a>
                    )}

                    {/* Instagram Button */}
                    {Boolean(selectedMember.instagram_url && selectedMember.instagram_url.trim()) && (
                      <a
                        href={selectedMember.instagram_url.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={'Instagram Profile of ' + selectedMember.name}
                        className="contact-action-card instagram-card"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          background: '#ffffff',
                          border: '1.5px solid #f2dbe0',
                          color: '#d62976',
                          fontSize: '13px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          boxShadow: '0 2px 8px rgba(15, 27, 60, 0.04)'
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                        </svg>
                        <span>Instagram</span>
                        <span style={{ fontSize: '11px', opacity: 0.7 }}>↗</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SLEEK BOTTOM CLOSE BUTTON */}
            <button
              type="button"
              onClick={() => setSelectedMember(null)}
              className="modal-bottom-close-btn"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Close Profile
            </button>

          </div>
        </div>
      )}
    </>
  );
}
