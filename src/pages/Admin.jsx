import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventDetailsForm from '../components/EventDetailsForm';

export default function Admin() {
  const { user, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('messages');

  // Stats
  const [stats, setStats] = useState({ total_messages: 0, total_registrations: 0, total_events: 0 });

  // Data
  const [messages, setMessages] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [regEventFilter, setRegEventFilter] = useState('all');
  const [eventsList, setEventsList] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [galleryList, setGalleryList] = useState([]);

  // Login form
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginErr, setLoginErr] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Add / Edit event modal
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '', category: 'technical', date_str: '', start_date: '', end_date: '', location: '',
    short_description: '', full_description: '', about_event: '', description: '', image: '', status: 'upcoming',
    custom_fields: [], visibility: 'public', registration_link: '', slideshow_images: [], schedule_cards: [], sub_events: []
  });

  // Add / Edit team modal
  const [showAddTeamMember, setShowAddTeamMember] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState(null);
  const [newTeamMember, setNewTeamMember] = useState({
    name: '', role: '', category: 'leadership', branch_title: '', description: '', image: '', icon: '⭐', display_order: 0
  });

  // Add / Edit gallery modal
  const [showAddGalleryModal, setShowAddGalleryModal] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState(null);
  const [newGalleryItem, setNewGalleryItem] = useState({
    title: '', category: 'Technical', image: '', display_order: 0
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('aayam_token') || localStorage.getItem('aayam_admin_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const isAdminLoggedIn = user && user.role === 'admin';

  useEffect(() => {
    if (isAdminLoggedIn) {
      loadStats();
      loadMessages();
      loadRegistrations();
      loadEvents();
      loadTeam();
      loadGallery();
    }
  }, [isAdminLoggedIn]);

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginErr('');

    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();

      if (data.success) {
        login(data.token, data.user);
      } else {
        setLoginErr(data.error || 'Login failed.');
        setLoginLoading(false);
      }
    } catch (err) {
      setLoginErr('Server connection error.');
      setLoginLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch(`/api/admin/stats?_t=${Date.now()}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (e) { console.error(e); }
  };

  const loadMessages = async () => {
    try {
      const res = await fetch(`/api/admin/messages?_t=${Date.now()}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setMessages(data.messages);
    } catch (e) { console.error(e); }
  };

  const markRead = async (id) => {
    await fetch(`/api/admin/messages/${id}/read`, { method: 'PATCH', headers: getAuthHeaders() });
    loadMessages();
    loadStats();
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    await fetch(`/api/admin/messages/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    loadMessages();
    loadStats();
  };

  const loadRegistrations = async () => {
    try {
      const res = await fetch(`/api/admin/registrations?_t=${Date.now()}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setRegistrations(data.registrations);
    } catch (e) { console.error(e); }
  };

  const deleteRegistration = async (id) => {
    if (!window.confirm('Cancel this registration?')) return;
    await fetch(`/api/admin/registrations/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    loadRegistrations();
    loadStats();
  };

  const loadEvents = async () => {
    try {
      const res = await fetch(`/api/events?_t=${Date.now()}`);
      const data = await res.json();
      if (data.success) setEventsList(data.events);
    } catch (e) { console.error(e); }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    await fetch(`/api/admin/events/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    loadEvents();
    loadStats();
  };

  const loadTeam = async () => {
    try {
      const res = await fetch(`/api/admin/team?_t=${Date.now()}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setTeamList(data.team);
    } catch (e) { console.error(e); }
  };

  const deleteTeamMember = async (id) => {
    if (!window.confirm('Delete this team member?')) return;
    await fetch(`/api/admin/team/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    loadTeam();
  };

  const handleCreateTeamMember = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newTeamMember)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddTeamMember(false);
        setNewTeamMember({ name: '', role: '', category: 'leadership', branch_title: '', description: '', image: '', icon: '⭐', display_order: 0 });
        loadTeam();
      } else {
        window.alert(data.error || 'Failed to add team member.');
      }
    } catch (err) {
      window.alert('Network error.');
    }
  };

  const handleUpdateTeamMember = async (e) => {
    e.preventDefault();
    if (!editingTeamMember) return;
    try {
      const res = await fetch(`/api/admin/team/${editingTeamMember.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editingTeamMember)
      });
      const data = await res.json();
      if (data.success) {
        setEditingTeamMember(null);
        loadTeam();
      } else {
        window.alert(data.error || 'Failed to update team member.');
      }
    } catch (err) {
      window.alert('Network error.');
    }
  };

  const loadGallery = async () => {
    try {
      const res = await fetch(`/api/admin/gallery?_t=${Date.now()}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setGalleryList(data.images);
    } catch (e) { console.error(e); }
  };

  const deleteGalleryItem = async (id) => {
    if (!window.confirm('Delete this gallery photo?')) return;
    await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    loadGallery();
  };

  const handleCreateGalleryItem = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newGalleryItem)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddGalleryModal(false);
        setNewGalleryItem({ title: '', category: 'Technical', image: '', display_order: 0 });
        loadGallery();
      } else {
        window.alert(data.error || 'Failed to add gallery image.');
      }
    } catch (err) {
      window.alert('Network error.');
    }
  };

  const handleUpdateGalleryItem = async (e) => {
    e.preventDefault();
    if (!editingGalleryItem) return;
    try {
      const res = await fetch(`/api/admin/gallery/${editingGalleryItem.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editingGalleryItem)
      });
      const data = await res.json();
      if (data.success) {
        setEditingGalleryItem(null);
        loadGallery();
      } else {
        window.alert(data.error || 'Failed to update gallery image.');
      }
    } catch (err) {
      window.alert('Network error.');
    }
  };

  // Custom Registration Fields Builder Helpers
  const addCustomFieldToNewEvent = () => {
    setNewEvent({
      ...newEvent,
      custom_fields: [
        ...(newEvent.custom_fields || []),
        { id: Date.now(), label: '', type: 'text', options: '', required: false }
      ]
    });
  };

  const removeCustomFieldFromNewEvent = (index) => {
    const updated = [...(newEvent.custom_fields || [])];
    updated.splice(index, 1);
    setNewEvent({ ...newEvent, custom_fields: updated });
  };

  const updateCustomFieldInNewEvent = (index, key, value) => {
    const updated = [...(newEvent.custom_fields || [])];
    updated[index] = { ...updated[index], [key]: value };
    setNewEvent({ ...newEvent, custom_fields: updated });
  };

  const getEditingEventCustomFields = () => {
    if (!editingEvent) return [];
    if (Array.isArray(editingEvent.custom_fields)) return editingEvent.custom_fields;
    if (typeof editingEvent.custom_fields === 'string' && editingEvent.custom_fields.trim()) {
      try { return JSON.parse(editingEvent.custom_fields); } catch (e) { return []; }
    }
    return [];
  };

  const addCustomFieldToEditingEvent = () => {
    const currentFields = getEditingEventCustomFields();
    setEditingEvent({
      ...editingEvent,
      custom_fields: [
        ...currentFields,
        { id: Date.now(), label: '', type: 'text', options: '', required: false }
      ]
    });
  };

  const removeCustomFieldFromEditingEvent = (index) => {
    const currentFields = [...getEditingEventCustomFields()];
    currentFields.splice(index, 1);
    setEditingEvent({ ...editingEvent, custom_fields: currentFields });
  };

  const updateCustomFieldInEditingEvent = (index, key, value) => {
    const currentFields = [...getEditingEventCustomFields()];
    currentFields[index] = { ...currentFields[index], [key]: value };
    setEditingEvent({ ...editingEvent, custom_fields: currentFields });
  };

  const renderCustomResponses = (customResponses) => {
    if (!customResponses) return <span style={{ color: '#94a3b8' }}>—</span>;
    try {
      const parsed = typeof customResponses === 'string' ? JSON.parse(customResponses) : customResponses;
      const keys = Object.keys(parsed);
      if (keys.length === 0) return <span style={{ color: '#94a3b8' }}>—</span>;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {keys.map(k => (
            <div key={k}>
              <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{k}:</span> {String(parsed[k])}
            </div>
          ))}
        </div>
      );
    } catch (e) {
      return <span>{String(customResponses)}</span>;
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newEvent)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddEvent(false);
        setNewEvent({ title: '', category: 'technical', date_str: '', location: '', description: '', status: 'upcoming' });
        loadEvents();
        loadStats();
      } else {
        window.alert(data.error || 'Failed to add event.');
      }
    } catch (err) {
      window.alert('Network error.');
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    if (!editingEvent) return;
    try {
      const res = await fetch(`/api/admin/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editingEvent)
      });
      const data = await res.json();
      if (data.success) {
        setEditingEvent(null);
        loadEvents();
        loadStats();
      } else {
        window.alert(data.error || 'Failed to update event.');
      }
    } catch (err) {
      window.alert('Network error updating event.');
    }
  };

  const handleSetFeatured = async (eventId) => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}/feature`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        loadEvents();
      } else {
        window.alert(data.error || 'Failed to update featured event.');
      }
    } catch (err) {
      window.alert('Network error setting featured event.');
    }
  };

  const exportEventCSV = (eventTitle, regList) => {
    const headers = ['ID', 'Registration Date', 'Student Name', 'Email', 'Phone', 'Roll Number', 'Branch', 'Year', 'Custom Responses'];
    const rows = regList.map(r => [
      r.id,
      new Date(r.created_at).toLocaleDateString(),
      `"${(r.student_name || '').replace(/"/g, '""')}"`,
      `"${(r.student_email || '').replace(/"/g, '""')}"`,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      `"${(r.roll_number || '').replace(/"/g, '""')}"`,
      `"${(r.branch || '').replace(/"/g, '""')}"`,
      `"${(r.year || '').replace(/"/g, '""')}"`,
      `"${(typeof r.custom_responses === 'string' ? r.custom_responses : JSON.stringify(r.custom_responses || '')).replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${(eventTitle || 'Event').replace(/[^a-z0-9]/gi, '_')}_Registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // IF NOT LOGGED IN AS ADMIN
  if (!isAdminLoggedIn) {
    return (
      <div className="admin-login-wrap" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: "linear-gradient(135deg, rgba(15, 27, 60, 0.88) 0%, rgba(8, 15, 36, 0.90) 100%), url('/auth_bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center center', padding: '20px' }}>
        <div className="admin-login-card" style={{ background: '#ffffff', borderRadius: '20px', padding: '48px 40px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(200, 146, 42, 0.3)' }}>
          <div className="admin-login-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '42px', color: 'var(--gold)', fontWeight: 800, lineHeight: 1 }}>आयाम</div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '24px', color: 'var(--navy)', margin: '10px 0 6px', fontWeight: 700 }}>Admin Portal</h1>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Log in to manage AAYAM events, student registrations & contact messages.</p>
          </div>

          <form onSubmit={handleAdminLoginSubmit}>
            <div className="form-group-custom">
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username / Email</label>
              <input type="text" value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} required placeholder="admin" style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', transition: 'all 0.2s ease', outline: 'none' }} />
            </div>
            <div className="form-group-custom" style={{ marginTop: '18px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
              <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required placeholder="••••••••" style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', transition: 'all 0.2s ease', outline: 'none' }} />
            </div>

            {loginErr && (
              <div style={{ color: '#dc2626', fontSize: '13px', marginTop: '16px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', textAlign: 'center', fontWeight: 500 }}>
                ⚠️ {loginErr}
              </div>
            )}

            <button type="submit" disabled={loginLoading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', cursor: 'pointer', marginTop: '24px', padding: '14px', fontSize: '14px', fontWeight: 700, borderRadius: '10px', boxShadow: '0 4px 14px rgba(200, 146, 42, 0.4)' }}>
              {loginLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div style={{ marginTop: '24px', padding: '12px', background: '#faf6f0', border: '1px solid #e8e0d0', borderRadius: '10px', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
            🔑 Default Admin: <strong style={{ color: 'var(--navy)' }}>admin</strong> | Password: <strong style={{ color: 'var(--navy)' }}>adminpassword123</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard" style={{ display: 'block', background: 'var(--cream-dark)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* HEADER */}
      <header className="admin-header" style={{ background: 'var(--navy)', borderBottom: '2px solid var(--gold)', color: '#ffffff', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(15,27,60,0.2)' }}>
        <div className="admin-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent' }}>
          <img src="/karnavati_logo.png" alt="Karnavati University" style={{ height: '32px', objectFit: 'contain', background: 'transparent' }} />
          <div style={{ height: '18px', width: '1px', background: 'rgba(255,255,255,0.3)' }}></div>
          <img src="/uit_logo.png" alt="UIT" style={{ height: '32px', objectFit: 'contain', background: 'transparent' }} />
          <div style={{ height: '18px', width: '1px', background: 'rgba(255,255,255,0.3)' }}></div>
          <img src="/aayam_logo.png" alt="AAYAM" style={{ height: '32px', objectFit: 'contain', background: 'transparent' }} />
          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--gold-pale)', fontFamily: "'Playfair Display', serif", marginLeft: '4px' }}>Admin Portal</span>
        </div>
        <div className="admin-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/" className="btn-navy-pill" style={{ padding: '8px 18px', fontSize: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '30px', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}>
            🌐 View Website
          </Link>
          <button onClick={logout} style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', borderRadius: '30px', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)' }}>
            Logout
          </button>
        </div>
      </header>

      {/* DASHBOARD HERO BANNER */}
      <div style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1a2a55 100%)', color: '#fff', padding: '36px 40px 48px', borderBottom: '1px solid rgba(200, 146, 42, 0.2)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold-pale)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>COMMAND CENTER</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, margin: 0, color: '#fff' }}>
            Welcome back, <span style={{ color: 'var(--gold-pale)' }}>{user?.name || 'Administrator'}</span>
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginTop: '6px', maxWidth: '600px', margin: '6px 0 0' }}>
            Manage campus events, review student registrations, and answer incoming contact inquiries in real-time.
          </p>
        </div>
      </div>

      <main className="admin-main" style={{ maxWidth: '1280px', margin: '-24px auto 48px', padding: '0 24px' }}>
        {/* STATS OVERVIEW CARDS */}
        <div className="stats-grid-admin" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {/* Card 1 */}
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(15,27,60,0.08)', border: '1px solid #e8e0d0', borderLeft: '5px solid var(--navy)', transition: 'transform 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Inquiries</span>
              <span style={{ fontSize: '20px' }}>📩</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--navy)', marginTop: '8px', fontFamily: "'Playfair Display',serif" }}>{stats.total_messages}</div>
            {stats.unread_messages > 0 && (
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#b91c1c', background: '#fee2e2', padding: '2px 8px', borderRadius: '10px', marginTop: '6px', display: 'inline-block' }}>
                {stats.unread_messages} unread
              </span>
            )}
          </div>

          {/* Card 2 */}
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(15,27,60,0.08)', border: '1px solid #e8e0d0', borderLeft: '5px solid var(--gold)', transition: 'transform 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Event Registrations</span>
              <span style={{ fontSize: '20px' }}>🎟️</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--navy)', marginTop: '8px', fontFamily: "'Playfair Display',serif" }}>{stats.total_registrations}</div>
            <span style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', display: 'inline-block' }}>students registered</span>
          </div>

          {/* Card 3 */}
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(15,27,60,0.08)', border: '1px solid #e8e0d0', borderLeft: '5px solid var(--gold-light)', transition: 'transform 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Events</span>
              <span style={{ fontSize: '20px' }}>📅</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--navy)', marginTop: '8px', fontFamily: "'Playfair Display',serif" }}>{stats.total_events}</div>
            <span style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', display: 'inline-block' }}>published on site</span>
          </div>

          {/* Card 4 */}
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(15,27,60,0.08)', border: '1px solid #e8e0d0', borderLeft: '5px solid #16a34a', transition: 'transform 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Database Health</span>
              <span style={{ fontSize: '20px' }}>⚡</span>
            </div>
            <div style={{ color: '#16a34a', fontSize: '18px', fontWeight: 800, marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', background: '#16a34a', borderRadius: '50%', boxShadow: '0 0 10px #16a34a', display: 'inline-block' }}></span>
              Connected Online
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', display: 'inline-block' }}>SQLite / Supabase active</span>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '8px', display: 'flex', gap: '8px', border: '1px solid #e8e0d0', marginBottom: '28px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          {[
            { id: 'messages', label: '📩 Contact Messages', count: messages.length },
            { id: 'registrations', label: '🎟️ Event Registrations', count: registrations.length },
            { id: 'events', label: '📅 Manage Events', count: eventsList.length },
            { id: 'team', label: '👥 Manage Team', count: teamList.length },
            { id: 'gallery', label: '🖼️ Manage Gallery', count: galleryList.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '12px 20px',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeTab === tab.id ? 'var(--navy)' : 'transparent',
                color: activeTab === tab.id ? 'var(--gold-pale)' : 'var(--text-mid)',
                boxShadow: activeTab === tab.id ? '0 4px 14px rgba(15,27,60,0.2)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                gap: '8px'
              }}
            >
              {tab.label}
              <span style={{
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                background: activeTab === tab.id ? 'rgba(255,255,255,0.15)' : '#f1f5f9',
                color: activeTab === tab.id ? '#ffffff' : '#64748b'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(15,27,60,0.06)', border: '1px solid #e8e0d0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--navy)', fontFamily: "'Playfair Display',serif", fontWeight: 700 }}>Received Contact Inquiries</h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>Messages submitted via the contact form on the website.</p>
              </div>
              <button onClick={loadMessages} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--navy)' }}>
                🔄 Refresh
              </button>
            </div>
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>ID</th>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Date</th>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Sender</th>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Email</th>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Subject</th>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Message</th>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.length > 0 ? (
                    messages.map(m => (
                      <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px', color: '#94a3b8' }}>#{m.id}</td>
                        <td style={{ padding: '14px 16px', color: '#64748b' }}>{new Date(m.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '14px 16px' }}><strong style={{ color: 'var(--navy)' }}>{m.name}</strong></td>
                        <td style={{ padding: '14px 16px', color: '#475569' }}>{m.email}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 600 }}>{m.subject}</td>
                        <td style={{ padding: '14px 16px', maxWidth: '240px', color: '#475569', lineHeight: 1.4 }}>{m.message}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: m.status === 'unread' ? '#fee2e2' : '#f1f5f9', color: m.status === 'unread' ? '#991b1b' : '#475569' }}>
                            {m.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {m.status === 'unread' && (
                              <button onClick={() => markRead(m.id)} style={{ padding: '5px 10px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Mark Read</button>
                            )}
                            <button onClick={() => deleteMessage(m.id)} style={{ padding: '5px 10px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No contact messages received yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REGISTRATIONS TAB - EVENT-WISE */}
        {activeTab === 'registrations' && (() => {
          // Group registrations by event_title
          const grouped = {};
          registrations.forEach(r => {
            const title = r.event_title || 'General Event';
            if (!grouped[title]) {
              grouped[title] = {
                title,
                event_id: r.event_id,
                items: []
              };
            }
            grouped[title].items.push(r);
          });

          const eventTitles = Object.keys(grouped);
          const filteredTitles = regEventFilter === 'all' ? eventTitles : eventTitles.filter(t => t === regEventFilter);

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* TOP CONTROL BAR & EVENT SELECTOR PILLS */}
              <div style={{ background: '#fff', borderRadius: '16px', padding: '24px 28px', boxShadow: '0 4px 20px rgba(15,27,60,0.06)', border: '1px solid #e8e0d0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--navy)', fontFamily: "'Playfair Display',serif", fontWeight: 700 }}>
                      Student Registrations (Event-Wise)
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                      Showing {registrations.length} total registrations organized by event.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => exportEventCSV('All_Events', registrations)}
                      style={{ padding: '9px 18px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}
                    >
                      📥 Export All CSV
                    </button>
                    <button
                      onClick={loadRegistrations}
                      style={{ padding: '9px 18px', border: '1.5px solid #cbd5e1', borderRadius: '8px', background: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--navy)' }}
                    >
                      🔄 Refresh List
                    </button>
                  </div>
                </div>

                {/* EVENT FILTER PILLS */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '6px' }}>Select Event:</span>
                  <button
                    onClick={() => setRegEventFilter('all')}
                    style={{
                      padding: '7px 16px',
                      borderRadius: '20px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: regEventFilter === 'all' ? 'var(--navy)' : '#f1f5f9',
                      color: regEventFilter === 'all' ? '#ffffff' : '#475569',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    🌐 All Events ({registrations.length})
                  </button>
                  {eventTitles.map(t => (
                    <button
                      key={t}
                      onClick={() => setRegEventFilter(t)}
                      style={{
                        padding: '7px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: regEventFilter === t ? 'var(--gold)' : '#f1f5f9',
                        color: regEventFilter === t ? 'var(--navy)' : '#475569',
                        transition: 'all 0.2s ease',
                        boxShadow: regEventFilter === t ? '0 2px 8px rgba(197, 160, 89, 0.4)' : 'none'
                      }}
                    >
                      🎟️ {t} ({grouped[t].items.length})
                    </button>
                  ))}
                </div>
              </div>

              {/* EVENT-WISE CARDS LIST */}
              {filteredTitles.length > 0 ? (
                filteredTitles.map(t => {
                  const evGroup = grouped[t];
                  return (
                    <div
                      key={t}
                      style={{
                        background: '#fff',
                        borderRadius: '16px',
                        padding: '24px 28px',
                        boxShadow: '0 4px 20px rgba(15,27,60,0.06)',
                        border: '1.5px solid #e8e0d0'
                      }}
                    >
                      {/* DEDICATED EVENT HEADER */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '16px', borderBottom: '2px solid #f1f5f9', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--navy), #1e3a73)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800 }}>
                            🎟️
                          </div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--navy)', fontFamily: "'Playfair Display',serif", fontWeight: 800 }}>
                              {evGroup.title}
                            </h4>
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                              Total Registrations: <strong style={{ color: 'var(--gold-dark)' }}>{evGroup.items.length} Students</strong>
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => exportEventCSV(evGroup.title, evGroup.items)}
                          style={{
                            padding: '7px 16px',
                            background: '#f0fdf4',
                            color: '#15803d',
                            border: '1px solid #bbf7d0',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          📄 Export {evGroup.title} CSV
                        </button>
                      </div>

                      {/* DEDICATED EVENT REGISTRATION TABLE */}
                      <div className="table-responsive" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Reg ID</th>
                              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Date</th>
                              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Student Name</th>
                              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Email</th>
                              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Phone</th>
                              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Roll No</th>
                              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Branch</th>
                              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Year</th>
                              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Custom Answers</th>
                              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {evGroup.items.map(r => (
                              <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '12px 16px', color: '#94a3b8', fontWeight: 600 }}>#{r.id}</td>
                                <td style={{ padding: '12px 16px', color: '#64748b' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                                <td style={{ padding: '12px 16px' }}><strong style={{ color: 'var(--navy)' }}>{r.student_name}</strong></td>
                                <td style={{ padding: '12px 16px', color: '#475569' }}>{r.student_email}</td>
                                <td style={{ padding: '12px 16px', color: '#475569' }}>{r.phone}</td>
                                <td style={{ padding: '12px 16px' }}><code style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>{r.roll_number}</code></td>
                                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{r.branch}</td>
                                <td style={{ padding: '12px 16px' }}>{r.year}</td>
                                <td style={{ padding: '12px 16px', fontSize: '12px', color: '#334155' }}>
                                  {renderCustomResponses(r.custom_responses)}
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                  <button onClick={() => deleteRegistration(r.id)} style={{ padding: '5px 12px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ background: '#fff', borderRadius: '16px', padding: '50px 20px', textAlign: 'center', color: '#94a3b8', border: '1px solid #e8e0d0' }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎟️</div>
                  <h4 style={{ color: 'var(--navy)', margin: '0 0 6px', fontSize: '18px' }}>No Event Registrations Found</h4>
                  <p style={{ margin: 0, fontSize: '13px' }}>There are currently no student registrations for this event.</p>
                </div>
              )}
            </div>
          );
        })()}

        {/* EVENTS TAB */}
        {activeTab === 'events' && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(15,27,60,0.06)', border: '1px solid #e8e0d0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--navy)', fontFamily: "'Playfair Display',serif", fontWeight: 700 }}>Published Events</h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>Create, update, or remove events displayed on the website.</p>
              </div>
              <button onClick={() => setShowAddEvent(true)} className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px', cursor: 'pointer', borderRadius: '8px', fontWeight: 700, boxShadow: '0 4px 14px rgba(200,146,42,0.3)' }}>
                + Add New Event
              </button>
            </div>
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Poster</th>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Title</th>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Category</th>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Date Range</th>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Location</th>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {eventsList.length > 0 ? (
                    eventsList.map(ev => {
                      const isFeatured = (ev.status || '').toLowerCase() === 'featured';
                      return (
                        <tr key={ev.id} style={{ borderBottom: '1px solid #f1f5f9', background: isFeatured ? '#fffdf5' : 'transparent' }}>
                          <td style={{ padding: '12px 16px' }}>
                            {ev.image ? (
                              <img src={ev.image} alt={ev.title} style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: isFeatured ? '2px solid var(--gold)' : '1px solid #cbd5e1' }} />
                            ) : (
                              <div style={{ width: '48px', height: '36px', background: 'var(--navy)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontSize: '10px', fontWeight: 700 }}>AAYAM</div>
                            )}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <strong style={{ color: 'var(--navy)', fontSize: '14px' }}>{ev.title}</strong>
                            {ev.subtitle && <div style={{ fontSize: '11px', color: '#64748b' }}>{ev.subtitle}</div>}
                          </td>
                          <td style={{ padding: '14px 16px', textTransform: 'capitalize', fontWeight: 600, color: 'var(--gold)' }}>{ev.category}</td>
                          <td style={{ padding: '14px 16px', color: '#475569' }}>{ev.date_str || (ev.start_date ? `${ev.start_date} – ${ev.end_date}` : 'TBA')}</td>
                          <td style={{ padding: '14px 16px', color: '#475569' }}>{ev.location}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, background: isFeatured ? '#fef3c7' : ev.status === 'registering' ? '#dcfce7' : '#f1f5f9', color: isFeatured ? '#92400e' : ev.status === 'registering' ? '#166534' : '#475569', boxShadow: isFeatured ? '0 0 10px rgba(200,146,42,0.3)' : 'none' }}>
                              {isFeatured ? '★ FEATURED SPOTLIGHT' : ev.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {!isFeatured ? (
                                <button
                                  onClick={() => handleSetFeatured(ev.id)}
                                  style={{ padding: '5px 12px', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#92400e', border: '1px solid #f59e0b', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                  ⭐ Set as Featured Spotlight
                                </button>
                              ) : (
                                <span style={{ fontSize: '11px', fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '5px 10px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  ✓ Active Spotlight
                                </span>
                              )}
                              <button onClick={() => setEditingEvent(ev)} style={{ padding: '5px 12px', background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                              <button onClick={() => deleteEvent(ev.id)} style={{ padding: '5px 12px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No events published yet. Click <strong>+ Add New Event</strong> to get started.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TEAM MEMBERS TAB */}
        {activeTab === 'team' && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(15,27,60,0.06)', border: '1px solid #e8e0d0' }}>
            
            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--navy)', fontFamily: "'Playfair Display',serif", fontWeight: 800 }}>👥 Team Members Management</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Manage student leaders grouped into 6 official team categories matching the public website.</p>
              </div>
              <button
                onClick={() => {
                  setNewTeamMember({ name: '', role: '', category: 'Head', branch_title: '', description: '', image: '', icon: '👤' });
                  setShowAddTeamMember(true);
                }}
                className="btn-primary"
                style={{ padding: '11px 22px', fontSize: '13px', cursor: 'pointer', borderRadius: '30px', fontWeight: 700, boxShadow: '0 4px 14px rgba(200,146,42,0.3)' }}
              >
                + Add Team Member
              </button>
            </div>

            {/* 7 TEAM CATEGORIES SECTIONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
              {[
                { id: 'Head', title: 'Head', icon: '👑', subtitle: 'Executive Board & Committee Heads' },
                { id: 'Management Team', title: 'Management Team', icon: '💼', subtitle: 'Operations, Logistics & Event Planning' },
                { id: 'Sports Team', title: 'Sports Team', icon: '⚽', subtitle: 'Inter-College Tournaments & Athletics' },
                { id: 'Cultural Team', title: 'Cultural Team', icon: '🎭', subtitle: 'Performing Arts, Stage & Music' },
                { id: 'Media Team', title: 'Media Team', icon: '📸', subtitle: 'Photography, Video & Creative Design' },
                { id: 'Technical Team', title: 'Technical Team', icon: '💻', subtitle: 'Web Portals, Hackathons & Tech Labs' },
                { id: 'Hospitality Team', title: 'Hospitality Team', icon: '🤝', subtitle: 'Guest Welcome, Reception & VIP Management' }
              ].map(sec => {
                const members = teamList.filter(m => {
                  const c = (m.category || '').toLowerCase().trim();
                  const target = sec.id.toLowerCase().trim();
                  if (target === 'head') return c === 'head' || c === 'leadership' || c === 'executive';
                  if (target === 'management team') return c === 'management team' || c === 'management' || (c === 'branch_head' && (m.branch_title || '').toLowerCase().includes('management'));
                  if (target === 'sports team') return c === 'sports team' || c === 'sports' || (c === 'branch_head' && (m.branch_title || '').toLowerCase().includes('sports'));
                  if (target === 'cultural team') return c === 'cultural team' || c === 'cultural' || (c === 'branch_head' && (m.branch_title || '').toLowerCase().includes('cultural'));
                  if (target === 'media team') return c === 'media team' || c === 'media' || c === 'media & design' || (c === 'branch_head' && (m.branch_title || '').toLowerCase().includes('media'));
                  if (target === 'technical team') return c === 'technical team' || c === 'technical' || c === 'tech' || (c === 'branch_head' && (m.branch_title || '').toLowerCase().includes('technical'));
                  if (target === 'hospitality team') return c === 'hospitality team' || c === 'hospitality' || (c === 'branch_head' && (m.branch_title || '').toLowerCase().includes('hospitality'));
                  return c === target;
                });

                return (
                  <div key={sec.id} style={{ background: '#faf8f5', borderRadius: '16px', padding: '24px', border: '1.5px solid #e8e0d0' }}>
                    
                    {/* Section Header with Add Button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1.5px solid #e8e0d0', paddingBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '20px' }}>{sec.icon}</span>
                          <h4 style={{ margin: 0, fontSize: '18px', fontFamily: "'Playfair Display', serif", fontWeight: 800, color: 'var(--navy)' }}>
                            {sec.title} <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>({members.length} {members.length === 1 ? 'member' : 'members'})</span>
                          </h4>
                        </div>
                        <p style={{ margin: '2px 0 0 28px', fontSize: '12px', color: '#64748b' }}>{sec.subtitle}</p>
                      </div>

                      {/* Per-Category Add Member Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setNewTeamMember({ name: '', role: '', category: sec.id, branch_title: sec.title, description: '', image: '', icon: '👤' });
                          setShowAddTeamMember(true);
                        }}
                        style={{
                          padding: '7px 16px',
                          background: '#ffffff',
                          border: '1.5px solid #C5A059',
                          color: 'var(--navy)',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 8px rgba(15,27,60,0.05)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        + Add to {sec.title}
                      </button>
                    </div>

                    {/* Member Cards Grid for this category */}
                    {members.length > 0 ? (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: '20px'
                      }}>
                        {members.map(m => (
                          <div key={m.id} style={{
                            background: '#ffffff',
                            borderRadius: '14px',
                            padding: '18px 14px',
                            border: '1px solid #e8e0d0',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            boxShadow: '0 4px 12px rgba(15,27,60,0.04)'
                          }}>
                            {/* Avatar */}
                            {m.image ? (
                              <img src={m.image} alt={m.name} style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #C5A059', marginBottom: '10px' }} />
                            ) : (
                              <div style={{ width: '84px', height: '84px', borderRadius: '50%', background: 'linear-gradient(135deg, #0f1b3c, #1a2a55)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '36px', border: '2px solid #C5A059', marginBottom: '10px' }}>
                                👤
                              </div>
                            )}

                            {/* Name */}
                            <h5 style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: 800, color: 'var(--navy)', margin: '0 0 3px' }}>
                              {m.name}
                            </h5>

                            {/* Position */}
                            <div style={{ fontSize: '11px', fontWeight: 800, color: '#C5A059', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '10px' }}>
                              {m.role || 'Member'}
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '6px', marginTop: 'auto', width: '100%', justifyContent: 'center' }}>
                              <button onClick={() => setEditingTeamMember(m)} style={{ padding: '5px 10px', background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', flex: 1 }}>Edit</button>
                              <button onClick={() => deleteTeamMember(m.id)} style={{ padding: '5px 10px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', flex: 1 }}>Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>
                        No members added to {sec.title} yet. Click <strong>+ Add to {sec.title}</strong> to add one.
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* GALLERY TAB */}
        {activeTab === 'gallery' && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(15,27,60,0.06)', border: '1px solid #e8e0d0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--navy)', fontFamily: "'Playfair Display',serif", fontWeight: 700 }}>Gallery Photos</h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>Manage event, workshop, and campus photos displayed on the Gallery page.</p>
              </div>
              <button onClick={() => setShowAddGalleryModal(true)} className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px', cursor: 'pointer', borderRadius: '8px', fontWeight: 700, boxShadow: '0 4px 14px rgba(200,146,42,0.3)' }}>
                + Add Gallery Image
              </button>
            </div>
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Photo</th>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Title</th>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Category</th>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {galleryList.length > 0 ? (
                    galleryList.map(g => (
                      <tr key={g.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <img src={g.image} alt={g.title} style={{ width: '56px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <strong style={{ color: 'var(--navy)', fontSize: '14px' }}>{g.title}</strong>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--gold)' }}>{g.category}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => setEditingGalleryItem(g)} style={{ padding: '5px 12px', background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                            <button onClick={() => deleteGalleryItem(g.id)} style={{ padding: '5px 12px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No gallery photos added yet. Click <strong>+ Add Gallery Image</strong> to upload one.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ADD EVENT MODAL */}
      {showAddEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,27,60,0.75)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '32px', maxWidth: '880px', width: '95%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.35)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1.5px solid #e8e0d0', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>✨</span>
                <h2 style={{ margin: 0, color: 'var(--navy)', fontSize: '24px', fontFamily: "'Playfair Display',serif", fontWeight: 800 }}>Create New Event</h2>
              </div>
              <button onClick={() => setShowAddEvent(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
            </div>

            <EventDetailsForm
              eventData={newEvent}
              setEventData={setNewEvent}
              onSubmit={handleCreateEvent}
              onCancel={() => setShowAddEvent(false)}
              submitBtnText="Save Event Details"
            />
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {editingEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,27,60,0.75)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '32px', maxWidth: '880px', width: '95%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.35)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1.5px solid #e8e0d0', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>✏️</span>
                <h2 style={{ margin: 0, color: 'var(--navy)', fontSize: '24px', fontFamily: "'Playfair Display',serif", fontWeight: 800 }}>Edit Event #{editingEvent.id}</h2>
              </div>
              <button onClick={() => setEditingEvent(null)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
            </div>

            <EventDetailsForm
              eventData={editingEvent}
              setEventData={setEditingEvent}
              onSubmit={handleUpdateEvent}
              onCancel={() => setEditingEvent(null)}
              submitBtnText="Update Event Details"
            />
          </div>
        </div>
      )}

      {/* ADD TEAM MEMBER MODAL MATCHING SCREENSHOT 1 */}
      {showAddTeamMember && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,27,60,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#faf6f0', borderRadius: '24px', padding: '32px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.35)', border: '1.5px solid #e2d7c5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--navy)', fontSize: '22px', fontFamily: "'Playfair Display',serif", fontWeight: 800 }}>👤 Add Team Member</h3>
              <button onClick={() => setShowAddTeamMember(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>

            <form onSubmit={handleCreateTeamMember}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* 1. Member Name */}
                <div>
                  <input
                    type="text"
                    value={newTeamMember.name}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                    required
                    placeholder="Member name"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      border: '1.5px solid #e8dfd1',
                      borderRadius: '16px',
                      background: '#fffefb',
                      fontSize: '15px',
                      color: 'var(--navy)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* 2. Position (e.g. Head of Committee) */}
                <div>
                  <input
                    type="text"
                    value={newTeamMember.role}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                    required
                    placeholder="Position (e.g. Head of Committee)"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      border: '1.5px solid #e8dfd1',
                      borderRadius: '16px',
                      background: '#fffefb',
                      fontSize: '15px',
                      color: 'var(--navy)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* 3. Team Category Dropdown */}
                <div>
                  <select
                    value={newTeamMember.category || 'Head'}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, category: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      border: '1.5px solid #e8dfd1',
                      borderRadius: '16px',
                      background: '#fffefb',
                      fontSize: '15px',
                      color: 'var(--navy)',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontWeight: 600
                    }}
                  >
                    <option value="Head">Head (Core Board)</option>
                    <option value="Management Team">Management Team</option>
                    <option value="Sports Team">Sports Team</option>
                    <option value="Cultural Team">Cultural Team</option>
                    <option value="Media Team">Media Team</option>
                    <option value="Technical Team">Technical Team</option>
                    <option value="Hospitality Team">Hospitality Team</option>
                  </select>
                </div>

                {/* 4. Choose File Photo Upload Box */}
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid #e8dfd1',
                    borderRadius: '16px',
                    background: '#fffefb',
                    overflow: 'hidden'
                  }}>
                    <label style={{
                      padding: '14px 20px',
                      background: '#f4ede2',
                      borderRight: '1.5px solid #e8dfd1',
                      fontSize: '14px',
                      color: '#334155',
                      cursor: 'pointer',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}>
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setNewTeamMember({ ...newTeamMember, image: reader.result });
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <span style={{ padding: '0 16px', fontSize: '14px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {newTeamMember.image ? 'Photo selected' : 'no file selected'}
                    </span>
                  </div>

                  {newTeamMember.image && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={newTeamMember.image} alt="Preview" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #C5A059' }} />
                      <button type="button" onClick={() => setNewTeamMember({ ...newTeamMember, image: '' })} style={{ padding: '4px 10px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Remove</button>
                    </div>
                  )}
                </div>

                {/* 5. LinkedIn Profile URL */}
                <div>
                  <input
                    type="url"
                    value={newTeamMember.linkedin_url || ''}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, linkedin_url: e.target.value })}
                    placeholder="LinkedIn Profile URL (e.g. https://linkedin.com/in/name)"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      border: '1.5px solid #e8dfd1',
                      borderRadius: '16px',
                      background: '#fffefb',
                      fontSize: '14px',
                      color: 'var(--navy)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* 6. Email Address */}
                <div>
                  <input
                    type="email"
                    value={newTeamMember.email || ''}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, email: e.target.value })}
                    placeholder="Email Address (e.g. member@ku.edu.in)"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      border: '1.5px solid #e8dfd1',
                      borderRadius: '16px',
                      background: '#fffefb',
                      fontSize: '14px',
                      color: 'var(--navy)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* 7. Short Bio / Description */}
                <div>
                  <input
                    type="text"
                    value={newTeamMember.description}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, description: e.target.value })}
                    placeholder="Short Responsibilities / Bio (Optional)"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      border: '1.5px solid #e8dfd1',
                      borderRadius: '16px',
                      background: '#fffefb',
                      fontSize: '14px',
                      color: 'var(--navy)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Submit Button */}
                <div style={{ marginTop: '12px' }}>
                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '16px 28px',
                      background: 'linear-gradient(135deg, #7c5235, #5a3922)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '30px',
                      fontSize: '16px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 8px 24px rgba(124, 82, 53, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      gap: '8px',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    ↑ Upload Member
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TEAM MEMBER MODAL */}
      {editingTeamMember && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,27,60,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#faf6f0', borderRadius: '24px', padding: '32px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.35)', border: '1.5px solid #e2d7c5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--navy)', fontSize: '22px', fontFamily: "'Playfair Display',serif", fontWeight: 800 }}>✏️ Edit Team Member #{editingTeamMember.id}</h3>
              <button onClick={() => setEditingTeamMember(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>

            <form onSubmit={handleUpdateTeamMember}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Member Name */}
                <div>
                  <input
                    type="text"
                    value={editingTeamMember.name || ''}
                    onChange={(e) => setEditingTeamMember({ ...editingTeamMember, name: e.target.value })}
                    required
                    placeholder="Member name"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      border: '1.5px solid #e8dfd1',
                      borderRadius: '16px',
                      background: '#fffefb',
                      fontSize: '15px',
                      color: 'var(--navy)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Position */}
                <div>
                  <input
                    type="text"
                    value={editingTeamMember.role || ''}
                    onChange={(e) => setEditingTeamMember({ ...editingTeamMember, role: e.target.value })}
                    required
                    placeholder="Position (e.g. Head of Committee)"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      border: '1.5px solid #e8dfd1',
                      borderRadius: '16px',
                      background: '#fffefb',
                      fontSize: '15px',
                      color: 'var(--navy)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Team Category Dropdown */}
                <div>
                  <select
                    value={editingTeamMember.category || 'Head'}
                    onChange={(e) => setEditingTeamMember({ ...editingTeamMember, category: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      border: '1.5px solid #e8dfd1',
                      borderRadius: '16px',
                      background: '#fffefb',
                      fontSize: '15px',
                      color: 'var(--navy)',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontWeight: 600
                    }}
                  >
                    <option value="Head">Head (Core Board)</option>
                    <option value="Management Team">Management Team</option>
                    <option value="Sports Team">Sports Team</option>
                    <option value="Cultural Team">Cultural Team</option>
                    <option value="Media Team">Media Team</option>
                    <option value="Technical Team">Technical Team</option>
                    <option value="Hospitality Team">Hospitality Team</option>
                  </select>
                </div>

                {/* LinkedIn URL */}
                <div>
                  <input
                    type="url"
                    value={editingTeamMember.linkedin_url || ''}
                    onChange={(e) => setEditingTeamMember({ ...editingTeamMember, linkedin_url: e.target.value })}
                    placeholder="LinkedIn Profile URL (e.g. https://linkedin.com/in/name)"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      border: '1.5px solid #e8dfd1',
                      borderRadius: '16px',
                      background: '#fffefb',
                      fontSize: '14px',
                      color: 'var(--navy)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Email Address */}
                <div>
                  <input
                    type="email"
                    value={editingTeamMember.email || ''}
                    onChange={(e) => setEditingTeamMember({ ...editingTeamMember, email: e.target.value })}
                    placeholder="Email Address (e.g. member@ku.edu.in)"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      border: '1.5px solid #e8dfd1',
                      borderRadius: '16px',
                      background: '#fffefb',
                      fontSize: '14px',
                      color: 'var(--navy)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Choose File Photo Upload */}
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid #e8dfd1',
                    borderRadius: '16px',
                    background: '#fffefb',
                    overflow: 'hidden'
                  }}>
                    <label style={{
                      padding: '14px 20px',
                      background: '#f4ede2',
                      borderRight: '1.5px solid #e8dfd1',
                      fontSize: '14px',
                      color: '#334155',
                      cursor: 'pointer',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}>
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setEditingTeamMember({ ...editingTeamMember, image: reader.result });
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <span style={{ padding: '0 16px', fontSize: '14px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {editingTeamMember.image ? 'Photo selected' : 'no file selected'}
                    </span>
                  </div>

                  {editingTeamMember.image && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={editingTeamMember.image} alt="Preview" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #C5A059' }} />
                      <button type="button" onClick={() => setEditingTeamMember({ ...editingTeamMember, image: '' })} style={{ padding: '4px 10px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Remove</button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <input
                    type="text"
                    value={editingTeamMember.description || ''}
                    onChange={(e) => setEditingTeamMember({ ...editingTeamMember, description: e.target.value })}
                    placeholder="Short Responsibilities / Bio (Optional)"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      border: '1.5px solid #e8dfd1',
                      borderRadius: '16px',
                      background: '#fffefb',
                      fontSize: '14px',
                      color: 'var(--navy)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Submit Button */}
                <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingTeamMember(null)}
                    style={{
                      flex: 1,
                      padding: '14px',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                      borderRadius: '30px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#475569'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 2,
                      padding: '14px',
                      background: 'linear-gradient(135deg, #7c5235, #5a3922)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '30px',
                      fontSize: '15px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 8px 24px rgba(124, 82, 53, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    ↑ Update Member
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD GALLERY IMAGE MODAL */}
      {showAddGalleryModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,27,60,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', maxWidth: '540px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', pb: '12px' }}>
              <h3 style={{ margin: 0, color: 'var(--navy)', fontSize: '20px', fontFamily: "'Playfair Display',serif" }}>🖼️ Add Gallery Image</h3>
              <button onClick={() => setShowAddGalleryModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>

            <form onSubmit={handleCreateGalleryItem}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)', display: 'block', marginBottom: '4px' }}>Photo Title / Caption *</label>
                  <input type="text" value={newGalleryItem.title} onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })} required placeholder="e.g. Equinox 3.0 Tech Symposium" style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)', display: 'block', marginBottom: '4px' }}>Category *</label>
                  <input type="text" value={newGalleryItem.category} onChange={(e) => setNewGalleryItem({ ...newGalleryItem, category: e.target.value })} required placeholder="e.g. Technical, Cultural, Sports, Workshop, Campus" style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} />
                </div>

                {/* Photo Upload */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)', display: 'block', marginBottom: '4px' }}>Image File / Poster *</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '6px', fontSize: '13px', color: '#475569', cursor: 'pointer', fontWeight: 600 }}>
                      📁 Choose File
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setNewGalleryItem({ ...newGalleryItem, image: reader.result });
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>or URL:</span>
                    <input type="text" value={newGalleryItem.image} onChange={(e) => setNewGalleryItem({ ...newGalleryItem, image: e.target.value })} placeholder="https://..." style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }} />
                  </div>
                  {newGalleryItem.image && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={newGalleryItem.image} alt="Preview" style={{ width: '80px', height: '54px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      <button type="button" onClick={() => setNewGalleryItem({ ...newGalleryItem, image: '' })} style={{ padding: '3px 8px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Remove Image</button>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button type="button" onClick={() => setShowAddGalleryModal(false)} style={{ padding: '9px 18px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '9px 20px', cursor: 'pointer', fontSize: '13px' }}>Upload Photo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT GALLERY IMAGE MODAL */}
      {editingGalleryItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,27,60,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', maxWidth: '540px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', pb: '12px' }}>
              <h3 style={{ margin: 0, color: 'var(--navy)', fontSize: '20px', fontFamily: "'Playfair Display',serif" }}>✏️ Edit Gallery Image #{editingGalleryItem.id}</h3>
              <button onClick={() => setEditingGalleryItem(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>

            <form onSubmit={handleUpdateGalleryItem}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)', display: 'block', marginBottom: '4px' }}>Photo Title / Caption *</label>
                  <input type="text" value={editingGalleryItem.title || ''} onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, title: e.target.value })} required style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)', display: 'block', marginBottom: '4px' }}>Category *</label>
                  <input type="text" value={editingGalleryItem.category || ''} onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, category: e.target.value })} required style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} />
                </div>

                {/* Photo Upload */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)', display: 'block', marginBottom: '4px' }}>Image File / Poster *</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '6px', fontSize: '13px', color: '#475569', cursor: 'pointer', fontWeight: 600 }}>
                      📁 Choose File
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setEditingGalleryItem({ ...editingGalleryItem, image: reader.result });
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>or URL:</span>
                    <input type="text" value={editingGalleryItem.image || ''} onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, image: e.target.value })} placeholder="https://..." style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }} />
                  </div>
                  {editingGalleryItem.image && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={editingGalleryItem.image} alt="Preview" style={{ width: '80px', height: '54px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      <button type="button" onClick={() => setEditingGalleryItem({ ...editingGalleryItem, image: '' })} style={{ padding: '3px 8px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Remove Image</button>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button type="button" onClick={() => setEditingGalleryItem(null)} style={{ padding: '9px 18px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '9px 20px', cursor: 'pointer', fontSize: '13px' }}>Update Photo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
