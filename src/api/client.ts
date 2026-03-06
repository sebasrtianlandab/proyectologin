/**
 * Cliente para el backend real (VITE_API_URL).
 * Reemplaza los mocks de employees, audit, analytics y change-password.
 */

const getApiUrl = () => (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_API_URL as string)) || '';

// --- Empleados (snake_case → camelCase) ---
export interface EmployeeRow {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  employee_type: string;
  department: string;
  position: string;
  hire_date?: string;
  status: string;
  created_at?: string;
}

export interface Employee {
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
  createdAt: string;
  mustChangePassword?: boolean;
}

function mapEmployee(row: EmployeeRow): Employee {
  return {
    id: row.id,
    name: row.name ?? '',
    email: row.email ?? '',
    phone: row.phone,
    employeeType: row.employee_type ?? '',
    department: row.department ?? '',
    position: row.position ?? '',
    hireDate: row.hire_date,
    status: row.status ?? 'Activo',
    verified: true,
    createdAt: row.created_at ?? new Date().toISOString(),
    mustChangePassword: false,
  };
}

export async function getEmployees(): Promise<{ success: boolean; employees: Employee[] }> {
  const base = getApiUrl();
  if (!base) return { success: false, employees: [] };
  try {
    const res = await fetch(`${base}/api/employees`);
    const data = await res.json().catch(() => ({}));
    const rows: EmployeeRow[] = data.employees ?? [];
    return { success: data.success !== false, employees: rows.map(mapEmployee) };
  } catch {
    return { success: false, employees: [] };
  }
}

export async function createEmployee(payload: {
  name: string;
  email: string;
  phone?: string;
  employeeType: string;
  department: string;
  position: string;
  hireDate: string;
  status: string;
}): Promise<{ success: boolean; message?: string; employee?: Employee }> {
  const base = getApiUrl();
  if (!base) return { success: false, message: 'API no configurada' };
  try {
    const res = await fetch(`${base}/api/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        employeeType: payload.employeeType,
        department: payload.department,
        position: payload.position,
        hireDate: payload.hireDate,
        status: payload.status,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, message: data.message || 'Error al crear empleado' };
    return { success: true, message: data.message, employee: data.employee ? mapEmployee(data.employee as EmployeeRow) : undefined };
  } catch {
    return { success: false, message: 'Error de conexión con el servidor' };
  }
}

export async function deleteEmployee(id: string): Promise<{ success: boolean; message?: string }> {
  const base = getApiUrl();
  if (!base) return { success: false, message: 'API no configurada' };
  try {
    const res = await fetch(`${base}/api/employees/${id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    return { success: res.ok && data !== false, message: data.message };
  } catch {
    return { success: false, message: 'Error de conexión con el servidor' };
  }
}

// --- Auditoría (snake_case → camelCase) ---
export interface AuditRow {
  id?: string;
  user_id?: string;
  email?: string;
  action?: string;
  ip?: string;
  user_agent?: string;
  created_at?: string;
}

export interface AuditEntry {
  id?: string;
  timestamp?: string;
  action?: string;
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
}

function mapAudit(row: AuditRow): AuditEntry {
  return {
    id: row.id,
    timestamp: row.created_at,
    userId: row.user_id,
    email: row.email,
    action: row.action,
    ip: row.ip,
    userAgent: row.user_agent,
  };
}

export async function getAudit(): Promise<{ success: boolean; audits: AuditEntry[]; message?: string }> {
  const base = getApiUrl();
  if (!base) return { success: false, audits: [], message: 'VITE_API_URL no configurada en .env del ERP' };
  try {
    const res = await fetch(`${base}/api/audit`);
    const data = await res.json().catch(() => ({}));
    const rows: AuditRow[] = data.audits ?? [];
    const success = data.success !== false;
    return { success, audits: rows.map(mapAudit), message: data.message };
  } catch {
    return { success: false, audits: [], message: 'No se pudo conectar al servidor (¿está en marcha en el puerto 3001?)' };
  }
}

// --- Clientes (usuarios registrados en la plataforma / landing) ---
export interface ClientRow {
  id: string;
  full_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  origin?: string;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Client {
  id: string;
  fullName: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role: string;
  origin?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
}

function mapClient(row: ClientRow): Client {
  const name = (row.full_name ?? row.name ?? '').trim() || '—';
  return {
    id: row.id,
    fullName: name,
    name,
    email: row.email ?? '',
    phone: row.phone,
    company: row.company,
    role: row.role ?? 'client',
    origin: row.origin,
    emailVerified: !!row.email_verified,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at,
  };
}

export async function getClients(): Promise<{ success: boolean; clients: Client[] }> {
  const base = getApiUrl();
  if (!base) return { success: false, clients: [] };
  try {
    const res = await fetch(`${base}/api/clients`);
    const data = await res.json().catch(() => ({}));
    const rows: ClientRow[] = data.clients ?? [];
    return { success: data.success !== false, clients: rows.map(mapClient) };
  } catch {
    return { success: false, clients: [] };
  }
}

// --- Analytics y usuarios ---
export async function getAnalyticsSummary(days: number): Promise<{
  totalVisits: number;
  uniqueSessions: number;
  registeredUsers: number;
  pagesPerSession: string;
  dailyVisits?: unknown[];
  topPages?: unknown[];
  devices?: { desktop: number; mobile: number; other: number };
}> {
  const base = getApiUrl();
  const fallback = { totalVisits: 0, uniqueSessions: 0, registeredUsers: 0, pagesPerSession: '0', dailyVisits: [], topPages: [], devices: { desktop: 0, mobile: 0, other: 0 } };
  if (!base) return fallback;
  try {
    const res = await fetch(`${base}/api/analytics/summary?days=${days}`);
    const data = await res.json().catch(() => ({}));
    return { ...fallback, ...data };
  } catch {
    return fallback;
  }
}

export async function getUsersCount(): Promise<{ count: number }> {
  const base = getApiUrl();
  if (!base) return { count: 0 };
  try {
    const res = await fetch(`${base}/api/users/count`);
    const data = await res.json().catch(() => ({}));
    return { count: data.count ?? 0 };
  } catch {
    return { count: 0 };
  }
}

export async function trackAnalytics(): Promise<void> {
  const base = getApiUrl();
  if (!base) return;
  try {
    await fetch(`${base}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: typeof window !== 'undefined' ? window.location.pathname : '/', device_type: 'desktop' }),
    });
  } catch {
    // silencioso
  }
}

export async function changePassword(email: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
  const base = getApiUrl();
  if (!base) return { success: false, message: 'API no configurada' };
  try {
    const res = await fetch(`${base}/api/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    return { success: res.ok && data !== false, message: data.message };
  } catch {
    return { success: false, message: 'Error de conexión con el servidor' };
  }
}
