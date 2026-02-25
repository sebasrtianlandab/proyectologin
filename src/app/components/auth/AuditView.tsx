import React, { useEffect, useState } from 'react';
import {
    ShieldCheck, User, CheckCircle2, XCircle, RefreshCw,
    AlertCircle, Search, Activity, Download, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { ERPLayout } from '../layout/ERPLayout';

export const AuditView: React.FC = () => {
    const [audits, setAudits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchAudits = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/audit');
            const data = await response.json();
            if (data.success) {
                setAudits(data.audits);
            } else {
                toast.error('No se pudo cargar la auditoría');
            }
        } catch {
            toast.error('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAudits();
        const interval = setInterval(fetchAudits, 30000);
        return () => clearInterval(interval);
    }, []);

    const getActionBadge = (action: string) => {
        const map: Record<string, { label: string; color: string; icon: React.ElementType }> = {
            'OTP_VERIFIED_SUCCESS': { label: 'OTP Verificado', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
            'LOGIN_SUCCESS_DIRECT': { label: 'Acceso Directo', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
            'LOGIN_FAILED': { label: 'Intento Fallido', color: 'bg-red-100 text-red-800', icon: XCircle },
            'USER_REGISTERED': { label: 'Registro Usuario', color: 'bg-viision-100 text-viision-800', icon: User },
            'EMPLOYEE_REGISTERED': { label: 'Alta Empleado', color: 'bg-viision-100 text-viision-800', icon: User },
            'PASSWORD_CHANGED': { label: 'Cambio Contraseña', color: 'bg-viision-100 text-viision-800', icon: ShieldCheck },
            'EMPLOYEE_DELETED': { label: 'Baja Empleado', color: 'bg-red-100 text-red-800', icon: Trash2 },
            'LOGIN_ATTEMPT_SUCCESS_WAITING_OTP': { label: 'Esperando OTP', color: 'bg-viision-100 text-viision-800', icon: AlertCircle },
        };
        const def = map[action] || { label: action, color: 'bg-gray-100 text-gray-700', icon: Activity };
        const Icon = def.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${def.color}`}>
                <Icon className="w-3 h-3" /> {def.label}
            </span>
        );
    };

    // Stats
    const successCount = audits.filter(a => ['OTP_VERIFIED_SUCCESS', 'LOGIN_SUCCESS_DIRECT'].includes(a.action)).length;
    const failedCount = audits.filter(a => a.action === 'LOGIN_FAILED').length;
    const registeredCount = audits.filter(a => ['USER_REGISTERED', 'EMPLOYEE_REGISTERED'].includes(a.action)).length;

    const filtered = audits.filter(a =>
        search === '' ||
        a.email?.toLowerCase().includes(search.toLowerCase()) ||
        a.action?.toLowerCase().includes(search.toLowerCase()) ||
        a.ip?.includes(search)
    );

    return (
        <ERPLayout title="Auditoría" subtitle="Registro de eventos y seguridad del sistema">
            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
                <div />
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-semibold text-green-700">Live · Auto-refresh 30s</span>
                    </div>
                    <button
                        onClick={fetchAudits}
                        disabled={loading}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50">
                        <Download className="w-4 h-4" /> Exportar CSV
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Accesos Exitosos', value: successCount, color: 'text-green-600 bg-green-50', icon: CheckCircle2 },
                    { label: 'Intentos Fallidos', value: failedCount, color: 'text-red-600 bg-red-50', icon: XCircle },
                    { label: 'Registros', value: registeredCount, color: 'text-viision-600 bg-viision-50', icon: User },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm card-glow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                            </div>
                            <div className={`p-2 rounded-lg ${stat.color}`}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 shadow-sm card-glow">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por email, acción o IP..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-viision-500/20"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden card-glow">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-viision-600" />
                    <h3 className="text-sm font-bold text-gray-700">Registro de Eventos</h3>
                    <span className="ml-auto text-xs text-gray-400">{filtered.length} eventos</span>
                </div>
                {loading ? (
                    <div className="text-center py-16 text-gray-400 text-sm">Cargando registros...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <Activity className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                        <p className="text-sm">No hay registros de auditoría</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Fecha y Hora', 'Acción', 'Usuario', 'IP', 'Agente'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((audit) => (
                                    <tr key={audit.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                            {new Date(audit.timestamp).toLocaleString('es-ES', {
                                                day: '2-digit', month: '2-digit', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getActionBadge(audit.action)}
                                        </td>
                                        <td className="px-4 py-3 text-xs font-medium text-gray-700">
                                            {audit.email}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                                            {audit.ip || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-400 max-w-48 truncate">
                                            {(audit.user_agent || audit.userAgent)?.split(' ')[0] || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </ERPLayout>
    );
};
