import { useState, useEffect } from 'react';
import { ERPLayout } from '../layout/ERPLayout';
import { ShoppingCart, Users, DollarSign, Package, MousePointerClick, Activity, BarChart3, TrendingUp, Search, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function SalesView() {
    const [events, setEvents] = useState<any[]>([]);
    const [quotes, setQuotes] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'ventas' | 'analitica' | 'cotizaciones'>('ventas');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Cargar eventos
        fetch('http://localhost:3001/api/sales/events')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setEvents(data.events);
                }
            })
            .catch(err => console.error('Error fetching events:', err));

        // Cargar cotizaciones
        fetch('http://localhost:3001/api/sales/quotes')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setQuotes(data.quotes);
                }
            })
            .catch(err => console.error('Error fetching quotes:', err));
    }, []);

    const filteredEvents = events.filter(ev =>
        ev.tipo_evento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.sesion_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ev.detalles?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredQuotes = quotes.filter(q =>
        (q.cliente_nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.cliente_correo || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Cálculos para Gráficos
    const intentByProduct = events.reduce((acc: any, ev) => {
        if (ev.tipo_evento === 'intento_compra') {
            const name = ev.detalles?.nombre || 'Producto';
            acc[name] = (acc[name] || 0) + 1;
        }
        return acc;
    }, {});

    const topProducts = Object.entries(intentByProduct)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 4);

    const stats = [
        { label: 'Ventas Hoy', value: '$12,450', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Pedidos Nuevos', value: '48', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Clientes Potenciales', value: [...new Set(events.map(e => e.detalles?.email || e.sesion_id))].length.toString(), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Interacciones Web', value: events.length.toString(), icon: MousePointerClick, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    return (
        <ERPLayout title="Gestión Comercial" subtitle="Administra tus ventas y analiza el comportamiento de tus clientes">

            {/* TABS DE NAVEGACIÓN SUPERIOR */}
            <div className="flex items-center gap-8 border-b border-gray-100 mb-8 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('ventas')}
                    className={`pb-4 px-2 text-sm font-bold tracking-tight transition-all relative ${activeTab === 'ventas' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Panel de Ventas
                    </div>
                    {activeTab === 'ventas' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                </button>
                <button
                    onClick={() => setActiveTab('cotizaciones')}
                    className={`pb-4 px-2 text-sm font-bold tracking-tight transition-all relative ${activeTab === 'cotizaciones' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <div className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4" /> Cotizaciones
                    </div>
                    {activeTab === 'cotizaciones' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
                </button>
                <button
                    onClick={() => setActiveTab('analitica')}
                    className={`pb-4 px-2 text-sm font-bold tracking-tight transition-all relative ${activeTab === 'analitica' ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" /> Analítica de Clientes
                    </div>
                    {activeTab === 'analitica' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'ventas' ? (
                    <motion.div
                        key="ventas"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                    >
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {stats.map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm card-glow"
                                >
                                    <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                    <p className="text-sm font-medium text-gray-400 mt-1">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Middle Section: Activity & Mini-Reports */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Gráfico de Interés (SIMULADO) */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 card-glow">
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 mb-6 flex items-center justify-between">
                                    <span>Productos más deseados</span>
                                    <Activity className="w-4 h-4 text-purple-600" />
                                </h3>
                                <div className="space-y-6">
                                    {topProducts.length > 0 ? topProducts.map(([name, count]: any, idx) => (
                                        <div key={name} className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                                                <span className="truncate w-2/3">{name}</span>
                                                <span className="text-purple-600">{count} Intentos</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(count / ((topProducts[0][1] as number) || 1)) * 100}%` }}
                                                    className={`h-full ${idx === 0 ? 'bg-purple-600' : 'bg-purple-400'}`}
                                                />
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="h-40 flex items-center justify-center text-xs text-gray-400 italic">
                                            Sin datos de compra aún
                                        </div>
                                    )}
                                </div>
                                <div className="mt-8 pt-6 border-t border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                                    Actualizado en tiempo real
                                </div>
                            </div>

                            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 card-glow">
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 mb-6 flex items-center gap-2">
                                    <MousePointerClick className="w-4 h-4 text-blue-600" /> Actividad Web en Vivo
                                </h3>
                                <div className="space-y-4">
                                    {events.slice(0, 7).map((ev, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-gray-100">
                                            <div className={`w-2 h-2 rounded-full ${ev.tipo_evento === 'intento_compra' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-400'}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-black text-gray-800 uppercase tracking-tighter truncate">
                                                    {ev.tipo_evento.replace('_', ' ')}
                                                </p>
                                                <p className="text-[9px] text-gray-400 font-bold">{new Date(ev.fecha_hora).toLocaleTimeString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest truncate max-w-[120px]">
                                                    {ev.detalles?.email || 'Visitante Anónimo'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : activeTab === 'cotizaciones' ? (
                    <motion.div
                        key="cotizaciones"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 card-glow"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-gray-50">
                            <div>
                                <h3 className="text-2xl font-light text-gray-800 tracking-tight">Registro de Cotizaciones</h3>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1">Gestión de proformas y presupuestos</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">
                                        <th className="py-4 px-6">ID / Fecha</th>
                                        <th className="py-4 px-6">Cliente / Correo</th>
                                        <th className="py-4 px-6">Total</th>
                                        <th className="py-4 px-6">Estado</th>
                                        <th className="py-4 px-6">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredQuotes.map((q, i) => (
                                        <tr key={q.id || i} className="border-b border-gray-50 hover:bg-slate-50 transition-all">
                                            <td className="py-6 px-6">
                                                <div className="flex flex-col text-[10px]">
                                                    <span className="font-black text-gray-800 uppercase">COT-{i + 100}</span>
                                                    <span className="text-gray-400">{new Date(q.creado_en).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-6 font-bold text-[11px] text-stone-700">
                                                {q.cliente_nombre} <br />
                                                <span className="text-[10px] text-gray-400 font-normal">{q.cliente_correo}</span>
                                            </td>
                                            <td className="py-6 px-6 font-black text-stone-900">${q.total}</td>
                                            <td className="py-6 px-6 text-[10px]">
                                                <span className="px-2 py-1 bg-yellow-50 text-yellow-600 border border-yellow-100 font-bold uppercase tracking-tighter">
                                                    {q.estado || 'Pendiente'}
                                                </span>
                                            </td>
                                            <td className="py-6 px-6 text-[10px]">
                                                <button className="text-blue-600 font-bold uppercase hover:underline">Ver Proforma</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredQuotes.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-24 text-center opacity-30">
                                                <p className="text-xs font-black uppercase tracking-widest">No hay cotizaciones registradas</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="analitica"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 card-glow"
                    >
                        {/* Header de la Analítica */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-gray-50">
                            <div>
                                <h3 className="text-2xl font-light text-gray-800 tracking-tight">Registro Maestro de Eventos</h3>
                                <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mt-1">Monitoreo de trazabilidad omnicanal</p>
                            </div>
                            <div className="relative w-full md:w-[350px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" strokeWidth={1.5} />
                                <input
                                    type="text"
                                    placeholder="Buscar por email, sesión o tipo de evento..."
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-none text-xs outline-none focus:ring-1 focus:ring-purple-400 uppercase tracking-widest font-bold placeholder:text-gray-300"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Tabla Avanzada */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">
                                        <th className="py-4 px-6">Marca de Tiempo</th>
                                        <th className="py-4 px-6">Acción</th>
                                        <th className="py-4 px-6">Identidad de Cliente</th>
                                        <th className="py-4 px-6">Sesión ID</th>
                                        <th className="py-4 px-6">Detalles Técnicos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEvents.map((ev, i) => (
                                        <tr key={ev.id || i} className="border-b border-gray-50 hover:bg-slate-50/80 transition-all group">
                                            <td className="py-6 px-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-800">{new Date(ev.fecha_hora).toLocaleDateString()}</span>
                                                    <span className="text-[9px] text-gray-400 font-bold">{new Date(ev.fecha_hora).toLocaleTimeString()}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-6">
                                                <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-tighter ${ev.tipo_evento === 'intento_compra' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    ev.tipo_evento === 'checkout_completado' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                        'bg-gray-50 text-gray-400 border border-gray-100'
                                                    }`}>
                                                    {ev.tipo_evento.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-6 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-none flex items-center justify-center text-[10px] font-bold ${ev.detalles?.email ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                        {ev.detalles?.email ? ev.detalles?.email[0].toUpperCase() : '?'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`text-[11px] font-black uppercase tracking-tight ${ev.detalles?.email ? 'text-blue-700' : 'text-gray-400 italic'}`}>
                                                            {ev.detalles?.email || 'Visitante Desconocido'}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-gray-300 uppercase">
                                                            {ev.detalles?.email ? 'Cliente Verificado' : 'Lead Potencial'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 px-6">
                                                <span className="text-[9px] font-mono text-gray-400 truncate max-w-[100px] block" title={ev.sesion_id}>
                                                    {ev.sesion_id}
                                                </span>
                                            </td>
                                            <td className="py-6 px-6">
                                                {ev.detalles?.producto_id ? (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[11px] font-bold text-purple-600 uppercase tracking-tighter">{ev.detalles.nombre}</span>
                                                        <span className="text-[9px] font-bold text-gray-400">ID: {ev.detalles.producto_id}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                                                        <Activity className="w-3 h-3 opacity-50" /> {ev.detalles?.page?.replace('_', ' ') || 'Sesión General'}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredEvents.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-24 text-center">
                                                <div className="flex flex-col items-center opacity-30">
                                                    <Search size={40} className="mb-4" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">Sin resultados en la trazabilidad</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Sección de Reportes descargables (SIMULADOS) */}
                        <div className="mt-12 flex flex-wrap gap-4 pt-8 border-t border-gray-50">
                            <button className="px-6 py-2 bg-gray-900 text-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-stone-800 transition-all">
                                Exportar Reporte Mensual (PDF)
                            </button>
                            <button className="px-6 py-2 border border-gray-200 text-gray-600 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all">
                                Descargar Dataset CSV
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ERPLayout>
    );
}
