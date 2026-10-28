import React, { useState } from 'react';
import { formatCleanDate } from '../utils/dateFormatter';

export default function EventDetailsView({ event, onBack, onRegister }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPrevHovered, setIsPrevHovered] = useState(false);
  const [isNextHovered, setIsNextHovered] = useState(false);

  if (!event) return null;

  // Build slides array combining main image and slideshow_images
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

  const nextSlide = () => setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);

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

  // Date range display matching website theme
  const formatDateRange = () => formatCleanDate(event);

  return (
    <div style={{
      background: 'var(--cream)',
      minHeight: '85vh',
      padding: '100px 24px 80px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Decorative Watermark Crest Graphic in Background */}
      <div style={{
        position: 'absolute',
        top: '120px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '780px',
        height: '780px',
        borderRadius: '50%',
        border: '30px solid rgba(200, 146, 42, 0.04)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Main content container (800px) */}
      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          style={{
            padding: '10px 22px',
            borderRadius: '30px',
            border: '1.5px solid var(--gold)',
            background: '#ffffff',
            color: 'var(--navy)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '28px',
            boxShadow: '0 4px 14px rgba(15,27,60,0.06)',
            transition: 'all 0.2s ease'
          }}
        >
          ← Back to All Events
        </button>

        {/* ========================================================================= */}
        {/* CAROUSEL CONTAINER WITH HIGH-END ARROW BUTTONS */}
        {/* ========================================================================= */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '440px',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 18px 50px rgba(15, 27, 60, 0.1)',
          border: '1.5px solid #e8e0d0',
          marginBottom: '36px',
          background: '#0f1b3c'
        }}>
          
          {/* Full Width Image */}
          <img
            src={slides[currentSlideIndex]}
            alt={event.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />

          {/* LUXURY GLASSMORPHIC NAVIGATION ARROWS */}
          {slides.length > 1 && (
            <>
              {/* Left Arrow Button */}
              <button
                type="button"
                onClick={prevSlide}
                onMouseEnter={() => setIsPrevHovered(true)}
                onMouseLeave={() => setIsPrevHovered(false)}
                aria-label="Previous Slide"
                style={{
                  position: 'absolute',
                  left: '18px',
                  top: '50%',
                  transform: isPrevHovered ? 'translateY(-50%) scale(1.12)' : 'translateY(-50%) scale(1)',
                  zIndex: 10,
                  background: isPrevHovered
                    ? 'linear-gradient(135deg, var(--gold) 0%, #a6761e 100%)'
                    : 'rgba(15, 27, 60, 0.85)',
                  color: isPrevHovered ? '#ffffff' : 'var(--gold-pale)',
                  border: isPrevHovered ? '1.5px solid #ffffff' : '1.5px solid rgba(200, 146, 42, 0.6)',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: isPrevHovered
                    ? '0 8px 24px rgba(200, 146, 42, 0.5)'
                    : '0 6px 20px rgba(0, 0, 0, 0.35)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>

              {/* Right Arrow Button */}
              <button
                type="button"
                onClick={nextSlide}
                onMouseEnter={() => setIsNextHovered(true)}
                onMouseLeave={() => setIsNextHovered(false)}
                aria-label="Next Slide"
                style={{
                  position: 'absolute',
                  right: '18px',
                  top: '50%',
                  transform: isNextHovered ? 'translateY(-50%) scale(1.12)' : 'translateY(-50%) scale(1)',
                  zIndex: 10,
                  background: isNextHovered
                    ? 'linear-gradient(135deg, var(--gold) 0%, #a6761e 100%)'
                    : 'rgba(15, 27, 60, 0.85)',
                  color: isNextHovered ? '#ffffff' : 'var(--gold-pale)',
                  border: isNextHovered ? '1.5px solid #ffffff' : '1.5px solid rgba(200, 146, 42, 0.6)',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: isNextHovered
                    ? '0 8px 24px rgba(200, 146, 42, 0.5)'
                    : '0 6px 20px rgba(0, 0, 0, 0.35)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </>
          )}

          {/* Dots Pagination */}
          {slides.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              display: 'flex',
              gap: '8px',
              justify: 'center',
              background: 'rgba(15, 27, 60, 0.65)',
              padding: '6px 14px',
              borderRadius: '20px',
              backdropFilter: 'blur(8px)'
            }}>
              {slides.map((_, idx) => (
                <span
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  style={{
                    width: idx === currentSlideIndex ? '20px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: idx === currentSlideIndex ? 'var(--gold)' : 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          )}

        </div>

        {/* EVENT DETAILS CONTENT BLOCK */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Title */}
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(32px, 4vw, 44px)',
            fontWeight: 800,
            color: 'var(--navy)',
            margin: 0,
            lineHeight: 1.15
          }}>
            {event.title}
          </h1>

          {/* Date Tag / Pill Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f5ead6',
            padding: '8px 20px',
            borderRadius: '24px',
            border: '1px solid #e2d2b4',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--navy)',
            width: 'fit-content'
          }}>
            <span>📅</span>
            <span>{formatDateRange()}</span>
          </div>

          {/* Description Paragraphs */}
          <div style={{
            fontSize: '16px',
            color: '#334155',
            lineHeight: 1.8,
            fontFamily: "'Inter', sans-serif"
          }}>
            {event.full_description || event.description || event.short_description}
          </div>

          {/* About Event Card (if present) */}
          {event.about_event && (
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              border: '1.5px solid #e8e0d0',
              marginTop: '8px'
            }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 800, color: 'var(--navy)', marginTop: 0, marginBottom: '12px' }}>
                About the Event
              </h3>
              <div style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, whitespace: 'pre-line' }}>
                {event.about_event}
              </div>
            </div>
          )}

          {/* Schedule Cards Section (if present) */}
          {scheduleCards.length > 0 && (
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              border: '1.5px solid #e8e0d0',
              marginTop: '8px'
            }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 800, color: 'var(--navy)', marginTop: 0, marginBottom: '14px' }}>
                📅 Schedule & Timeline
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {scheduleCards.map((card, idx) => (
                  <div key={idx} style={{ background: '#faf8f5', borderRadius: '12px', padding: '16px', border: '1.5px solid #e8e0d0' }}>
                    <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 800, color: 'var(--navy)' }}>
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

          {/* Sub-Events / Sessions (if present) */}
          {subEvents.length > 0 && (
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              border: '1.5px solid #e8e0d0',
              marginTop: '8px'
            }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 800, color: 'var(--navy)', marginTop: 0, marginBottom: '14px' }}>
                🏆 Sessions & Competition Tracks
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                {subEvents.map((sub, idx) => (
                  <div key={idx} style={{ background: '#faf8f5', borderRadius: '12px', padding: '14px', border: '1.5px solid #e8e0d0' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '0.5px' }}>
                      DAY {sub.day_number} · {sub.event_type || 'Session'}
                    </span>
                    <h4 style={{ margin: '4px 0 6px', fontSize: '15px', fontWeight: 800, color: 'var(--navy)' }}>
                      {sub.title}
                    </h4>
                    {sub.description && (
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                        {sub.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Divider & Registration CTA Button */}
          <div style={{ borderTop: '1.5px solid #e8e0d0', paddingTop: '24px', marginTop: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => {
                if (onRegister) onRegister(event.id, event.title, event.custom_fields);
              }}
              className="btn-primary"
              style={{
                padding: '14px 38px',
                fontSize: '15px',
                fontWeight: 800,
                borderRadius: '30px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(200, 146, 42, 0.4)'
              }}
            >
              Register Now ↗
            </button>

            {event.registration_link && (
              <a
                href={event.registration_link}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '14px',
                  color: 'var(--gold)',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                🌐 Open External Link ↗
              </a>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
