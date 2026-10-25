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

    // 9. Volunteer Collection Mode Setting
    const modeSetting = await dbGetCore(`SELECT * FROM system_settings WHERE key = 'volunteer_collection_mode'`);
    if (!modeSetting) {
      await dbRunCore(`INSERT INTO system_settings (key, value) VALUES ('volunteer_collection_mode', 'off')`);
    }

    // 10. Volunteers Table (for Volunteer Registration & OD Sheet Master Data)
    await dbRunCore(`
      CREATE TABLE IF NOT EXISTS volunteers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        qid TEXT UNIQUE NOT NULL,
        sem INTEGER NOT NULL,
        cls TEXT NOT NULL,
        cat TEXT NOT NULL DEFAULT 'Management',
        phone TEXT,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migrations for volunteers table columns
    const volunteerCols = ['cat', 'phone', 'email'];
    for (const col of volunteerCols) {
      try {
        await dbRunCore(`ALTER TABLE volunteers ADD COLUMN ${col} TEXT`);
      } catch (e) {
        // column already exists
      }
    }

    // Seed default master volunteers if empty
    const existingVolunteers = await dbAllCore(`SELECT COUNT(*) as count FROM volunteers`);
    if (existingVolunteers[0].count === 0) {
      const defaultVolunteers = [
        { name: "YASHAN OSWAL", qid: "KU2407U448", sem: 5, cls: "B.TECH CYBER", cat: "Management" },
        { name: "Manush Patel", qid: "KU2407U425", sem: 5, cls: "Cyber- 5th", cat: "Technical" },
        { name: "Parth Patel", qid: "KU2407U644", sem: 5, cls: "Cyber- 5th", cat: "Management" },
        { name: "Het Thaker", qid: "KU2507U0139", sem: 3, cls: "DS HONS- 3rd", cat: "Creatives" },
        { name: "Suhani Killa", qid: "KU2407U382", sem: 5, cls: "AIML-C/5th", cat: "Cultural" },
        { name: "Devam Patel", qid: "KU2507U0484", sem: 3, cls: "AI-ML (B)- 3rd", cat: "Technical" },
        { name: "Shaan Patel", qid: "KU2507U0584", sem: 3, cls: "AI-ML (B)- 3rd", cat: "Sports" },
        { name: "Param Patel", qid: "KU2507U0678", sem: 3, cls: "CSE A- 3rd", cat: "Management" },
        { name: "Brij Dalsaniya", qid: "2000016522", sem: 3, cls: "CSE- DS- 3rd", cat: "Technical" },
        { name: "Chirag Odedara", qid: "KU2507U0329", sem: 3, cls: "CSE- DS- 3rd", cat: "Media" },
        { name: "Dhvanit Dave", qid: "KU202604183", sem: 1, cls: "Gen-AI (B)- 1st", cat: "Technical" },
        { name: "Meet Padaspagar", qid: "2000017269", sem: 1, cls: "CSE CORE-C- 1st", cat: "Management" },
        { name: "Shivam Thakkar", qid: "KU202606448", sem: 1, cls: "BTech Mechanical- 1st", cat: "Sports" },
        { name: "Rishampreet Kaur", qid: "KU202603552", sem: 1, cls: "CSE-DS- 1st", cat: "Cultural" },
        { name: "Aeshna Jain", qid: "KU202607569", sem: 1, cls: "CSE A- 1st", cat: "Creatives" },
        { name: "Ayush Vankar", qid: "2000017101", sem: 1, cls: "ECE B- 1st", cat: "Technical" },
        { name: "Satvik Joshi", qid: "KU2407U439", sem: 5, cls: "Cyber- 5th", cat: "Media" },
        { name: "Shashank Kumar", qid: "KU2407U370", sem: 5, cls: "Ai-ML C / 5th", cat: "Technical" },
        { name: "Dev Suthar", qid: "KU2507U0804", sem: 3, cls: "AI-ML C / 3rd", cat: "Management" },
        { name: "Aeshva Rao", qid: "KU2507U0801", sem: 3, cls: "AI-ML C / 3rd", cat: "Hospitality" },
        { name: "Diya Makwana", qid: "KU202608436", sem: 1, cls: "CSE DS(H.)", cat: "Decor" },
        { name: "Labdhi Jain", qid: "KU202607850", sem: 1, cls: "Cse-(Gen-AI)- 1st", cat: "Communication" },
        { name: "Deval Patoriya", qid: "KU2507U0237", sem: 3, cls: "CSE -cloud-3rd", cat: "Technical" },
        { name: "Jinesh Soni", qid: "KU2507U0241", sem: 3, cls: "CSE-CLOUD-3rd", cat: "Technical" },
        { name: "Jiya Rawal", qid: "KU202604351", sem: 1, cls: "CSE hons cloud 1st", cat: "Promotion" },
        { name: "Varsha Sharma", qid: "KU2507U0383", sem: 3, cls: "3RD CSE DS HONS", cat: "Cultural" },
        { name: "Kavaiya Het", qid: "KU2507U0502", sem: 3, cls: "CSE - B / 3 SEM", cat: "Sports" },
        { name: "Jiya Dudani", qid: "KU2407U400", sem: 5, cls: "Cyber- 5th", cat: "Management" },
        { name: "Saagar", qid: "KU2507U0400", sem: 3, cls: "Gen ai b", cat: "Technical" },
        { name: "Himani Raveshiya", qid: "KU2507U0701", sem: 3, cls: "CSE DS - 3rd", cat: "Creatives" },
        { name: "Jainil Kansara", qid: "KU2507U0757", sem: 3, cls: "CSE - CYBER - 3rd", cat: "Technical" },
        { name: "Vaishnavi Patel", qid: "KU2507U0104", sem: 3, cls: "CSE-DS-HONS-3rd", cat: "Management" },
        { name: "Man Jetani", qid: "KU2507U0546", sem: 3, cls: "CSE-B 3rd", cat: "Sports" },
        { name: "Jay Patel", qid: "ACPCB2026477", sem: 1, cls: "ECE-B 1st", cat: "Technical" },
        { name: "Dasadiya Rudra", qid: "KU202604813", sem: 1, cls: "GEN AI -A", cat: "Technical" },
        { name: "Brinda", qid: "KU2507U0680", sem: 3, cls: "CSE-A 3rd", cat: "Hospitality" },
        { name: "Deev Dosi", qid: "KU2507U0044", sem: 3, cls: "CSE-Cyber", cat: "Technical" },
        { name: "Avika Hingad", qid: "KU202607918", sem: 1, cls: "CYBER 1st", cat: "Creatives" },
        { name: "Shivangi Tiwari", qid: "2000016300", sem: 1, cls: "CSE B Core-1st", cat: "Communication" },
        { name: "Mahim Barot", qid: "KU2507U0504", sem: 3, cls: "3-CSE-A", cat: "Management" },
        { name: "Dhvanit Sachdev", qid: "KU2507U0673", sem: 3, cls: "3 CSE A", cat: "Promotion" },
        { name: "Muskan Sharma", qid: "KU2507U0270", sem: 3, cls: "3 CS DS", cat: "Cultural" },
        { name: "Priyank Darji", qid: "KU2407U966", sem: 5, cls: "cse aiml D-5th sem", cat: "Technical" },
        { name: "Jiya Shah", qid: "KU2507U0642", sem: 3, cls: "3 CSE A", cat: "Decor" },
        { name: "Kathan Shah", qid: "KU2407U311", sem: 5, cls: "BTECH AIML A", cat: "Management" },
        { name: "Gohel Bhavya", qid: "KU2507U0557", sem: 3, cls: "Cse B", cat: "Technical" },
        { name: "Shah Keval DevendraKumar", qid: "ACPCD2026168", sem: 3, cls: "CSE-AIML-C", cat: "Technical" },
        { name: "Agamudaliyar Kiran karnan", qid: "2000016794", sem: 1, cls: "B.tech hons cloud", cat: "Technical" },
        { name: "VINEET SHIINDE", qid: "KU2407U447", sem: 5, cls: "CYBER", cat: "Management" },
        { name: "Aman Chordia", qid: "KU2407U501", sem: 5, cls: "CSE-CYBER", cat: "Technical" },
        { name: "Harshika Goyal", qid: "KU2407U287", sem: 5, cls: "Aiml-B", cat: "Communication" },
        { name: "Paree Mistry", qid: "KU2507U0143", sem: 3, cls: "CSE DS Hons", cat: "Creatives" },
        { name: "Dharmangi Shah", qid: "KU2507U0310", sem: 3, cls: "DA-A", cat: "Media" },
        { name: "Mantra Shah", qid: "KU2507U0341", sem: 3, cls: "Gen-AI(A)", cat: "Technical" },
        { name: "Darshil Bharucha", qid: "ACPCB2026637", sem: 1, cls: "CSE AIML B", cat: "Management" },
        { name: "Ayush Rupawala", qid: "KU202609112", sem: 1, cls: "ECE-A", cat: "Hospitality" },
        { name: "Dhanvi Virani", qid: "KU2507U0223", sem: 3, cls: "CSE DS Hons", cat: "Cultural" },
        { name: "Jeel Patel", qid: "KU2507U0177", sem: 3, cls: "CSE-DS (Hons)", cat: "Technical" },
        { name: "Henil Goswami", qid: "KU2407U290", sem: 5, cls: "AIML - A", cat: "Technical" },
        { name: "Shrida Patel", qid: "KU2407U911", sem: 5, cls: "AIML-D", cat: "Creatives" },
        { name: "Diya Patel", qid: "KU2407U933", sem: 5, cls: "AIML-D", cat: "Cultural" }
      ];

      for (const item of defaultVolunteers) {
        await dbRunCore(
          `INSERT OR IGNORE INTO volunteers (name, qid, sem, cls, cat, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [item.name, item.qid, item.sem, item.cls, item.cat || 'Management', '', '']
        );
      }
      console.log('Seeded default master volunteers into database.');
    }

    console.log('Database initialization complete with students, admins, and volunteers tables.');
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
