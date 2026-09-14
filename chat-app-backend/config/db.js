const fs = require('fs');
const path = require('path');

// Render Free has an ephemeral filesystem, so this stores data locally
// without requiring MongoDB, Supabase, or any paid storage.
const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const dbFile = path.join(dataDir, 'chat.json');

const emptyDB = { users: [], messages: [] };

function ensureDB() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify(emptyDB, null, 2), 'utf8');
  }
}

function readDB() {
  ensureDB();
  try {
    const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    return {
      users: Array.isArray(data.users) ? data.users : [],
      messages: Array.isArray(data.messages) ? data.messages : []
    };
  } catch {
    const freshDB = { users: [], messages: [] };
    fs.writeFileSync(dbFile, JSON.stringify(freshDB, null, 2), 'utf8');
    return freshDB;
  }
}

function writeDB(data) {
  ensureDB();
  const tempFile = `${dbFile}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempFile, dbFile);
}

async function connectDB() {
  ensureDB();
  console.log(`File storage ready: ${dbFile}`);
}

module.exports = { connectDB, readDB, writeDB, dataDir, dbFile };
