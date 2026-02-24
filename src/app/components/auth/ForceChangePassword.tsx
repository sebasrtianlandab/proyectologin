import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { AuthService } from '../../../models/AuthService';

const API = 'http://localhost:3001/api';

export function ForceChangePassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = (location.state as any)?.email || AuthService.getSession()?.email || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const checks = [
        { label: 'Mínimo 8 caracteres', ok: newPassword.length >= 8 },
        { label: 'Al menos una mayúscula', ok: /[A-Z]/.test(newPassword) },
        { label: 'Al menos un número', ok: /[0-9]/.test(newPassword) },
        { label: 'Las contraseñas coinciden', ok: newPassword === confirmPassword && confirmPassword.length > 0 },
    ];

    const allOk = checks.every(c => c.ok);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!allOk) return;
        setLoading(true);
        try {
            const res = await fetch(`${API}/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, newPassword }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success('¡Contraseña actualizada exitosamente!', {
                    description: 'Ya puedes acceder al sistema con tu nueva contraseña.',
                });
                // Actualizar la sesión
                const session = AuthService.getSession();
                if (session) {
                    AuthService.saveSession({ ...session, mustChangePassword: false });
                }
                navigate('/dashboard');
            } else {
                toast.error(data.message || 'Error al cambiar contraseña');
            }
        } catch {
            toast.error('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Cambio de Contraseña</h1>
                        <p className="text-blue-200 text-sm mt-2">Por razones de seguridad, debes crear una nueva contraseña para continuar.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Email (readonly) */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Cuenta</label>
                            <input
                                readOnly
                                value={email}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                            />
                        </div>

                        {/* New password */}
                        <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">Nueva Contraseña *</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    type={showNew ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="w-full pl-9 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                />
                                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Strength Meter */}
                            {newPassword.length > 0 && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Seguridad:</span>
                                        <span className={`text-[10px] font-bold uppercase ${newPassword.length < 5 ? 'text-red-500' :
                                                newPassword.length < 8 ? 'text-orange-500' :
                                                    !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) ? 'text-yellow-600' :
                                                        !/[!@#$%^&*]/.test(newPassword) ? 'text-blue-600' : 'text-emerald-600'
                                            }`}>
                                            {newPassword.length < 5 ? 'Muy débil' :
                                                newPassword.length < 8 ? 'Débil' :
                                                    !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) ? 'Regular' :
                                                        !/[!@#$%^&*]/.test(newPassword) ? 'Segura' : 'Muy segura'}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((step) => {
                                            const score =
                                                (newPassword.length >= 5 ? 1 : 0) +
                                                (newPassword.length >= 8 ? 1 : 0) +
                                                (/[A-Z]/.test(newPassword) ? 1 : 0) +
                                                (/[0-9]/.test(newPassword) ? 1 : 0) +
                                                (/[!@#$%^&*]/.test(newPassword) ? 1 : 0);

                                            const colors = ['bg-gray-200', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500'];
                                            const activeColor = score >= step ? colors[score] : 'bg-gray-100';

                                            return (
                                                <div key={step} className={`h-1 flex-1 rounded-full transition-all duration-500 ${activeColor}`} />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">Confirmar Contraseña *</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className="w-full pl-9 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Checklist */}
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                            {checks.map(check => (
                                <div key={check.label} className="flex items-center gap-2">
                                    <CheckCircle2 className={`w-4 h-4 transition-colors ${check.ok ? 'text-green-500' : 'text-gray-300'}`} />
                                    <span className={`text-xs transition-colors ${check.ok ? 'text-green-700 font-medium' : 'text-gray-400'}`}>
                                        {check.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={!allOk || loading}
                            className="w-full py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Actualizando...' : 'Actualizar Contraseña y Continuar'}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
