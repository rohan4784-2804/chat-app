const crypto = require('crypto');
const { supabase } = require('../config/db');

async function findById(id) {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data || null;
}

async function findByUsername(username) {
  const { data, error } = await supabase.from('users').select('*').eq('username', username).maybeSingle();
  if (error) throw error;
  return data || null;
}

async function findByEmail(email) {
  const { data, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).maybeSingle();
  if (error) throw error;
  return data || null;
}

async function createUser({ username, email, passwordHash }) {
  const user = {
    id: crypto.randomUUID(),
    username,
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString()
  };

  const { data, error } = await supabase.from('users').insert(user).select('*').single();
  if (error) throw error;
  return data;
}

module.exports = { findById, findByUsername, findByEmail, createUser };
