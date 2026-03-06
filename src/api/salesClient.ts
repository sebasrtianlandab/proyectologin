/**
 * Cliente API para el módulo de Ventas (catálogos, servicios, cotizaciones, eventos).
 * Usa VITE_API_URL; reemplaza mocks de ServiciosTab, CotizacionesTab, MonitoreoTab.
 */

import type {
  Quote,
  QuoteStatus,
  EventsSummary,
  Service,
  ModuleTemplate,
  Category,
  Technology,
  BenefitTemplate,
  QuoteFilters,
} from '../domain/sales/types';
import type { ServiceWithDetails, UpdateServicePayload } from '../mocks/dataSales';

const getApiUrl = () => (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_API_URL as string)) || '';

export async function getCategories(): Promise<Category[]> {
  const base = getApiUrl();
  if (!base) return [];
  try {
    const res = await fetch(`${base}/api/categories`);
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getTechnologies(): Promise<Technology[]> {
  const base = getApiUrl();
  if (!base) return [];
  try {
    const res = await fetch(`${base}/api/technologies`);
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getModuleTemplates(): Promise<ModuleTemplate[]> {
  const base = getApiUrl();
  if (!base) return [];
  try {
    const res = await fetch(`${base}/api/module-templates`);
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getBenefitTemplates(): Promise<BenefitTemplate[]> {
  const base = getApiUrl();
  if (!base) return [];
  try {
    const res = await fetch(`${base}/api/benefit-templates`);
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getServices(): Promise<Service[]> {
  const base = getApiUrl();
  if (!base) return [];
  try {
    const res = await fetch(`${base}/api/services`);
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getServiceWithDetails(serviceId: string): Promise<ServiceWithDetails | null> {
  const base = getApiUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/services/${serviceId}`);
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    if (!data) return null;
    return {
      ...data,
      technology_ids: data.technology_ids || [],
      benefit_ids: data.benefit_ids || [],
    };
  } catch {
    return null;
  }
}

export async function updateService(serviceId: string, payload: UpdateServicePayload): Promise<{ success: boolean; message?: string }> {
  const base = getApiUrl();
  if (!base) return { success: false, message: 'API no configurada' };
  try {
    const res = await fetch(`${base}/api/services/${serviceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        short_description: payload.short_description,
        category_id: payload.category_id,
        module_template_ids: payload.module_template_ids,
        technology_ids: payload.technology_ids,
        benefit_ids: payload.benefit_ids,
      }),
    });
    const data = await res.json().catch(() => ({}));
    return { success: res.ok, message: data.message };
  } catch {
    return { success: false, message: 'Error de conexión' };
  }
}

function buildQuotesQuery(base: string, filters?: QuoteFilters): string {
  const q = new URLSearchParams();
  if (filters?.serviceId && filters.serviceId !== 'all') q.set('serviceId', filters.serviceId);
  if (filters?.status && filters.status !== 'all') q.set('status', filters.status);
  if (filters?.dateFrom) q.set('dateFrom', filters.dateFrom);
  if (filters?.dateTo) q.set('dateTo', filters.dateTo);
  const query = q.toString();
  return query ? `${base}/api/quotes?${query}` : `${base}/api/quotes`;
}

export async function getQuotes(filters?: QuoteFilters): Promise<Quote[]> {
  const base = getApiUrl();
  if (!base) return [];
  try {
    const res = await fetch(buildQuotesQuery(base, filters));
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getQuoteById(id: string): Promise<Quote | null> {
  const base = getApiUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/quotes/${id}`);
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    return data;
  } catch {
    return null;
  }
}

export async function updateQuoteStatus(
  id: string,
  status: QuoteStatus,
  observations: string | null
): Promise<{ success: boolean }> {
  const base = getApiUrl();
  if (!base) return { success: false };
  try {
    const res = await fetch(`${base}/api/quotes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, observations }),
    });
    const data = await res.json().catch(() => ({}));
    return { success: res.ok && data.success !== false };
  } catch {
    return { success: false };
  }
}

export async function getEventsSummary(periodDays: number): Promise<EventsSummary> {
  const base = getApiUrl();
  const empty: EventsSummary = {
    byType: { page_view: 0, click_servicio: 0, click_cotizar: 0, cotizacion_confirmada: 0 },
    byService: {},
    cotizacionesConfirmadas: 0,
    totalEvents: 0,
    periodDays,
  };
  if (!base) return empty;
  try {
    const res = await fetch(`${base}/api/events/summary?days=${periodDays}`);
    const data = await res.json().catch(() => ({}));
    return {
      byType: data.byType || empty.byType,
      byService: data.byService || {},
      cotizacionesConfirmadas: data.cotizacionesConfirmadas ?? 0,
      totalEvents: data.totalEvents ?? 0,
      periodDays: data.periodDays ?? periodDays,
    };
  } catch {
    return empty;
  }
}

export async function getQuoteCountsByStatus(): Promise<Record<QuoteStatus, number>> {
  const base = getApiUrl();
  const empty: Record<QuoteStatus, number> = { pendiente: 0, en_proceso: 0, ganada: 0, perdida: 0 };
  if (!base) return empty;
  try {
    const res = await fetch(`${base}/api/quotes/counts-by-status`);
    const data = await res.json().catch(() => ({}));
    return {
      pendiente: data.pendiente ?? 0,
      en_proceso: data.en_proceso ?? 0,
      ganada: data.ganada ?? 0,
      perdida: data.perdida ?? 0,
    };
  } catch {
    return empty;
  }
}
