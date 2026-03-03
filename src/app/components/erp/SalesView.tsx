import { useState, useEffect, useMemo } from 'react';
import { ERPLayout } from '../layout/ERPLayout';
import { ShoppingCart, TrendingUp, DollarSign, Package, BarChart2, MousePointerClick, Edit, Trash2, Activity, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

export function SalesView() {
    const [activeTab, setActiveTab] = useState<'monitoring' | 'sales' | 'audit' | 'inventory'>('monitoring');
    const [sales, setSales] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [clicksCount, setClicksCount] = useState(0);
    const [salesByDate, setSalesByDate] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [traffic, setTraffic] = useState<any[]>([]);

    // Form state
    const [newSale, setNewSale] = useState({
        product_id: '',
        customer_email: '',
        quantity: 1,
        total_amount: 0,
        status: 'Completado'
    });

    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        image_url: '',
        category: ''
    });

    const [isAddingProduct, setIsAddingProduct] = useState(false);

    // Load data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [salesRes, prodRes, clicksRes, dateRes, topRes, trafficRes] = await Promise.all([
                    fetch('http://localhost:3001/api/sales'),
                    fetch('http://localhost:3001/api/products'),
                    fetch('http://localhost:3001/api/analytics/product-clicks'),
                    fetch('http://localhost:3001/api/analytics/sales-by-date'),
                    fetch('http://localhost:3001/api/analytics/top-products'),
                    fetch('http://localhost:3001/api/analytics/detailed-traffic')
                ]);

                const salesData = await salesRes.json();
                const prodData = await prodRes.json();
                const clicksData = await clicksRes.json();
                const dateData = await dateRes.json();
                const topData = await topRes.json();
                const trafficData = await trafficRes.json();

                if (salesData.success) setSales(salesData.sales);
                if (prodData.success) setProducts(prodData.products);
                if (clicksData.success) setClicksCount(clicksData.count);
                if (dateData.success) setSalesByDate(dateData.data);
                if (topData.success) setTopProducts(topData.data);
                if (trafficData.success) setTraffic(trafficData.traffic);
            } catch (err) {
                console.error("Error loading sales/products", err);
                toast.error("Error conectando con el servidor");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta venta?')) return;
        try {
            const res = await fetch(`http://localhost:3001/api/sales/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setSales(s => s.filter(sale => sale.id !== id));
                toast.success('Venta eliminada');
            }
        } catch (e) {
            toast.error('Error al eliminar');
        }
    };

    const handleAddSale = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3001/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSale)
            });
            const data = await res.json();
            if (data.success) {
                // Agregar producto mockeado para la tabla temporalmente
                const prod = products.find(p => p.id === newSale.product_id);
                setSales([{ ...data.sale, products: prod }, ...sales]);
                setIsAdding(false);
                toast.success('Venta registrada');
                setNewSale({ product_id: '', customer_email: '', quantity: 1, total_amount: 0, status: 'Completado' });
            } else {
                toast.error(data.error || 'Error al guardar');
            }
        } catch (e) {
            toast.error('Error de conexión');
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3001/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });
            const data = await res.json();
            if (data.success) {
                setProducts([data.product, ...products]);
                setIsAddingProduct(false);
                toast.success('Producto agregado');
                setNewProduct({ name: '', description: '', price: '', image_url: '', category: '' });
            } else {
                toast.error(data.message || 'Error al agregar');
            }
        } catch (e) {
            toast.error('Error de conexión');
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('¿Eliminar este producto? Si tiene ventas asociadas podría causar errores.')) return;
        try {
            const res = await fetch(`http://localhost:3001/api/products/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setProducts(p => p.filter(prod => prod.id !== id));
                toast.success('Producto eliminado');
            } else {
                toast.error(data.message || 'Error al eliminar');
            }
        } catch (e) {
            toast.error('Error de conexión');
        }
    };

    const conversionRate = useMemo(() => {
        if (clicksCount === 0) return 0;
        return ((sales.length / clicksCount) * 100).toFixed(1);
    }, [sales.length, clicksCount]);

    const avgOrderValue = useMemo(() => {
        if (sales.length === 0) return 0;
        const total = sales.reduce((acc, s) => acc + Number(s.total_amount), 0);
        return (total / sales.length).toFixed(2);
    }, [sales]);

    const stats = [
        { label: 'Ingresos Totales', value: `$${sales.reduce((acc, sale) => acc + Number(sale.total_amount), 0).toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Tasa Conversión', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Ticket Promedio', value: `$${avgOrderValue}`, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Clics Landing', value: clicksCount.toString(), icon: MousePointerClick, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <ERPLayout title="Módulo de Ventas" subtitle="Gestión de CRM, Monitoreo Web y Catálogo">
            {/* Tabs Selector */}
            <div className="flex gap-4 mb-8 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('monitoring')}
                    className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'monitoring' ? 'border-viision-600 text-viision-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2"><BarChart2 className="w-4 h-4" /> Monitoreo y Analítica</div>
                </button>
                <button
                    onClick={() => setActiveTab('sales')}
                    className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'sales' ? 'border-viision-600 text-viision-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Gestión de Ventas</div>
                </button>
                <button
                    onClick={() => setActiveTab('audit')}
                    className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'audit' ? 'border-viision-600 text-viision-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2"><MousePointerClick className="w-4 h-4" /> Auditoría de Tráfico</div>
                </button>
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'inventory' ? 'border-viision-600 text-viision-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2"><Package className="w-4 h-4" /> Gestión de Productos</div>
                </button>
            </div>

            {/* TAB 1: MONITORING */}
            {activeTab === 'monitoring' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {stats.map((stat) => (
                            <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm card-glow">
                                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                <p className="text-sm font-medium text-gray-400 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Gráfico de Ventas en el Tiempo */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 card-glow">
                            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-6">
                                <TrendingUp className="w-4 h-4 text-blue-600" /> Histórico de Ingresos
                            </h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesByDate}>
                                        <defs>
                                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => [`$${value}`, 'Ingresos']}
                                        />
                                        <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Gráfico de Top Productos */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 card-glow">
                            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-6">
                                <Package className="w-4 h-4 text-emerald-600" /> Unidades por Producto
                            </h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topProducts} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 10, fill: '#64748b' }} />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                            {topProducts.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Conversión Funnel (Simulado/Basado en Clicks vs Ventas) */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 card-glow lg:col-span-2">
                            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-6">
                                <Activity className="w-4 h-4 text-orange-600" /> Resumen de Conversión
                            </h3>
                            <div className="flex flex-col md:flex-row items-center justify-around gap-8">
                                <div className="h-48 w-48 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Clics sin Venta', value: Math.max(0, clicksCount - sales.length) },
                                                    { name: 'Ventas Cerradas', value: sales.length }
                                                ]}
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                <Cell fill="#f1f5f9" />
                                                <Cell fill="#4f46e5" />
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-2xl font-black text-viision-600">{conversionRate}%</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Conversión</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-8 flex-1 max-w-md">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tráfico Total</p>
                                        <p className="text-3xl font-black text-gray-800">{clicksCount}</p>
                                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-orange-400 w-full"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Conversiones</p>
                                        <p className="text-3xl font-black text-gray-800">{sales.length}</p>
                                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-viision-600" style={{ width: `${conversionRate}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* TAB 2: SALES CRUD */}
            {activeTab === 'sales' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800">Registro de Ventas</h3>
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className="bg-viision-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-viision-700 transition-colors"
                        >
                            {isAdding ? 'Cancelar' : '+ Nueva Venta Manual'}
                        </button>
                    </div>

                    {isAdding && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                            <h4 className="font-bold text-gray-800 mb-4">Registrar Venta</h4>
                            <form onSubmit={handleAddSale} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Producto</label>
                                    <select
                                        required
                                        className="w-full border-gray-200 rounded-lg text-sm"
                                        value={newSale.product_id}
                                        onChange={(e) => {
                                            const p = products.find(x => x.id === e.target.value);
                                            setNewSale({ ...newSale, product_id: e.target.value, total_amount: p ? p.price * newSale.quantity : 0 })
                                        }}
                                    >
                                        <option value="">Seleccione...</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Email Cliente (Opcional)</label>
                                    <input type="email" className="w-full border-gray-200 rounded-lg text-sm" value={newSale.customer_email} onChange={e => setNewSale({ ...newSale, customer_email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Cantidad</label>
                                    <input type="number" min="1" required className="w-full border-gray-200 rounded-lg text-sm" value={newSale.quantity} onChange={e => {
                                        const q = parseInt(e.target.value) || 1;
                                        const p = products.find(x => x.id === newSale.product_id);
                                        setNewSale({ ...newSale, quantity: q, total_amount: p ? p.price * q : 0 });
                                    }} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Monto Total</label>
                                    <input type="number" step="0.01" required className="w-full border-gray-200 rounded-lg text-sm" value={newSale.total_amount} onChange={e => setNewSale({ ...newSale, total_amount: parseFloat(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Estado</label>
                                    <select className="w-full border-gray-200 rounded-lg text-sm" value={newSale.status} onChange={e => setNewSale({ ...newSale, status: e.target.value })}>
                                        <option>Completado</option>
                                        <option>Pendiente</option>
                                        <option>Cancelado</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button type="submit" className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                                        Guardar
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Cargando ventas...</div>
                        ) : sales.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center">
                                <Package className="w-12 h-12 text-gray-300 mb-4" />
                                <p className="text-gray-500">No hay ventas registradas aún.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-gray-100">
                                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Venta</th>
                                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente (Email)</th>
                                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {sales.map((sale) => (
                                            <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4 text-sm text-gray-600 font-mono">{sale.id.split('-')[0]}</td>
                                                <td className="p-4 text-sm text-gray-900 font-medium">{sale.products?.name || 'Producto Eliminado'}</td>
                                                <td className="p-4 text-sm text-gray-600">{sale.customer_email || 'Anónimo'}</td>
                                                <td className="p-4 text-sm text-emerald-600 font-semibold">${sale.total_amount}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${sale.status === 'Completado' ? 'bg-emerald-100 text-emerald-700' :
                                                        sale.status === 'Pendiente' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {sale.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDelete(sale.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* TAB 3: TRAFFIC AUDIT */}
            {activeTab === 'audit' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-orange-500" /> Registro de Actividad en Landing Page
                            </h3>
                            <span className="text-xs text-gray-500 font-medium">Últimos 50 eventos</span>
                        </div>
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Cargando auditoría...</div>
                        ) : traffic.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center">
                                <MousePointerClick className="w-12 h-12 text-gray-300 mb-4" />
                                <p className="text-gray-500">No hay actividad registrada en la landing aún.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white border-b border-gray-100">
                                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Evento</th>
                                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Producto</th>
                                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Usuario / IP</th>
                                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Fecha y Hora</th>
                                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-widest text-right">Origen</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {traffic.map((event) => (
                                            <tr key={event.id} className="hover:bg-slate-50/30 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                                                        <span className="text-sm font-bold text-gray-700">CLIC_PRODUCTO</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-gray-900 font-medium">
                                                    {event.products?.name || 'Producto Desconocido'}
                                                </td>
                                                <td className="p-4 text-sm">
                                                    {event.user_email ? (
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-viision-600 flex items-center gap-1">
                                                                <TrendingUp className="w-3 h-3" /> {event.user_email}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400">Logueado · {event.ip}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-gray-600 text-xs italic">Usuario Anónimo</span>
                                                            <span className="text-[10px] text-gray-400">{event.ip}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 text-sm text-gray-500">
                                                    {new Date(event.clicked_at).toLocaleString('es-ES', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit'
                                                    })}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded uppercase">Landing Page</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* TAB 3: TRAFFIC AUDIT */}
            {activeTab === 'audit' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-orange-500" /> Registro de Actividad en Landing Page
                            </h3>
                            <span className="text-xs text-gray-500 font-medium">Últimos 50 eventos</span>
                        </div>
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Cargando auditoría...</div>
                        ) : traffic.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center">
                                <MousePointerClick className="w-12 h-12 text-gray-300 mb-4" />
                                <p className="text-gray-500">No hay actividad registrada en la landing aún.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white border-b border-gray-100">
                                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Evento</th>
                                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Producto</th>
                                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Usuario / IP</th>
                                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Fecha y Hora</th>
                                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-widest text-right">Origen</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {traffic.map((event) => (
                                            <tr key={event.id} className="hover:bg-slate-50/30 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                                                        <span className="text-sm font-bold text-gray-700">CLIC_PRODUCTO</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-gray-900 font-medium">
                                                    {event.products?.name || 'Producto Desconocido'}
                                                </td>
                                                <td className="p-4 text-sm">
                                                    {event.user_email ? (
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-viision-600 flex items-center gap-1">
                                                                <TrendingUp className="w-3 h-3" /> {event.user_email}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400">Logueado · {event.ip}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-gray-600 text-xs italic">Usuario Anónimo</span>
                                                            <span className="text-[10px] text-gray-400">{event.ip}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 text-sm text-gray-500">
                                                    {new Date(event.clicked_at).toLocaleString('es-ES', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit'
                                                    })}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded uppercase">Landing Page</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
            {/* TAB 4: INVENTORY */}
            {activeTab === 'inventory' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div>
                            <h2 className="text-xl font-black text-gray-900">Inventario de Productos</h2>
                            <p className="text-sm text-gray-500">Agrega, edita o elimina productos de la tienda.</p>
                        </div>
                        <button
                            onClick={() => setIsAddingProduct(!isAddingProduct)}
                            className="bg-viision-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-viision-700 transition-all shadow-lg shadow-viision-600/20"
                        >
                            <Plus className="w-4 h-4" /> {isAddingProduct ? 'Cancelar' : 'Nuevo Producto'}
                        </button>
                    </div>

                    {isAddingProduct && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-8 rounded-2xl shadow-xl border border-viision-100"
                        >
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Package className="w-5 h-5 text-viision-600" /> Registrar Nuevo Producto
                            </h3>
                            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre del Producto</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-viision-500/20 focus:border-viision-500 outline-none transition-all"
                                        placeholder="Ej: Teclado Mecánico RGB"
                                        value={newProduct.name}
                                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Precio ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-viision-500/20 focus:border-viision-500 outline-none transition-all"
                                        placeholder="0.00"
                                        value={newProduct.price}
                                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción</label>
                                    <textarea
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-viision-500/20 focus:border-viision-500 outline-none transition-all h-24"
                                        placeholder="Describe las características principales..."
                                        value={newProduct.description}
                                        onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">URL de Imagen</label>
                                    <input
                                        type="url"
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-viision-500/20 focus:border-viision-500 outline-none transition-all"
                                        placeholder="https://..."
                                        value={newProduct.image_url}
                                        onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-viision-500/20 focus:border-viision-500 outline-none transition-all"
                                        value={newProduct.category}
                                        onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                    >
                                        <option value="">Sin Categoría</option>
                                        <option value="perifericos">Periféricos</option>
                                        <option value="componentes">Componentes</option>
                                        <option value="monitores">Monitores</option>
                                        <option value="laptops">Laptops</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingProduct(false)}
                                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-8 py-2.5 bg-viision-600 text-white rounded-xl text-sm font-bold hover:bg-viision-700 transition-all shadow-lg shadow-viision-600/30"
                                    >
                                        Guardar Producto
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Producto</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categoría</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Precio</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{product.name}</p>
                                                    <p className="text-[10px] text-gray-500 line-clamp-1 max-w-[200px]">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                                {product.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-black text-emerald-600">${Number(product.price).toFixed(2)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 text-gray-400 hover:text-viision-600 transition-colors"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </ERPLayout>
    );
}
