/**
 * Capa de datos mock para Módulo de Ventas.
 * Fuente única para cotizaciones, eventos, servicios y catálogos.
 */

import type { Quote, QuoteModule, QuoteStatus, Event, EventsSummary, EventType, Service, ModuleTemplate, Category, Technology, BenefitTemplate, QuoteFilters } from '../domain/sales/types';
import {
  seedCategories,
  seedTechnologies,
  seedModuleTemplates,
  seedBenefitTemplates,
  seedServices,
  seedQuotes,
  seedQuoteModules,
  seedEvents,
} from './seedSales';

const categories = JSON.parse(JSON.stringify(seedCategories)) as Category[];
const technologies = JSON.parse(JSON.stringify(seedTechnologies)) as Technology[];
const moduleTemplates = JSON.parse(JSON.stringify(seedModuleTemplates)) as ModuleTemplate[];
const benefitTemplates = JSON.parse(JSON.stringify(seedBenefitTemplates)) as BenefitTemplate[];
const services = JSON.parse(JSON.stringify(seedServices)) as Service[];
const quotes = JSON.parse(JSON.stringify(seedQuotes)) as Quote[];
const quoteModules = JSON.parse(JSON.stringify(seedQuoteModules)) as QuoteModule[];
const events = JSON.parse(JSON.stringify(seedEvents)) as Event[];

export function getCategories() {
  return categories;
}

export function getTechnologies() {
  return technologies;
}

export function getModuleTemplates() {
  return moduleTemplates;
}

export function getBenefitTemplates() {
  return benefitTemplates;
}

export function getServices() {
  return services;
}

export function getQuotes(filters?: QuoteFilters): Quote[] {
  let list = quotes.map(q => ({
    ...q,
    modules: quoteModules.filter(qm => qm.quote_id === q.id),
  }));
  if (filters?.serviceId) list = list.filter(q => q.service_id === filters.serviceId);
  if (filters?.status) list = list.filter(q => q.status === filters.status);
  if (filters?.dateFrom) {
    const from = new Date(filters.dateFrom).getTime();
    list = list.filter(q => new Date(q.created_at).getTime() >= from);
  }
  if (filters?.dateTo) {
    const to = new Date(filters.dateTo).getTime();
    list = list.filter(q => new Date(q.created_at).getTime() <= to);
  }
  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getQuoteById(id: string): Quote | null {
  const quote = quotes.find(q => q.id === id);
  if (!quote) return null;
  return {
    ...quote,
    modules: quoteModules.filter(qm => qm.quote_id === id),
  };
}

export function updateQuoteStatus(id: string, status: QuoteStatus, observations: string | null): boolean {
  const idx = quotes.findIndex(q => q.id === id);
  if (idx === -1) return false;
  quotes[idx].status = status;
  quotes[idx].observations = observations;
  quotes[idx].updated_at = new Date().toISOString();
  return true;
}

export function getEvents(): Event[] {
  return [...events].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getEventsSummary(periodDays: number): EventsSummary {
  const cutoff = Date.now() - periodDays * 24 * 60 * 60 * 1000;
  const filtered = events.filter(e => new Date(e.created_at).getTime() >= cutoff);
  const byType: Record<EventType, number> = {
    page_view: 0,
    click_servicio: 0,
    click_cotizar: 0,
    cotizacion_confirmada: 0,
  };
  const byService: Record<string, number> = {};
  let cotizacionesConfirmadas = 0;
  filtered.forEach(e => {
    byType[e.event_type]++;
    if (e.event_type === 'cotizacion_confirmada') cotizacionesConfirmadas++;
    if (e.service_id) byService[e.service_id] = (byService[e.service_id] || 0) + 1;
  });
  return { byType, byService, cotizacionesConfirmadas, totalEvents: filtered.length, periodDays };
}

export function getQuoteCountsByStatus(): Record<QuoteStatus, number> {
  const counts: Record<QuoteStatus, number> = { pendiente: 0, en_proceso: 0, ganada: 0, perdida: 0 };
  quotes.forEach(q => { counts[q.status]++; });
  return counts;
}
