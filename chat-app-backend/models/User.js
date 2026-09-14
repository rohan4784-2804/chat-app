const crypto = require('crypto');
const dbStore = require('../config/db');

function findById(id) {
  return dbStore.readDB().users.find((u) => u.id === id) || null;
}

function findByUsername(username) {
  const name = String(username).toLowerCase();
  return dbStore.readDB().users.find((u) => String(u.username).toLowerCase() === name) || null;
}

function findByEmail(email) {
  const address = String(email).toLowerCase();
  return dbStore.readDB().users.find((u) => String(u.email).toLowerCase() === address) || null;
}

function createUser({ username, email, passwordHash }) {
  const db = dbStore.readDB();
  const user = {
    id: crypto.randomUUID(),
    username,
    email: String(email).toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString()
  };
  db.users.push(user);
  dbStore.writeDB(db);
  return user;
}

module.exports = { findById, findByUsername, findByEmail, createUser };
