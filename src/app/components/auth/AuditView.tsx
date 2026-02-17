import React, { useEffect, useState } from 'react';
import {
    ShieldCheck,
    History,
    User,
    Globe,
    Monitor,
    Calendar,
    Search,
    ArrowLeft,
    AlertCircle,
    CheckCircle2,
    XCircle,
    RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export const AuditView: React.FC = () => {
    const navigate = useNavigate();
    const [audits, setAudits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
        } catch (error) {
            console.error('Error fetching audits:', error);
            toast.error('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAudits();
    }, []);

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'OTP_VERIFIED_SUCCESS':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Acceso Exitoso
                    </span>
                );
            case 'LOGIN_FAILED':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        <XCircle className="w-3 h-3 mr-1" /> Intento Fallido
                    </span>
                );
            case 'USER_REGISTERED':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        <User className="w-3 h-3 mr-1" /> Registro Nuevo
                    </span>
                );
            case 'LOGIN_ATTEMPT_SUCCESS_WAITING_OTP':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                        <AlertCircle className="w-3 h-3 mr-1" /> Esperando OTP
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
                        <Activity className="w-3 h-3 mr-1" /> {action}
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-neutral-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-500"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-neutral-900 leading-tight">Módulo de Auditoría</h1>
                                <p className="text-xs text-neutral-500 font-medium">Panel de Control de Seguridad</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchAudits}
                            disabled={loading}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-all text-neutral-500 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <div className="flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Live Logs</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm transition-transform hover:scale-[1.02]">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                <History className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-neutral-500 text-sm font-medium">Eventos Totales</h3>
                        <p className="text-3xl font-bold text-neutral-900 mt-1">{audits.length}</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm transition-transform hover:scale-[1.02]">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-red-50 rounded-xl text-red-600">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-neutral-500 text-sm font-medium">Alertas Críticas</h3>
                        <p className="text-3xl font-bold text-neutral-900 mt-1">
                            {audits.filter(a => a.action === 'LOGIN_FAILED').length}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm transition-transform hover:scale-[1.02]">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-green-50 rounded-xl text-green-600">
                                <Globe className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-neutral-500 text-sm font-medium">IPs Únicas</h3>
                        <p className="text-3xl font-bold text-neutral-900 mt-1">
                            {new Set(audits.map(a => a.ip)).size}
                        </p>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
                        <h2 className="font-bold text-neutral-800 flex items-center gap-2">
                            <Monitor className="w-5 h-5 text-blue-600" />
                            Actividad del Servidor
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-200">
                                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Fecha / Hora</th>
                                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Acción</th>
                                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Usuario / Email</th>
                                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">IP de Origen</th>
                                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Dispositivo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-neutral-400">
                                            Cargando registros...
                                        </td>
                                    </tr>
                                ) : audits.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-neutral-400">
                                            No hay actividad registrada aún.
                                        </td>
                                    </tr>
                                ) : (
                                    audits.map((audit) => (
                                        <tr key={audit.id} className="hover:bg-neutral-50 transition-colors group">
                                            <td className="px-6 py-4 text-sm text-neutral-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-neutral-400" />
                                                    {new Date(audit.timestamp).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getActionBadge(audit.action)}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-neutral-900">
                                                {audit.email}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono text-neutral-500">
                                                {audit.ip}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs text-neutral-400 max-w-[200px] truncate group-hover:whitespace-normal transition-all">
                                                    {audit.userAgent}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

const Activity: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
);
