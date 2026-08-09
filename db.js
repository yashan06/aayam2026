const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const isVercel = Boolean(process.env.VERCEL);
const dbPath = isVercel
  ? path.join('/tmp', 'aayam.db')
  : path.resolve(__dirname, 'aayam.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Low-level query helpers
const dbRunCore = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbAllCore = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGetCore = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

let initPromise = null;
const ensureDbInitialized = () => {
  if (!initPromise) {
    initPromise = initDb();
  }
  return initPromise;
};

// Safe public query helpers (automatically awaits initialization before executing query)
const dbRun = async (sql, params = []) => {
  await ensureDbInitialized();
  return dbRunCore(sql, params);
};

const dbAll = async (sql, params = []) => {
  await ensureDbInitialized();
  return dbAllCore(sql, params);
};

const dbGet = async (sql, params = []) => {
  await ensureDbInitialized();
  return dbGetCore(sql, params);
};

// Initialize Database Tables
const initDb = async () => {
  try {
    // 1. Contact Messages Table
    await dbRunCore(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'unread',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Events Table
    await dbRunCore(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        subtitle TEXT,
        category TEXT NOT NULL,
        date_str TEXT,
        start_date TEXT,
        end_date TEXT,
        location TEXT NOT NULL,
        description TEXT,
        short_description TEXT,
        full_description TEXT,
        about_event TEXT,
        image TEXT,
        status TEXT DEFAULT 'upcoming',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration: Add new columns if table was created previously without them
    const newColumns = [
      'start_date', 'end_date', 'short_description', 'full_description', 'about_event', 'custom_fields',
      'visibility', 'registration_link', 'slideshow_images', 'schedule_cards', 'sub_events'
    ];
    for (const col of newColumns) {
      try {
        await dbRunCore(`ALTER TABLE events ADD COLUMN ${col} TEXT`);
      } catch (e) {
        // Column already exists, ignore error
      }
    }

    // 3. Event Registrations Table
    await dbRunCore(`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        event_title TEXT NOT NULL,
        student_name TEXT NOT NULL,
        student_email TEXT NOT NULL,
        phone TEXT NOT NULL,
        roll_number TEXT NOT NULL,
        branch TEXT NOT NULL,
        year TEXT NOT NULL,
        custom_responses TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )
    `);

    try {
      await dbRunCore(`ALTER TABLE event_registrations ADD COLUMN custom_responses TEXT`);
    } catch (e) {
      // Column already exists, ignore error
    }

    // 4. Admin Users Table
    await dbRunCore(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration: Add email column if table was created previously without email
    try {
      await dbRunCore(`ALTER TABLE admins ADD COLUMN email TEXT`);
    } catch (e) {
      // Column already exists, ignore error
    }

    // 5. Students Users Table
    await dbRunCore(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        roll_number TEXT,
        branch TEXT,
        year TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed Default Admin (username: admin, password: adminpassword123)
    const existingAdmin = await dbGetCore(`SELECT * FROM admins WHERE username = ?`, ['admin']);
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('adminpassword123', 10);
      await dbRunCore(
        `INSERT INTO admins (username, email, password_hash, name) VALUES (?, ?, ?, ?)`,
        ['admin', 'admin@ku.edu.in', passwordHash, 'AAYAM Administrator']
      );
      console.log('Seeded default admin user: admin / adminpassword123');
    }

    // 6. System Settings Table (to track system config)
    await dbRunCore(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);
    await dbRunCore(`INSERT OR REPLACE INTO system_settings (key, value) VALUES ('events_seeded', '1')`);

    // 6. Team Members Table
    await dbRunCore(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'Head',
        branch_title TEXT,
        description TEXT,
        image TEXT,
        icon TEXT,
        linkedin_url TEXT,
        email TEXT,
        instagram_url TEXT,
        display_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration: Add new columns if table was created previously without them
    const newTeamCols = ['linkedin_url', 'email', 'instagram_url'];
    for (const col of newTeamCols) {
      try {
        await dbRunCore(`ALTER TABLE team_members ADD COLUMN ${col} TEXT`);
      } catch (e) {
        // Column already exists, ignore error
      }
    }

    // Seed Team Members if empty
    const existingTeam = await dbAllCore(`SELECT COUNT(*) as count FROM team_members`);
    if (existingTeam[0].count === 0) {
      const initialTeam = [
        { name: 'Dr. Suresh Patel', role: 'Patron & Principal', category: 'Head', branch_title: 'Head', description: 'Guiding AAYAM with visionary leadership and unwavering support for student empowerment.', icon: '👤', image: '', display_order: 1 },
        { name: 'Prof. Ananya Sharma', role: 'Faculty Coordinator', category: 'Head', branch_title: 'Head', description: 'Faculty mentor ensuring academic alignment, university integration, and student excellence.', icon: '👤', image: '', display_order: 2 },
        { name: 'Karan Mehta', role: 'President — AAYAM', category: 'Head', branch_title: 'Head', description: 'Overall strategy, committee leadership, and representing UIT at university levels.', icon: '👤', image: '', display_order: 3 },
        { name: 'Riya Trivedi', role: 'Vice President', category: 'Head', branch_title: 'Head', description: 'Operations oversight, cross-branch coordination, and driving student initiatives.', icon: '👤', image: '', display_order: 4 },

        { name: 'Devang Joshi', role: 'Head of Committee', category: 'Management Team', branch_title: 'Management Team', description: 'Logistics, event schedules, university permissions, and operational execution.', icon: '👤', image: '', display_order: 5 },
        { name: 'Pooja Shah', role: 'Media Lead', category: 'Media Team', branch_title: 'Media Team', description: 'Graphic design, video production, photography, and social media branding.', icon: '👤', image: '', display_order: 6 },
        { name: 'Harshil Varma', role: 'Tech Lead', category: 'Technical Team', branch_title: 'Technical Team', description: 'Websites, technical competitions, hackathons, and lab infrastructure.', icon: '👤', image: '', display_order: 7 },
        { name: 'Yash Patel', role: 'Sports Head', category: 'Sports Team', branch_title: 'Sports Team', description: 'Inter-college tournaments, sports leagues, and physical fitness events.', icon: '👤', image: '', display_order: 8 },
        { name: 'Sneha Roy', role: 'Cultural Head', category: 'Cultural Team', branch_title: 'Cultural Team', description: 'Stage productions, dance, music, fashion show, and arts festivals.', icon: '👤', image: '', display_order: 9 },
        { name: 'Aarav Desai', role: 'Management Executive', category: 'Management Team', branch_title: 'Management Team', description: 'Public relations, corporate sponsorships, and guest communications.', icon: '👤', image: '', display_order: 10 },
        { name: 'Kavya Nair', role: 'Media Executive', category: 'Media Team', branch_title: 'Media Team', description: 'Content creation, video reels, and social media management.', icon: '👤', image: '', display_order: 11 },
        { name: 'Rohan Solanki', role: 'Technical Co-Lead', category: 'Technical Team', branch_title: 'Technical Team', description: 'Backend systems, event registration portal, and security.', icon: '👤', image: '', display_order: 12 },
        { name: 'Neha Chokshi', role: 'Head of Hospitality', category: 'Hospitality Team', branch_title: 'Hospitality Team', description: 'Managing guest receptions, VIP escorts, hospitality suites, and delegate accommodation.', icon: '👤', image: '', display_order: 13 }
      ];

      for (const m of initialTeam) {
        await dbRunCore(
          `INSERT INTO team_members (name, role, category, branch_title, description, icon, image, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [m.name, m.role, m.category, m.branch_title, m.description, m.icon, m.image, m.display_order]
        );
      }
      console.log('Seeded initial team members into database.');
    }

    // 7. Gallery Images Table
    await dbRunCore(`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'General',
        image TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed Gallery Images if empty
    const existingGallery = await dbAllCore(`SELECT COUNT(*) as count FROM gallery_images`);
    if (existingGallery[0].count === 0) {
      const initialGallery = [
        { title: 'Equinox 3.0 Tech Symposium', category: 'Technical', image: '/equinox_event.png', display_order: 1 },
        { title: 'Inferno 3.0 Coding Battle', category: 'Competition', image: '/inferno_event.png', display_order: 2 },
        { title: 'Ariaro 4.0 National Symposium', category: 'Symposium', image: '/ariaro_event.png', display_order: 3 },
        { title: 'Karnavati University Campus', category: 'Campus', image: '/university_sketch.png', display_order: 4 },
        { title: 'UIT Engineering Block', category: 'Architecture', image: '/tower_sketch.png', display_order: 5 },
        { title: 'Interactive Tech Workshop', category: 'Workshop', image: '/equinox_event.png', display_order: 6 }
      ];

      for (const item of initialGallery) {
        await dbRunCore(
          `INSERT INTO gallery_images (title, category, image, display_order) VALUES (?, ?, ?, ?)`,
          [item.title, item.category, item.image, item.display_order]
        );
      }
      console.log('Seeded initial gallery images into database.');
    }

    // 8. Moments That Matter Table
    await dbRunCore(`
      CREATE TABLE IF NOT EXISTS moments_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        image TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed Initial Moments Images if empty
    const existingMoments = await dbAllCore(`SELECT COUNT(*) as count FROM moments_images`);
    if (existingMoments[0].count === 0) {
      const initialMoments = [
        { title: 'Unitedworld Fest Celebration', image: '/equinox_event.png', display_order: 1 },
        { title: 'AAYAM Student Team Gathering', image: '/inferno_event.png', display_order: 2 },
        { title: 'Keynote Tech Address', image: '/ariaro_event.png', display_order: 3 },
        { title: 'Cultural Stage Performance', image: '/university_sketch.png', display_order: 4 }
      ];

      for (const item of initialMoments) {
        await dbRunCore(
          `INSERT INTO moments_images (title, image, display_order) VALUES (?, ?, ?)`,
          [item.title, item.image, item.display_order]
        );
      }
      console.log('Seeded initial moments images into database.');
    }

    console.log('Database initialization complete with students and admins tables.');
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
};

initDb();

module.exports = {
  db,
  dbRun,
  dbAll,
  dbGet
};
