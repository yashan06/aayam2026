import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_HOME_EVENTS = [
  {
    id: 1,
    title: 'EQUINOX 3.0',
    subtitle: 'Technical Symposium',
    description: 'The flagship technical symposium of UIT — hackathons, paper presentations, and tech talks.',
    date_str: '18 MAR',
    location: 'KU Campus',
    image: '/equinox_event.png'
  },
  {
    id: 2,
    title: 'INFERNO 3.0',
    subtitle: 'The Battle of Brains',
    description: 'Intense coding battles, robotics challenges, and problem solving hackathons.',
    date_str: '19 MAR',
    location: 'KU Auditorium',
    image: '/inferno_event.png'
  },
  {
    id: 3,
    title: 'ARIARO 4.0',
    subtitle: 'National Technical Symposium',
    description: 'National symposium showcasing student tech projects and guest keynotes.',
    date_str: '20 MAR',
    location: 'KU Engineering Block',
    image: '/ariaro_event.png'
  }
];

export default function Home() {
  const [homeEvents, setHomeEvents] = useState([]);

  useEffect(() => {
    fetchHomeEvents();

    // Scroll animations
    const observerOptions = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const animatables = document.querySelectorAll(
      '.event-card, .event-card-full, .branch-card, .member-card, .initiative-card, .stat-item'
    );
    animatables.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = `opacity 0.5s ease ${i * 0.05}s, transform 0.5s ease ${i * 0.05}s`;
      observer.observe(el);
    });

    // Counter animation
    const counters = document.querySelectorAll('.stat-num');
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const text = el.textContent.trim();
          const hasPlus = text.includes('+');
          const num = parseInt(text.replace(/\D/g, ''));
          if (!isNaN(num)) {
            let start = 0;
            const duration = 1500;
            const step = Math.ceil(num / (duration / 16));
            const timer = setInterval(() => {
              start = Math.min(start + step, num);
              el.textContent = start + (hasPlus ? '+' : '');
              if (start >= num) clearInterval(timer);
            }, 16);
          }
          countObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => countObserver.observe(counter));

    return () => {
      observer.disconnect();
      countObserver.disconnect();
    };
  }, []);

  const fetchHomeEvents = async () => {
    try {
      const res = await fetch(`/api/events?_t=${Date.now()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        setHomeEvents(data.events.slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching home events:', err);
    }
  };

  const parseDateBadge = (dateStr) => {
    if (!dateStr) return { num: '18', mon: 'MAR' };
    const parts = dateStr.trim().split(/\s+/);
    if (parts.length >= 2) {
      return { num: parts[0], mon: parts[1].slice(0, 3).toUpperCase() };
    }
    return { num: '18', mon: 'MAR' };
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero-redesign hero-bg-sketch" style={{ backgroundImage: "url('/home_bg.jpg')" }}>
        <div className="hero-overlay"></div>
        <div className="hero-dots-pattern hero-dots-top"></div>
        <div className="hero-dots-pattern hero-dots-bottom"></div>

        <div className="hero-container">
          <div className="hero-left-content">
            <div className="hero-ku-header">KARNAVATI UNIVERSITY</div>
            <div className="hero-uit-pill">
              <span className="pill-dot"></span> UIT · UNITEDWORLD INSTITUTE OF TECHNOLOGY
            </div>
            <div className="hero-welcome-sub">WELCOME TO</div>
            <h1 className="hero-aayam-title">AAYAM</h1>
            <div className="hero-devanagari-sub">
              <span>आयाम</span> · Official UIT Students' Committee
            </div>
            <p className="hero-tagline">
              Where ideas become events, events become memories, and students become leaders.
            </p>
            <div className="hero-buttons-wrap">
              <Link to="/events" className="btn-navy-pill">
                Explore Events
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link to="/team" className="btn-outline-pill">Meet Our Team</Link>
            </div>
          </div>
        </div>

        {/* STATS FLOATING BAR */}
        <div className="stats-floating-wrapper">
          <div className="stats-floating-bar">
            <div className="stat-box">
              <div className="stat-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div className="stat-text">
                <span className="stat-number stat-num">150+</span>
                <span className="stat-lbl">Active Members</span>
              </div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-box">
              <div className="stat-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div className="stat-text">
                <span className="stat-number stat-num">20+</span>
                <span className="stat-lbl">Events Organized</span>
              </div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-box">
              <div className="stat-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
              </div>
              <div className="stat-text">
                <span className="stat-number stat-num">25+</span>
                <span className="stat-lbl">Achievements</span>
              </div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-box">
              <div className="stat-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <div className="stat-text">
                <span className="stat-number stat-num">8</span>
                <span className="stat-lbl">Core Branches</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS & HIGHLIGHTS */}
      <section className="middle-combined-section">
        <div className="middle-combined-container">
          <div className="section-tag center">OUR EVENTS</div>
          <h2 className="section-title center">Experience Extraordinary<br /><span className="gold">Student Initiatives.</span></h2>
          <p className="section-subtitle center">From technical symposiums to cultural extravaganzas, AAYAM brings energy and purpose to campus life.</p>

          <div className="events-grid-home" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', marginTop: '40px' }}>
            {homeEvents.map((ev) => {
              const badge = parseDateBadge(ev.date_str);
              return (
                <article key={ev.id} className="event-card hover-card">
                  <div className="event-banner" style={!ev.image ? { background: 'linear-gradient(135deg,#0f1b3c,#1a3060)' } : {}}>
                    {ev.image ? (
                      <img src={ev.image} alt={ev.title} />
                    ) : (
                      <div className="event-banner-overlay" style={{ opacity: 1, background: 'linear-gradient(135deg,rgba(15,27,60,0.9),rgba(15,27,60,0.6))' }}>
                        <div className="event-name">{ev.title}</div>
                        <div className="event-sub">{ev.subtitle || 'Special Event'}</div>
                      </div>
                    )}
                    <div className="event-date-badge">
                      <div className="event-date-num">{badge.num}</div>
                      <div className="event-date-mon">{badge.mon}</div>
                    </div>
                  </div>
                  <div className="event-info">
                    <div className="event-title-sm">{ev.title}</div>
                    <p className="event-desc-sm">{ev.description || ev.subtitle || 'Exciting student event organized by AAYAM UIT.'}</p>
                    <div className="event-meta">
                      <div className="event-meta-item">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> {ev.location}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/events" className="btn-primary">View All Events <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg></Link>
          </div>
        </div>
      </section>

      {/* CORE BRANCHES */}
      <section class="branches-section" style={{ background: 'var(--cream)', padding: '80px 40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div class="section-tag center">OUR ARCHITECTURE</div>
          <h2 class="section-title center">8 Core Pillars of <span class="gold">AAYAM.</span></h2>
          <p class="section-subtitle center">Our committee is divided into 8 specialized branches, each driving a distinct aspect of student life.</p>

          <div class="branches-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginTop: '48px' }}>
            <div class="branch-card hover-card">
              <div class="branch-icon">⚙️</div>
              <h3>Management</h3>
              <p>Planning, coordinating, and executing large-scale campus events and initiatives seamlessly.</p>
            </div>
            <div class="branch-card hover-card">
              <div class="branch-icon">📸</div>
              <h3>Media & Content</h3>
              <p>Capturing memories, creating engaging visual content, graphics, and social media campaigns.</p>
            </div>
            <div class="branch-card hover-card">
              <div class="branch-icon">💻</div>
              <h3>Technical</h3>
              <p>Driving tech workshops, hackathons, web development, and technical symposiums.</p>
            </div>
            <div class="branch-card hover-card">
              <div class="branch-icon">🏆</div>
              <h3>Sports</h3>
              <p>Organizing inter-departmental tournaments, athletic leagues, and promoting fitness.</p>
            </div>
            <div class="branch-card hover-card">
              <div class="branch-icon">🎭</div>
              <h3>Cultural</h3>
              <p>Bringing music, dance, drama, and artistic festivals to life with enthusiasm.</p>
            </div>
            <div class="branch-card hover-card">
              <div class="branch-icon">📢</div>
              <h3>Communication</h3>
              <p>Public relations, outreach, sponsor negotiations, and inter-university liaison.</p>
            </div>
            <div class="branch-card hover-card">
              <div class="branch-icon">🤝</div>
              <h3>Hospitality</h3>
              <p>Welcoming dignitaries, managing guest accommodations, and stage protocols.</p>
            </div>
            <div class="branch-card hover-card">
              <div class="branch-icon">🛡️</div>
              <h3>Discipline</h3>
              <p>Ensuring decorum, crowd management, and safety during major university events.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
