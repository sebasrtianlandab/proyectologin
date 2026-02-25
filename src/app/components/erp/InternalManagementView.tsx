import { useEffect, useState } from 'react';
import { ERPLayout } from '../layout/ERPLayout';
import { useNavigate } from 'react-router';
import {
    Users, UserPlus, ShieldCheck, Activity, CheckCircle2,
    XCircle, ArrowUpRight, RefreshCw, AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';

const API = 'http://localhost:3001/api';

export function InternalManagementView() {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState<any[]>([]);
    const [audits, setAudits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const [empRes, auditRes] = await Promise.all([
                fetch(`${API}/employees`),
                fetch(`${API}/audit`),
            ]);
            const empData = await empRes.json();
            const auditData = await auditRes.json();
            if (empData.success) setEmployees(empData.employees);
            if (auditData.success) setAudits(auditData.audits);
        } catch {
            // silencioso
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    // Empleados con contraseña temporal pendiente de cambiar
    const pendingChange = employees.filter(e => e.mustChangePassword);
    const activeEmployees = employees.filter(e => e.status === 'Activo');
    const inactiveEmployees = employees.filter(e => e.status === 'Inactivo');

    // Auditoría reciente de empleados
    const employeeAudits = audits.filter(a =>
        ['EMPLOYEE_REGISTERED', 'PASSWORD_CHANGED', 'USER_REGISTERED'].includes(a.action)
    ).slice(0, 10);

    const badgeMap: Record<string, { label: string; color: string }> = {
        'EMPLOYEE_REGISTERED': { label: 'Alta Empleado', color: 'bg-viision-100 text-viision-700' },
        'PASSWORD_CHANGED': { label: 'Contraseña Cambiada', color: 'bg-viision-100 text-viision-700' },
        'USER_REGISTERED': { label: 'Registro Usuario', color: 'bg-viision-100 text-viision-700' },
    };

    return (
        <ERPLayout title="Gestión Interna (RRHH & Ops)" subtitle="Recursos humanos, soporte al cliente y comunidad">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <div className="flex gap-6">
                    {['Recursos Humanos'].map((tab) => (
                        <button key={tab} className="pb-3 text-sm font-medium border-b-2 border-viision-600 text-viision-600">
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Personal', value: employees.length, icon: Users, color: 'text-viision-600 bg-viision-50', sub: 'Empleados registrados' },
                    { label: 'Activos', value: activeEmployees.length, icon: CheckCircle2, color: 'text-green-600 bg-green-50', sub: 'Con acceso al sistema' },
                    { label: 'Inactivos', value: inactiveEmployees.length, icon: XCircle, color: 'text-red-600 bg-red-50', sub: 'Sin acceso activo' },
                    { label: 'Clave Pendiente', value: pendingChange.length, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50', sub: 'Deben cambiar contraseña' },
                ].map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm card-glow"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className={`p-2 rounded-lg ${kpi.color}`}>
                                <kpi.icon className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{loading ? '—' : kpi.value}</p>
                        <p className="text-xs font-medium text-gray-600 mt-1">{kpi.label}</p>
                        <p className="text-[10px] text-gray-400">{kpi.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => navigate('/crm/rrhh')}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm bg-viision-600 text-white rounded-lg hover:bg-viision-700 transition-colors shadow-sm"
                >
                    <UserPlus className="w-4 h-4" /> Ir a Recursos Humanos
                    <ArrowUpRight className="w-3 h-3" />
                </button>
                <button
                    onClick={() => navigate('/audit')}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <ShieldCheck className="w-4 h-4" /> Ver Auditoría Completa
                </button>
                <button
                    onClick={load}
                    className="p-2.5 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Clave temporal pendiente */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden card-glow"
                >
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <h3 className="text-sm font-bold text-gray-700">Contraseña Temporal Pendiente</h3>
                        {pendingChange.length > 0 && (
                            <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                {pendingChange.length}
                            </span>
                        )}
                    </div>
                    <div className="p-4">
                        {loading ? (
                            <p className="text-xs text-center text-gray-400 py-6">Cargando...</p>
                        ) : pendingChange.length === 0 ? (
                            <div className="text-center py-8">
                                <CheckCircle2 className="w-8 h-8 text-green-200 mx-auto mb-2" />
                                <p className="text-xs text-gray-400">Todos han cambiado su contraseña</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingChange.map(emp => (
                                    <div key={emp.id} className="flex items-center gap-3 p-2 bg-amber-50 rounded-lg border border-amber-100">
                                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-bold text-amber-700">{emp.name?.charAt(0)}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-gray-700 truncate">{emp.name}</p>
                                            <p className="text-[10px] text-gray-400 truncate">{emp.email}</p>
                                        </div>
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-auto" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Últimos eventos RRHH (auditoría) */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.38 }}
                    className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden card-glow"
                >
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-viision-500" />
                            <h3 className="text-sm font-bold text-gray-700">Auditoría de Gestión Interna</h3>
                        </div>
                        <button
                            onClick={() => navigate('/audit')}
                            className="text-xs text-viision-600 hover:underline"
                        >
                            Ver todo
                        </button>
                    </div>
                    {loading ? (
                        <p className="text-xs text-center text-gray-400 py-10">Cargando...</p>
                    ) : employeeAudits.length === 0 ? (
                        <div className="text-center py-10">
                            <Activity className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                            <p className="text-xs text-gray-400">Sin actividad de gestión interna aún</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['Fecha', 'Acción', 'Usuario'].map(h => (
                                            <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {employeeAudits.map(audit => {
                                        const badge = badgeMap[audit.action] || { label: audit.action, color: 'bg-gray-100 text-gray-700' };
                                        return (
                                            <tr key={audit.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                                                    {new Date(audit.timestamp).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.color}`}>
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-600 font-medium truncate max-w-48">
                                                    {audit.email}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </div>
        </ERPLayout>
    );
}
