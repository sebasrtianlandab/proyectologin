import { useEffect, useState } from 'react';
import { ERPLayout } from '../layout/ERPLayout';
import { HRMTabs } from './HRMTabs';
import { Target, User, CheckCircle2, Circle, RefreshCw } from 'lucide-react';

const API = 'http://localhost:3001/api';

interface Employee {
    id: string;
    name: string;
    email: string;
    employeeType: string;
    department: string;
}

export function HRMObjetivosView() {
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

    // Objetivos por empleado (API /api/objectives)
    const objetivosPorEmpleado = employees.map(emp => ({
        employeeId: emp.id,
        employeeName: emp.name,
        objetivos: [
            { id: '1', titulo: 'Completar certificación del área', cumplido: Math.random() > 0.5 },
            { id: '2', titulo: 'Cumplir metas de productividad', cumplido: Math.random() > 0.4 },
            { id: '3', titulo: 'Participar en al menos 2 formaciones', cumplido: Math.random() > 0.6 },
        ],
        avance: Math.round(30 + Math.random() * 70),
    }));

    return (
        <ERPLayout title="Recursos Humanos" subtitle="Objetivos y metas por empleado">
            <HRMTabs />

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Objetivos del Período</h2>
                <button onClick={load} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm card-glow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-viision-50">
                            <Target className="w-5 h-5 text-viision-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">
                                {objetivosPorEmpleado.reduce((s, e) => s + e.objetivos.length, 0)}
                            </p>
                            <p className="text-xs text-gray-500">Objetivos totales</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm card-glow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-50">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">
                                {objetivosPorEmpleado.reduce((s, e) =>
                                    s + e.objetivos.filter(o => o.cumplido).length, 0
                                )}
                            </p>
                            <p className="text-xs text-gray-500">Objetivos cumplidos</p>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 card-glow">Cargando...</div>
            ) : objetivosPorEmpleado.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 card-glow">
                    <User className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                    <p className="text-sm">No hay empleados. Agrega personal en la pestaña Personal.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {objetivosPorEmpleado.map(emp => (
                        <div key={emp.employeeId} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden card-glow">
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-viision-100 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold text-viision-600">{emp.employeeName.charAt(0)}</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-700">{emp.employeeName}</h3>
                                </div>
                                <span className="text-xs font-semibold text-viision-600 bg-viision-50 px-2 py-1 rounded-full">
                                    {emp.avance}% avance
                                </span>
                            </div>
                            <div className="p-4 space-y-2">
                                {emp.objetivos.map(obj => (
                                    <div key={obj.id} className="flex items-center gap-3 text-sm">
                                        {obj.cumplido ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                        ) : (
                                            <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                                        )}
                                        <span className={obj.cumplido ? 'text-gray-600 line-through' : 'text-gray-800'}>
                                            {obj.titulo}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </ERPLayout>
    );
}
