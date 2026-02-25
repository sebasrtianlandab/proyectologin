import { ERPLayout } from '../layout/ERPLayout';
import { ShoppingCart, TrendingUp, Users, DollarSign, Package, ArrowUpRight, BarChart2 } from 'lucide-react';
import { motion } from 'motion/react';

export function SalesView() {
    const stats = [
        { label: 'Ventas Hoy', value: '$12,450', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Pedidos Nuevos', value: '48', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Clientes Activos', value: '1,204', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Tasa Conversión', value: '3.2%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    return (
        <ERPLayout title="Módulo de Ventas" subtitle="Gestión comercial, pedidos y facturación">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 card-glow">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-blue-600" /> Rendimiento de Ventas
                        </h3>
                        <button className="text-sm text-blue-600 font-bold hover:underline">Ver Reporte</button>
                    </div>
                    <div className="h-64 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center">
                        <p className="text-gray-400 text-sm italic">[ Gráfico de Ventas Mensuales ]</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 card-glow">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Package className="w-5 h-5 text-orange-600" /> Pedidos Recientes
                    </h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                    <ShoppingCart className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 truncate">Pedido #00{45 + i}</p>
                                    <p className="text-xs text-gray-400">Hace {i + 2} horas</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-emerald-600">$450.00</p>
                                    <ArrowUpRight className="w-3 h-3 text-gray-300 ml-auto" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ERPLayout>
    );
}
