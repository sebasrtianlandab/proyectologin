/**
 * Datos mock para el ERP. Fuente única: se usa en toda la app en lugar de API/Supabase.
 * Cuando exista backend, se reemplaza por llamadas reales.
 */

import { seedUsers, seedEmployees, seedAudit, seedAnalytics } from './seed';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  verified: boolean;
  mustChangePassword: boolean;
  createdAt: string;
}

export interface MockEmployee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  employeeType: string;
  department: string;
  position: string;
  hireDate?: string;
  status: string;
  verified: boolean;
  mustChangePassword?: boolean;
  tempPassword?: string;
  createdAt: string;
}

export interface MockAuditEntry {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  email: string;
  ip: string;
  userAgent: string;
}

export interface MockAnalyticsHit {
  timestamp: string;
  ip: string;
  userAgent: string;
  path: string;
}

// Copias mutables en memoria (para crear/eliminar empleados en la sesión)
const users = JSON.parse(JSON.stringify(seedUsers)) as MockUser[];
const employees = JSON.parse(JSON.stringify(seedEmployees)) as MockEmployee[];
const audit = JSON.parse(JSON.stringify(seedAudit)) as MockAuditEntry[];
const analyticsHits = JSON.parse(JSON.stringify(seedAnalytics)) as MockAnalyticsHit[];

export function getMockUsers() {
  return users;
}

export function getMockEmployees() {
  return employees;
}

export function getMockAudit() {
  return audit;
}

export function getMockAnalyticsHits() {
  return analyticsHits;
}

/** Añadir empleado (mock en memoria) */
export function mockCreateEmployee(emp: Omit<MockEmployee, 'id' | 'createdAt'>): MockEmployee {
  const newEmp: MockEmployee = {
    ...emp,
    id: `emp_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  employees.push(newEmp);
  audit.push({
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'EMPLOYEE_REGISTERED',
    userId: newEmp.id,
    email: newEmp.email,
    ip: '::1',
    userAgent: navigator.userAgent,
  });
  return newEmp;
}

/** Eliminar empleado (mock en memoria) */
export function mockDeleteEmployee(id: string): boolean {
  const idx = employees.findIndex(e => e.id === id);
  if (idx === -1) return false;
  const emp = employees[idx];
  employees.splice(idx, 1);
  audit.push({
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'EMPLOYEE_DELETED',
    userId: emp.id,
    email: emp.email,
    ip: '::1',
    userAgent: navigator.userAgent,
  });
  return true;
}

/** Simular cambio de contraseña (mock) */
export function mockChangePassword(_email: string, _newPassword: string): { success: boolean; message?: string } {
  return { success: true };
}

/** Construir resumen de analítica desde hits (misma forma que el server) */
export function buildAnalyticsSummary(days: number) {
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  const filtered = analyticsHits.filter(h => new Date(h.timestamp).getTime() >= cutoff);

  const byPath: Record<string, number> = {};
  const byDay: Record<string, { visitas: number; sesiones: number }> = {};

  for (let i = 0; i < days; i++) {
    const d = new Date(now - (days - 1 - i) * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    byDay[key] = { visitas: 0, sesiones: 0 };
  }

  filtered.forEach(h => {
    const path = (h.path || '/').replace(/^https?:\/\/[^/]+/, '') || '/';
    byPath[path] = (byPath[path] || 0) + 1;
    const dayKey = new Date(h.timestamp).toISOString().slice(0, 10);
    if (byDay[dayKey]) {
      byDay[dayKey].visitas += 1;
      byDay[dayKey].sesiones += 1;
    }
  });

  const dailyVisits = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      date: new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
      visitas: v.visitas,
      sesiones: v.sesiones,
    }));

  const topPages = Object.entries(byPath)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  return {
    totalVisits: filtered.length,
    uniqueSessions: Math.floor(filtered.length * 0.6) || 0,
    registeredUsers: users.length,
    pagesPerSession: filtered.length ? (filtered.length / (Math.floor(filtered.length * 0.6) || 1)).toFixed(1) : '2.5',
    dailyVisits,
    topPages,
    devices: { desktop: 100, mobile: 0, other: 0 },
  };
}
