import { useEffect, useState } from 'react';
import { ERPLayout } from '../layout/ERPLayout';
import { AuthService } from '../../../models/AuthService';
import { useNavigate } from 'react-router';
import {
    Eye, Users, Activity, TrendingUp, ShieldCheck, UserPlus,
    ArrowUpRight, Clock, Zap
} from 'lucide-react';
import { motion } from 'motion/react';

const API = 'http://localhost:3001/api';

export function MainDashboard() {
    const session = AuthService.getSession();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalVisits: 0,
        uniqueSessions: 0,
        registeredUsers: 0,
        recentAudits: [] as any[],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [visitRes, auditRes, usersRes] = await Promise.all([
                    fetch(`${API}/analytics/summary`),
                    fetch(`${API}/audit`),
                    fetch(`${API}/users/count`),
                ]);
                const visitData = await visitRes.json();
                const auditData = await auditRes.json();
                const usersData = await usersRes.json();

                setStats({
                    totalVisits: visitData.totalVisits || 0,
                    uniqueSessions: visitData.uniqueSessions || 0,
                    registeredUsers: usersData.count || 0,
                    recentAudits: auditData.audits?.slice(0, 5) || [],
                });
            } catch {
                // fallback silencioso
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
        // Registrar visita
        fetch(`${API}/analytics/track`, { method: 'POST' }).catch(() => { });
    }, []);

    const kpiColor = 'bg-viision-50 text-viision-600';
    const kpis = [
        { label: 'Total de Visitas', value: stats.totalVisits, icon: Eye, color: kpiColor, trend: '+12%', sub: 'Páginas vistas en el período' },
        { label: 'Sesiones Únicas', value: stats.uniqueSessions, icon: Activity, color: kpiColor, trend: '+8%', sub: 'Visitantes por sesión' },
        { label: 'Usuarios Registrados', value: stats.registeredUsers, icon: Users, color: kpiColor, trend: '+3', sub: 'Usuarios autenticados activos' },
        { label: 'Eventos de Seguridad', value: stats.recentAudits.length, icon: ShieldCheck, color: kpiColor, trend: 'Hoy', sub: 'Logs de auditoría recientes' },
    ];

    const getActionLabel = (action: string) => {
        const map: Record<string, { label: string; color: string }> = {
            'LOGIN_SUCCESS_DIRECT': { label: 'Acceso Directo', color: 'bg-green-100 text-green-700' },
            'LOGIN_FAILED': { label: 'Acceso Fallido', color: 'bg-red-100 text-red-700' },
            'USER_REGISTERED': { label: 'Registro', color: 'bg-viision-100 text-viision-700' },
            'OTP_VERIFIED_SUCCESS': { label: 'OTP Verificado', color: 'bg-green-100 text-green-700' },
        };
        return map[action] || { label: action, color: 'bg-gray-100 text-gray-700' };
    };

    const quickAccessColor = 'text-viision-600 bg-viision-50';
    const quickAccess = [
        { label: 'Recursos Humanos', path: '/crm/rrhh', icon: UserPlus, color: quickAccessColor, roles: ['admin'] },
        { label: 'Analítica Web', path: '/analytics', icon: TrendingUp, color: quickAccessColor, roles: ['admin'] },
        { label: 'Auditoría', path: '/audit', icon: ShieldCheck, color: quickAccessColor, roles: ['admin'] },
        { label: 'Ventas', path: '/ventas', icon: Zap, color: quickAccessColor, roles: ['admin', 'user'] },
        { label: 'DevOps', icon: Zap, path: '/devops', color: quickAccessColor, roles: ['admin', 'user'] },
    ].filter(item => !item.roles || (session?.role && item.roles.includes(session.role)));

    return (
        <ERPLayout title="Inicio" subtitle="Resumen general del sistema">
            {/* Welcome */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    Bienvenido, <span className="text-viision-600">{session?.name}</span> 👋
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {kpis
                    .filter(kpi => kpi.label !== 'Eventos de Seguridad' || session?.role === 'admin')
                    .map((kpi, i) => (
                        <motion.div
                            key={kpi.label}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm card-glow hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-2 rounded-lg ${kpi.color}`}>
                                    <kpi.icon className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-semibold text-green-600 flex items-center gap-0.5">
                                    <ArrowUpRight className="w-3 h-3" /> {kpi.trend}
                                </span>
                            </div>
                            <p className="text-3xl font-bold text-gray-800">{loading ? '—' : kpi.value}</p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">{kpi.label}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{kpi.sub}</p>
                        </motion.div>
                    ))}
            </div>

            {/* Bottom grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Quick access */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm card-glow"
                    >
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-viision-500" /> Acceso Rápido
                    </h3>
                    <div className="space-y-2">
                        {quickAccess.map(item => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-all text-left group"
                            >
                                <div className={`p-1.5 rounded-lg ${item.color}`}>
                                    <item.icon className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-viision-600 transition-colors">{item.label}</span>
                                <ArrowUpRight className="w-3 h-3 text-gray-300 ml-auto group-hover:text-viision-500 transition-colors" />
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Recent audit */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.42 }}
                    className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm card-glow"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" /> Actividad Reciente
                        </h3>
                        <button onClick={() => navigate('/audit')} className="text-xs text-viision-600 hover:underline">Ver todo</button>
                    </div>
                    {loading ? (
                        <p className="text-xs text-gray-400 text-center py-6">Cargando...</p>
                    ) : stats.recentAudits.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-6">No hay actividad reciente</p>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {stats.recentAudits.map((audit: any) => {
                                const badge = getActionLabel(audit.action);
                                return (
                                    <div key={audit.id} className="py-2.5 flex items-center gap-3">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                                        <span className="text-xs text-gray-600 font-medium truncate flex-1">{audit.email}</span>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                            {new Date(audit.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>
        </ERPLayout>
    );
}
