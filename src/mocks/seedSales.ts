/**
 * Seed para Módulo de Ventas: catálogos, servicios, cotizaciones, eventos.
 * Especificación C.2 y C.3.
 */

import type { ModuleTemplate, Category, Technology, BenefitTemplate, Service, ServiceModule, ServiceTechnology, ServiceBenefit, Quote, QuoteModule, Event } from '../domain/sales/types';

export const seedCategories: Category[] = [
  { id: 'cat_1', name: 'Gestión Empresarial' },
  { id: 'cat_2', name: 'Ventas' },
  { id: 'cat_3', name: 'E-commerce' },
  { id: 'cat_4', name: 'Analítica' },
];

export const seedTechnologies: Technology[] = [
  { id: 'tech_1', name: 'React' },
  { id: 'tech_2', name: 'Node.js' },
  { id: 'tech_3', name: 'PostgreSQL' },
  { id: 'tech_4', name: 'AWS' },
  { id: 'tech_5', name: 'Vue.js' },
  { id: 'tech_6', name: 'Python' },
  { id: 'tech_7', name: 'MongoDB' },
  { id: 'tech_8', name: 'Redis' },
];

export const seedModuleTemplates: ModuleTemplate[] = [
  { id: 'mod_ventas_crm', code: 'ventas_crm', name: 'Ventas / CRM', description: 'Pipeline, contactos, seguimiento, reportes de ventas', precio_estandar: 1200, sort_order: 1 },
  { id: 'mod_financiero', code: 'financiero', name: 'Financiero / Contabilidad', description: 'Cuentas por cobrar y pagar, estados financieros, conciliación', precio_estandar: 1500, sort_order: 2 },
  { id: 'mod_inventarios', code: 'inventarios', name: 'Inventarios', description: 'Stock, almacenes, alertas, trazabilidad', precio_estandar: 1000, sort_order: 3 },
  { id: 'mod_compras', code: 'compras_proveedores', name: 'Compras y proveedores', description: 'Órdenes de compra, proveedores, cotizaciones de compra', precio_estandar: 1100, sort_order: 4 },
  { id: 'mod_rrhh', code: 'rrhh', name: 'Recursos humanos', description: 'Nómina, asistencia, evaluación, reclutamiento', precio_estandar: 1300, sort_order: 5 },
  { id: 'mod_facturacion', code: 'facturacion', name: 'Facturación', description: 'Emisión de comprobantes, series, integración tributaria', precio_estandar: 800, sort_order: 6 },
  { id: 'mod_logistica', code: 'logistica_transporte', name: 'Logística / Transporte', description: 'Rutas, entregas, flota, despacho', precio_estandar: 1400, sort_order: 7 },
  { id: 'mod_ecommerce', code: 'ecommerce_tienda', name: 'E-commerce (tienda)', description: 'Catálogo, carrito, checkout, pedidos online', precio_estandar: 1600, sort_order: 8 },
  { id: 'mod_bi', code: 'bi_reportes', name: 'BI / Reportes', description: 'Dashboards, reportes gerenciales, exportación', precio_estandar: 1000, sort_order: 9 },
];

export const seedBenefitTemplates: BenefitTemplate[] = [
  { id: 'ben_1', text: 'Gestión financiera y contable integrada' },
  { id: 'ben_2', text: 'Control de inventarios en tiempo real' },
  { id: 'ben_3', text: 'Módulo de recursos humanos' },
  { id: 'ben_4', text: 'Reportes y analytics avanzados' },
  { id: 'ben_5', text: 'Pipeline de ventas visual' },
  { id: 'ben_6', text: 'Integración con email y WhatsApp' },
];

const now = new Date().toISOString();
const created = new Date(Date.now() - 5 * 86400000).toISOString();

export const seedServices: Service[] = [
  { id: 'srv_erp', code: 'erp', name: 'Sistema ERP Empresarial', short_description: 'Solución integral para gestión de recursos empresariales.', category_id: 'cat_1', created_at: created, updated_at: now },
  { id: 'srv_crm', code: 'crm', name: 'CRM de Ventas', short_description: 'Gestiona tus relaciones con clientes de manera efectiva.', category_id: 'cat_2', created_at: created, updated_at: now },
  { id: 'srv_ecommerce', code: 'ecommerce', name: 'E-commerce', short_description: 'Tienda online con catálogo, carrito y checkout.', category_id: 'cat_3', created_at: created, updated_at: now },
  { id: 'srv_bi', code: 'bi', name: 'BI y Reportes', short_description: 'Dashboards y reportes gerenciales.', category_id: 'cat_4', created_at: created, updated_at: now },
];

export const seedServiceModules: ServiceModule[] = [
  { service_id: 'srv_erp', module_template_id: 'mod_financiero', sort_order: 1 },
  { service_id: 'srv_erp', module_template_id: 'mod_inventarios', sort_order: 2 },
  { service_id: 'srv_erp', module_template_id: 'mod_rrhh', sort_order: 3 },
  { service_id: 'srv_erp', module_template_id: 'mod_compras', sort_order: 4 },
  { service_id: 'srv_erp', module_template_id: 'mod_ventas_crm', sort_order: 5 },
  { service_id: 'srv_erp', module_template_id: 'mod_facturacion', sort_order: 6 },
  { service_id: 'srv_erp', module_template_id: 'mod_logistica', sort_order: 7 },
  { service_id: 'srv_erp', module_template_id: 'mod_bi', sort_order: 8 },
  { service_id: 'srv_crm', module_template_id: 'mod_ventas_crm', sort_order: 1 },
  { service_id: 'srv_crm', module_template_id: 'mod_bi', sort_order: 2 },
  { service_id: 'srv_crm', module_template_id: 'mod_facturacion', sort_order: 3 },
  { service_id: 'srv_ecommerce', module_template_id: 'mod_ecommerce', sort_order: 1 },
  { service_id: 'srv_ecommerce', module_template_id: 'mod_inventarios', sort_order: 2 },
  { service_id: 'srv_ecommerce', module_template_id: 'mod_facturacion', sort_order: 3 },
  { service_id: 'srv_ecommerce', module_template_id: 'mod_bi', sort_order: 4 },
  { service_id: 'srv_bi', module_template_id: 'mod_bi', sort_order: 1 },
];

export const seedServiceTechnologies: ServiceTechnology[] = [
  { service_id: 'srv_erp', technology_id: 'tech_1', sort_order: 1 },
  { service_id: 'srv_erp', technology_id: 'tech_2', sort_order: 2 },
  { service_id: 'srv_erp', technology_id: 'tech_3', sort_order: 3 },
  { service_id: 'srv_crm', technology_id: 'tech_1', sort_order: 1 },
  { service_id: 'srv_crm', technology_id: 'tech_4', sort_order: 2 },
  { service_id: 'srv_ecommerce', technology_id: 'tech_1', sort_order: 1 },
  { service_id: 'srv_ecommerce', technology_id: 'tech_5', sort_order: 2 },
  { service_id: 'srv_bi', technology_id: 'tech_6', sort_order: 1 },
  { service_id: 'srv_bi', technology_id: 'tech_4', sort_order: 2 },
];

export const seedServiceBenefits: ServiceBenefit[] = [
  { service_id: 'srv_erp', benefit_template_id: 'ben_1', sort_order: 1 },
  { service_id: 'srv_erp', benefit_template_id: 'ben_2', sort_order: 2 },
  { service_id: 'srv_erp', benefit_template_id: 'ben_3', sort_order: 3 },
  { service_id: 'srv_crm', benefit_template_id: 'ben_5', sort_order: 1 },
  { service_id: 'srv_crm', benefit_template_id: 'ben_6', sort_order: 2 },
  { service_id: 'srv_ecommerce', benefit_template_id: 'ben_2', sort_order: 1 },
  { service_id: 'srv_bi', benefit_template_id: 'ben_4', sort_order: 1 },
];

export const seedQuotes: Quote[] = [
  { id: 'quo_1', user_id: 'user_2', service_id: 'srv_erp', message: 'Necesito módulos financiero e inventarios.', status: 'pendiente', total: 2500, observations: null, created_at: new Date(Date.now() - 2 * 86400000).toISOString(), updated_at: now, user_name: 'Wilson', user_email: 'acosta.wp076@gmail.com', user_phone: '910175892', user_company: 'Acosta SAC', service_name: 'Sistema ERP Empresarial', service_code: 'erp' },
  { id: 'quo_2', user_id: 'user_3', service_id: 'srv_erp', message: null, status: 'en_proceso', total: 3800, observations: 'Cliente interesado, enviar propuesta formal.', created_at: new Date(Date.now() - 1 * 86400000).toISOString(), updated_at: now, user_name: 'José Ignacio Hernández', user_email: 'hernandz.j2004@gmail.com', user_phone: '918918147', user_company: 'Tech Solutions', service_name: 'Sistema ERP Empresarial', service_code: 'erp' },
  { id: 'quo_3', user_id: 'user_4', service_id: 'srv_crm', message: 'Solo CRM y facturación.', status: 'ganada', total: 2000, observations: 'Venta cerrada por WhatsApp.', created_at: new Date(Date.now() - 4 * 86400000).toISOString(), updated_at: now, user_name: 'Huaman', user_email: 'isistemas2022@gmail.com', user_phone: '915009603', user_company: null, service_name: 'CRM de Ventas', service_code: 'crm' },
  { id: 'quo_4', user_id: 'user_5', service_id: 'srv_erp', message: 'Cotización para proyecto educativo.', status: 'perdida', total: 5100, observations: 'Presupuesto no aprobado.', created_at: new Date(Date.now() - 7 * 86400000).toISOString(), updated_at: now, user_name: 'Thiago fabian', user_email: 'floresthiagop1@gmail.com', user_phone: '965848073', user_company: 'Instituto XYZ', service_name: 'Sistema ERP Empresarial', service_code: 'erp' },
];

export const seedQuoteModules: QuoteModule[] = [
  { id: 'qm_1', quote_id: 'quo_1', module_template_id: 'mod_financiero', unit_price: 1500, module_name: 'Financiero / Contabilidad', module_code: 'financiero' },
  { id: 'qm_2', quote_id: 'quo_1', module_template_id: 'mod_inventarios', unit_price: 1000, module_name: 'Inventarios', module_code: 'inventarios' },
  { id: 'qm_3', quote_id: 'quo_2', module_template_id: 'mod_financiero', unit_price: 1500, module_name: 'Financiero / Contabilidad', module_code: 'financiero' },
  { id: 'qm_4', quote_id: 'quo_2', module_template_id: 'mod_inventarios', unit_price: 1000, module_name: 'Inventarios', module_code: 'inventarios' },
  { id: 'qm_5', quote_id: 'quo_2', module_template_id: 'mod_rrhh', unit_price: 1300, module_name: 'Recursos humanos', module_code: 'rrhh' },
  { id: 'qm_6', quote_id: 'quo_3', module_template_id: 'mod_ventas_crm', unit_price: 1200, module_name: 'Ventas / CRM', module_code: 'ventas_crm' },
  { id: 'qm_7', quote_id: 'quo_3', module_template_id: 'mod_facturacion', unit_price: 800, module_name: 'Facturación', module_code: 'facturacion' },
  { id: 'qm_8', quote_id: 'quo_4', module_template_id: 'mod_financiero', unit_price: 1500, module_name: 'Financiero / Contabilidad', module_code: 'financiero' },
  { id: 'qm_9', quote_id: 'quo_4', module_template_id: 'mod_inventarios', unit_price: 1000, module_name: 'Inventarios', module_code: 'inventarios' },
  { id: 'qm_10', quote_id: 'quo_4', module_template_id: 'mod_rrhh', unit_price: 1300, module_name: 'Recursos humanos', module_code: 'rrhh' },
  { id: 'qm_11', quote_id: 'quo_4', module_template_id: 'mod_facturacion', unit_price: 800, module_name: 'Facturación', module_code: 'facturacion' },
];

const eventDates = [
  new Date(Date.now() - 0 * 86400000).toISOString(),
  new Date(Date.now() - 1 * 86400000).toISOString(),
  new Date(Date.now() - 2 * 86400000).toISOString(),
];

export const seedEvents: Event[] = [
  { id: 'ev_1', session_id: 's1', user_id: null, event_type: 'page_view', page_path: '/servicios', service_id: null, metadata: null, created_at: eventDates[0] },
  { id: 'ev_2', session_id: 's1', user_id: null, event_type: 'click_servicio', page_path: '/servicios/erp', service_id: 'srv_erp', metadata: null, created_at: eventDates[0] },
  { id: 'ev_3', session_id: 's1', user_id: 'user_2', event_type: 'click_cotizar', page_path: '/servicios/erp', service_id: 'srv_erp', metadata: null, created_at: eventDates[0] },
  { id: 'ev_4', session_id: 's1', user_id: 'user_2', event_type: 'cotizacion_confirmada', page_path: '/servicios/erp', service_id: 'srv_erp', metadata: { quote_id: 'quo_1' }, created_at: eventDates[0] },
  { id: 'ev_5', session_id: 's2', user_id: null, event_type: 'page_view', page_path: '/servicios', service_id: null, metadata: null, created_at: eventDates[1] },
  { id: 'ev_6', session_id: 's2', user_id: null, event_type: 'click_servicio', page_path: '/servicios/crm', service_id: 'srv_crm', metadata: null, created_at: eventDates[1] },
  { id: 'ev_7', session_id: 's3', user_id: 'user_3', event_type: 'cotizacion_confirmada', page_path: '/servicios/erp', service_id: 'srv_erp', metadata: { quote_id: 'quo_2' }, created_at: eventDates[2] },
  { id: 'ev_8', session_id: 's4', user_id: null, event_type: 'click_cotizar', page_path: '/servicios/ecommerce', service_id: 'srv_ecommerce', metadata: null, created_at: eventDates[2] },
];
