import React, { useCallback, useEffect, useMemo } from 'react';
import {
    ShieldCheck, User, CheckCircle2, XCircle, RefreshCw,
    AlertCircle, Activity, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { ERPLayout } from '../layout/ERPLayout';
import { ErpSearchInput } from '../ui/ErpSearchInput';
import { ExportTableButton } from '../ui/ExportTableButton';
import { StatCard } from '../ui/StatCard';
import { ErpDataTable } from '../ui/ErpDataTable';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useFilteredList } from '../../hooks/useFilteredList';
import { getAudit } from '../../../api/client';

type AuditRow = { id: string; timestamp?: string; action?: string; email?: string; ip?: string; user_agent?: string; userAgent?: string };

export const AuditView: React.FC = () => {
    const DEFAULT_AUDIT_ERROR = 'No se pudo cargar la auditoría. Comprueba que el servidor esté en marcha (puerto 3001) y VITE_API_URL en .env del ERP.';

    const fetchAudits = async () => {
        const data = await getAudit();
        if (!data.success) {
            const msg = data.message && data.message.length > 0 ? data.message : DEFAULT_AUDIT_ERROR;
            toast.error(msg);
            throw new Error('Audit load failed');
        }
        return data.audits;
    };
    const { data: auditsData, loading, error, refetch } = useAsyncData(fetchAudits, []);
    const audits = auditsData ?? [];

    useEffect(() => {
        if (error) toast.error(DEFAULT_AUDIT_ERROR);
    }, [error]);

    useEffect(() => {
        const interval = setInterval(refetch, 30000);
        return () => clearInterval(interval);
    }, [refetch]);

    const ACTION_LABELS: Record<string, string> = {
        'OTP_VERIFIED_SUCCESS': 'OTP Verificado',
        'LOGIN_SUCCESS_DIRECT': 'Acceso Directo',
        'LOGIN_FAILED': 'Intento Fallido',
        'USER_REGISTERED': 'Registro Usuario',
        'EMPLOYEE_REGISTERED': 'Alta Empleado',
        'PASSWORD_CHANGED': 'Cambio Contraseña',
        'EMPLOYEE_DELETED': 'Baja Empleado',
        'LOGIN_ATTEMPT_SUCCESS_WAITING_OTP': 'Esperando OTP',
    };

    const getActionLabel = (action: string) => ACTION_LABELS[action] ?? action;

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

    const auditFilter = useCallback((a: { email?: string; action?: string; ip?: string }, q: string) =>
        q === '' ||
        (a.email?.toLowerCase().includes(q.toLowerCase()) ?? false) ||
        (a.action?.toLowerCase().includes(q.toLowerCase()) ?? false) ||
        (a.ip?.includes(q) ?? false), []);
    const { filtered, search, setSearch } = useFilteredList(audits, auditFilter);

    const auditExportColumns = useMemo(
        () => [
            { key: 'timestamp', label: 'Fecha y Hora', format: (v: unknown) => v ? new Date(v as string).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—' },
            { key: 'action', label: 'Acción', format: (v: unknown) => getActionLabel(v as string) },
            { key: 'email', label: 'Usuario' },
            { key: 'ip', label: 'IP', format: (v: unknown) => (v as string) || '—' },
            { key: 'userAgent', label: 'Agente', format: (v: unknown) => ((v as string) || '—').split(' ')[0] || '—' },
        ],
        []
    );
    const auditExportData = useMemo(() => filtered.map(a => ({ ...a, userAgent: a.user_agent || a.userAgent })), [filtered]);

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
                        onClick={refetch}
                        disabled={loading}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <ExportTableButton
                        columns={auditExportColumns}
                        data={auditExportData}
                        filenamePrefix="auditoria"
                        formats={['csv', 'pdf']}
                        disabled={filtered.length === 0}
                        buttonLabel="Exportar"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard label="Accesos Exitosos" value={successCount} icon={CheckCircle2} layout="valueFirst" iconWrapperClassName="p-2 rounded-lg text-green-600 bg-green-50" iconClassName="w-4 h-4" />
                <StatCard label="Intentos Fallidos" value={failedCount} icon={XCircle} layout="valueFirst" iconWrapperClassName="p-2 rounded-lg text-red-600 bg-red-50" iconClassName="w-4 h-4" />
                <StatCard label="Registros" value={registeredCount} icon={User} layout="valueFirst" iconWrapperClassName="p-2 rounded-lg text-viision-600 bg-viision-50" iconClassName="w-4 h-4" />
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 shadow-sm card-glow">
                <ErpSearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Buscar por email, acción o IP..."
                    className="max-w-sm"
                />
            </div>

            {/* Table */}
            <ErpDataTable<AuditRow>
                keyExtractor={(a) => a.id}
                data={filtered}
                loading={loading}
                loadingMessage="Cargando registros..."
                title={
                    <>
                        <ShieldCheck className="w-4 h-4 text-viision-600" />
                        <h3 className="text-sm font-bold text-gray-700">Registro de Eventos</h3>
                    </>
                }
                titleRight={`${filtered.length} eventos`}
                emptyState={
                    <div className="text-center py-16 text-gray-400">
                        <Activity className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                        <p className="text-sm">No hay registros de auditoría</p>
                    </div>
                }
                columns={[
                    {
                        id: 'timestamp',
                        label: 'Fecha y Hora',
                        render: (a) => (
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                {a.timestamp ? new Date(a.timestamp).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                            </span>
                        ),
                    },
                    { id: 'action', label: 'Acción', render: (a) => getActionBadge(a.action ?? '') },
                    { id: 'email', label: 'Usuario', render: (a) => <span className="text-xs font-medium text-gray-700">{a.email}</span> },
                    { id: 'ip', label: 'IP', render: (a) => <span className="text-xs text-gray-400 font-mono">{a.ip || '—'}</span> },
                    {
                        id: 'agent',
                        label: 'Agente',
                        render: (a) => <span className="text-xs text-gray-400 max-w-48 truncate block">{(a.user_agent || a.userAgent)?.split(' ')[0] || '—'}</span>,
                    },
                ]}
            />
        </ERPLayout>
    );
};
