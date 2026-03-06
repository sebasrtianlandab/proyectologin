/**
 * Configuración única de navegación del ERP.
 * Fuente de verdad para sidebar (ERPLayout), acceso rápido (MainDashboard) y tabs RRHH (HRMTabs).
 */
import type { ComponentType } from 'react';
import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    BarChart3,
    ShoppingCart,
    UserPlus,
    Building2,
} from 'lucide-react';

export interface NavItemChild {
    label: string;
    path: string;
    roles?: string[];
}

export interface NavItem {
    label: string;
    icon: ComponentType<{ className?: string }>;
    path: string;
    children?: NavItemChild[];
    roles?: string[];
}

export interface NavGroup {
    group: string;
    items: NavItem[];
}

/** Grupos e ítems del menú lateral. Misma estructura y orden que antes. */
export const navGroups: NavGroup[] = [
    {
        group: 'PANEL',
        items: [
            { label: 'Inicio', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'user'] },
        ],
    },
    {
        group: 'OPERACIONES',
        items: [
            {
                label: 'Ventas',
                icon: ShoppingCart,
                path: '/ventas',
                roles: ['admin', 'user'],
                children: [
                    { label: 'Cotizaciones', path: '/ventas/cotizaciones' },
                    { label: 'Clientes', path: '/ventas/clientes' },
                    { label: 'Monitoreo', path: '/ventas/monitoreo' },
                    { label: 'Servicios', path: '/ventas/servicios' },
                ],
            },
        ],
    },
    {
        group: 'RECURSOS HUMANOS',
        items: [
            {
                label: 'RRHH',
                icon: Users,
                path: '/crm/rrhh',
                roles: ['admin'],
                children: [
                    { label: 'Personal', path: '/crm/rrhh' },
                    { label: 'Desempeño', path: '/crm/rrhh/desempeno' },
                    { label: 'Objetivos', path: '/crm/rrhh/objetivos' },
                    { label: 'Auditoría RRHH', path: '/crm/rrhh/auditoria' },
                ],
            },
        ],
    },
    {
        group: 'GESTIÓN INTERNA',
        items: [
            { label: 'Gestión Interna', icon: ShieldCheck, path: '/gestion-interna', roles: ['admin'] },
        ],
    },
    {
        group: 'SISTEMA Y SEGURIDAD',
        items: [
            { label: 'Analítica Web', icon: BarChart3, path: '/analytics', roles: ['admin'] },
            { label: 'Auditoría', icon: ShieldCheck, path: '/audit', roles: ['admin'] },
        ],
    },
];

/** Orden y rutas del acceso rápido (Inicio). Ventas apunta a Cotizaciones. */
const QUICK_ACCESS_ORDER: { path: string; label: string; icon: ComponentType<{ className?: string }>; roles: string[] }[] = [
    { path: '/ventas/cotizaciones', label: 'Ventas', icon: ShoppingCart, roles: ['admin', 'user'] },
    { path: '/crm/rrhh', label: 'Recursos Humanos', icon: UserPlus, roles: ['admin'] },
    { path: '/gestion-interna', label: 'Gestión Interna', icon: Building2, roles: ['admin'] },
    { path: '/analytics', label: 'Analítica Web', icon: BarChart3, roles: ['admin'] },
    { path: '/audit', label: 'Auditoría', icon: ShieldCheck, roles: ['admin'] },
];

export function getQuickAccessItems(role: string | undefined) {
    return QUICK_ACCESS_ORDER.filter(
        (item) => !item.roles.length || (role && item.roles.includes(role))
    );
}

/** Tabs de RRHH para HRMTabs: mismo orden y labels que hijos de RRHH en nav. */
export interface RRHHTab {
    path: string;
    label: string;
    end: boolean;
}

export function getRRHHTabs(): RRHHTab[] {
    const rrhh = navGroups
        .flatMap((g) => g.items)
        .find((i) => i.path === '/crm/rrhh' && i.children);
    if (!rrhh?.children) return [];
    return rrhh.children.map((c, i) => ({
        path: c.path,
        label: c.label,
        end: i === 0,
    }));
}
