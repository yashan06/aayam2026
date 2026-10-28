const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { dbRun, dbAll, dbGet } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'aayam_uit_secret_key_2026_secure';
const ADMIN_PASSCODE = 'aayam2026admin'; // Secret code required for Admin self-registration

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Lightweight, High-Performance In-Memory API Cache
const apiCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

const getCached = (key) => {
  const item = apiCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    apiCache.delete(key);
    return null;
  }
  return item.data;
};

const setCached = (key, data, ttlMs = CACHE_TTL_MS) => {
  apiCache.set(key, { data, expiry: Date.now() + ttlMs });
};

const clearCachePrefix = (prefix) => {
  for (const key of apiCache.keys()) {
    if (key.startsWith(prefix)) {
      apiCache.delete(key);
    }
  }
};

// HTTP Cache headers:
// - Auth, Admin & Mutations: strictly no-store
// - Public read-only GET endpoints: fast edge & browser caching with stale-while-revalidate
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Serve static frontend assets & React build with aggressive browser caching
const fs = require('fs');
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, { maxAge: '7d', immutable: true }));
}
app.use(express.static(__dirname, { maxAge: '1d' }));

// ---- AUTH MIDDLEWARE ----
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
};

const authAdmin = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      req.admin = req.user;
      next();
    } else {
      res.status(403).json({ success: false, error: 'Access denied. Admin role required.' });
    }
  });
};

// ==========================================
// AUTHENTICATION API ENDPOINTS
// ==========================================

// 1. Student Signup
app.post('/api/auth/student/signup', async (req, res) => {
  try {
    const { name, email, password, roll_number, branch, year } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const existingStudent = await dbGet(`SELECT * FROM students WHERE email = ?`, [email.trim().toLowerCase()]);
    if (existingStudent) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await dbRun(
      `INSERT INTO students (name, email, password_hash, roll_number, branch, year) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        passwordHash,
        roll_number ? roll_number.trim() : '',
        branch ? branch.trim() : '',
        year ? year.trim() : ''
      ]
    );

    const token = jwt.sign(
      { id: result.lastID, name: name.trim(), email: email.trim().toLowerCase(), role: 'student', roll_number, branch, year },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to AAYAM.',
      token,
      user: {
        id: result.lastID,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        roll_number,
        branch,
        year,
        role: 'student'
      }
    });
  } catch (err) {
    console.error('Error during student signup:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to create student account.' });
  }
});

// 2. Student Login
app.post('/api/auth/student/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const student = await dbGet(`SELECT * FROM students WHERE email = ?`, [email.trim().toLowerCase()]);
    if (!student) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, student.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: student.id, name: student.name, email: student.email, role: 'student', roll_number: student.roll_number, branch: student.branch, year: student.year },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: `Welcome back, ${student.name}!`,
      token,
      user: {
        id: student.id,
        name: student.name,
        email: student.email,
        roll_number: student.roll_number,
        branch: student.branch,
        year: student.year,
        role: 'student'
      }
    });
  } catch (err) {
    console.error('Error during student login:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to log in.' });
  }
});

// 3. Admin Signup
app.post('/api/auth/admin/signup', async (req, res) => {
  try {
    const { name, username, email, password, secret_code } = req.body;

    if (!name || !username || !password || !secret_code) {
      return res.status(400).json({ success: false, error: 'Name, username, password, and admin secret code are required.' });
    }

    if (secret_code !== ADMIN_PASSCODE) {
      return res.status(403).json({ success: false, error: 'Invalid Admin Security Code.' });
    }

    const existingAdmin = await dbGet(`SELECT * FROM admins WHERE username = ? OR email = ?`, [username.trim(), (email || '').trim().toLowerCase()]);
    if (existingAdmin) {
      return res.status(400).json({ success: false, error: 'Username or email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await dbRun(
      `INSERT INTO admins (username, email, password_hash, name) VALUES (?, ?, ?, ?)`,
      [username.trim(), (email || '').trim().toLowerCase(), passwordHash, name.trim()]
    );

    const token = jwt.sign(
      { id: result.lastID, username: username.trim(), name: name.trim(), role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully!',
      token,
      user: {
        id: result.lastID,
        username: username.trim(),
        name: name.trim(),
        role: 'admin'
      }
    });
  } catch (err) {
    console.error('Error during admin signup:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to create admin account.' });
  }
});

// 4. Admin Login
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username/email and password are required.' });
    }

    const input = username.trim();
    const admin = await dbGet(`SELECT * FROM admins WHERE username = ? OR email = ?`, [input, input.toLowerCase()]);
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Invalid username/email or password.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid username/email or password.' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, name: admin.name, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: { id: admin.id, username: admin.username, name: admin.name, role: 'admin' }
    });
  } catch (err) {
    console.error('Error logging in admin:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to process login.' });
  }
});

// Unified Universal Login (Handles both Students and Admins automatically)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const input = (email || username || '').trim();

    if (!input || !password) {
      return res.status(400).json({ success: false, error: 'Email/Username and password are required.' });
    }

    // 1. Check Student Table
    const student = await dbGet(`SELECT * FROM students WHERE email = ?`, [input.toLowerCase()]);
    if (student) {
      const isMatch = await bcrypt.compare(password, student.password_hash);
      if (isMatch) {
        const token = jwt.sign(
          { id: student.id, name: student.name, email: student.email, role: 'student', roll_number: student.roll_number, branch: student.branch, year: student.year },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        return res.json({
          success: true,
          message: `Welcome back, ${student.name}!`,
          token,
          user: {
            id: student.id,
            name: student.name,
            email: student.email,
            roll_number: student.roll_number,
            branch: student.branch,
            year: student.year,
            role: 'student'
          }
        });
      }
    }

    // 2. Check Admin Table
    const admin = await dbGet(`SELECT * FROM admins WHERE username = ? OR email = ?`, [input, input.toLowerCase()]);
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password_hash);
      if (isMatch) {
        const token = jwt.sign(
          { id: admin.id, username: admin.username, name: admin.name, role: 'admin' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({
          success: true,
          message: `Welcome back, ${admin.name}!`,
          token,
          user: { id: admin.id, username: admin.username, name: admin.name, role: 'admin' }
        });
      }
    }

    return res.status(401).json({ success: false, error: 'Invalid Email/Username or Password.' });
  } catch (err) {
    console.error('Error during unified login:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to process login.' });
  }
});

// 5. Get Current User Info (/api/auth/me)
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});


// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

// Submit Contact Form Message
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: 'All fields (name, email, subject, message) are required.' });
    }

    const result = await dbRun(
      `INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)`,
      [name.trim(), email.trim(), subject.trim(), message.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Your message has been received! We will get back to you soon.',
      id: result.lastID
    });
  } catch (err) {
    console.error('Error handling contact submit:', err);
    res.status(500).json({ success: false, error: 'Internal server error processing message.' });
  }
});

// Get Events List (Filterable)
app.get('/api/events', async (req, res) => {
  try {
    const { category, status } = req.query;
    const cacheKey = `events_${category || 'all'}_${status || 'all'}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY id DESC';
    const events = await dbAll(query, params);
    const result = { success: true, count: events.length, events };
    setCached(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch events.' });
  }
});

// Get Single Event Details
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await dbGet(`SELECT * FROM events WHERE id = ?`, [req.params.id]);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }
    res.json({ success: true, event });
  } catch (err) {
    console.error('Error fetching event details:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch event details.' });
  }
});

// Register Student for an Event
app.post('/api/events/register', async (req, res) => {
  try {
    const {
      event_id, event_title, student_name, student_email, phone, roll_number, branch, year, custom_responses
    } = req.body;

    if (!event_id || !student_name || !student_email || !phone || !roll_number || !branch || !year) {
      return res.status(400).json({ success: false, error: 'All standard registration fields are required.' });
    }

    const event = await dbGet(`SELECT * FROM events WHERE id = ?`, [event_id]);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }

    const existing = await dbGet(
      `SELECT * FROM event_registrations WHERE event_id = ? AND (student_email = ? OR roll_number = ?)`,
      [event_id, student_email.trim(), roll_number.trim()]
    );
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'You have already registered for this event with this email or roll number.'
      });
    }

    const titleToSave = event_title || event.title;
    const customResponsesStr = typeof custom_responses === 'object' ? JSON.stringify(custom_responses) : (custom_responses || '');

    const result = await dbRun(
      `INSERT INTO event_registrations (event_id, event_title, student_name, student_email, phone, roll_number, branch, year, custom_responses)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event_id,
        titleToSave,
        student_name.trim(),
        student_email.trim(),
        phone.trim(),
        roll_number.trim(),
        branch.trim(),
        year.trim(),
        customResponsesStr
      ]
    );

    res.status(201).json({
      success: true,
      message: `Successfully registered for ${titleToSave}!`,
      registration_id: result.lastID
    });
  } catch (err) {
    console.error('Error handling event registration:', err);
    res.status(500).json({ success: false, error: 'Internal server error processing registration.' });
  }
});

// ==========================================
// ADMIN API ENDPOINTS (PROTECTED)
// ==========================================

// Admin Stats Overview
app.get('/api/admin/stats', authAdmin, async (req, res) => {
  try {
    const messagesCount = await dbGet(`SELECT COUNT(*) as count FROM contact_messages`);
    const unreadMessagesCount = await dbGet(`SELECT COUNT(*) as count FROM contact_messages WHERE status = 'unread'`);
    const registrationsCount = await dbGet(`SELECT COUNT(*) as count FROM event_registrations`);
    const eventsCount = await dbGet(`SELECT COUNT(*) as count FROM events`);
    const studentsCount = await dbGet(`SELECT COUNT(*) as count FROM students`);

    res.json({
      success: true,
      stats: {
        total_messages: messagesCount.count,
        unread_messages: unreadMessagesCount.count,
        total_registrations: registrationsCount.count,
        total_events: eventsCount.count,
        total_students: studentsCount.count
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to load admin stats.' });
  }
});

// Admin: Get All Messages
app.get('/api/admin/messages', authAdmin, async (req, res) => {
  try {
    const messages = await dbAll(`SELECT * FROM contact_messages ORDER BY created_at DESC`);
    res.json({ success: true, count: messages.length, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to load messages.' });
  }
});

// Admin: Mark Message Read
app.patch('/api/admin/messages/:id/read', authAdmin, async (req, res) => {
  try {
    await dbRun(`UPDATE contact_messages SET status = 'read' WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Message marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update message status.' });
  }
});

// Admin: Delete Message
app.delete('/api/admin/messages/:id', authAdmin, async (req, res) => {
  try {
    await dbRun(`DELETE FROM contact_messages WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete message.' });
  }
});

// Admin: Get All Event Registrations
app.get('/api/admin/registrations', authAdmin, async (req, res) => {
  try {
    const { event_id } = req.query;
    let query = 'SELECT * FROM event_registrations';
    const params = [];

    if (event_id) {
      query += ' WHERE event_id = ?';
      params.push(event_id);
    }

    query += ' ORDER BY created_at DESC';
    const registrations = await dbAll(query, params);
    res.json({ success: true, count: registrations.length, registrations });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to load registrations.' });
  }
});

// Admin: Delete Registration
app.delete('/api/admin/registrations/:id', authAdmin, async (req, res) => {
  try {
    await dbRun(`DELETE FROM event_registrations WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Registration deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete registration.' });
  }
});

// Admin: Create Event
app.post('/api/admin/events', authAdmin, async (req, res) => {
  try {
    const {
      title, subtitle, category, start_date, end_date, date_str, location,
      short_description, full_description, about_event, description, image, status, custom_fields,
      visibility, registration_link, slideshow_images, schedule_cards, sub_events
    } = req.body;

    if (!title || !category || !location) {
      return res.status(400).json({ success: false, error: 'Title, category, and location are required.' });
    }

function formatEventDateString(startDate, endDate, manualDateStr) {
  if (manualDateStr && !manualDateStr.includes('T') && !manualDateStr.includes('to')) {
    return manualDateStr.trim();
  }

  let start = startDate ? new Date(startDate) : null;
  let end = endDate ? new Date(endDate) : null;

  if ((!start || isNaN(start.getTime())) && manualDateStr) {
    if (manualDateStr.includes(' to ')) {
      const parts = manualDateStr.split(' to ');
      const p0 = new Date(parts[0].trim());
      const p1 = new Date(parts[1].trim());
      if (!isNaN(p0.getTime())) start = p0;
      if (!isNaN(p1.getTime())) end = p1;
    }
  }

  if (start && !isNaN(start.getTime())) {
    const sDay = start.getDate();
    const sMon = start.toLocaleString('en-US', { month: 'short' });
    const sYr = start.getFullYear();

    if (end && !isNaN(end.getTime())) {
      const eDay = end.getDate();
      const eMon = end.toLocaleString('en-US', { month: 'short' });
      const eYr = end.getFullYear();

      if (sDay === eDay && sMon === eMon && sYr === eYr) {
        return `${sDay} ${sMon} ${sYr}`;
      }
      if (sMon === eMon && sYr === eYr) {
        return `${sDay} – ${eDay} ${sMon} ${sYr}`;
      }
      if (sYr === eYr) {
        return `${sDay} ${sMon} – ${eDay} ${eMon} ${sYr}`;
      }
      return `${sDay} ${sMon} ${sYr} – ${eDay} ${eMon} ${eYr}`;
    }
    return `${sDay} ${sMon} ${sYr}`;
  }
  return manualDateStr || 'TBA';
}

    const computedDateStr = formatEventDateString(start_date, end_date, date_str);
    const mainDescription = short_description || description || '';
    const customFieldsStr = typeof custom_fields === 'object' ? JSON.stringify(custom_fields) : (custom_fields || '');
    const slideshowStr = typeof slideshow_images === 'object' ? JSON.stringify(slideshow_images) : (slideshow_images || '');
    const scheduleStr = typeof schedule_cards === 'object' ? JSON.stringify(schedule_cards) : (schedule_cards || '');
    const subEventsStr = typeof sub_events === 'object' ? JSON.stringify(sub_events) : (sub_events || '');

    if (status === 'featured') {
      await dbRun(`UPDATE events SET status = 'upcoming' WHERE status = 'featured'`);
    }

    const result = await dbRun(
      `INSERT INTO events (
        title, subtitle, category, date_str, start_date, end_date, location,
        description, short_description, full_description, about_event, image, status, custom_fields,
        visibility, registration_link, slideshow_images, schedule_cards, sub_events
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, subtitle || '', category, computedDateStr, start_date || '', end_date || '', location,
        mainDescription, short_description || '', full_description || '', about_event || '', image || '', status || 'upcoming',
        customFieldsStr, visibility || 'public', registration_link || '', slideshowStr, scheduleStr, subEventsStr
      ]
    );

    clearCachePrefix('events');
    res.status(201).json({ success: true, message: 'Event created successfully.', id: result.lastID });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ success: false, error: 'Failed to create event.' });
  }
});

// Admin: Update Event
app.put('/api/admin/events/:id', authAdmin, async (req, res) => {
  try {
    const {
      title, subtitle, category, start_date, end_date, date_str, location,
      short_description, full_description, about_event, description, image, status, custom_fields,
      visibility, registration_link, slideshow_images, schedule_cards, sub_events
    } = req.body;

    if (!title || !category || !location) {
      return res.status(400).json({ success: false, error: 'Title, category, and location are required.' });
    }

    if (status === 'featured') {
      await dbRun(`UPDATE events SET status = 'upcoming' WHERE status = 'featured' AND id != ?`, [req.params.id]);
    }

    const computedDateStr = formatEventDateString(start_date, end_date, date_str);
    const mainDescription = short_description || description || '';
    const customFieldsStr = typeof custom_fields === 'object' ? JSON.stringify(custom_fields) : (custom_fields || '');
    const slideshowStr = typeof slideshow_images === 'object' ? JSON.stringify(slideshow_images) : (slideshow_images || '');
    const scheduleStr = typeof schedule_cards === 'object' ? JSON.stringify(schedule_cards) : (schedule_cards || '');
    const subEventsStr = typeof sub_events === 'object' ? JSON.stringify(sub_events) : (sub_events || '');

    await dbRun(
      `UPDATE events SET
        title = ?, subtitle = ?, category = ?, date_str = ?, start_date = ?, end_date = ?, location = ?,
        description = ?, short_description = ?, full_description = ?, about_event = ?, image = ?, status = ?, custom_fields = ?,
        visibility = ?, registration_link = ?, slideshow_images = ?, schedule_cards = ?, sub_events = ?
       WHERE id = ?`,
      [
        title, subtitle || '', category, computedDateStr, start_date || '', end_date || '', location,
        mainDescription, short_description || '', full_description || '', about_event || '', image || '', status || 'upcoming',
        customFieldsStr, visibility || 'public', registration_link || '', slideshowStr, scheduleStr, subEventsStr,
        req.params.id
      ]
    );

    clearCachePrefix('events');
    res.json({ success: true, message: 'Event updated successfully.' });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ success: false, error: 'Failed to update event.' });
  }
});

// Admin: Set Event as Featured Spotlight
app.patch('/api/admin/events/:id/feature', authAdmin, async (req, res) => {
  try {
    const eventId = req.params.id;
    await dbRun(`UPDATE events SET status = 'upcoming' WHERE status = 'featured'`);
    await dbRun(`UPDATE events SET status = 'featured' WHERE id = ?`, [eventId]);

    clearCachePrefix('events');
    res.json({ success: true, message: 'Event successfully set as Featured Spotlight!' });
  } catch (err) {
    console.error('Error setting featured event:', err);
    res.status(500).json({ success: false, error: 'Failed to update featured event.' });
  }
});

// Public: Get Team Members
app.get('/api/team', async (req, res) => {
  try {
    const cached = getCached('team_all');
    if (cached) return res.json(cached);

    const team = await dbAll(`SELECT * FROM team_members ORDER BY display_order ASC, id ASC`);
    const leadership = team.filter(m => m.category === 'leadership');
    const branches = team.filter(m => m.category === 'branch_head');
    const result = { success: true, team, leadership, branches };
    setCached('team_all', result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch team members.' });
  }
});

// Admin: Get Team Members
app.get('/api/admin/team', authAdmin, async (req, res) => {
  try {
    const team = await dbAll(`SELECT * FROM team_members ORDER BY display_order ASC, id ASC`);
    res.json({ success: true, team });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch team members.' });
  }
});

// Admin: Create Team Member
app.post('/api/admin/team', authAdmin, async (req, res) => {
  try {
    const { name, role, category, branch_title, description, image, icon, linkedin_url, email, instagram_url, display_order } = req.body;
    if (!name || !role) {
      return res.status(400).json({ success: false, error: 'Name and role are required.' });
    }

    const result = await dbRun(
      `INSERT INTO team_members (name, role, category, branch_title, description, image, icon, linkedin_url, email, instagram_url, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, role, category || 'Head', branch_title || '', description || '', image || '', icon || '👤', linkedin_url || '', email || '', instagram_url || '', display_order || 0]
    );

    clearCachePrefix('team');
    res.status(201).json({ success: true, message: 'Team member created.', id: result.lastID });
  } catch (err) {
    console.error('Error creating team member:', err);
    res.status(500).json({ success: false, error: 'Failed to create team member.' });
  }
});

// Admin: Update Team Member
app.put('/api/admin/team/:id', authAdmin, async (req, res) => {
  try {
    const { name, role, category, branch_title, description, image, icon, linkedin_url, email, instagram_url, display_order } = req.body;
    if (!name || !role) {
      return res.status(400).json({ success: false, error: 'Name and role are required.' });
    }

    await dbRun(
      `UPDATE team_members SET name = ?, role = ?, category = ?, branch_title = ?, description = ?, image = ?, icon = ?, linkedin_url = ?, email = ?, instagram_url = ?, display_order = ?
       WHERE id = ?`,
      [name, role, category || 'Head', branch_title || '', description || '', image || '', icon || '👤', linkedin_url || '', email || '', instagram_url || '', display_order || 0, req.params.id]
    );

    clearCachePrefix('team');
    res.json({ success: true, message: 'Team member updated.' });
  } catch (err) {
    console.error('Error updating team member:', err);
    res.status(500).json({ success: false, error: 'Failed to update team member.' });
  }
});

// Admin: Delete Team Member
app.delete('/api/admin/team/:id', authAdmin, async (req, res) => {
  try {
    await dbRun(`DELETE FROM team_members WHERE id = ?`, [req.params.id]);
    clearCachePrefix('team');
    res.json({ success: true, message: 'Team member deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete team member.' });
  }
});

// Public: Get Gallery Images
app.get('/api/gallery', async (req, res) => {
  try {
    const cached = getCached('gallery_all');
    if (cached) return res.json(cached);

    const images = await dbAll(`SELECT * FROM gallery_images ORDER BY display_order ASC, id DESC`);
    const result = { success: true, count: images.length, images };
    setCached('gallery_all', result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch gallery images.' });
  }
});

// Admin: Get Gallery Images
app.get('/api/admin/gallery', authAdmin, async (req, res) => {
  try {
    const images = await dbAll(`SELECT * FROM gallery_images ORDER BY display_order ASC, id DESC`);
    res.json({ success: true, count: images.length, images });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch gallery images.' });
  }
});

// Admin: Add Gallery Image
app.post('/api/admin/gallery', authAdmin, async (req, res) => {
  try {
    const { title, category, image, display_order } = req.body;
    if (!title || !image) {
      return res.status(400).json({ success: false, error: 'Title and image are required.' });
    }

    const result = await dbRun(
      `INSERT INTO gallery_images (title, category, image, display_order) VALUES (?, ?, ?, ?)`,
      [title, category || 'General', image, display_order || 0]
    );

    clearCachePrefix('gallery');
    res.status(201).json({ success: true, message: 'Gallery image added.', id: result.lastID });
  } catch (err) {
    console.error('Error adding gallery image:', err);
    res.status(500).json({ success: false, error: 'Failed to add gallery image.' });
  }
});

// Admin: Update Gallery Image
app.put('/api/admin/gallery/:id', authAdmin, async (req, res) => {
  try {
    const { title, category, image, display_order } = req.body;
    if (!title || !image) {
      return res.status(400).json({ success: false, error: 'Title and image are required.' });
    }

    await dbRun(
      `UPDATE gallery_images SET title = ?, category = ?, image = ?, display_order = ? WHERE id = ?`,
      [title, category || 'General', image, display_order || 0, req.params.id]
    );

    clearCachePrefix('gallery');
    res.json({ success: true, message: 'Gallery image updated.' });
  } catch (err) {
    console.error('Error updating gallery image:', err);
    res.status(500).json({ success: false, error: 'Failed to update gallery image.' });
  }
});

// Admin: Delete Gallery Image
app.delete('/api/admin/gallery/:id', authAdmin, async (req, res) => {
  try {
    await dbRun(`DELETE FROM gallery_images WHERE id = ?`, [req.params.id]);
    clearCachePrefix('gallery');
    res.json({ success: true, message: 'Gallery image deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete gallery image.' });
  }
});

// ==========================================
// MOMENTS THAT MATTER ENDPOINTS
// ==========================================

// Public: Get Moments Images
app.get('/api/moments', async (req, res) => {
  try {
    const cached = getCached('moments_all');
    if (cached) return res.json(cached);

    const images = await dbAll(`SELECT * FROM moments_images ORDER BY display_order ASC, id ASC`);
    const result = { success: true, count: images.length, images };
    setCached('moments_all', result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch moments images.' });
  }
});

// Admin: Get Moments Images
app.get('/api/admin/moments', authAdmin, async (req, res) => {
  try {
    const images = await dbAll(`SELECT * FROM moments_images ORDER BY display_order ASC, id ASC`);
    res.json({ success: true, count: images.length, images });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch moments images.' });
  }
});

// Admin: Add Moment Image
app.post('/api/admin/moments', authAdmin, async (req, res) => {
  try {
    const { title, image, display_order } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'Image is required.' });
    }

    const result = await dbRun(
      `INSERT INTO moments_images (title, image, display_order) VALUES (?, ?, ?)`,
      [title || 'Moment Image', image, display_order || 0]
    );

    clearCachePrefix('moments');
    res.status(201).json({ success: true, message: 'Moment photo added.', id: result.lastID });
  } catch (err) {
    console.error('Error adding moment photo:', err);
    res.status(500).json({ success: false, error: 'Failed to add moment photo.' });
  }
});

// Admin: Update Moment Image
app.put('/api/admin/moments/:id', authAdmin, async (req, res) => {
  try {
    const { title, image, display_order } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'Image is required.' });
    }

    await dbRun(
      `UPDATE moments_images SET title = ?, image = ?, display_order = ? WHERE id = ?`,
      [title || 'Moment Image', image, display_order || 0, req.params.id]
    );

    clearCachePrefix('moments');
    res.json({ success: true, message: 'Moment photo updated.' });
  } catch (err) {
    console.error('Error updating moment photo:', err);
    res.status(500).json({ success: false, error: 'Failed to update moment photo.' });
  }
});

// Admin: Delete Moment Image
app.delete('/api/admin/moments/:id', authAdmin, async (req, res) => {
  try {
    await dbRun(`DELETE FROM moments_images WHERE id = ?`, [req.params.id]);
    clearCachePrefix('moments');
    res.json({ success: true, message: 'Moment photo deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete moment photo.' });
  }
});

// Admin: Delete Event
app.delete('/api/admin/events/:id', authAdmin, async (req, res) => {
  try {
    await dbRun(`DELETE FROM events WHERE id = ?`, [req.params.id]);
    clearCachePrefix('events');
    res.json({ success: true, message: 'Event deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete event.' });
  }
});

// ==========================================
// VOLUNTEER REGISTRATION & OD SHEET MASTER DATA APIS
// ==========================================

// 1. Get Volunteer Data Collection Mode (Public)
app.get('/api/volunteer-mode', async (req, res) => {
  try {
    const cached = getCached('volunteer_mode');
    if (cached) return res.json(cached);

    const row = await dbGet(`SELECT value FROM system_settings WHERE key = 'volunteer_collection_mode'`);
    const mode = row ? row.value : 'off';
    const result = { success: true, mode };
    setCached('volunteer_mode', result);
    res.json(result);
  } catch (err) {
    console.error('Error fetching volunteer mode:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch volunteer data mode.' });
  }
});

// 2. Toggle Volunteer Data Collection Mode (Admin Only)
app.post('/api/admin/volunteer-mode', authAdmin, async (req, res) => {
  try {
    const { mode } = req.body;
    if (mode !== 'on' && mode !== 'off') {
      return res.status(400).json({ success: false, error: 'Mode must be either "on" or "off".' });
    }

    await dbRun(
      `INSERT INTO system_settings (key, value) VALUES ('volunteer_collection_mode', ?)
       ON CONFLICT(key) DO UPDATE SET value = ?`,
      [mode, mode]
    );

    clearCachePrefix('volunteer_mode');
    res.json({
      success: true,
      mode,
      message: mode === 'on' ? 'Volunteer data collection mode is now ACTIVE (Form is Open).' : 'Volunteer data collection mode is now OFF (Form is Closed).'
    });
  } catch (err) {
    console.error('Error updating volunteer mode:', err);
    res.status(500).json({ success: false, error: 'Failed to update volunteer data collection mode.' });
  }
});

// 3. Get Master Volunteers List (Public / Admin for OD Sheet generator)
app.get('/api/volunteers', async (req, res) => {
  try {
    const cached = getCached('volunteers_all');
    if (cached) return res.json(cached);

    const volunteers = await dbAll(`SELECT * FROM volunteers ORDER BY name ASC`);
    const result = { success: true, volunteers };
    setCached('volunteers_all', result);
    res.json(result);
  } catch (err) {
    console.error('Error fetching volunteers:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch volunteers.' });
  }
});

// 4. Public Volunteer Registration Submission
// All fields compulsory: Full Name, KU ID, Semester, Class/Branch, Work Category, Phone Number, Email
app.post('/api/volunteers', async (req, res) => {
  try {
    // Check if data collection mode is ON
    const modeRow = await dbGet(`SELECT value FROM system_settings WHERE key = 'volunteer_collection_mode'`);
    const isModeOn = modeRow && modeRow.value === 'on';
    if (!isModeOn) {
      return res.status(403).json({
        success: false,
        error: 'Volunteer registration is currently CLOSED by the administration. Submissions are not accepted at this time.'
      });
    }

    const { name, qid, sem, cls, cat, phone, email, allow_update } = req.body;

    // Strict validation: ALL fields compulsory
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Full Student Name is compulsory.' });
    }
    if (!qid || !qid.trim()) {
      return res.status(400).json({ success: false, error: 'KU ID / Enrollment Number is compulsory.' });
    }
    if (sem === undefined || sem === null || sem === '' || isNaN(Number(sem))) {
      return res.status(400).json({ success: false, error: 'Semester (Sem 1 to 8) is compulsory.' });
    }
    const parsedSem = parseInt(sem, 10);
    if (parsedSem < 1 || parsedSem > 8) {
      return res.status(400).json({ success: false, error: 'Semester must be between 1 and 8.' });
    }
    if (!cls || !cls.trim()) {
      return res.status(400).json({ success: false, error: 'Class / Branch / Division is compulsory.' });
    }
    if (!cat || !cat.trim()) {
      return res.status(400).json({ success: false, error: 'Work Category / Department is compulsory.' });
    }
    if (!phone || !phone.trim() || phone.trim().replace(/\D/g, '').length < 10) {
      return res.status(400).json({ success: false, error: 'A valid Mobile / WhatsApp Number (at least 10 digits) is compulsory.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !email.trim() || !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'A valid Email Address is compulsory.' });
    }

    const cleanName = name.trim();
    const cleanQid = qid.trim().toUpperCase();
    const cleanCls = cls.trim();
    const cleanCat = cat.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if another volunteer has already registered with this Email address
    const existingByEmail = await dbGet(
      `SELECT * FROM volunteers WHERE LOWER(email) = ? AND email != '' AND UPPER(qid) != ?`,
      [cleanEmail, cleanQid]
    );
    if (existingByEmail) {
      return res.status(409).json({
        success: false,
        already_exists: true,
        duplicate_field: 'email',
        error: `A volunteer is already registered with this email address (${cleanEmail}). Each student must use their own unique email.`,
        message: `A volunteer record for "${existingByEmail.name}" (${existingByEmail.qid}) already exists with this email address.`,
        existing_volunteer: {
          name: existingByEmail.name,
          qid: existingByEmail.qid,
          sem: existingByEmail.sem,
          cls: existingByEmail.cls,
          cat: existingByEmail.cat,
          phone: existingByEmail.phone,
          email: existingByEmail.email
        }
      });
    }

    // 2. Check if a volunteer with this KU ID already exists
    const existingByQid = await dbGet(`SELECT * FROM volunteers WHERE UPPER(qid) = ?`, [cleanQid]);
    if (existingByQid) {
      // If user hasn't explicitly clicked "Refill / Update My Form", inform them that they have already filled the form
      if (!allow_update) {
        return res.status(409).json({
          success: false,
          already_exists: true,
          duplicate_field: 'qid',
          error: `You have already filled the volunteer registration form! A record with KU ID ${cleanQid} (${existingByQid.name}) is already registered.`,
          message: 'You have already filled this form! If you made a mistake or want to update your department or details, you can choose "Refill / Update Form".',
          existing_volunteer: {
            name: existingByQid.name,
            qid: existingByQid.qid,
            sem: existingByQid.sem,
            cls: existingByQid.cls,
            cat: existingByQid.cat,
            phone: existingByQid.phone,
            email: existingByQid.email
          }
        });
      }

      // User confirmed they want to refill / update their existing registration
      await dbRun(
        `UPDATE volunteers SET name = ?, sem = ?, cls = ?, cat = ?, phone = ?, email = ? WHERE id = ?`,
        [cleanName, parsedSem, cleanCls, cleanCat, cleanPhone, cleanEmail, existingByQid.id]
      );

      clearCachePrefix('volunteers');
      return res.json({
        success: true,
        is_update: true,
        message: `Volunteer registration for ${cleanName} (${cleanQid}) has been successfully updated!`,
        volunteer: { id: existingByQid.id, name: cleanName, qid: cleanQid, sem: parsedSem, cls: cleanCls, cat: cleanCat, phone: cleanPhone, email: cleanEmail }
      });
    }

    // 3. New unique volunteer registration
    const result = await dbRun(
      `INSERT INTO volunteers (name, qid, sem, cls, cat, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cleanName, cleanQid, parsedSem, cleanCls, cleanCat, cleanPhone, cleanEmail]
    );

    clearCachePrefix('volunteers');
    return res.status(201).json({
      success: true,
      is_update: false,
      message: `Volunteer registration for ${cleanName} (${cleanQid}) recorded successfully!`,
      volunteer: { id: result.lastID, name: cleanName, qid: cleanQid, sem: parsedSem, cls: cleanCls, cat: cleanCat, phone: cleanPhone, email: cleanEmail }
    });
  } catch (err) {
    console.error('Error submitting volunteer registration:', err);
    res.status(500).json({ success: false, error: 'Failed to process volunteer registration.' });
  }
});

// 5. Admin: Add Volunteer Manually
app.post('/api/admin/volunteers', authAdmin, async (req, res) => {
  try {
    const { name, qid, sem, cls, cat, phone, email } = req.body;

    if (!name || !name.trim() || !qid || !qid.trim() || !cls || !cls.trim()) {
      return res.status(400).json({ success: false, error: 'Name, KU ID, and Class are required.' });
    }

    const cleanName = name.trim();
    const cleanQid = qid.trim().toUpperCase();
    const cleanSem = parseInt(sem, 10) || 1;
    const cleanCls = cls.trim();
    const cleanCat = cat ? cat.trim() : 'Management';
    const cleanPhone = phone ? phone.trim() : '';
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    const existing = await dbGet(`SELECT id FROM volunteers WHERE UPPER(qid) = ?`, [cleanQid]);
    if (existing) {
      await dbRun(
        `UPDATE volunteers SET name = ?, sem = ?, cls = ?, cat = ?, phone = ?, email = ? WHERE id = ?`,
        [cleanName, cleanSem, cleanCls, cleanCat, cleanPhone, cleanEmail, existing.id]
      );
      clearCachePrefix('volunteers');
      return res.json({ success: true, message: 'Volunteer updated successfully.', id: existing.id });
    }

    const result = await dbRun(
      `INSERT INTO volunteers (name, qid, sem, cls, cat, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cleanName, cleanQid, cleanSem, cleanCls, cleanCat, cleanPhone, cleanEmail]
    );

    clearCachePrefix('volunteers');
    res.status(201).json({ success: true, message: 'Volunteer added successfully.', id: result.lastID });
  } catch (err) {
    console.error('Error adding volunteer:', err);
    res.status(500).json({ success: false, error: 'Failed to add volunteer.' });
  }
});

// 6. Admin: Update Volunteer
app.put('/api/admin/volunteers/:id', authAdmin, async (req, res) => {
  try {
    const { name, qid, sem, cls, cat, phone, email } = req.body;
    if (!name || !qid || !cls) {
      return res.status(400).json({ success: false, error: 'Name, KU ID, and Class are required.' });
    }

    await dbRun(
      `UPDATE volunteers SET name = ?, qid = ?, sem = ?, cls = ?, cat = ?, phone = ?, email = ? WHERE id = ?`,
      [name.trim(), qid.trim().toUpperCase(), parseInt(sem, 10) || 1, cls.trim(), (cat || 'Management').trim(), (phone || '').trim(), (email || '').trim().toLowerCase(), req.params.id]
    );

    clearCachePrefix('volunteers');
    res.json({ success: true, message: 'Volunteer updated successfully.' });
  } catch (err) {
    console.error('Error updating volunteer:', err);
    res.status(500).json({ success: false, error: 'Failed to update volunteer.' });
  }
});

// 7. Admin: Delete Volunteer
app.delete('/api/admin/volunteers/:id', authAdmin, async (req, res) => {
  try {
    await dbRun(`DELETE FROM volunteers WHERE id = ?`, [req.params.id]);
    clearCachePrefix('volunteers');
    res.json({ success: true, message: 'Volunteer removed.' });
  } catch (err) {
    console.error('Error deleting volunteer:', err);
    res.status(500).json({ success: false, error: 'Failed to delete volunteer.' });
  }
});

// 8. Admin: Bulk Import Volunteers
app.post('/api/admin/volunteers/bulk-import', authAdmin, async (req, res) => {
  try {
    const { list } = req.body;
    if (!Array.isArray(list) || list.length === 0) {
      return res.status(400).json({ success: false, error: 'Valid array of volunteers is required.' });
    }

    let addedCount = 0;
    let updatedCount = 0;

    for (const v of list) {
      if (!v.name || !v.qid) continue;
      const cleanName = v.name.trim();
      const cleanQid = v.qid.trim().toUpperCase();
      const cleanSem = parseInt(v.sem, 10) || 1;
      const cleanCls = (v.cls || '').trim();
      const cleanCat = (v.cat || 'Management').trim();
      const cleanPhone = (v.phone || '').trim();
      const cleanEmail = (v.email || '').trim();

      const existing = await dbGet(`SELECT id FROM volunteers WHERE UPPER(qid) = ?`, [cleanQid]);
      if (existing) {
        await dbRun(
          `UPDATE volunteers SET name = ?, sem = ?, cls = ?, cat = ?, phone = ?, email = ? WHERE id = ?`,
          [cleanName, cleanSem, cleanCls, cleanCat, cleanPhone, cleanEmail, existing.id]
        );
        updatedCount++;
      } else {
        await dbRun(
          `INSERT INTO volunteers (name, qid, sem, cls, cat, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [cleanName, cleanQid, cleanSem, cleanCls, cleanCat, cleanPhone, cleanEmail]
        );
        addedCount++;
      }
    }

    res.json({
      success: true,
      message: `Bulk import completed. Added: ${addedCount}, Updated: ${updatedCount}.`,
      addedCount,
      updatedCount
    });
  } catch (err) {
    console.error('Error bulk importing volunteers:', err);
    res.status(500).json({ success: false, error: 'Failed to bulk import volunteers.' });
  }
});

// SPA Fallback Route for React Router
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexHtml = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  next();
});

// Start Server (Only when run directly, not in Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`AAYAM UIT React & Backend Server is running!`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`React App Routes: /, /events, /team, /gallery, /contact`);
    console.log(`Auth Routes: /login, /signup`);
    console.log(`Admin Portal: /admin`);
    console.log(`====================================================`);
  });
}

module.exports = app;
