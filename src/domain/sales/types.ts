/**
 * Tipos de dominio para el Módulo de Ventas (Cotizaciones, Monitoreo, Servicios).
 * Alineados con la especificación C.3 y flujo plataforma → ERP.
 */

export type QuoteStatus = 'pendiente' | 'en_proceso' | 'ganada' | 'perdida';

export interface ModuleTemplate {
  id: string;
  code: string;
  name: string;
  description: string;
  precio_estandar: number;
  sort_order: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface Technology {
  id: string;
  name: string;
}

export interface BenefitTemplate {
  id: string;
  text: string;
}

export interface Service {
  id: string;
  code: string;
  name: string;
  short_description: string;
  category_id: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceModule {
  service_id: string;
  module_template_id: string;
  sort_order: number;
}

export interface ServiceTechnology {
  service_id: string;
  technology_id: string;
  sort_order: number;
}

export interface ServiceBenefit {
  service_id: string;
  benefit_template_id: string;
  sort_order: number;
}

export interface QuoteModule {
  id: string;
  quote_id: string;
  module_template_id: string;
  unit_price: number;
  module_name?: string;
  module_code?: string;
}

export interface Quote {
  id: string;
  user_id: string;
  service_id: string;
  message: string | null;
  status: QuoteStatus;
  total: number;
  observations: string | null;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  user_company?: string;
  service_name?: string;
  service_code?: string;
  modules?: QuoteModule[];
}

export type EventType = 'page_view' | 'click_servicio' | 'click_cotizar' | 'cotizacion_confirmada';

export interface Event {
  id: string;
  session_id: string | null;
  user_id: string | null;
  event_type: EventType;
  page_path: string | null;
  service_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface EventsSummary {
  byType: Record<EventType, number>;
  byService: Record<string, number>;
  cotizacionesConfirmadas: number;
  totalEvents: number;
  periodDays: number;
}

export interface QuoteFilters {
  serviceId?: string;
  status?: QuoteStatus;
  dateFrom?: string;
  dateTo?: string;
}
