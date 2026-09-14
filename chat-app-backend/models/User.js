const crypto = require('crypto');
const { readDB, writeDB } = require('../config/db');

function findById(id) {
  const db = readDB();
  return db.users.find((u) => u.id === id) || null;
}

function findByUsername(username) {
  const db = readDB();
  return db.users.find((u) => u.username === username) || null;
}

function findByEmail(email) {
  const db = readDB();
  return db.users.find((u) => u.email === email.toLowerCase()) || null;
}

function createUser({ username, email, passwordHash }) {
  const db = readDB();
  const user = {
    id: crypto.randomUUID(),
    username,
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString()
  };
  db.users.push(user);
  writeDB(db);
  return user;
}

module.exports = { findById, findByUsername, findByEmail, createUser };
