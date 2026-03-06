/** Seed de datos mock (misma estructura que data/*.json). */

export const seedUsers = [
  { id: 'user_admin_001', name: 'Administrador', email: 'admin@erp.com', password: 'admin', role: 'admin' as const, verified: true, mustChangePassword: false, createdAt: '2026-02-24T09:00:00.000Z' },
  { id: 'user_2', name: 'Wilson', email: 'acosta.wp076@gmail.com', password: 'RipX1234', role: 'user' as const, verified: true, mustChangePassword: false, createdAt: '2026-02-24T14:16:07.472Z' },
  { id: 'user_3', name: 'José Ignacio Hernández', email: 'hernandz.j2004@gmail.com', password: '#5368ig2207Hg', role: 'user' as const, verified: true, mustChangePassword: false, createdAt: '2026-02-24T14:23:14.494Z' },
  { id: 'user_4', name: 'Huaman', email: 'isistemas2022@gmail.com', password: '#5368ig2207Hg', role: 'user' as const, verified: true, mustChangePassword: false, createdAt: '2026-02-24T15:26:20.530Z' },
  { id: 'user_5', name: 'Thiago fabian', email: 'floresthiagop1@gmail.com', password: 'Temp2714!', role: 'user' as const, verified: true, mustChangePassword: true, createdAt: '2026-02-24T16:10:15.360Z' },
];

export const seedEmployees = [
  { id: 'emp_admin_001', name: 'Administrador', email: 'admin@erp.com', phone: '000000000', employeeType: 'Administrador', department: 'Dirección', position: 'Gerente General', hireDate: '2026-02-24', status: 'Activo', verified: true, mustChangePassword: false, createdAt: '2026-02-24T09:00:00.000Z' },
  { id: 'emp_2', name: 'Wilson', email: 'acosta.wp076@gmail.com', phone: '910175892', employeeType: 'Asist. Administrativo', department: 'Soporte', position: 'Recepcionista', hireDate: '2026-02-24', status: 'Activo', verified: false, tempPassword: 'Temp4147!', createdAt: '2026-02-24T14:16:07.470Z' },
  { id: 'emp_3', name: 'José Ignacio Hernández', email: 'hernandz.j2004@gmail.com', phone: '918918147', employeeType: 'Desarrollador', department: 'Desarrollo', position: 'Backend Developer', hireDate: '2026-02-24', status: 'Activo', verified: false, tempPassword: 'Temp9771!', createdAt: '2026-02-24T14:23:14.492Z' },
  { id: 'emp_4', name: 'Huaman', email: 'isistemas2022@gmail.com', phone: '915009603', employeeType: 'Instructor', department: 'Docente', position: 'Instructor Senior', hireDate: '2026-02-24', status: 'Activo', verified: false, tempPassword: 'Temp1103!', createdAt: '2026-02-24T15:26:20.528Z' },
  { id: 'emp_5', name: 'Thiago fabian', email: 'floresthiagop1@gmail.com', phone: '965848073', employeeType: 'Instructor', department: 'Docente', position: '', hireDate: '2026-02-24', status: 'Activo', verified: false, mustChangePassword: true, tempPassword: 'Temp2714!', createdAt: '2026-02-24T16:10:15.358Z' },
];

export const seedAudit = [
  { id: 'audit_1', timestamp: '2026-02-24T14:16:07.474Z', action: 'EMPLOYEE_REGISTERED', userId: 'emp_2', email: 'acosta.wp076@gmail.com', ip: '::1', userAgent: 'Mozilla/5.0...' },
  { id: 'audit_2', timestamp: '2026-02-24T14:17:40.975Z', action: 'LOGIN_SUCCESS_DIRECT', userId: 'user_2', email: 'acosta.wp076@gmail.com', ip: '::1', userAgent: 'Mozilla/5.0...' },
  { id: 'audit_3', timestamp: '2026-02-24T14:19:11.535Z', action: 'PASSWORD_CHANGED', userId: 'user_2', email: 'acosta.wp076@gmail.com', ip: '::1', userAgent: 'Mozilla/5.0...' },
  { id: 'audit_4', timestamp: '2026-02-24T14:19:32.972Z', action: 'LOGIN_SUCCESS_DIRECT', userId: 'user_admin_001', email: 'admin@erp.com', ip: '::1', userAgent: 'Mozilla/5.0...' },
  { id: 'audit_5', timestamp: '2026-02-24T14:19:51.950Z', action: 'LOGIN_FAILED', userId: 'N/A', email: 'acosta.wp076@gmail.com', ip: '::1', userAgent: 'Mozilla/5.0...' },
  { id: 'audit_6', timestamp: '2026-02-24T14:23:14.496Z', action: 'EMPLOYEE_REGISTERED', userId: 'emp_3', email: 'hernandz.j2004@gmail.com', ip: '::1', userAgent: 'Mozilla/5.0...' },
  { id: 'audit_7', timestamp: '2026-02-24T14:24:02.719Z', action: 'LOGIN_SUCCESS_DIRECT', userId: 'user_3', email: 'hernandz.j2004@gmail.com', ip: '::1', userAgent: 'Mozilla/5.0...' },
  { id: 'audit_8', timestamp: '2026-02-24T15:26:20.533Z', action: 'EMPLOYEE_REGISTERED', userId: 'emp_4', email: 'isistemas2022@gmail.com', ip: '::1', userAgent: 'Mozilla/5.0...' },
  { id: 'audit_9', timestamp: '2026-02-24T15:27:27.046Z', action: 'LOGIN_FAILED', userId: 'N/A', email: 'isistemas2022@gmail.com', ip: '::1', userAgent: 'Mozilla/5.0...' },
  { id: 'audit_10', timestamp: '2026-02-24T15:27:37.648Z', action: 'LOGIN_SUCCESS_DIRECT', userId: 'user_4', email: 'isistemas2022@gmail.com', ip: '::1', userAgent: 'Mozilla/5.0...' },
];

// Incluye fechas recientes (últimos días) para que el resumen por 7/14/30 días muestre datos
const now = new Date();
const recent = [
  new Date(now.getTime() - 0 * 86400000).toISOString(),
  new Date(now.getTime() - 1 * 86400000).toISOString(),
  new Date(now.getTime() - 2 * 86400000).toISOString(),
  new Date(now.getTime() - 3 * 86400000).toISOString(),
];
export const seedAnalytics = [
  { timestamp: recent[0], ip: '::1', userAgent: 'Mozilla/5.0...', path: 'http://localhost:5173/' },
  { timestamp: recent[0], ip: '::1', userAgent: 'Mozilla/5.0...', path: 'http://localhost:5173/dashboard' },
  { timestamp: recent[1], ip: '::1', userAgent: 'Mozilla/5.0...', path: 'http://localhost:5173/login' },
  { timestamp: recent[1], ip: '::1', userAgent: 'Mozilla/5.0...', path: 'http://localhost:5173/ventas' },
  { timestamp: recent[2], ip: '::1', userAgent: 'Mozilla/5.0...', path: 'http://localhost:5173/crm/rrhh' },
  { timestamp: recent[3], ip: '::1', userAgent: 'Mozilla/5.0...', path: 'http://localhost:5173/analytics' },
  { timestamp: '2026-02-24T14:19:33.024Z', ip: '::1', userAgent: 'Mozilla/5.0...', path: 'http://localhost:5173/dashboard' },
  { timestamp: '2026-02-24T15:28:13.862Z', ip: '::1', userAgent: 'Mozilla/5.0...', path: 'http://localhost:5173/crm/rrhh' },
  { timestamp: '2026-02-24T16:08:30.321Z', ip: '::1', userAgent: 'Mozilla/5.0...', path: 'http://localhost:5173/analytics' },
];
