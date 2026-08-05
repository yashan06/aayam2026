import React, { useState } from 'react';

export default function EventDetailsForm({ eventData, setEventData, onSubmit, onCancel, submitBtnText = 'Save Event Details' }) {
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'description', 'media', 'schedule', 'custom_fields'

  // Parse helper for arrays stored as JSON strings or array objects
  const getArrayField = (key) => {
    const val = eventData[key];
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim()) {
      try { return JSON.parse(val); } catch (e) { return []; }
    }
    return [];
  };

  const updateArrayField = (key, newArray) => {
    setEventData({ ...eventData, [key]: newArray });
  };

  // State for Schedule Card Builder
  const [newScheduleCard, setNewScheduleCard] = useState({
    heading: '',
    type: 'richtext',
    content: ''
  });

  // State for Sub-Event Builder
  const [newSubEvent, setNewSubEvent] = useState({
    title: '',
    description: '',
    day_number: '1',
    event_date: '',
    start_time: '',
    end_time: '',
    registration_deadline: '',
    max_participants: 'Unlimited',
    event_type: 'Individual',
    min_team_size: '1',
    max_team_size: '4'
  });

  // Visibility toggle
  const visibility = eventData.visibility || 'public';

  // Slideshow upload handler
  const handleSlideshowUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const currentSlides = getArrayField('slideshow_images');
    const newSlides = [...currentSlides];

    let processed = 0;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newSlides.push(reader.result);
        processed++;
        if (processed === files.length) {
          updateArrayField('slideshow_images', newSlides);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeSlide = (idx) => {
    const current = getArrayField('slideshow_images');
    current.splice(idx, 1);
    updateArrayField('slideshow_images', current);
  };

  // Schedule Card Handlers
  const handleAddScheduleCard = (e) => {
    e.preventDefault();
    if (!newScheduleCard.heading.trim()) return;
    const current = getArrayField('schedule_cards');
    updateArrayField('schedule_cards', [...current, { ...newScheduleCard, id: Date.now() }]);
    setNewScheduleCard({ heading: '', type: 'richtext', content: '' });
  };

  const removeScheduleCard = (idx) => {
    const current = getArrayField('schedule_cards');
    current.splice(idx, 1);
    updateArrayField('schedule_cards', current);
  };

  // Sub-Event Handlers
  const handleAddSubEvent = (e) => {
    e.preventDefault();
    if (!newSubEvent.title.trim()) return;
    const current = getArrayField('sub_events');
    updateArrayField('sub_events', [...current, { ...newSubEvent, id: Date.now() }]);
    setNewSubEvent({
      title: '',
      description: '',
      day_number: '1',
      event_date: '',
      start_time: '',
      end_time: '',
      registration_deadline: '',
      max_participants: 'Unlimited',
      event_type: 'Individual',
      min_team_size: '1',
      max_team_size: '4'
    });
  };

  const removeSubEvent = (idx) => {
    const current = getArrayField('sub_events');
    current.splice(idx, 1);
    updateArrayField('sub_events', current);
  };

  // Custom Fields Handlers
  const customFields = getArrayField('custom_fields');
  const addCustomField = () => {
    updateArrayField('custom_fields', [
      ...customFields,
      { id: Date.now(), label: '', type: 'text', options: '', required: false }
    ]);
  };

  const updateCustomField = (idx, key, val) => {
    const updated = [...customFields];
    updated[idx] = { ...updated[idx], [key]: val };
    updateArrayField('custom_fields', updated);
  };

  const removeCustomField = (idx) => {
    const updated = [...customFields];
    updated.splice(idx, 1);
    updateArrayField('custom_fields', updated);
  };

  // Formatting helpers for textareas
  const applyFormat = (fieldKey, prefix, suffix = '') => {
    const current = eventData[fieldKey] || '';
    setEventData({ ...eventData, [fieldKey]: current + prefix + suffix });
  };

  // Tab configurations
  const tabs = [
    { id: 'general', label: '1. Basic Details', icon: '📌' },
    { id: 'description', label: '2. Descriptions', icon: '📝' },
    { id: 'media', label: '3. Media & Slides', icon: '🖼️' },
    { id: 'schedule', label: '4. Schedule & Sub-Events', icon: '📅' },
    { id: 'custom_fields', label: '5. Student Registration Form', icon: '📋' }
  ];

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ========================================================================= */}
      {/* HIGH-END TABBED NAVIGATION HEADER */}
      {/* ========================================================================= */}
      <div style={{
        display: 'flex',
        gap: '8px',
        background: '#f4efe6',
        padding: '6px',
        borderRadius: '16px',
        border: '1px solid #e2d7c5',
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                whiteSpace: 'nowrap',
                padding: '10px 16px',
                borderRadius: '12px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, var(--navy) 0%, #1a2f60 100%)' : 'transparent',
                color: isActive ? 'var(--gold-pale)' : '#64748b',
                fontWeight: isActive ? 800 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                gap: '8px',
                boxShadow: isActive ? '0 4px 14px rgba(15,27,60,0.25)' : 'none'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GENERAL / BASIC DETAILS */}
      {/* ========================================================================= */}
      {activeTab === 'general' && (
        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #e8e0d0', padding: '28px', boxShadow: '0 10px 30px rgba(15,27,60,0.04)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', background: '#fef3c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                📌
              </div>
              <div>
                <h4 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 800, color: 'var(--navy)' }}>Basic Information</h4>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Configure event visibility, title, dates, venue, and banner</span>
              </div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', background: '#fef3c7', padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.5px' }}>STEP 1 OF 5</span>
          </div>

          {/* VISIBILITY SELECTOR */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
              EVENT VISIBILITY
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div
                onClick={() => setEventData({ ...eventData, visibility: 'public' })}
                style={{
                  padding: '16px 20px',
                  borderRadius: '16px',
                  border: visibility === 'public' ? '2px solid #16a34a' : '1.5px solid #e2e8f0',
                  background: visibility === 'public' ? '#f0fdf4' : '#faf8f5',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <div style={{ fontSize: '24px', background: visibility === 'public' ? '#dcfce7' : '#f1f5f9', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌐</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: visibility === 'public' ? '#15803d' : 'var(--navy)' }}>Public Event</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Full details & registration visible to everyone</div>
                </div>
              </div>

              <div
                onClick={() => setEventData({ ...eventData, visibility: 'private' })}
                style={{
                  padding: '16px 20px',
                  borderRadius: '16px',
                  border: visibility === 'private' ? '2px solid var(--navy)' : '1.5px solid #e2e8f0',
                  background: visibility === 'private' ? '#f8fafc' : '#faf8f5',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <div style={{ fontSize: '24px', background: visibility === 'private' ? '#e2e8f0' : '#f1f5f9', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔒</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--navy)' }}>Private / Draft</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Poster + Coming Soon teaser view only</div>
                </div>
              </div>
            </div>
          </div>

          {/* TITLE & SUBTITLE */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                EVENT TITLE *
              </label>
              <input
                type="text"
                value={eventData.title || ''}
                onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                required
                placeholder="e.g. EQUINOX 3.0"
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #cbd5e1', borderRadius: '12px', fontSize: '14px', background: '#faf8f5', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                SUBTITLE / TAGLINE
              </label>
              <input
                type="text"
                value={eventData.subtitle || ''}
                onChange={(e) => setEventData({ ...eventData, subtitle: e.target.value })}
                placeholder="e.g. Annual Tech & Innovation Fest"
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #cbd5e1', borderRadius: '12px', fontSize: '14px', background: '#faf8f5', outline: 'none' }}
              />
            </div>
          </div>

          {/* CATEGORY, STATUS, VENUE */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                CATEGORY *
              </label>
              <select
                value={eventData.category || 'technical'}
                onChange={(e) => setEventData({ ...eventData, category: e.target.value })}
                required
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #cbd5e1', borderRadius: '12px', fontSize: '13px', background: '#faf8f5' }}
              >
                <option value="technical">Technical</option>
                <option value="non-technical">Non-Technical</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                STATUS *
              </label>
              <select
                value={eventData.status || 'upcoming'}
                onChange={(e) => setEventData({ ...eventData, status: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #cbd5e1', borderRadius: '12px', fontSize: '13px', background: '#faf8f5', fontWeight: 600, color: eventData.status === 'featured' ? '#92400e' : 'var(--navy)' }}
              >
                <option value="upcoming">Upcoming Event</option>
                <option value="featured">★ Featured Spotlight (Hero Spotlight Banner)</option>
                <option value="registering">⚡ Registration Open</option>
                <option value="completed">✓ Completed</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                LOCATION / VENUE *
              </label>
              <input
                type="text"
                value={eventData.location || ''}
                onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                required
                placeholder="e.g. UIT Auditorium, Karnavati University"
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #cbd5e1', borderRadius: '12px', fontSize: '13px', background: '#faf8f5' }}
              />
            </div>
          </div>

          {/* DATES GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                START DATE *
              </label>
              <input
                type="datetime-local"
                value={eventData.start_date || ''}
                onChange={(e) => setEventData({ ...eventData, start_date: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #cbd5e1', borderRadius: '12px', fontSize: '13px', background: '#faf8f5' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                END DATE *
              </label>
              <input
                type="datetime-local"
                value={eventData.end_date || ''}
                onChange={(e) => setEventData({ ...eventData, end_date: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #cbd5e1', borderRadius: '12px', fontSize: '13px', background: '#faf8f5' }}
              />
            </div>
          </div>

          {/* REGISTRATION LINK */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              REGISTRATION LINK <span style={{ textTransform: 'none', fontWeight: 500, color: '#94a3b8' }}>(optional)</span>
            </label>
            <input
              type="text"
              value={eventData.registration_link || ''}
              onChange={(e) => setEventData({ ...eventData, registration_link: e.target.value })}
              placeholder="https://forms.google.com/..."
              style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #cbd5e1', borderRadius: '12px', fontSize: '13px', background: '#faf8f5' }}
            />
          </div>

          {/* EVENT BANNER UPLOADER */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              MAIN EVENT BANNER / POSTER
            </label>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#faf8f5', padding: '16px', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
              {eventData.image ? (
                <div style={{ position: 'relative' }}>
                  <img src={eventData.image} alt="Banner" style={{ width: '110px', height: '70px', objectFit: 'cover', borderRadius: '12px', border: '1.5px solid #cbd5e1' }} />
                  <button type="button" onClick={() => setEventData({ ...eventData, image: '' })} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', fontSize: '11px', cursor: 'pointer' }}>✕</button>
                </div>
              ) : (
                <div style={{ width: '110px', height: '70px', background: '#f1f5f9', borderRadius: '12px', border: '1.5px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '24px' }}>
                  🖼️
                </div>
              )}

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ padding: '10px 18px', background: 'var(--navy)', color: '#ffffff', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(15,27,60,0.15)' }}>
                    📁 Choose Image File
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setEventData({ ...eventData, image: reader.result });
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>or paste URL:</span>
                  <input
                    type="text"
                    value={eventData.image || ''}
                    onChange={(e) => setEventData({ ...eventData, image: e.target.value })}
                    placeholder="https://..."
                    style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', background: '#ffffff' }}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DESCRIPTIONS */}
      {/* ========================================================================= */}
      {activeTab === 'description' && (
        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #e8e0d0', padding: '28px', boxShadow: '0 10px 30px rgba(15,27,60,0.04)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', background: '#dbeafe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                📝
              </div>
              <div>
                <h4 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 800, color: 'var(--navy)' }}>Detailed Descriptions</h4>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Provide rich descriptions, guidelines, speaker info, and event overview</span>
              </div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', background: '#fef3c7', padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.5px' }}>STEP 2 OF 5</span>
          </div>

          {/* SHORT DESCRIPTION */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              SHORT DESCRIPTION *
            </label>
            <textarea
              value={eventData.short_description || ''}
              onChange={(e) => setEventData({ ...eventData, short_description: e.target.value })}
              required
              placeholder="Catchy 1-2 sentence overview summary for event cards..."
              style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #cbd5e1', borderRadius: '12px', fontSize: '13px', background: '#faf8f5', minHeight: '64px', resize: 'vertical' }}
            />
          </div>

          {/* FULL DESCRIPTION WITH TOOLBAR */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>
                FULL DESCRIPTION *
              </label>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>(supports formatting, lists & headings)</span>
            </div>
            
            <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden', background: '#ffffff' }}>
              <div style={{ display: 'flex', gap: '6px', padding: '8px 12px', background: '#0f1b3c', color: '#ffffff' }}>
                <button type="button" onClick={() => applyFormat('full_description', '**', '**')} style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}>B</button>
                <button type="button" onClick={() => applyFormat('full_description', '*', '*')} style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '6px', fontStyle: 'italic', cursor: 'pointer' }}>I</button>
                <button type="button" onClick={() => applyFormat('full_description', '<u>', '</u>')} style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '6px', textDecoration: 'underline', cursor: 'pointer' }}>U</button>
                <span style={{ color: 'rgba(255,255,255,0.3)', padding: '0 4px', display: 'flex', alignItems: 'center' }}>|</span>
                <button type="button" onClick={() => applyFormat('full_description', '\n• ')} style={{ height: '28px', padding: '0 10px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>≡ List</button>
                <button type="button" onClick={() => applyFormat('full_description', '### ')} style={{ height: '28px', padding: '0 10px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>H3</button>
              </div>
              <textarea
                value={eventData.full_description || ''}
                onChange={(e) => setEventData({ ...eventData, full_description: e.target.value })}
                placeholder="Comprehensive guidelines, rules, structure, and details..."
                style={{ width: '100%', padding: '14px 16px', border: 'none', fontSize: '13px', background: '#faf8f5', minHeight: '140px', resize: 'vertical', outline: 'none' }}
              />
            </div>
          </div>

          {/* ABOUT THE EVENT WITH TOOLBAR */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              ABOUT THE EVENT <span style={{ textTransform: 'none', fontWeight: 500, color: '#94a3b8' }}>(optional)</span>
            </label>
            
            <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden', background: '#ffffff' }}>
              <div style={{ display: 'flex', gap: '6px', padding: '8px 12px', background: '#0f1b3c', color: '#ffffff' }}>
                <button type="button" onClick={() => applyFormat('about_event', '**', '**')} style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}>B</button>
                <button type="button" onClick={() => applyFormat('about_event', '*', '*')} style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '6px', fontStyle: 'italic', cursor: 'pointer' }}>I</button>
                <button type="button" onClick={() => applyFormat('about_event', '\n• ')} style={{ height: '28px', padding: '0 10px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>≡ List</button>
              </div>
              <textarea
                value={eventData.about_event || ''}
                onChange={(e) => setEventData({ ...eventData, about_event: e.target.value })}
                placeholder="Background history, organizers, speaker profiles, prerequisites..."
                style={{ width: '100%', padding: '14px 16px', border: 'none', fontSize: '13px', background: '#faf8f5', minHeight: '100px', resize: 'vertical', outline: 'none' }}
              />
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MEDIA & SLIDESHOW */}
      {/* ========================================================================= */}
      {activeTab === 'media' && (
        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #e8e0d0', padding: '28px', boxShadow: '0 10px 30px rgba(15,27,60,0.04)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', background: '#ede9fe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                🖼️
              </div>
              <div>
                <h4 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 800, color: 'var(--navy)' }}>Poster Slideshow</h4>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Upload multiple promotional posters — visitors will see a carousel with arrows</span>
              </div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', background: '#fef3c7', padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.5px' }}>STEP 3 OF 5</span>
          </div>

          {getArrayField('slideshow_images').length > 0 && (
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                CURRENT SLIDES ({getArrayField('slideshow_images').length})
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                {getArrayField('slideshow_images').map((slide, idx) => (
                  <div key={idx} style={{ position: 'relative', height: '90px', borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #cbd5e1', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}>
                    <img src={slide} alt={`Slide ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removeSlide(idx)}
                      style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(220,38,38,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DASHDROP ZONE */}
          <label style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justify: 'center',
            padding: '40px 20px',
            borderRadius: '20px',
            border: '2px dashed var(--gold)',
            background: '#faf8f5',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'center'
          }}>
            <div style={{ width: '56px', height: '56px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', color: 'var(--gold)', marginBottom: '10px' }}>
              🖼️
            </div>
            <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--navy)' }}>Click to upload poster slides</span>
            <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>PNG, JPG, WEBP · Multiple files supported</span>
            <input type="file" accept="image/*" multiple onChange={handleSlideshowUpload} style={{ display: 'none' }} />
          </label>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SCHEDULE & SUB-EVENTS */}
      {/* ========================================================================= */}
      {activeTab === 'schedule' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* SCHEDULE CARDS */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #e8e0d0', padding: '28px', boxShadow: '0 10px 30px rgba(15,27,60,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', background: '#fee2e2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  📅
                </div>
                <div>
                  <h4 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 800, color: 'var(--navy)' }}>Schedule & Day Cards</h4>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Organize event breakdown by Day 1, Day 2 cards</span>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', background: '#fef3c7', padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.5px' }}>STEP 4 OF 5</span>
            </div>

            {getArrayField('schedule_cards').length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {getArrayField('schedule_cards').map((card, idx) => (
                  <div key={idx} style={{ background: '#faf8f5', padding: '14px 18px', borderRadius: '12px', border: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: 'var(--navy)' }}>{card.heading}</strong>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Type: {card.type === 'table' ? '📊 Table' : '📝 Rich Text'}</div>
                    </div>
                    <button type="button" onClick={() => removeScheduleCard(idx)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Remove</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: '#faf8f5', padding: '20px', borderRadius: '16px', border: '1.5px dashed #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase' }}>➕ ADD NEW DAY / SCHEDULE CARD</label>
              
              <input
                type="text"
                value={newScheduleCard.heading}
                onChange={(e) => setNewScheduleCard({ ...newScheduleCard, heading: e.target.value })}
                placeholder="e.g. Day 1 — Inauguration & Keynote (18 March)"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', background: '#ffffff' }}
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setNewScheduleCard({ ...newScheduleCard, type: 'richtext' })}
                  style={{ padding: '8px 16px', borderRadius: '10px', border: newScheduleCard.type === 'richtext' ? '2px solid var(--navy)' : '1.5px solid #cbd5e1', background: newScheduleCard.type === 'richtext' ? 'var(--navy)' : '#ffffff', color: newScheduleCard.type === 'richtext' ? '#ffffff' : '#475569', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                >
                  📝 Rich Text
                </button>
                <button
                  type="button"
                  onClick={() => setNewScheduleCard({ ...newScheduleCard, type: 'table' })}
                  style={{ padding: '8px 16px', borderRadius: '10px', border: newScheduleCard.type === 'table' ? '2px solid var(--navy)' : '1.5px solid #cbd5e1', background: newScheduleCard.type === 'table' ? 'var(--navy)' : '#ffffff', color: newScheduleCard.type === 'table' ? '#ffffff' : '#475569', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                >
                  📊 Table
                </button>
              </div>

              <textarea
                value={newScheduleCard.content}
                onChange={(e) => setNewScheduleCard({ ...newScheduleCard, content: e.target.value })}
                placeholder={newScheduleCard.type === 'table' ? "Time | Event | Venue\n09:00 AM | Welcome | Main Hall" : "Schedule summary..."}
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', minHeight: '80px', background: '#ffffff' }}
              />

              <button type="button" onClick={handleAddScheduleCard} style={{ width: 'fit-content', padding: '10px 22px', background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                💾 Add Schedule Card
              </button>
            </div>
          </div>

          {/* SUB EVENTS / SESSIONS */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #e8e0d0', padding: '28px', boxShadow: '0 10px 30px rgba(15,27,60,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <div style={{ width: '38px', height: '38px', background: '#dcfce7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                ➕
              </div>
              <div>
                <h4 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 800, color: 'var(--navy)' }}>Sub-Events & Sessions</h4>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Add track categories, workshops, or sub-competition rounds</span>
              </div>
            </div>

            {getArrayField('sub_events').length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {getArrayField('sub_events').map((sub, idx) => (
                  <div key={idx} style={{ background: '#faf8f5', padding: '14px 18px', borderRadius: '12px', border: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: 'var(--navy)' }}>{sub.title}</strong>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Day {sub.day_number} · Type: {sub.event_type} · Max Limit: {sub.max_participants}</div>
                    </div>
                    <button type="button" onClick={() => removeSubEvent(idx)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Remove</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: '#faf8f5', padding: '20px', borderRadius: '16px', border: '1.5px dashed #cbd5e1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>SUB-EVENT TITLE *</label>
                <input type="text" value={newSubEvent.title} onChange={(e) => setNewSubEvent({ ...newSubEvent, title: e.target.value })} placeholder="e.g. Hackathon Track 1, AI Workshop" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', background: '#ffffff' }} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>DESCRIPTION</label>
                <textarea value={newSubEvent.description} onChange={(e) => setNewSubEvent({ ...newSubEvent, description: e.target.value })} placeholder="Track overview..." style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', minHeight: '60px', background: '#ffffff' }} />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>DAY NUMBER</label>
                <input type="text" value={newSubEvent.day_number} onChange={(e) => setNewSubEvent({ ...newSubEvent, day_number: e.target.value })} placeholder="1" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', background: '#ffffff' }} />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>EVENT TYPE</label>
                <select value={newSubEvent.event_type} onChange={(e) => setNewSubEvent({ ...newSubEvent, event_type: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', background: '#ffffff' }}>
                  <option value="Individual">👤 Individual</option>
                  <option value="Team">👥 Team</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <button type="button" onClick={handleAddSubEvent} style={{ padding: '10px 22px', background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                  ➕ Add Sub-Event
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: STUDENT REGISTRATION FORM BUILDER */}
      {/* ========================================================================= */}
      {activeTab === 'custom_fields' && (
        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #e8e0d0', padding: '28px', boxShadow: '0 10px 30px rgba(15,27,60,0.04)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', background: '#e0f2fe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                📋
              </div>
              <div>
                <h4 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 800, color: 'var(--navy)' }}>Custom Registration Fields</h4>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Add extra questions for students registering for this event</span>
              </div>
            </div>
            <button
              type="button"
              onClick={addCustomField}
              style={{ padding: '8px 18px', background: 'var(--navy)', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              + Add Field
            </button>
          </div>

          {customFields.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {customFields.map((f, idx) => (
                <div key={idx} style={{ background: '#faf8f5', padding: '14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Field Label (e.g. Team Name)"
                    value={f.label}
                    onChange={(e) => updateCustomField(idx, 'label', e.target.value)}
                    style={{ flex: 2, minWidth: '140px', padding: '8px 12px', fontSize: '13px', border: '1.5px solid #cbd5e1', borderRadius: '8px', background: '#ffffff' }}
                    required
                  />
                  <select
                    value={f.type}
                    onChange={(e) => updateCustomField(idx, 'type', e.target.value)}
                    style={{ flex: 1, minWidth: '110px', padding: '8px 12px', fontSize: '13px', border: '1.5px solid #cbd5e1', borderRadius: '8px', background: '#ffffff' }}
                  >
                    <option value="text">Text Input</option>
                    <option value="select">Dropdown Select</option>
                    <option value="checkbox">Checkbox (Yes/No)</option>
                    <option value="number">Number</option>
                  </select>

                  {f.type === 'select' && (
                    <input
                      type="text"
                      placeholder="Options (comma separated: S, M, L, XL)"
                      value={f.options || ''}
                      onChange={(e) => updateCustomField(idx, 'options', e.target.value)}
                      style={{ flex: 2, minWidth: '150px', padding: '8px 12px', fontSize: '13px', border: '1.5px solid #cbd5e1', borderRadius: '8px', background: '#ffffff' }}
                    />
                  )}

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--navy)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!f.required}
                      onChange={(e) => updateCustomField(idx, 'required', e.target.checked)}
                    />
                    Required
                  </label>

                  <button
                    type="button"
                    onClick={() => removeCustomField(idx)}
                    style={{ padding: '6px 10px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 700 }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '16px', background: '#faf8f5', borderRadius: '12px' }}>
              No custom fields added. Standard student fields (Full Name, Email, Phone, Roll No, Branch, Year) will be used automatically.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* BOTTOM ACTION BAR */}
      {/* ========================================================================= */}
      <div style={{ display: 'flex', gap: '14px', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1.5px solid #e8e0d0' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{ padding: '12px 24px', border: '1.5px solid #cbd5e1', background: '#ffffff', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 700, color: '#475569' }}
        >
          Cancel
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          {activeTab !== 'general' && (
            <button
              type="button"
              onClick={() => {
                const idx = tabs.findIndex(t => t.id === activeTab);
                if (idx > 0) setActiveTab(tabs[idx - 1].id);
              }}
              style={{ padding: '12px 20px', background: '#f1f5f9', border: '1.5px solid #cbd5e1', borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: 'var(--navy)', cursor: 'pointer' }}
            >
              ← Previous Step
            </button>
          )}

          {activeTab !== 'custom_fields' ? (
            <button
              type="button"
              onClick={() => {
                const idx = tabs.findIndex(t => t.id === activeTab);
                if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id);
              }}
              style={{ padding: '12px 24px', background: 'var(--navy)', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              Next Step →
            </button>
          ) : null}

          <button
            type="submit"
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, var(--gold) 0%, #a6761e 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 800,
              boxShadow: '0 6px 18px rgba(200, 146, 42, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>💾</span>
            <span>{submitBtnText}</span>
          </button>
        </div>
      </div>

    </form>
  );
}
