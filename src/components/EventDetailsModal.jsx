import React, { useState, useEffect } from 'react';
import { formatCleanDate } from '../utils/dateFormatter';

export default function EventDetailsModal({ isOpen, onClose, event, onRegister }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentSlideIndex(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  // Build slides array combining banner image and slideshow_images
  const slides = (() => {
    let extra = [];
    if (Array.isArray(event.slideshow_images)) {
      extra = event.slideshow_images;
    } else if (typeof event.slideshow_images === 'string' && event.slideshow_images.trim()) {
      try { extra = JSON.parse(event.slideshow_images); } catch (e) { extra = []; }
    }

    const all = [];
    if (event.image) all.push(event.image);
    extra.forEach(img => {
      if (img && !all.includes(img)) all.push(img);
    });

    return all.length > 0 ? all : ['/equinox_event.png'];
  })();

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Helper to parse schedule cards
  const scheduleCards = (() => {
    if (Array.isArray(event.schedule_cards)) return event.schedule_cards;
    if (typeof event.schedule_cards === 'string' && event.schedule_cards.trim()) {
      try { return JSON.parse(event.schedule_cards); } catch (e) { return []; }
    }
    return [];
  })();

  // Helper to parse sub-events
  const subEvents = (() => {
    if (Array.isArray(event.sub_events)) return event.sub_events;
    if (typeof event.sub_events === 'string' && event.sub_events.trim()) {
      try { return JSON.parse(event.sub_events); } catch (e) { return []; }
    }
    return [];
  })();

  // Date range display
  const formatDateRange = () => formatCleanDate(event);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100vh',
      background: 'var(--cream-dark)',
      zIndex: 99999,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* ========================================================================= */}
      {/* STICKY TOP HEADER BAR */}
      {/* ========================================================================= */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(15, 27, 60, 0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: '2px solid var(--gold)',
        padding: '14px 32px',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
      }}>
        {/* LEFT: BACK BUTTON */}
        <button
          onClick={onClose}
          style={{
            padding: '8px 18px',
            borderRadius: '30px',
            border: '1.5px solid var(--gold)',
            background: 'rgba(255,255,255,0.08)',
            color: 'var(--gold-pale)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <span>←</span> Back to Events
        </button>

        {/* CENTER: EVENT TITLE BADGE */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(255,255,255,0.08)',
          padding: '6px 16px',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.15)'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {event.category || 'EVENT'}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
          <span style={{ color: '#ffffff', fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: 700 }}>
            {event.title}
          </span>
        </div>

        {/* RIGHT: REGISTER NOW & CLOSE BUTTON */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => {
              onClose();
              if (onRegister) onRegister(event.id, event.title, event.custom_fields);
            }}
            className="btn-primary"
            style={{ padding: '8px 22px', fontSize: '13px', borderRadius: '30px', border: 'none', cursor: 'pointer' }}
          >
            Register Now ↗
          </button>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              fontSize: '18px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'center'
            }}
          >
            ✕
          </button>
        </div>
      </header>


      {/* ========================================================================= */}
      {/* HERO POSTER SHOWCASE CARD */}
      {/* ========================================================================= */}
      <section style={{ maxWidth: '1100px', width: '100%', margin: '24px auto 0', padding: '0 24px' }}>
        <div style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0b1329 0%, #15244c 100%)',
          boxShadow: '0 20px 50px rgba(15,27,60,0.2)',
          border: '1.5px solid rgba(200, 146, 42, 0.25)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          
          {/* Poster Image Container */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '420px',
            display: 'flex',
            alignItems: 'center',
            justify: 'center'
          }}>
            <img
              src={slides[currentSlideIndex]}
              alt={event.title}
              decoding="async"
              style={{
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: 'contain',
                borderRadius: '16px',
                boxShadow: '0 15px 40px rgba(0,0,0,0.4)'
              }}
            />

            {/* Carousel Arrow Navigation Buttons */}
            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(15, 27, 60, 0.85)',
                    color: 'var(--gold-pale)',
                    border: '1.5px solid var(--gold)',
                    borderRadius: '50%',
                    width: '46px',
                    height: '46px',
                    cursor: 'pointer',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.3)'
                  }}
                >
                  ❮
                </button>

                <button
                  type="button"
                  onClick={nextSlide}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(15, 27, 60, 0.85)',
                    color: 'var(--gold-pale)',
                    border: '1.5px solid var(--gold)',
                    borderRadius: '50%',
                    width: '46px',
                    height: '46px',
                    cursor: 'pointer',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.3)'
                  }}
                >
                  ❯
                </button>
              </>
            )}
          </div>

          {/* Dots Pagination - Centered under image */}
          {slides.length > 1 && (
            <div style={{
              display: 'flex',
              gap: '8px',
              justify: 'center',
              marginTop: '16px'
            }}>
              {slides.map((_, idx) => (
                <span
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  style={{
                    width: idx === currentSlideIndex ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: idx === currentSlideIndex ? 'var(--gold)' : 'rgba(255, 255, 255, 0.35)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          )}

        </div>
      </section>


      {/* ========================================================================= */}
      {/* MAIN EVENT DETAILS BODY */}
      {/* ========================================================================= */}
      <main style={{ maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '36px 24px 60px', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '36px', alignItems: 'flex-start' }}>

          {/* LEFT COLUMN: MAIN CONTENT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* TITLE BLOCK */}
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', border: '1.5px solid #e8e0d0', boxShadow: '0 4px 16px rgba(15,27,60,0.03)' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ background: 'var(--gold)', color: 'var(--navy)', fontWeight: 800, fontSize: '11px', padding: '4px 14px', borderRadius: '20px', textTransform: 'uppercase' }}>
                  {event.category || 'TECHNICAL'}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '4px 12px', borderRadius: '20px' }}>
                  ⚡ {event.status ? event.status.toUpperCase() : 'UPCOMING'}
                </span>
              </div>

              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '34px', fontWeight: 800, color: 'var(--navy)', margin: '0 0 8px', lineHeight: 1.2 }}>
                {event.title}
              </h1>

              {event.subtitle && (
                <div style={{ fontSize: '16px', color: 'var(--gold)', fontWeight: 600, fontFamily: "'Playfair Display', serif" }}>
                  {event.subtitle}
                </div>
              )}

              {/* DATE & LOCATION BADGES */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#faf8f5', padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 700, color: 'var(--navy)' }}>
                  <span>📅</span>
                  <span>{formatDateRange()}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#faf8f5', padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 700, color: 'var(--navy)' }}>
                  <span>📍</span>
                  <span>{event.location || 'KU Campus'}</span>
                </div>
              </div>
            </div>

            {/* SHORT DESCRIPTION CALLOUT */}
            {event.short_description && (
              <div style={{
                fontSize: '15px',
                color: '#334155',
                lineHeight: 1.6,
                background: '#ffffff',
                padding: '20px 24px',
                borderRadius: '16px',
                borderLeft: '5px solid var(--gold)',
                border: '1.5px solid #e8e0d0',
                boxShadow: '0 4px 16px rgba(15,27,60,0.03)'
              }}>
                {event.short_description}
              </div>
            )}

            {/* FULL DESCRIPTION */}
            {event.full_description && (
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', border: '1.5px solid #e8e0d0', boxShadow: '0 4px 16px rgba(15,27,60,0.03)' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 800, color: 'var(--navy)', marginTop: 0, marginBottom: '14px', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '10px' }}>
                  📖 Overview & Details
                </h3>
                <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.8, whitespace: 'pre-line' }}>
                  {event.full_description}
                </div>
              </div>
            )}

            {/* ABOUT THE EVENT */}
            {event.about_event && (
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', border: '1.5px solid #e8e0d0', boxShadow: '0 4px 16px rgba(15,27,60,0.03)' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 800, color: 'var(--navy)', marginTop: 0, marginBottom: '14px', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '10px' }}>
                  💡 About the Event
                </h3>
                <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.8, whitespace: 'pre-line' }}>
                  {event.about_event}
                </div>
              </div>
            )}

            {/* SCHEDULE CARDS SECTION */}
            {scheduleCards.length > 0 && (
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', border: '1.5px solid #e8e0d0', boxShadow: '0 4px 16px rgba(15,27,60,0.03)' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 800, color: 'var(--navy)', marginTop: 0, marginBottom: '16px', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '10px' }}>
                  📅 Event Schedule & Day Breakdown
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {scheduleCards.map((card, idx) => (
                    <div key={idx} style={{ background: '#faf8f5', borderRadius: '14px', padding: '18px', border: '1.5px solid #e8e0d0' }}>
                      <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 800, color: 'var(--navy)' }}>
                        {card.heading}
                      </h4>
                      <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, whitespace: 'pre-line' }}>
                        {card.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-EVENTS / COMPETITION TRACKS */}
            {subEvents.length > 0 && (
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', border: '1.5px solid #e8e0d0', boxShadow: '0 4px 16px rgba(15,27,60,0.03)' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 800, color: 'var(--navy)', marginTop: 0, marginBottom: '16px', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '10px' }}>
                  🏆 Competition Tracks & Sessions
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  {subEvents.map((sub, idx) => (
                    <div key={idx} style={{ background: '#faf8f5', borderRadius: '14px', padding: '16px', border: '1.5px solid #e8e0d0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '0.5px' }}>
                          DAY {sub.day_number} · {sub.event_type || 'Session'}
                        </span>
                        <h4 style={{ margin: '4px 0 8px', fontSize: '15px', fontWeight: 800, color: 'var(--navy)' }}>
                          {sub.title}
                        </h4>
                        {sub.description && (
                          <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                            {sub.description}
                          </p>
                        )}
                      </div>
                      <div style={{ marginTop: '12px', fontSize: '11px', fontWeight: 700, color: '#475569', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2d7c5', paddingTop: '8px' }}>
                        <span>Max: {sub.max_participants || 'Unlimited'}</span>
                        {sub.start_time && <span>🕒 {sub.start_time} - {sub.end_time}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: STICKY QUICK DETAILS SIDEBAR */}
          <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '28px',
              border: '1.5px solid #e8e0d0',
              boxShadow: '0 10px 30px rgba(15,27,60,0.06)'
            }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 800, color: 'var(--navy)', marginTop: 0, marginBottom: '18px', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '10px' }}>
                Quick Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', background: '#f5ead6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                    📅
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>EVENT DATES</span>
                    <strong style={{ fontSize: '13px', color: 'var(--navy)' }}>{formatDateRange()}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', background: '#f5ead6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                    📍
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>VENUE / LOCATION</span>
                    <strong style={{ fontSize: '13px', color: 'var(--navy)' }}>{event.location || 'KU Campus'}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', background: '#f5ead6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                    🏷️
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>CATEGORY</span>
                    <strong style={{ fontSize: '13px', color: 'var(--navy)', textTransform: 'capitalize' }}>{event.category || 'General'}</strong>
                  </div>
                </div>
              </div>

              {/* PRIMARY REGISTER BUTTON */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onRegister) onRegister(event.id, event.title, event.custom_fields);
                }}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  fontSize: '14px',
                  fontWeight: 800,
                  borderRadius: '30px',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(200, 146, 42, 0.4)'
                }}
              >
                Register For Event ↗
              </button>

              {event.registration_link && (
                <a
                  href={event.registration_link}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    marginTop: '12px',
                    fontSize: '12px',
                    color: 'var(--gold)',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  🌐 External Registration Link ↗
                </a>
              )}
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
