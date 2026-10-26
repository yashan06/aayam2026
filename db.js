require('dotenv').config();
const path = require('path');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

// 1. SUPABASE CLIENT INITIALIZATION
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
let supabase = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    console.log('✅ Connected to Supabase Cloud Database at:', supabaseUrl);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err.message);
  }
}

// 2. SQLITE FALLBACK (Used only if Supabase credentials are not provided)
let sqliteDb = null;
const isVercel = Boolean(process.env.VERCEL);

if (!supabase) {
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = isVercel ? path.join('/tmp', 'aayam.db') : path.resolve(__dirname, 'aayam.db');
  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Error connecting to SQLite database:', err.message);
    else console.log('Connected to SQLite database at:', dbPath);
  });
}

const sqliteRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const sqliteAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const sqliteGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// 3. SUPABASE QUERY EXECUTOR
async function querySupabase(mode, sql, params = []) {
  const clean = sql.trim().replace(/\s+/g, ' ');

  // A. SELECT COUNT(*)
  const countMatch = clean.match(/^SELECT\s+COUNT\s*\(\s*\*\s*\)\s+(?:as\s+count\s+)?FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+))?$/i);
  if (countMatch) {
    const table = countMatch[1];
    const where = countMatch[2];
    let q = supabase.from(table).select('*', { count: 'exact', head: true });
    if (where && where.includes("status = 'unread'")) {
      q = q.eq('status', 'unread');
    }
    const { count, error } = await q;
    if (error) throw error;
    const res = { count: count || 0 };
    return mode === 'all' ? [res] : res;
  }

  // B. INSERT INTO
  const insertMatch = clean.match(/^INSERT\s+INTO\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)(?:\s+ON\s+CONFLICT.*)?$/i);
  if (insertMatch) {
    const table = insertMatch[1];
    const cols = insertMatch[2].split(',').map((c) => c.trim().replace(/^['"`]|['"`]$/g, ''));

    if (table.toLowerCase() === 'system_settings') {
      const keyVal = params[0] || 'volunteer_collection_mode';
      const valVal = params[1] !== undefined ? params[1] : params[0];
      const { data, error } = await supabase.from('system_settings').upsert({ key: keyVal, value: valVal }).select();
      if (error) throw error;
      return { lastID: 1, changes: 1 };
    }

    const record = {};
    cols.forEach((col, i) => {
      record[col] = params[i] !== undefined ? params[i] : null;
    });

    const { data, error } = await supabase.from(table).insert(record).select();
    if (error) throw error;
    return { lastID: data?.[0]?.id || 1, changes: data?.length || 1 };
  }

  // C. UPDATE
  const updateMatch = clean.match(/^UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
  if (updateMatch) {
    const table = updateMatch[1];
    const setPart = updateMatch[2];
    const wherePart = updateMatch[3] || '';

    // Special case: UPDATE events SET status = 'upcoming' WHERE status = 'featured'
    if (setPart.includes("status = 'upcoming'") && wherePart.includes("status = 'featured'")) {
      let q = supabase.from('events').update({ status: 'upcoming' }).eq('status', 'featured');
      if (wherePart.includes('id !=')) {
        q = q.neq('id', params[0]);
      }
      const { data, error } = await q.select();
      if (error) throw error;
      return { lastID: null, changes: data?.length || 1 };
    }

    if (setPart.includes("status = 'featured'") && wherePart.includes('id = ?')) {
      const { data, error } = await supabase.from('events').update({ status: 'featured' }).eq('id', params[0]).select();
      if (error) throw error;
      return { lastID: params[0], changes: 1 };
    }

    if (setPart.includes("status = 'read'") && wherePart.includes('id = ?')) {
      const { data, error } = await supabase.from('contact_messages').update({ status: 'read' }).eq('id', params[0]).select();
      if (error) throw error;
      return { lastID: params[0], changes: 1 };
    }

    // Standard SET col = ?, col2 = ? WHERE id = ?
    const setAssignments = setPart.split(',').map((s) => s.trim());
    const record = {};
    let paramIdx = 0;
    for (const assign of setAssignments) {
      const [col] = assign.split('=').map((s) => s.trim());
      record[col] = params[paramIdx++];
    }

    let q = supabase.from(table).update(record);
    if (wherePart.toLowerCase().includes('id = ?')) {
      q = q.eq('id', params[paramIdx]);
    }
    const { data, error } = await q.select();
    if (error) throw error;
    return { lastID: params[paramIdx] || null, changes: data?.length || 1 };
  }

  // D. DELETE FROM
  const deleteMatch = clean.match(/^DELETE\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+))?$/i);
  if (deleteMatch) {
    const table = deleteMatch[1];
    const wherePart = deleteMatch[2] || '';
    let q = supabase.from(table).delete();
    if (wherePart.toLowerCase().includes('id = ?')) {
      q = q.eq('id', params[0]);
    }
    const { data, error } = await q.select();
    if (error) throw error;
    return { lastID: null, changes: data?.length || 1 };
  }

  // E. SELECT query
  const selectMatch = clean.match(/^SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_]+)(.*)$/i);
  if (selectMatch) {
    const fields = selectMatch[1].trim();
    const table = selectMatch[2].trim();
    const rest = selectMatch[3] || '';

    let selectCols = fields === '*' ? '*' : fields.split(',').map((f) => f.trim()).join(',');
    let q = supabase.from(table).select(selectCols);

    // Apply where filters
    const keyMatch = rest.match(/WHERE\s+key\s*=\s*(?:'([^']+)'|\?)/i);
    if (keyMatch) {
      const keyVal = keyMatch[1] !== undefined ? keyMatch[1] : params[0];
      q = q.eq('key', keyVal);
    } else if (/WHERE\s+email\s*=\s*\?/i.test(rest)) {
      q = q.ilike('email', params[0]);
    } else if (/WHERE\s+username\s*=\s*\?\s+OR\s+email\s*=\s*\?/i.test(rest)) {
      q = q.or(`username.eq.${params[0]},email.ilike.${params[1]}`);
    } else if (/WHERE\s+UPPER\(qid\)\s*=\s*\?/i.test(rest)) {
      q = q.ilike('qid', params[0]);
    } else if (/WHERE\s+LOWER\(email\)\s*=\s*\?\s+AND\s+email\s*!=\s*''\s+AND\s+UPPER\(qid\)\s*!=\s*\?/i.test(rest)) {
      q = q.ilike('email', params[0]).neq('email', '').not('qid', 'ilike', params[1]);
    } else if (/WHERE\s+id\s*=\s*\?/i.test(rest)) {
      q = q.eq('id', params[0]);
    } else if (/WHERE\s+event_id\s*=\s*\?\s+AND\s+\(\s*student_email\s*=\s*\?\s+OR\s+roll_number\s*=\s*\?\s*\)/i.test(rest)) {
      q = q.eq('event_id', params[0]).or(`student_email.ilike.${params[1]},roll_number.eq.${params[2]}`);
    } else if (/WHERE\s+event_id\s*=\s*\?/i.test(rest)) {
      q = q.eq('event_id', params[0]);
    } else if (/WHERE\s+1=1/i.test(rest)) {
      let pIdx = 0;
      if (rest.includes('category = ?')) {
        q = q.eq('category', params[pIdx++]);
      }
      if (rest.includes('status = ?')) {
        q = q.eq('status', params[pIdx++]);
      }
    }

    // Apply sorting
    if (/ORDER\s+BY\s+display_order\s+ASC,\s*id\s+ASC/i.test(rest)) {
      q = q.order('display_order', { ascending: true }).order('id', { ascending: true });
    } else if (/ORDER\s+BY\s+display_order\s+ASC,\s*id\s+DESC/i.test(rest)) {
      q = q.order('display_order', { ascending: true }).order('id', { ascending: false });
    } else if (/ORDER\s+BY\s+name\s+ASC/i.test(rest)) {
      q = q.order('name', { ascending: true });
    } else if (/ORDER\s+BY\s+created_at\s+DESC/i.test(rest)) {
      q = q.order('created_at', { ascending: false });
    } else if (/ORDER\s+BY\s+id\s+DESC/i.test(rest)) {
      q = q.order('id', { ascending: false });
    }

    if (mode === 'get') {
      const { data, error } = await q.limit(1);
      if (error) throw error;
      return data?.[0] || undefined;
    } else {
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    }
  }

  // Fallback to SQLite if query not matched
  if (sqliteDb) {
    if (mode === 'run') return sqliteRun(sql, params);
    if (mode === 'all') return sqliteAll(sql, params);
    return sqliteGet(sql, params);
  }

  throw new Error('Unsupported SQL pattern: ' + clean);
}

// 4. PUBLIC DATABASE INTERFACES
const dbRun = async (sql, params = []) => {
  if (supabase) {
    try {
      return await querySupabase('run', sql, params);
    } catch (err) {
      console.error('Supabase query error (dbRun):', err.message);
      if (sqliteDb) return sqliteRun(sql, params);
      throw err;
    }
  }
  return sqliteRun(sql, params);
};

const dbAll = async (sql, params = []) => {
  if (supabase) {
    try {
      return await querySupabase('all', sql, params);
    } catch (err) {
      console.error('Supabase query error (dbAll):', err.message);
      if (sqliteDb) return sqliteAll(sql, params);
      throw err;
    }
  }
  return sqliteAll(sql, params);
};

const dbGet = async (sql, params = []) => {
  if (supabase) {
    try {
      return await querySupabase('get', sql, params);
    } catch (err) {
      console.error('Supabase query error (dbGet):', err.message);
      if (sqliteDb) return sqliteGet(sql, params);
      throw err;
    }
  }
  return sqliteGet(sql, params);
};

module.exports = {
  db: sqliteDb,
  supabase,
  dbRun,
  dbAll,
  dbGet
};
