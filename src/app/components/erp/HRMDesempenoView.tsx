import { useEffect, useMemo, useState } from 'react';
import { ERPLayout } from '../layout/ERPLayout';
import { HRMTabs } from './HRMTabs';
import { ExportTableButton } from '../ui/ExportTableButton';
import { StatCard } from '../ui/StatCard';
import { ErpDataTable } from '../ui/ErpDataTable';
import { TrendingUp, User, Calendar, Star, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

import { mockGetEmployees } from '../../../mocks/api';

type EvaluacionRow = { employeeId: string; employeeName: string; periodo: string; calificacion: number; estado: string; ultimaRevision: string };

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
            const data = await mockGetEmployees();
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

    const exportColumns = useMemo(
        () => [
            { key: 'employeeName', label: 'Empleado' },
            { key: 'periodo', label: 'Período' },
            { key: 'calificacion', label: 'Calificación', format: (v: unknown) => (v as number).toFixed(1) },
            { key: 'estado', label: 'Estado' },
            { key: 'ultimaRevision', label: 'Última revisión' },
        ],
        []
    );

    return (
        <ERPLayout title="Recursos Humanos" subtitle="Desempeño y evaluaciones">
            <HRMTabs />

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Evaluaciones de Desempeño</h2>
                <div className="flex items-center gap-2">
                    <ExportTableButton
                        columns={exportColumns}
                        data={evaluaciones}
                        filenamePrefix="evaluaciones-desempeno"
                        formats={['csv', 'pdf']}
                        disabled={evaluaciones.length === 0}
                        buttonLabel="Exportar"
                    />
                    <button onClick={load} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <StatCard layout="iconFirst" value={evaluaciones.length} label="Evaluaciones este período" icon={TrendingUp} iconWrapperClassName="p-2 rounded-lg bg-viision-50" iconClassName="w-5 h-5 text-viision-600" />
                <StatCard layout="iconFirst" value={`${(evaluaciones.filter(e => e.estado === 'Completada').length / (evaluaciones.length || 1) * 100).toFixed(0)}%`} label="Completadas" icon={Star} iconWrapperClassName="p-2 rounded-lg bg-green-50" iconClassName="w-5 h-5 text-green-600" />
                <StatCard layout="iconFirst" value={(evaluaciones.reduce((s, e) => s + e.calificacion, 0) / (evaluaciones.length || 1)).toFixed(1)} label="Promedio (1-5)" icon={Calendar} iconWrapperClassName="p-2 rounded-lg bg-viision-50" iconClassName="w-5 h-5 text-viision-600" />
            </div>

            <ErpDataTable<EvaluacionRow>
                keyExtractor={(ev) => ev.employeeId}
                data={evaluaciones}
                loading={loading}
                loadingMessage="Cargando..."
                title={<h3 className="text-sm font-bold text-gray-700">Listado de evaluaciones</h3>}
                emptyState={
                    <div className="p-8 text-center text-gray-400">
                        <User className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                        <p className="text-sm">No hay empleados para evaluar. Agrega personal en la pestaña Personal.</p>
                    </div>
                }
                columns={[
                    { id: 'empleado', label: 'Empleado', render: (ev) => <span className="font-medium text-gray-800">{ev.employeeName}</span> },
                    { id: 'periodo', label: 'Período', render: (ev) => <span className="text-gray-600">{ev.periodo}</span> },
                    {
                        id: 'calificacion',
                        label: 'Calificación',
                        render: (ev) => (
                            <span className="inline-flex items-center gap-1 text-viision-600 font-semibold">
                                <Star className="w-3.5 h-3.5 fill-current" /> {ev.calificacion.toFixed(1)}
                            </span>
                        ),
                    },
                    {
                        id: 'estado',
                        label: 'Estado',
                        render: (ev) => (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                ev.estado === 'Completada' ? 'bg-green-100 text-green-700' :
                                ev.estado === 'Pendiente' ? 'bg-amber-100 text-amber-700' : 'bg-viision-100 text-viision-700'
                            }`}>
                                {ev.estado}
                            </span>
                        ),
                    },
                    { id: 'revision', label: 'Última revisión', render: (ev) => <span className="text-gray-500">{ev.ultimaRevision}</span> },
                ]}
            />
        </ERPLayout>
    );
}
