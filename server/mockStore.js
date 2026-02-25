/**
 * Almacenamiento mock en JSON para desarrollo sin Supabase.
 * Se usa cuando USE_MOCK_DATA=true en server/.env
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function readJson(name) {
  const file = path.join(DATA_DIR, `${name}.json`);
  try {
    const raw = await fs.readFile(file, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

async function writeJson(name, data) {
  const file = path.join(DATA_DIR, `${name}.json`);
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
}

// --- Users ---
export async function getUserByEmail(email) {
  const users = await readJson('users');
  const user = users.find((u) => u.email === email) || null;
  return { data: user, error: null };
}

export async function getExistingUserByEmail(email) {
  const users = await readJson('users');
  const user = users.find((u) => u.email === email) || null;
  return { data: user, error: null };
}

export async function createUser({ name, email, password, role = 'user', verified = false, must_change_password = false }) {
  const users = await readJson('users');
  const newUser = {
    id: uuid(),
    name,
    email,
    password,
    role,
    verified,
    must_change_password: must_change_password,
    created_at: new Date().toISOString(),
  };
  users.push(newUser);
  await writeJson('users', users);
  return { data: newUser, error: null };
}

export async function updateUserById(id, updates) {
  const users = await readJson('users');
  const i = users.findIndex((u) => u.id === id);
  if (i === -1) return { error: new Error('User not found') };
  users[i] = { ...users[i], ...updates };
  await writeJson('users', users);
  return { error: null };
}

export async function updateUserByEmail(email, updates) {
  const users = await readJson('users');
  const i = users.findIndex((u) => u.email === email);
  if (i === -1) return { error: new Error('User not found') };
  users[i] = { ...users[i], ...updates };
  await writeJson('users', users);
  return { error: null };
}

export async function getUsersCount() {
  const users = await readJson('users');
  return { count: users.length, error: null };
}

// --- OTP ---
export async function insertOtp({ user_id, code, expires_at }) {
  const rows = await readJson('otp');
  const maxAttempts = 5;
  const row = {
    id: uuid(),
    user_id,
    code,
    attempts: 0,
    max_attempts: maxAttempts,
    expires_at,
    created_at: new Date().toISOString(),
  };
  rows.push(row);
  await writeJson('otp', rows);
  return { error: null };
}

export async function getLatestOtpByUserId(userId) {
  const rows = await readJson('otp');
  const forUser = rows.filter((r) => r.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const otp = forUser[0] || null;
  return { data: otp, error: null };
}

export async function updateOtpAttempts(otpId, attempts) {
  const rows = await readJson('otp');
  const i = rows.findIndex((r) => r.id === otpId);
  if (i === -1) return { error: new Error('OTP not found') };
  rows[i].attempts = attempts;
  await writeJson('otp', rows);
  return { error: null };
}

export async function deleteOtpById(otpId) {
  const rows = await readJson('otp');
  const filtered = rows.filter((r) => r.id !== otpId);
  await writeJson('otp', filtered);
  return { error: null };
}

export async function deleteOtpsByUserId(userId) {
  const rows = await readJson('otp');
  const filtered = rows.filter((r) => r.user_id !== userId);
  await writeJson('otp', filtered);
  return { error: null };
}

// --- Audit ---
export async function insertAudit({ user_id, email, action, ip, user_agent }) {
  const rows = await readJson('audit_logs');
  rows.unshift({
    id: uuid(),
    user_id: user_id || null,
    email: email || 'N/A',
    action,
    ip: ip || null,
    user_agent: user_agent || null,
    timestamp: new Date().toISOString(),
  });
  await writeJson('audit_logs', rows.slice(0, 500));
  return { error: null };
}

export async function getAuditLogs(limit = 100) {
  const rows = await readJson('audit_logs');
  const sorted = rows.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return { data: sorted.slice(0, limit), error: null };
}

// --- Employees ---
export async function getEmployees() {
  const rows = await readJson('employees');
  const sorted = [...rows].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return { data: sorted, error: null };
}

export async function createEmployee(row) {
  const rows = await readJson('employees');
  const emp = {
    id: uuid(),
    ...row,
    created_at: new Date().toISOString(),
  };
  rows.push(emp);
  await writeJson('employees', rows);
  return { error: null };
}

export async function deleteEmployeeById(id) {
  const rows = await readJson('employees');
  const filtered = rows.filter((r) => r.id !== id);
  await writeJson('employees', filtered);
  return { error: null };
}

// --- Analytics ---
export async function getAnalyticsCount() {
  const rows = await readJson('analytics_tracking');
  return { count: rows.length, error: null };
}

export async function getAnalyticsTracking() {
  const rows = await readJson('analytics_tracking');
  return { data: rows, error: null };
}

export async function insertAnalyticsTracking({ path: p, ip, user_agent }) {
  const rows = await readJson('analytics_tracking');
  rows.push({
    id: uuid(),
    path: p || '/',
    ip: ip || null,
    user_agent: user_agent || null,
    timestamp: new Date().toISOString(),
  });
  await writeJson('analytics_tracking', rows);
  return { error: null };
}
