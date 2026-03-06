import { useState } from 'react';
import { User, Mail, Phone, Briefcase, Building, Calendar, CheckCircle2, UserPlus, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { ErpModal } from '../ui/ErpModal';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { mockCreateEmployeeApi } from '../../../mocks/api';

const EMPLOYEE_TYPES = ['Instructor', 'Administrador', 'Asist. Administrativo'];
const DEPARTMENTS = ['Docente', 'Administrativo', 'Dirección'];
const POSITIONS: Record<string, string[]> = {
    'Instructor': ['Instructor Senior', 'Instructor Junior', 'Coordinador de Contenidos'],
    'Administrador': ['Gerente General', 'Jefe de RRHH', 'Coordinador Admin'],
    'Asist. Administrativo': ['Asistente RRHH', 'Asistente Financiero', 'Recepcionista'],
};

const defaultForm = {
    name: '',
    email: '',
    phone: '',
    employeeType: 'Instructor' as const,
    department: 'Docente',
    position: '',
    hireDate: '',
    status: 'Activo' as const,
};

export interface AddEmployeeModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddEmployeeModal({ open, onClose, onSuccess }: AddEmployeeModalProps) {
    const [form, setForm] = useState(defaultForm);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email) return;
        setSaving(true);
        try {
            const data = await mockCreateEmployeeApi(form);
            if (data.success) {
                toast.success(`✅ Empleado registrado exitosamente`, {
                    description: `Se ha enviado una clave de acceso temporal al correo ${form.email}. El empleado deberá cambiarla en su primer inicio de sesión.`,
                    duration: 6000,
                });
                setForm(defaultForm);
                onClose();
                onSuccess();
            } else {
                toast.error(data.message || 'Error al registrar empleado');
            }
        } catch {
            toast.error('Error de conexión con el servidor');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ErpModal open={open} onClose={onClose}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">Agregar Nuevo Empleado</h2>
                <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Cerrar">
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">Información del Usuario</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="text-xs font-medium text-gray-600 mb-1 block">Nombre Completo *</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    placeholder="Ej. Juan Pérez García"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-viision-500/20 focus:border-viision-400"
                                />
                            </div>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="text-xs font-medium text-gray-600 mb-1 block">Correo Electrónico *</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    type="email"
                                    placeholder="juan.perez@empresa.com"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-viision-500/20 focus:border-viision-400"
                                />
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-medium text-gray-600 mb-1 block">Teléfono</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    placeholder="+51 999 999 999"
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-viision-500/20 focus:border-viision-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">Información Laboral</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">Tipo de Empleado *</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                                <Select value={form.employeeType} onValueChange={v => setForm({ ...form, employeeType: v as typeof form.employeeType, position: '' })}>
                                    <SelectTrigger className="w-full pl-9">
                                        <SelectValue placeholder="Tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EMPLOYEE_TYPES.map(t => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">Departamento</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                                <Select value={form.department} onValueChange={v => setForm({ ...form, department: v })}>
                                    <SelectTrigger className="w-full pl-9">
                                        <SelectValue placeholder="Departamento" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DEPARTMENTS.map(d => (
                                            <SelectItem key={d} value={d}>{d}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">Puesto / Posición</label>
                            <Select value={form.position || '__none__'} onValueChange={v => setForm({ ...form, position: v === '__none__' ? '' : v })}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccionar puesto" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">Seleccionar puesto</SelectItem>
                                    {(POSITIONS[form.employeeType] || []).map(p => (
                                        <SelectItem key={p} value={p}>{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">Fecha de Contratación</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    value={form.hireDate}
                                    onChange={e => setForm({ ...form, hireDate: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">Estado *</label>
                            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as 'Activo' | 'Inactivo' })}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Activo">Activo</SelectItem>
                                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="bg-viision-50 border border-viision-100 rounded-lg p-3 flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-viision-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-viision-600">
                        Se generará automáticamente una <strong>clave temporal</strong> y se enviará al correo del empleado. En su primer acceso, deberá cambiarla obligatoriamente.
                    </p>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={saving} className="flex-1">
                        {saving ? (
                            <><RefreshCw className="w-4 h-4 animate-spin" /> Procesando...</>
                        ) : (
                            <><UserPlus className="w-4 h-4" /> Agregar Empleado</>
                        )}
                    </Button>
                </div>
            </form>
        </ErpModal>
    );
}
