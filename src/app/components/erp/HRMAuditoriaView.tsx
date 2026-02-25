import { useEffect, useState } from 'react';
import { ERPLayout } from '../layout/ERPLayout';
import { HRMTabs } from './HRMTabs';
import { ShieldCheck, User, RefreshCw, Activity } from 'lucide-react';

const API = 'http://localhost:3001/api';

const HR_ACTIONS = ['EMPLOYEE_REGISTERED', 'PASSWORD_CHANGED', 'USER_REGISTERED', 'EMPLOYEE_DELETED'];

const actionLabels: Record<string, string> = {
    EMPLOYEE_REGISTERED: 'Alta de empleado',
    PASSWORD_CHANGED: 'Cambio de contraseña',
    USER_REGISTERED: 'Registro de usuario',
    EMPLOYEE_DELETED: 'Baja de empleado',
};

export function HRMAuditoriaView() {
    const [audits, setAudits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/audit`);
            const data = await res.json();
            if (data.success && Array.isArray(data.audits)) {
                const hrAudits = data.audits.filter((a: any) => HR_ACTIONS.includes(a.action));
                setAudits(hrAudits);
            } else {
                setAudits([]);
            }
        } catch {
            setAudits([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    return (
        <ERPLayout title="Recursos Humanos" subtitle="Auditoría de acciones de RRHH">
            <HRMTabs />

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Auditoría de Recursos Humanos</h2>
                <button onClick={load} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm card-glow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-viision-50">
                            <Activity className="w-5 h-5 text-viision-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{audits.length}</p>
                            <p className="text-xs text-gray-500">Eventos RRHH</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm card-glow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-50">
                            <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">
                                {new Set(audits.map(a => a.email)).size}
                            </p>
                            <p className="text-xs text-gray-500">Usuarios afectados</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm card-glow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-viision-50">
                            <ShieldCheck className="w-5 h-5 text-viision-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">
                                {audits.filter(a => a.action === 'EMPLOYEE_REGISTERED').length}
                            </p>
                            <p className="text-xs text-gray-500">Altas registradas</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden card-glow">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-viision-600" />
                    <h3 className="text-sm font-bold text-gray-700">Registro de eventos RRHH</h3>
                    <span className="ml-auto text-xs text-gray-400">{audits.length} eventos</span>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Cargando...</div>
                ) : audits.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        <Activity className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                        <p className="text-sm">No hay eventos de RRHH en la auditoría</p>
                        <p className="text-xs mt-1">Las altas, bajas y cambios de contraseña aparecerán aquí.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    {['Fecha y hora', 'Acción', 'Usuario', 'IP'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {audits.map((audit, i) => (
                                    <tr key={audit.id || i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                            {audit.timestamp
                                                ? new Date(audit.timestamp).toLocaleString('es-ES', {
                                                      day: '2-digit',
                                                      month: '2-digit',
                                                      year: 'numeric',
                                                      hour: '2-digit',
                                                      minute: '2-digit',
                                                  })
                                                : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-viision-100 text-viision-700">
                                                {actionLabels[audit.action] || audit.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-700">{audit.email || '—'}</td>
                                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">{audit.ip || '—'}</td>
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
