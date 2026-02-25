import { useEffect, useState } from 'react';
import { ERPLayout } from '../layout/ERPLayout';
import { Eye, Activity, Users, TrendingUp, RefreshCw, Monitor, Smartphone, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = 'http://localhost:3001/api';

export function AnalyticsView() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('7');

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/analytics/summary?days=${period}`);
            const json = await res.json();
            if (json.success === false) setData(null);
            else setData(json);
        } catch {
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [period]);

    const kpiColor = 'text-viision-600 bg-viision-50';
    const kpis = [
        { label: 'Total de Visitas', value: data?.totalVisits ?? 0, icon: Eye, sub: 'Páginas vistas en el período', color: kpiColor },
        { label: 'Sesiones Únicas', value: data?.uniqueSessions ?? 0, icon: Activity, sub: 'Visitantes por sesión', color: kpiColor },
        { label: 'Usuarios Registrados', value: data?.registeredUsers ?? 0, icon: Users, sub: 'Usuarios autenticados activos', color: kpiColor },
        { label: 'Págs. por Sesión', value: data?.pagesPerSession ?? '0', icon: TrendingUp, sub: 'Promedio de navegación', color: kpiColor },
    ];

    const defaultChartData = Array.from({ length: parseInt(period) || 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - ((parseInt(period) || 7) - 1 - i));
        return {
            date: d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
            visitas: 0,
            sesiones: 0,
        };
    });
    const chartData = (data?.dailyVisits?.length ? data.dailyVisits : null) ?? defaultChartData;

    const defaultTopPages = [
        { path: '/dashboard', views: 0 },
        { path: '/login', views: 0 },
        { path: '/crm/rrhh', views: 0 },
    ];
    const topPages = (data?.topPages?.length ? data.topPages : null) ?? defaultTopPages;

    const devices = data?.devices ?? { desktop: 0, mobile: 0, other: 0 };
    const totalDevices = devices.desktop + devices.mobile + devices.other || 1;

    return (
        <ERPLayout title="Analítica Web" subtitle="Interacciones de usuarios en toda la plataforma">
            {/* Period selector */}
            <div className="flex items-center justify-between mb-6">
                <div />
                <div className="flex items-center gap-2">
                    <button onClick={load} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <select
                        value={period}
                        onChange={e => setPeriod(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none bg-white text-gray-600"
                    >
                        <option value="7">Últimos 7 días</option>
                        <option value="14">Últimos 14 días</option>
                        <option value="30">Últimos 30 días</option>
                    </select>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                {kpis.map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm card-glow"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <p className="text-sm font-semibold text-gray-600">{kpi.label}</p>
                            <div className={`p-2 rounded-lg ${kpi.color}`}>
                                <kpi.icon className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{loading ? '—' : kpi.value}</p>
                        <p className="text-[11px] text-gray-400 mt-1">{kpi.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* Chart */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6 card-glow"
            >
                <h3 className="text-sm font-bold text-gray-700 mb-4">Tráfico en el Tiempo</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6164ff" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#6164ff" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorSesiones" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3413fc" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#3413fc" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)' }}
                            />
                            <Area type="monotone" dataKey="visitas" stroke="#6164ff" strokeWidth={2} fill="url(#colorVisitas)" name="Vistas" />
                            <Area type="monotone" dataKey="sesiones" stroke="#3413fc" strokeWidth={2} fill="url(#colorSesiones)" name="Sesiones" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 mt-2 justify-center">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-0.5 bg-viision-500 inline-block rounded" /> Vistas</span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-0.5 bg-viision-600 inline-block rounded" /> Sesiones</span>
                </div>
            </motion.div>

            {/* Bottom grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Top pages */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.38 }}
                    className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm card-glow"
                >
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" /> Páginas Más Visitadas
                    </h3>
                    <div className="space-y-3">
                        {topPages.map((page: any, i: number) => {
                            const maxViews = Math.max(...topPages.map((p: any) => p.views), 1);
                            return (
                                <div key={page.path}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-600 font-medium">{page.path}</span>
                                        <span className="text-gray-400">{page.views} vistas</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div
                                            className="bg-viision-500 h-1.5 rounded-full transition-all duration-700"
                                            style={{ width: `${(page.views / maxViews) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Devices */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.44 }}
                    className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm card-glow"
                >
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-gray-400" /> Dispositivos
                    </h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Desktop', count: devices.desktop, icon: Monitor, color: 'bg-viision-500' },
                            { label: 'Móvil', count: devices.mobile, icon: Smartphone, color: 'bg-viision-600' },
                            { label: 'Otro', count: devices.other, icon: Globe, color: 'bg-gray-400' },
                        ].map(device => (
                            <div key={device.label} className="flex items-center gap-3">
                                <device.icon className="w-4 h-4 text-gray-400" />
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-600 font-medium">{device.label}</span>
                                        <span className="text-gray-400">{Math.round((device.count / totalDevices) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div
                                            className={`${device.color} h-1.5 rounded-full transition-all duration-700`}
                                            style={{ width: `${(device.count / totalDevices) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </ERPLayout>
    );
}
