import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { AuthController } from '../../../controllers/AuthController';
import { AuthService } from '../../../models/AuthService';
import { toast } from 'sonner';
import {
    LayoutDashboard, Users, ShieldCheck, BarChart3, LogOut,
    ChevronDown, ChevronRight, Menu, X, Globe, Bell, Settings,
    ShoppingCart, Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavItem {
    label: string;
    icon: React.ElementType;
    path: string;
    children?: { label: string; path: string; roles?: string[] }[];
    roles?: string[];
}

const navGroups: { group: string; items: NavItem[] }[] = [
    {
        group: 'PANEL',
        items: [
            { label: 'Inicio', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'user'] },
        ]
    },
    {
        group: 'MÓDULOS DE USUARIO',
        items: [
            { label: 'Ventas', icon: ShoppingCart, path: '/ventas', roles: ['admin', 'user'] },
            { label: 'DevOps', icon: Terminal, path: '/devops', roles: ['admin', 'user'] },
        ]
    },
    {
        group: 'COMERCIAL (CRM)',
        items: [
            {
                label: 'CRM', icon: Users, path: '/crm', roles: ['admin'], children: [
                    { label: 'Recursos Humanos', path: '/crm/rrhh' },
                ]
            }
        ]
    },
    {
        group: 'GESTIÓN INTERNA (RRHH & OPS)',
        items: [
            { label: 'Gestión Interna', icon: ShieldCheck, path: '/gestion-interna', roles: ['admin'] },
        ]
    },
    {
        group: 'SISTEMA Y SEGURIDAD',
        items: [
            { label: 'Analítica Web', icon: BarChart3, path: '/analytics', roles: ['admin'] },
            { label: 'Auditoría', icon: ShieldCheck, path: '/audit', roles: ['admin'] },
        ]
    },
];


interface ERPLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

export function ERPLayout({ children, title, subtitle }: ERPLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const session = AuthService.getSession();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expanded, setExpanded] = useState<string[]>(['/crm']);

    const handleLogout = () => {
        AuthController.logout();
        toast.success('Sesión cerrada exitosamente');
        navigate('/login');
    };

    const toggleExpand = (path: string) => {
        setExpanded(prev =>
            prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
        );
    };

    const isActive = (path: string) => location.pathname === path;
    const isParentActive = (children: { path: string }[]) =>
        children.some(c => location.pathname.startsWith(c.path));

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-20 shadow-sm"
                    >
                        {/* Logo */}
                        <div className="h-16 flex items-center px-5 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 leading-none">ERP System</p>
                                    <p className="text-[10px] text-gray-400">Panel de Administración</p>
                                </div>
                            </div>
                        </div>

                        {/* Nav */}
                        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                            {navGroups
                                .map(group => ({
                                    ...group,
                                    items: group.items.filter(item =>
                                        !item.roles || (session?.role && item.roles.includes(session.role))
                                    )
                                }))
                                .filter(group => group.items.length > 0)
                                .map(group => (
                                    <div key={group.group}>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
                                            {group.group}
                                        </p>
                                        <div className="space-y-0.5">
                                            {group.items.map(item => (
                                                <div key={item.label}>
                                                    <button
                                                        onClick={() => {
                                                            if (item.children) {
                                                                toggleExpand(item.path || '');
                                                            } else {
                                                                navigate(item.path || '/dashboard');
                                                            }
                                                        }}
                                                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-all ${isActive(item.path || '') || (item.children && isParentActive(item.children))
                                                            ? 'bg-blue-50 text-blue-700 font-semibold'
                                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                                                            }`}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <item.icon className="w-4 h-4" />
                                                            {item.label}
                                                        </span>
                                                        {item.children && (
                                                            expanded.includes(item.path || '')
                                                                ? <ChevronDown className="w-3 h-3" />
                                                                : <ChevronRight className="w-3 h-3" />
                                                        )}
                                                    </button>
                                                    {item.children && expanded.includes(item.path || '') && (
                                                        <div className="ml-6 mt-0.5 space-y-0.5">
                                                            {item.children.map(child => (
                                                                <button
                                                                    key={child.path}
                                                                    onClick={() => navigate(child.path)}
                                                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all ${isActive(child.path)
                                                                        ? 'bg-blue-50 text-blue-700 font-semibold'
                                                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                                                        }`}
                                                                >
                                                                    {child.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                        </nav>

                        {/* User footer */}
                        <div className="p-3 border-t border-gray-100">
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {session?.name?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-gray-700 truncate">{session?.name}</p>
                                    <p className="text-[10px] text-gray-400 truncate">{session?.email}</p>
                                </div>
                                <button onClick={handleLogout} title="Cerrar sesión" className="text-gray-400 hover:text-red-500 transition-colors">
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                {/* Top bar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {sidebarOpen ? <X className="w-4 h-4 text-gray-500" /> : <Menu className="w-4 h-4 text-gray-500" />}
                        </button>
                        <div>
                            <h1 className="text-base font-bold text-gray-800">{title}</h1>
                            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                            <Bell className="w-4 h-4 text-gray-500" />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Settings className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
