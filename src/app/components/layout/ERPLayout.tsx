import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { AuthController } from '../../../controllers/AuthController';
import { AuthService } from '../../../models/AuthService';
import { toast } from 'sonner';
import {
    LayoutDashboard, Users, ShieldCheck, BarChart3, LogOut,
    ChevronDown, ChevronRight, Menu, X, Bell, Settings,
    ShoppingCart, Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ShinyText } from '../ui/ShinyText';
import { shouldAnimateSidebar as getShouldAnimateSidebar, markSidebarShown } from './sidebarState';

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
    const shouldAnimateSidebar = getShouldAnimateSidebar();
    useEffect(() => {
        if (sidebarOpen) markSidebarShown();
    }, [sidebarOpen]);

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
        <div className="light min-h-screen bg-background flex">
            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={shouldAnimateSidebar ? { x: -280 } : { x: 0 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="w-64 bg-[#3a4050] border-r border-viision-600/25 flex flex-col fixed h-full z-20 shadow-lg shadow-viision-900/10"
                    >
                        {/* Logo + Marca */}
                        <div className="h-20 flex items-center gap-3 px-4 border-b border-viision-600/20">
                            <img
                                src="/logo/viision-logo.png"
                                alt="VIISION"
                                className="w-10 h-10 object-contain shrink-0"
                            />
                            <div className="min-w-0">
                                <ShinyText
                                    text="VIISION ERP"
                                    speed={5}
                                    className="text-sm font-bold uppercase tracking-wide block leading-tight"
                                />
                                <p className="text-[10px] text-gray-500 mt-0.5">Panel de gestión</p>
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
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-2">
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
                                                            ? 'bg-viision-600/20 text-viision-400 font-semibold border-l-2 border-viision-500'
                                                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
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
                                                                        ? 'bg-viision-600/20 text-viision-400 font-semibold'
                                                                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
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
                        <div className="p-3 border-t border-viision-600/20">
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                                <div className="w-8 h-8 bg-viision-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {session?.name?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-gray-200 truncate">{session?.name}</p>
                                    <p className="text-[10px] text-gray-500 truncate">{session?.email}</p>
                                </div>
                                <button onClick={handleLogout} title="Cerrar sesión" className="text-gray-400 hover:text-red-400 transition-colors">
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
                <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm shadow-viision-600/5">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                        >
                            {sidebarOpen ? <X className="w-4 h-4 text-muted-foreground" /> : <Menu className="w-4 h-4 text-muted-foreground" />}
                        </button>
                        <div>
                            <h1 className="text-base font-bold text-foreground">{title}</h1>
                            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-accent rounded-lg transition-colors relative">
                            <Bell className="w-4 h-4 text-muted-foreground" />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full"></span>
                        </button>
                        <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                            <Settings className="w-4 h-4 text-muted-foreground" />
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
