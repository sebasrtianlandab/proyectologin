/**
 * Capa de datos mock para Módulo de Ventas.
 * Fuente única para cotizaciones, eventos, servicios y catálogos.
 */

import type { Quote, QuoteModule, QuoteStatus, Event, EventsSummary, EventType, Service, ServiceModule, ServiceTechnology, ServiceBenefit, ModuleTemplate, Category, Technology, BenefitTemplate, QuoteFilters } from '../domain/sales/types';
import {
  seedCategories,
  seedTechnologies,
  seedModuleTemplates,
  seedBenefitTemplates,
  seedServices,
  seedServiceModules,
  seedServiceTechnologies,
  seedServiceBenefits,
  seedQuotes,
  seedQuoteModules,
  seedEvents,
} from './seedSales';

const categories = JSON.parse(JSON.stringify(seedCategories)) as Category[];
const technologies = JSON.parse(JSON.stringify(seedTechnologies)) as Technology[];
const moduleTemplates = JSON.parse(JSON.stringify(seedModuleTemplates)) as ModuleTemplate[];
const benefitTemplates = JSON.parse(JSON.stringify(seedBenefitTemplates)) as BenefitTemplate[];
const services = JSON.parse(JSON.stringify(seedServices)) as Service[];
const serviceModules = JSON.parse(JSON.stringify(seedServiceModules)) as ServiceModule[];
const serviceTechnologies = JSON.parse(JSON.stringify(seedServiceTechnologies)) as ServiceTechnology[];
const serviceBenefits = JSON.parse(JSON.stringify(seedServiceBenefits)) as ServiceBenefit[];
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

export interface ServiceWithDetails extends Service {
  modules: { module_template_id: string; sort_order: number; module?: ModuleTemplate }[];
  technology_ids: string[];
  benefit_ids: string[];
}

export function getServiceWithDetails(serviceId: string): ServiceWithDetails | null {
  const service = services.find(s => s.id === serviceId);
  if (!service) return null;
  const mods = serviceModules
    .filter(sm => sm.service_id === serviceId)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(sm => ({
      module_template_id: sm.module_template_id,
      sort_order: sm.sort_order,
      module: moduleTemplates.find(m => m.id === sm.module_template_id),
    }));
  const techIds = serviceTechnologies
    .filter(st => st.service_id === serviceId)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(st => st.technology_id);
  const benefitIds = serviceBenefits
    .filter(sb => sb.service_id === serviceId)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(sb => sb.benefit_template_id);
  return { ...service, modules: mods, technology_ids: techIds, benefit_ids: benefitIds };
}

export interface UpdateServicePayload {
  name: string;
  short_description: string;
  category_id: string;
  module_template_ids: string[];
  technology_ids: string[];
  benefit_ids: string[];
}

export function updateService(serviceId: string, payload: UpdateServicePayload): boolean {
  const idx = services.findIndex(s => s.id === serviceId);
  if (idx === -1) return false;
  services[idx].name = payload.name;
  services[idx].short_description = payload.short_description;
  services[idx].category_id = payload.category_id;
  services[idx].updated_at = new Date().toISOString();
  serviceModules.splice(0, serviceModules.length, ...serviceModules.filter(sm => sm.service_id !== serviceId));
  payload.module_template_ids.forEach((id, i) => {
    serviceModules.push({ service_id: serviceId, module_template_id: id, sort_order: i + 1 });
  });
  serviceTechnologies.splice(0, serviceTechnologies.length, ...serviceTechnologies.filter(st => st.service_id !== serviceId));
  payload.technology_ids.forEach((id, i) => {
    serviceTechnologies.push({ service_id: serviceId, technology_id: id, sort_order: i + 1 });
  });
  serviceBenefits.splice(0, serviceBenefits.length, ...serviceBenefits.filter(sb => sb.service_id !== serviceId));
  payload.benefit_ids.forEach((id, i) => {
    serviceBenefits.push({ service_id: serviceId, benefit_template_id: id, sort_order: i + 1 });
  });
  return true;
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
