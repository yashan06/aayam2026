import React, { useState, useEffect } from 'react';
import EventRegistrationModal from '../components/EventRegistrationModal';
import EventDetailsView from '../components/EventDetailsView';

const DEFAULT_EVENTS = [
  {
    id: 1,
    title: 'Equinox 3.0',
    subtitle: 'Technical Symposium',
    category: 'technical',
    date_str: '18 March 2026',
    location: 'KU Campus',
    description: 'The flagship event of AAYAM UIT — a national-level technical symposium bringing together the brightest minds for competitions, talks, and innovation showcases.',
    status: 'featured',
    image: '/equinox_event.png'
  },
  {
    id: 2,
    title: 'Inferno 3.0',
    subtitle: 'The Battle of Brains',
    category: 'technical',
    date_str: '19 March 2026',
    location: 'KU Campus',
    description: 'Intense coding battles, robotics challenges, and problem solving hackathons.',
    status: 'upcoming',
    image: '/inferno_event.png'
  },
  {
    id: 3,
    title: 'Ariaro 4.0',
    subtitle: 'National Level Technical Symposium',
    category: 'technical',
    date_str: '20 March 2026',
    location: 'KU Campus',
    description: 'National symposium showcasing student tech projects and guest keynotes.',
    status: 'upcoming',
    image: '/ariaro_event.png'
  },
  {
    id: 4,
    title: 'Data Science Workshop',
    subtitle: 'Hands-on Machine Learning',
    category: 'technical',
    date_str: '28 Jan 2026',
    location: 'CS Lab, KU',
    description: 'An interactive workshop covering practical Python ML algorithms, data visualisations, and predictive analytics.',
    status: 'past',
    image: ''
  },
  {
    id: 5,
    title: 'Rang 2.0 — Cultural Festival',
    subtitle: 'Annual Cultural Festival',
    category: 'non-technical',
    date_str: '15 Feb 2026',
    location: 'KU Amphitheater',
    description: 'A vibrant celebration of music, dance, fashion, and artistic expressions by students.',
    status: 'past',
    image: ''
  },
  {
    id: 6,
    title: 'Sports League 2026',
    subtitle: 'Inter-Branch Championship',
    category: 'non-technical',
    date_str: '10 April 2026',
    location: 'KU Sports Complex',
    description: 'Inter-departmental athletic leagues and tournaments.',
    status: 'registering',
    image: ''
  }
];

export default function Events() {
  const [filter, setFilter] = useState('all');
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ isOpen: false, eventId: 1, eventTitle: '' });
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        setEventsList(data.events);
      }
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  const openRegisterModal = (id, title, customFields) => {
    setModalState({ isOpen: true, eventId: id, eventTitle: title, eventCustomFields: customFields });
  };

  const closeRegisterModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const openDetailsModal = (eventObj) => {
    setSelectedEvent(eventObj);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeDetailsModal = () => {
    setDetailsModalState({ isOpen: false, event: null });
  };

  const parseDateBadge = (dateStr, startDateStr) => {
    const src = startDateStr || dateStr;
    if (!src) return { num: '18', mon: 'MAR' };
    if (src.includes('-')) {
      const d = new Date(src);
      if (!isNaN(d.getTime())) {
        const num = d.getDate();
        const mon = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        return { num, mon };
      }
    }
    const match = src.match(/(\d+)\s+([A-Za-z]+)/);
    if (match) return { num: match[1], mon: match[2].slice(0, 3).toUpperCase() };
    return { num: '18', mon: 'MAR' };
  };

  const formatEventDate = (ev) => {
    if (ev.start_date && ev.end_date) {
      const s = new Date(ev.start_date);
      const e = new Date(ev.end_date);
      if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
        const sStr = s.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const eStr = e.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        return `${sStr} ➔ ${eStr}`;
      }
    }
    return ev.date_str || 'TBA';
  };

  const formatStatus = (status) => {
    switch (status ? status.toLowerCase() : '') {
      case 'featured': return { label: '★ Featured', class: 'status-featured' };
      case 'registering': return { label: '⚡ Registration Open', class: 'status-registering' };
      case 'completed':
      case 'past': return { label: '✓ Completed', class: 'status-past' };
      default: return { label: 'Upcoming', class: 'status-upcoming' };
    }
  };

  const visibleEvents = eventsList.filter(ev => !ev.visibility || ev.visibility === 'public');

  const filteredEvents = visibleEvents.filter(ev => {
    if (filter === 'all') return true;
    return (ev.category || '').toLowerCase() === filter;
  });

  const featuredEvent = visibleEvents.find(ev => (ev.status || '').toLowerCase() === 'featured');

  if (selectedEvent) {
    return (
      <>
        <EventDetailsView
          event={selectedEvent}
          onBack={() => setSelectedEvent(null)}
          onRegister={openRegisterModal}
        />
        <EventRegistrationModal
          isOpen={modalState.isOpen}
          onClose={closeRegisterModal}
          eventId={modalState.eventId}
          eventTitle={modalState.eventTitle}
          eventCustomFields={modalState.eventCustomFields}
        />
      </>
    );
  }

  return (
    <>
      {/* HERO SECTION MATCHING ATTACHED SCREENSHOT */}
      <section className="events-hero" style={{ padding: '70px 20px 30px', textAlign: 'center', background: 'var(--cream)' }}>
        <div className="events-hero-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            color: 'var(--gold)',
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            WHAT'S HAPPENING
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(44px, 5vw, 64px)',
            fontWeight: 800,
            color: 'var(--navy)',
            margin: '0 0 12px',
            lineHeight: 1.1
          }}>
            Events
          </h1>

          <p style={{
            fontSize: '15px',
            color: 'var(--text-mid)',
            fontWeight: 500,
            maxWidth: '600px',
            margin: '0 auto 32px',
            lineHeight: 1.6
          }}>
            All major events coordinated and supported by AAYAM Committee
          </p>

          <div className="filter-pill-container" style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Events' },
              { id: 'technical', label: 'Technical' },
              { id: 'non-technical', label: 'Non-Technical' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`filter-pill ${filter === cat.id ? 'active' : ''}`}
                style={{ cursor: 'pointer', padding: '10px 22px', borderRadius: '30px', fontWeight: 700, fontSize: '13px' }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED SPOTLIGHT HIGHLIGHT */}
      {featuredEvent && filter === 'all' && (
        <section className="featured-event-sec" style={{ padding: '0 24px 50px', background: 'var(--cream-dark)' }}>
          <div
            className="featured-card"
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              background: 'linear-gradient(135deg, #0b152c 0%, #15274d 60%, #1e3a73 100%)',
              borderRadius: '24px',
              padding: '44px',
              color: '#fff',
              boxShadow: '0 25px 60px rgba(15,27,60,0.35)',
              border: '1.5px solid rgba(197, 160, 89, 0.45)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Background Radial Glow Accent */}
            <div style={{
              position: 'absolute',
              top: '-100px',
              right: '-100px',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(200, 146, 42, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0
            }} />

            <div className="featured-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <div className="featured-info">
                
                {/* BADGE BAR */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: 'linear-gradient(135deg, #C5A059 0%, #E8D39E 100%)',
                    color: 'var(--navy)',
                    fontWeight: 900,
                    fontSize: '11px',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    boxShadow: '0 0 16px rgba(197, 160, 89, 0.4)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    ★ FEATURED SPOTLIGHT
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--gold-pale)',
                    background: 'rgba(255,255,255,0.08)',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    textTransform: 'capitalize'
                  }}>
                    {featuredEvent.category}
                  </span>
                </div>

                {/* TITLE & SUBTITLE */}
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, margin: '0 0 10px', color: '#fff', lineHeight: 1.15 }}>
                  {featuredEvent.title}
                </h2>
                {featuredEvent.subtitle && (
                  <p style={{ color: 'var(--gold-pale)', fontWeight: 700, fontSize: '17px', margin: '0 0 16px', letterSpacing: '0.2px' }}>
                    {featuredEvent.subtitle}
                  </p>
                )}

                {/* DESCRIPTION */}
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px', lineHeight: 1.65, margin: '0 0 28px', maxWidth: '580px' }}>
                  {featuredEvent.short_description || featuredEvent.description}
                </p>

                {/* METADATA ROW */}
                <div className="featured-meta" style={{ display: 'flex', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
                  <div className="featured-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.06)', padding: '8px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" style={{ color: 'var(--gold)' }}><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
                    {formatEventDate(featuredEvent)}
                  </div>
                  <div className="featured-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.06)', padding: '8px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" style={{ color: 'var(--gold)' }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    {featuredEvent.location}
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => openDetailsModal(featuredEvent)}
                    style={{
                      padding: '12px 26px',
                      borderRadius: '30px',
                      border: '1.5px solid var(--gold)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                    }}
                  >
                    View Details ➔
                  </button>
                  <button
                    onClick={() => openRegisterModal(featuredEvent.id, featuredEvent.title, featuredEvent.custom_fields)}
                    className="btn-primary"
                    style={{ border: 'none', cursor: 'pointer', borderRadius: '30px', padding: '12px 28px', fontSize: '13px', fontWeight: 800, boxShadow: '0 6px 20px rgba(200, 146, 42, 0.4)' }}
                  >
                    Register Now ↗
                  </button>
                </div>
              </div>

              {/* POSTER / MEDIA IMAGE DISPLAY */}
              <div
                className="featured-event-img"
                onClick={() => openDetailsModal(featuredEvent)}
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: '0 12px 35px rgba(0,0,0,0.4)',
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  maxHeight: '340px'
                }}
              >
                <img
                  src={featuredEvent.image || '/equinox_event.png'}
                  alt={featuredEvent.title}
                  style={{ width: '100%', height: '340px', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  padding: '16px 20px',
                  background: 'linear-gradient(0deg, rgba(15,27,60,0.9) 0%, transparent 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold-pale)' }}>🔍 Click to expand details</span>
                  <span style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '12px', color: '#fff' }}>FULL EVENT VIEW</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ALL EVENTS */}
      <section className="all-events" style={{ padding: '60px 40px', background: 'var(--cream-dark)' }}>
        <div className="all-events-inner" style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="section-tag mb-16">ALL EVENTS</div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--navy)', fontWeight: 600 }}>Loading events...</div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', color: '#64748b' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>📅</div>
              <h3 style={{ color: 'var(--navy)', fontSize: '20px', marginBottom: '8px' }}>No Events Found</h3>
              <p style={{ fontSize: '14px', margin: 0 }}>There are currently no events listed in this category.</p>
            </div>
          ) : (
            <div className="events-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
              {filteredEvents.map(ev => {
                const dateBadge = parseDateBadge(ev.date_str, ev.start_date);
                const eventDateText = formatEventDate(ev);
                const statusInfo = formatStatus(ev.status);
                const isUpcoming = (ev.status || '').toLowerCase() !== 'past' && (ev.status || '').toLowerCase() !== 'completed';
                const displayDesc = ev.short_description || ev.description || ev.full_description || '';

                return (
                  <article key={ev.id} className="event-card-full" style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                    <div
                      className="event-banner"
                      onClick={() => openDetailsModal(ev)}
                      style={{ cursor: 'pointer', position: 'relative', ...(!ev.image ? { background: 'linear-gradient(135deg,#0f1b3c,#1a3060)' } : {}) }}
                    >
                      {ev.image ? (
                        <img src={ev.image} alt={ev.title} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                      ) : (
                        <div className="event-banner-overlay" style={{ opacity: 1, background: 'linear-gradient(135deg,rgba(15,27,60,0.9),rgba(15,27,60,0.6))' }}>
                          <div className="event-name">{ev.title}</div>
                          <div className="event-sub">{ev.subtitle}</div>
                        </div>
                      )}
                      <div className="event-date-badge">
                        <div className="event-date-num">{dateBadge.num}</div>
                        <div className="event-date-mon">{dateBadge.mon}</div>
                      </div>
                    </div>

                    <div className="event-info" style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                        <div className="event-title-sm" style={{ fontWeight: 800, fontSize: '20px', color: 'var(--navy)' }}>{ev.title}</div>
                        <span className={`event-status ${statusInfo.class}`} style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                          {statusInfo.label}
                        </span>
                      </div>

                      {ev.subtitle && (
                        <div style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: 600, marginBottom: '8px' }}>
                          {ev.subtitle}
                        </div>
                      )}

                      <div className="event-meta" style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-mid)', marginBottom: '14px' }}>
                        <div className="event-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg> {eventDateText}
                        </div>
                        <div className="event-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> {ev.location}
                        </div>
                      </div>

                      {displayDesc && (
                        <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, marginBottom: '20px' }}>
                          {displayDesc}
                        </p>
                      )}

                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '16px' }}>
                        <button
                          type="button"
                          onClick={() => openDetailsModal(ev)}
                          style={{
                            padding: '9px 18px',
                            borderRadius: '30px',
                            border: '1.5px solid #d4c8b8',
                            background: '#ffffff',
                            color: '#475569',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          View Details ➔
                        </button>

                        {isUpcoming && (
                          <button
                            type="button"
                            onClick={() => openRegisterModal(ev.id, ev.title, ev.custom_fields)}
                            className="btn-primary"
                            style={{
                              padding: '9px 22px',
                              borderRadius: '30px',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            Register ↗
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* REGISTRATION MODAL */}
      <EventRegistrationModal
        isOpen={modalState.isOpen}
        onClose={closeRegisterModal}
        eventId={modalState.eventId}
        eventTitle={modalState.eventTitle}
        eventCustomFields={modalState.eventCustomFields}
      />
    </>
  );
}
