import { useEffect, useState } from 'react';
import { ERPLayout } from '../layout/ERPLayout';
import { useNavigate } from 'react-router';
import {
    Users, UserPlus, ShieldCheck, Activity, CheckCircle2,
    XCircle, ArrowUpRight, RefreshCw, AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';

import { getEmployees, getAudit } from '../../../api/client';

/**
 * Vista resumen: KPIs de RRHH y accesos rápidos a Personal y Auditoría.
 * Sin datos redundantes: el detalle (clave pendiente, log completo) está en RRHH y Auditoría.
 */
export function InternalManagementView() {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState<any[]>([]);
    const [audits, setAudits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const [empData, auditData] = await Promise.all([
                getEmployees(),
                getAudit(),
            ]);
            if (empData.success) setEmployees(empData.employees);
            if (auditData.success) setAudits(auditData.audits);
        } catch {
            // silencioso
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const pendingChange = employees.filter((e: any) => e.mustChangePassword);
    const activeEmployees = employees.filter((e: any) => e.status === 'Activo');
    const inactiveEmployees = employees.filter((e: any) => e.status === 'Inactivo');
    const employeeAudits = audits.filter((a: any) =>
        ['EMPLOYEE_REGISTERED', 'PASSWORD_CHANGED', 'USER_REGISTERED'].includes(a.action)
    );
    const previewAudits = employeeAudits.slice(0, 3);

    const badgeMap: Record<string, string> = {
        'EMPLOYEE_REGISTERED': 'Alta Empleado',
        'PASSWORD_CHANGED': 'Contraseña Cambiada',
        'USER_REGISTERED': 'Registro Usuario',
    };

    return (
        <ERPLayout title="Gestión Interna" subtitle="Resumen de RRHH y accesos rápidos">
            {/* KPIs únicos: solo números de referencia */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Personal', value: employees.length, icon: Users, color: 'text-viision-600 bg-viision-50', sub: 'Empleados registrados' },
                    { label: 'Activos', value: activeEmployees.length, icon: CheckCircle2, color: 'text-green-600 bg-green-50', sub: 'Con acceso al sistema' },
                    { label: 'Inactivos', value: inactiveEmployees.length, icon: XCircle, color: 'text-red-600 bg-red-50', sub: 'Sin acceso activo' },
                    { label: 'Clave Pendiente', value: pendingChange.length, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50', sub: 'Ver detalle en RRHH' },
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

            {/* Accesos rápidos: sin duplicar pantallas completas */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
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
                    title="Actualizar datos"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Vista previa mínima: últimos 3 eventos + enlace a auditoría */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden card-glow"
            >
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-viision-500" />
                        <h3 className="text-sm font-bold text-gray-700">Última actividad</h3>
                        {!loading && (
                            <span className="text-xs text-gray-400">
                                {employeeAudits.length} eventos en auditoría
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => navigate('/audit')}
                        className="text-xs font-medium text-viision-600 hover:underline"
                    >
                        Ver auditoría completa →
                    </button>
                </div>
                <div className="p-4">
                    {loading ? (
                        <p className="text-xs text-gray-400">Cargando...</p>
                    ) : previewAudits.length === 0 ? (
                        <p className="text-xs text-gray-400">Sin actividad reciente. La auditoría completa está en el módulo Auditoría.</p>
                    ) : (
                        <ul className="space-y-2">
                            {previewAudits.map((audit: any) => (
                                <li key={audit.id} className="flex items-center gap-3 text-xs">
                                    <span className="text-gray-400 shrink-0 w-14">
                                        {new Date(audit.timestamp).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="font-medium text-viision-700 shrink-0 w-36">{badgeMap[audit.action] || audit.action}</span>
                                    <span className="text-gray-600 truncate">{audit.email}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </motion.div>
        </ERPLayout>
    );
}
