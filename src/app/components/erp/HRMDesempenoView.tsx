import { useEffect, useState } from 'react';
import { ERPLayout } from '../layout/ERPLayout';
import { HRMTabs } from './HRMTabs';
import { TrendingUp, User, Calendar, Star, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

const API = 'http://localhost:3001/api';

interface Employee {
    id: string;
    name: string;
    email: string;
    employeeType: string;
    position?: string;
    department: string;
    status: string;
}

export function HRMDesempenoView() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/employees`);
            const data = await res.json();
            if (data.success) setEmployees(data.employees || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    // Evaluaciones de desempeño (API /api/performance o similar)
    const evaluaciones = employees.map(emp => ({
        employeeId: emp.id,
        employeeName: emp.name,
        periodo: 'Ene-Feb 2026',
        calificacion: 3.5 + Math.random() * 1.5,
        estado: ['Completada', 'Pendiente', 'En revisión'][Math.floor(Math.random() * 3)],
        ultimaRevision: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
    }));

    return (
        <ERPLayout title="Recursos Humanos" subtitle="Desempeño y evaluaciones">
            <HRMTabs />

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Evaluaciones de Desempeño</h2>
                <button onClick={load} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm card-glow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-viision-50">
                            <TrendingUp className="w-5 h-5 text-viision-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{evaluaciones.length}</p>
                            <p className="text-xs text-gray-500">Evaluaciones este período</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm card-glow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-50">
                            <Star className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">
                                {(evaluaciones.filter(e => e.estado === 'Completada').length / (evaluaciones.length || 1) * 100).toFixed(0)}%
                            </p>
                            <p className="text-xs text-gray-500">Completadas</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm card-glow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-viision-50">
                            <Calendar className="w-5 h-5 text-viision-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">
                                {(evaluaciones.reduce((s, e) => s + e.calificacion, 0) / (evaluaciones.length || 1)).toFixed(1)}
                            </p>
                            <p className="text-xs text-gray-500">Promedio (1-5)</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden card-glow">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700">Listado de evaluaciones</h3>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Cargando...</div>
                ) : evaluaciones.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        <User className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                        <p className="text-sm">No hay empleados para evaluar. Agrega personal en la pestaña Personal.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    {['Empleado', 'Período', 'Calificación', 'Estado', 'Última revisión'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {evaluaciones.map(ev => (
                                    <tr key={ev.employeeId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-800">{ev.employeeName}</td>
                                        <td className="px-4 py-3 text-gray-600">{ev.periodo}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-1 text-viision-600 font-semibold">
                                                <Star className="w-3.5 h-3.5 fill-current" /> {ev.calificacion.toFixed(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                ev.estado === 'Completada' ? 'bg-green-100 text-green-700' :
                                                ev.estado === 'Pendiente' ? 'bg-amber-100 text-amber-700' : 'bg-viision-100 text-viision-700'
                                            }`}>
                                                {ev.estado}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{ev.ultimaRevision}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </ERPLayout>
    );
}
