/**
 * API mock: mismas formas de respuesta que el backend.
 * Todas las vistas del ERP usan esto en lugar de fetch(localhost:3001).
 */

import {
  getMockUsers,
  getMockEmployees,
  getMockAudit,
  buildAnalyticsSummary,
  mockCreateEmployee,
  mockDeleteEmployee,
  mockChangePassword,
  type MockEmployee,
} from './data';
import type { Quote, QuoteFilters, QuoteStatus, EventsSummary, Service, ModuleTemplate, Category, Technology, BenefitTemplate } from '../domain/sales/types';
import {
  getQuotes as getQuotesData,
  getQuoteById as getQuoteByIdData,
  updateQuoteStatus as updateQuoteStatusData,
  getEventsSummary as getEventsSummaryData,
  getQuoteCountsByStatus as getQuoteCountsByStatusData,
  getServices as getServicesData,
  getModuleTemplates as getModuleTemplatesData,
  getCategories as getCategoriesData,
  getTechnologies as getTechnologiesData,
  getBenefitTemplates as getBenefitTemplatesData,
} from './dataSales';

// --- Auth (usado por AuthService) ---

export function mockLogin(email: string, password: string): Promise<{ success: boolean; message?: string; requiresOTP?: boolean; user?: any }> {
  return new Promise(resolve => {
    setTimeout(() => {
      const users = getMockUsers();
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        resolve({ success: false, message: 'Credenciales inválidas' });
        return;
      }
      resolve({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          mustChangePassword: user.mustChangePassword || false,
        },
      });
    }, 300);
  });
}

export function mockRegister(_name: string, _email: string, _password: string): Promise<{ success: boolean; message?: string; userId?: string }> {
  return new Promise(resolve => {
    setTimeout(() => resolve({ success: true, message: 'Usuario registrado. Verifica tu email.', userId: 'mock_' + Date.now() }), 300);
  });
}

export function mockVerifyOTP(email: string, code: string): Promise<{ success: boolean; message?: string; user?: any }> {
  return new Promise(resolve => {
    setTimeout(() => {
      const users = getMockUsers();
      const user = users.find(u => u.email === email);
      if (!user) {
        resolve({ success: false, message: 'Usuario no encontrado' });
        return;
      }
      // Cualquier código de 6 dígitos pasa en mock
      if (String(code).length !== 6) {
        resolve({ success: false, message: 'Código incorrecto' });
        return;
      }
      resolve({
        success: true,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    }, 300);
  });
}

export function mockGetUser(email: string): Promise<{ success: boolean; user?: any }> {
  return new Promise(resolve => {
    const users = getMockUsers();
    const user = users.find(u => u.email === email);
    resolve(user ? { success: true, user } : { success: false });
  });
}

// --- Employees ---

export function mockGetEmployees(): Promise<{ success: boolean; employees: MockEmployee[] }> {
  return new Promise(resolve => {
    setTimeout(() => resolve({ success: true, employees: getMockEmployees() }), 200);
  });
}

export function mockCreateEmployeeApi(emp: any): Promise<{ success: boolean; message?: string; employee?: MockEmployee }> {
  return new Promise(resolve => {
    setTimeout(() => {
      try {
        const payload = { ...emp, verified: emp.verified ?? false };
        const created = mockCreateEmployee(payload);
        resolve({ success: true, employee: created });
      } catch (e) {
        resolve({ success: false, message: 'Error al crear empleado' });
      }
    }, 300);
  });
}

export function mockDeleteEmployeeApi(id: string): Promise<{ success: boolean; message?: string }> {
  return new Promise(resolve => {
    setTimeout(() => {
      const ok = mockDeleteEmployee(id);
      resolve(ok ? { success: true } : { success: false, message: 'Empleado no encontrado' });
    }, 200);
  });
}

// --- Audit ---

export function mockGetAudit(): Promise<{ success: boolean; audits: any[] }> {
  return new Promise(resolve => {
    setTimeout(() => resolve({ success: true, audits: getMockAudit() }), 200);
  });
}

// --- Analytics ---

export function mockGetAnalyticsSummary(days: number): Promise<{
  totalVisits: number;
  uniqueSessions: number;
  registeredUsers: number;
  pagesPerSession: string;
  dailyVisits: any[];
  topPages: any[];
  devices: { desktop: number; mobile: number; other: number };
}> {
  return new Promise(resolve => {
    setTimeout(() => resolve(buildAnalyticsSummary(days)), 200);
  });
}

export function mockGetUsersCount(): Promise<{ count: number }> {
  return new Promise(resolve => {
    setTimeout(() => resolve({ count: getMockUsers().length }), 100);
  });
}

// --- Change password ---

export function mockChangePasswordApi(email: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
  return new Promise(resolve => {
    setTimeout(() => {
      const result = mockChangePassword(email, newPassword);
      resolve(result);
    }, 300);
  });
}

// --- Track (no-op en mock) ---

export function mockTrackAnalytics(): Promise<void> {
  return Promise.resolve();
}

// --- Sales module (Cotizaciones, Monitoreo, Servicios) ---

export function mockGetQuotes(filters?: QuoteFilters): Promise<Quote[]> {
  return new Promise(resolve => setTimeout(() => resolve(getQuotesData(filters)), 150));
}

export function mockGetQuoteById(id: string): Promise<Quote | null> {
  return new Promise(resolve => setTimeout(() => resolve(getQuoteByIdData(id)), 100));
}

export function mockUpdateQuoteStatus(id: string, status: QuoteStatus, observations: string | null): Promise<{ success: boolean }> {
  return new Promise(resolve => {
    setTimeout(() => resolve({ success: updateQuoteStatusData(id, status, observations) }), 150);
  });
}

export function mockGetEventsSummary(periodDays: number): Promise<EventsSummary> {
  return new Promise(resolve => setTimeout(() => resolve(getEventsSummaryData(periodDays)), 150));
}

export function mockGetQuoteCountsByStatus(): Promise<Record<QuoteStatus, number>> {
  return new Promise(resolve => setTimeout(() => resolve(getQuoteCountsByStatusData()), 100));
}

export function mockGetServices(): Promise<Service[]> {
  return new Promise(resolve => setTimeout(() => resolve(getServicesData()), 150));
}

export function mockGetModuleTemplates(): Promise<ModuleTemplate[]> {
  return new Promise(resolve => setTimeout(() => resolve(getModuleTemplatesData()), 100));
}

export function mockGetCategories(): Promise<Category[]> {
  return new Promise(resolve => setTimeout(() => resolve(getCategoriesData()), 100));
}

export function mockGetTechnologies(): Promise<Technology[]> {
  return new Promise(resolve => setTimeout(() => resolve(getTechnologiesData()), 100));
}

export function mockGetBenefitTemplates(): Promise<BenefitTemplate[]> {
  return new Promise(resolve => setTimeout(() => resolve(getBenefitTemplatesData()), 100));
}
