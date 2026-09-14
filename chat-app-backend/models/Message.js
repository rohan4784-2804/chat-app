const crypto = require('crypto');
const { readDB, writeDB } = require('../config/db');

function createMessage({ text, user, clientMessageId }) {
  const db = readDB();
  if (clientMessageId) {
    const existing = db.messages.find((m) => m.clientMessageId === clientMessageId);
    if (existing) return existing;
  }
  const message = {
    id: crypto.randomUUID(),
    text: text.trim(),
    user: user || null,
    clientMessageId: clientMessageId || null,
    createdAt: new Date().toISOString()
  };
  db.messages.push(message);
  if (db.messages.length > 1000) db.messages = db.messages.slice(-1000);
  writeDB(db);
  return message;
}

function getMessages(limit = 200) {
  return readDB().messages.slice(-limit);
}

module.exports = { createMessage, getMessages };
