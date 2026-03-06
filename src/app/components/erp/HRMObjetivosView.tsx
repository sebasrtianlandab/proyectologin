import { useEffect, useState, useMemo } from 'react';
import { ERPLayout } from '../layout/ERPLayout';
import { HRMTabs } from './HRMTabs';
import { Target, User, CheckCircle2, Circle, RefreshCw } from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { getEmployees } from '../../../api/client';

interface Objetivo {
    id: string;
    titulo: string;
    cumplido: boolean;
}

interface Employee {
    id: string;
    name: string;
    email: string;
    employeeType: string;
    department: string;
}

const OBJETIVOS_BASE: Omit<Objetivo, 'cumplido'>[] = [
    { id: '1', titulo: 'Completar certificación del área' },
    { id: '2', titulo: 'Cumplir metas de productividad' },
    { id: '3', titulo: 'Participar en al menos 2 formaciones' },
];

export function HRMObjetivosView() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    // employeeId -> objetivoId -> cumplido (persistido en estado local)
    const [cumplidoByKey, setCumplidoByKey] = useState<Record<string, boolean>>({});

    const load = async () => {
        setLoading(true);
        try {
            const data = await getEmployees();
            if (data.success) setEmployees(data.employees || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const toggleCumplido = (employeeId: string, objetivoId: string) => {
        const key = `${employeeId}:${objetivoId}`;
        setCumplidoByKey(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const getCumplido = (employeeId: string, objetivoId: string) => {
        const key = `${employeeId}:${objetivoId}`;
        if (key in cumplidoByKey) return cumplidoByKey[key];
        const seed = (employeeId + objetivoId).split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 100 / 100;
        return seed > 0.5;
    };

    // Objetivos por empleado con estado interactivo
    const objetivosPorEmpleado = useMemo(() => employees.map(emp => {
        const objetivos: Objetivo[] = OBJETIVOS_BASE.map(o => ({
            ...o,
            cumplido: getCumplido(emp.id, o.id),
        }));
        const cumplidos = objetivos.filter(o => o.cumplido).length;
        const avance = objetivos.length ? Math.round((cumplidos / objetivos.length) * 100) : 0;
        return {
            employeeId: emp.id,
            employeeName: emp.name,
            objetivos,
            avance,
        };
    }), [employees, cumplidoByKey]);

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
                <StatCard layout="iconFirst" value={objetivosPorEmpleado.reduce((s, e) => s + e.objetivos.length, 0)} label="Objetivos totales" icon={Target} iconWrapperClassName="p-2 rounded-lg bg-viision-50" iconClassName="w-5 h-5 text-viision-600" />
                <StatCard layout="iconFirst" value={objetivosPorEmpleado.reduce((s, e) => s + e.objetivos.filter(o => o.cumplido).length, 0)} label="Objetivos cumplidos" icon={CheckCircle2} iconWrapperClassName="p-2 rounded-lg bg-green-50" iconClassName="w-5 h-5 text-green-600" />
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
                                    <button
                                        key={obj.id}
                                        type="button"
                                        onClick={() => toggleCumplido(emp.employeeId, obj.id)}
                                        className="flex items-center gap-3 text-sm w-full text-left rounded-lg py-1 -my-1 hover:bg-gray-50 transition-colors"
                                    >
                                        {obj.cumplido ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                        ) : (
                                            <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                                        )}
                                        <span className={obj.cumplido ? 'text-gray-600 line-through' : 'text-gray-800'}>
                                            {obj.titulo}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </ERPLayout>
    );
}
