import { useMemo } from 'react';
import { ERPLayout } from '../layout/ERPLayout';
import { HRMTabs } from './HRMTabs';
import { ShieldCheck, User, RefreshCw, Activity } from 'lucide-react';
import { ExportTableButton } from '../ui/ExportTableButton';
import { StatCard } from '../ui/StatCard';
import { ErpDataTable } from '../ui/ErpDataTable';
import { useAsyncData } from '../../hooks/useAsyncData';
import { mockGetAudit } from '../../../mocks/api';

type AuditRow = { id?: string; timestamp?: string; action?: string; email?: string; ip?: string };

const HR_ACTIONS = ['EMPLOYEE_REGISTERED', 'PASSWORD_CHANGED', 'USER_REGISTERED', 'EMPLOYEE_DELETED'];

const actionLabels: Record<string, string> = {
    EMPLOYEE_REGISTERED: 'Alta de empleado',
    PASSWORD_CHANGED: 'Cambio de contraseña',
    USER_REGISTERED: 'Registro de usuario',
    EMPLOYEE_DELETED: 'Baja de empleado',
};

export function HRMAuditoriaView() {
    const loadAudits = async () => {
        const data = await mockGetAudit();
        if (data.success && Array.isArray(data.audits)) {
            return data.audits.filter((a: { action?: string }) => HR_ACTIONS.includes(a.action ?? ''));
        }
        return [];
    };
    const { data: auditsData, loading, refetch } = useAsyncData(loadAudits, []);
    const audits = auditsData ?? [];

    const exportColumns = useMemo(
        () => [
            { key: 'timestamp', label: 'Fecha y hora', format: (v: unknown) => (v ? new Date(v as string).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—') },
            { key: 'action', label: 'Acción', format: (v: unknown) => actionLabels[v as string] || (v as string) },
            { key: 'email', label: 'Usuario' },
            { key: 'ip', label: 'IP', format: (v: unknown) => (v as string) || '—' },
        ],
        []
    );

    return (
        <ERPLayout title="Recursos Humanos" subtitle="Auditoría de acciones de RRHH">
            <HRMTabs />

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Auditoría de Recursos Humanos</h2>
                <div className="flex items-center gap-2">
                    <ExportTableButton
                        columns={exportColumns}
                        data={audits}
                        filenamePrefix="auditoria-rrhh"
                        formats={['csv', 'pdf']}
                        disabled={audits.length === 0}
                        buttonLabel="Exportar"
                    />
                    <button onClick={refetch} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard layout="iconFirst" value={audits.length} label="Eventos RRHH" icon={Activity} iconWrapperClassName="p-2 rounded-lg bg-viision-50" iconClassName="w-5 h-5 text-viision-600" />
                <StatCard layout="iconFirst" value={new Set(audits.map(a => a.email)).size} label="Usuarios afectados" icon={User} iconWrapperClassName="p-2 rounded-lg bg-green-50" iconClassName="w-5 h-5 text-green-600" />
                <StatCard layout="iconFirst" value={audits.filter(a => a.action === 'EMPLOYEE_REGISTERED').length} label="Altas registradas" icon={ShieldCheck} iconWrapperClassName="p-2 rounded-lg bg-viision-50" iconClassName="w-5 h-5 text-viision-600" />
            </div>

            <ErpDataTable<AuditRow>
                keyExtractor={(a) => a.id ?? `${a.email ?? ''}-${a.timestamp ?? ''}`}
                data={audits}
                loading={loading}
                loadingMessage="Cargando..."
                title={
                    <>
                        <ShieldCheck className="w-4 h-4 text-viision-600" />
                        <h3 className="text-sm font-bold text-gray-700">Registro de eventos RRHH</h3>
                    </>
                }
                titleRight={`${audits.length} eventos`}
                emptyState={
                    <div className="p-8 text-center text-gray-400">
                        <Activity className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                        <p className="text-sm">No hay eventos de RRHH en la auditoría</p>
                        <p className="text-xs mt-1">Las altas, bajas y cambios de contraseña aparecerán aquí.</p>
                    </div>
                }
                columns={[
                    {
                        id: 'timestamp',
                        label: 'Fecha y hora',
                        render: (a) => (
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                {a.timestamp ? new Date(a.timestamp).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                            </span>
                        ),
                    },
                    {
                        id: 'action',
                        label: 'Acción',
                        render: (a) => (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-viision-100 text-viision-700">
                                {actionLabels[a.action ?? ''] || a.action}
                            </span>
                        ),
                    },
                    { id: 'email', label: 'Usuario', render: (a) => <span className="font-medium text-gray-700">{a.email || '—'}</span> },
                    { id: 'ip', label: 'IP', render: (a) => <span className="text-xs text-gray-400 font-mono">{a.ip || '—'}</span> },
                ]}
            />
        </ERPLayout>
    );
}
