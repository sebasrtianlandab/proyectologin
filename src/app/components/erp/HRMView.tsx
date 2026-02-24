import { useEffect, useState } from 'react';
import { ERPLayout } from '../layout/ERPLayout';
import { toast } from 'sonner';
import {
    UserPlus, Search, X, User, Mail, Phone, Briefcase,
    Building, Calendar, CheckCircle2, Filter, Download, RefreshCw,
    Users, GraduationCap, Code2, ShieldCheck, HeadphonesIcon, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const API = 'http://localhost:3001/api';

interface Employee {
    id: string;
    name: string;
    email: string;
    phone?: string;
    employeeType: string;
    department: string;
    position: string;
    hireDate?: string;
    status: string;
    verified: boolean;
    createdAt: string;
    mustChangePassword?: boolean;
}

const EMPLOYEE_TYPES = ['Instructor', 'Desarrollador', 'Administrador', 'Asist. Administrativo'];
const DEPARTMENTS = ['Desarrollo', 'Docente', 'Administrativo', 'Soporte', 'Dirección'];
const POSITIONS: Record<string, string[]> = {
    'Instructor': ['Instructor Senior', 'Instructor Junior', 'Coordinador de Contenidos'],
    'Desarrollador': ['Frontend Developer', 'Backend Developer', 'Fullstack Developer', 'DevOps'],
    'Administrador': ['Gerente General', 'Jefe de RRHH', 'Coordinador Admin'],
    'Asist. Administrativo': ['Asistente RRHH', 'Asistente Financiero', 'Recepcionista'],
};

const typeIcons: Record<string, React.ElementType> = {
    'Instructor': GraduationCap,
    'Desarrollador': Code2,
    'Administrador': ShieldCheck,
    'Asist. Administrativo': HeadphonesIcon,
};

const typeColors: Record<string, string> = {
    'Instructor': 'bg-blue-100 text-blue-700',
    'Desarrollador': 'bg-purple-100 text-purple-700',
    'Administrador': 'bg-amber-100 text-amber-700',
    'Asist. Administrativo': 'bg-green-100 text-green-700',
};

export function HRMView() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [viewMode, setViewMode] = useState<'gallery' | 'table'>('gallery');
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: '', email: '', phone: '',
        employeeType: 'Instructor', department: 'Docente',
        position: '', hireDate: '', status: 'Activo',
    });

    const loadEmployees = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/employees`);
            const data = await res.json();
            if (data.success) setEmployees(data.employees);
        } catch {
            toast.error('Error al cargar empleados');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadEmployees(); }, []);

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email) return;
        setSaving(true);
        try {
            const res = await fetch(`${API}/employees`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`✅ Empleado registrado exitosamente`, {
                    description: `Se ha enviado una clave de acceso temporal al correo ${form.email}. El empleado deberá cambiarla en su primer inicio de sesión.`,
                    duration: 6000,
                });
                setShowModal(false);
                setForm({ name: '', email: '', phone: '', employeeType: 'Instructor', department: 'Docente', position: '', hireDate: '', status: 'Activo' });
                loadEmployees();
            } else {
                toast.error(data.message || 'Error al registrar empleado');
            }
        } catch {
            toast.error('Error de conexión con el servidor');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteEmployee = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este empleado? Esta acción no se puede deshacer y también eliminará su usuario asociado.')) return;

        try {
            const res = await fetch(`${API}/employees/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Empleado eliminado correctamente');
                loadEmployees();
            } else {
                toast.error(data.message || 'Error al eliminar empleado');
            }
        } catch {
            toast.error('Error de conexión con el servidor');
        }
    };

    const filtered = employees.filter(e => {
        const matchSearch = search === '' || e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === '' || e.employeeType === filterType;
        const matchStatus = filterStatus === '' || e.status === filterStatus;
        return matchSearch && matchType && matchStatus;
    });

    const countByType = (type: string) => employees.filter(e => e.employeeType === type).length;

    return (
        <ERPLayout title="Recursos Humanos" subtitle="Gestión de personal y empleados">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <div className="flex gap-6">
                    {['Personal', 'Desempeño', 'Objetivos', 'Auditoría'].map((tab, i) => (
                        <button key={tab} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${i === 0 ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Recursos Humanos</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Gestión de personal y empleados</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4" /> Exportar
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <UserPlus className="w-4 h-4" /> Agregar Empleado
                    </button>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                {[
                    { label: 'Total Personal', value: employees.length, icon: Users, sub: 'Empleados registrados' },
                    { label: 'Instructores', value: countByType('Instructor'), icon: GraduationCap, sub: 'Equipo docente' },
                    { label: 'Desarrolladores', value: countByType('Desarrollador'), icon: Code2, sub: 'Equipo técnico' },
                    { label: 'Administradores', value: countByType('Administrador'), icon: ShieldCheck, sub: 'Personal administrativo' },
                    { label: 'Asist. Admin.', value: countByType('Asist. Administrativo'), icon: HeadphonesIcon, sub: 'Personal de soporte' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                <p className="text-xs font-medium text-gray-500 mt-1">{stat.label}</p>
                                <p className="text-[10px] text-gray-400">{stat.sub}</p>
                            </div>
                            <stat.icon className="w-6 h-6 text-gray-300" />
                        </div>
                    </div>
                ))}
            </div>

            {/* View tabs */}
            <div className="flex items-center gap-4 mb-4 border-b border-gray-100 pb-3">
                {['gallery', 'table'].map(mode => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode as 'gallery' | 'table')}
                        className={`text-sm font-medium pb-1 border-b-2 transition-colors ${viewMode === mode ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        {mode === 'gallery' ? 'Galería de Fotos' : 'Tabla Detallada'}
                    </button>
                ))}
                <div className="ml-auto">
                    <button onClick={loadEmployees} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm mb-4">
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-48">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por nombre, email o puesto..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-600"
                    >
                        <option value="">Todos los tipos</option>
                        {EMPLOYEE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-600"
                    >
                        <option value="">Todos los estados</option>
                        <option>Activo</option>
                        <option>Inactivo</option>
                    </select>
                </div>
            </div>

            {/* Employee list */}
            {loading ? (
                <div className="text-center py-20 text-gray-400 text-sm">Cargando empleados...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                    <p className="text-sm font-medium">No hay empleados registrados</p>
                    <p className="text-xs mt-1">Haz clic en "Agregar Empleado" para comenzar</p>
                </div>
            ) : viewMode === 'gallery' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filtered.map((emp, i) => {
                        const TypeIcon = typeIcons[emp.employeeType] || User;
                        const badgeColor = typeColors[emp.employeeType] || 'bg-gray-100 text-gray-700';
                        return (
                            <motion.div
                                key={emp.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.04 }}
                                className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow text-center"
                            >
                                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 relative">
                                    <span className="text-xl font-bold text-blue-600">{emp.name.charAt(0)}</span>
                                    {emp.status === 'Activo' && (
                                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></span>
                                    )}
                                </div>
                                <p className="text-sm font-semibold text-gray-800 truncate">{emp.name}</p>
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${badgeColor}`}>
                                    <TypeIcon className="w-2.5 h-2.5" /> {emp.employeeType}
                                </span>
                                <p className="text-[10px] text-gray-400 mt-1 truncate">{emp.position || emp.department}</p>
                                <p className={`text-[10px] truncate ${emp.mustChangePassword ? 'text-amber-600 font-bold' : (emp.status === 'Activo' ? 'text-green-600 font-medium' : 'text-gray-400')}`}>
                                    {emp.mustChangePassword ? 'Pendiente Cambio Clave' : emp.status}
                                </p>
                                <div className="mt-3 pt-3 border-t border-gray-50 flex justify-center">
                                    <button
                                        onClick={() => handleDeleteEmployee(emp.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Eliminar Empleado"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {['Empleado', 'Tipo', 'Departamento', 'Puesto', 'Fecha Alta', 'Estado', ''].map(h => (
                                    <th key={h} className={`px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider ${h === '' ? 'text-right' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(emp => {
                                const badgeColor = typeColors[emp.employeeType] || 'bg-gray-100 text-gray-700';
                                return (
                                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-bold text-blue-600">{emp.name.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{emp.name}</p>
                                                    <p className="text-xs text-gray-400">{emp.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>{emp.employeeType}</span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{emp.department}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{emp.position || '—'}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString('es-ES') : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {emp.mustChangePassword ? (
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                                                    Clave Temporal
                                                </span>
                                            ) : (
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${emp.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {emp.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleDeleteEmployee(emp.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar Empleado"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal: Agregar Empleado */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                        onClick={e => e.target === e.currentTarget && setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">Agregar Nuevo Empleado</h2>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleAddEmployee} className="p-6 space-y-5">
                                {/* Información del Usuario */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
                                        Información del Usuario
                                    </h3>
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
                                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="text-xs font-medium text-gray-600 mb-1 block">Correo Electrónico *</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                                <input
                                                    required type="email"
                                                    placeholder="juan.perez@empresa.com"
                                                    value={form.email}
                                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
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
                                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Información Laboral */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
                                        Información Laboral
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-medium text-gray-600 mb-1 block">Tipo de Empleado *</label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                                <select
                                                    required
                                                    value={form.employeeType}
                                                    onChange={e => setForm({ ...form, employeeType: e.target.value, position: '' })}
                                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none appearance-none bg-white"
                                                >
                                                    {EMPLOYEE_TYPES.map(t => <option key={t}>{t}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-600 mb-1 block">Departamento</label>
                                            <div className="relative">
                                                <Building className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                                <select
                                                    value={form.department}
                                                    onChange={e => setForm({ ...form, department: e.target.value })}
                                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none appearance-none bg-white"
                                                >
                                                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-600 mb-1 block">Puesto / Posición</label>
                                            <select
                                                value={form.position}
                                                onChange={e => setForm({ ...form, position: e.target.value })}
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none appearance-none bg-white"
                                            >
                                                <option value="">Seleccionar puesto</option>
                                                {(POSITIONS[form.employeeType] || []).map(p => <option key={p}>{p}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-600 mb-1 block">Fecha de Contratación</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="date"
                                                    value={form.hireDate}
                                                    onChange={e => setForm({ ...form, hireDate: e.target.value })}
                                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-600 mb-1 block">Estado *</label>
                                            <select
                                                value={form.status}
                                                onChange={e => setForm({ ...form, status: e.target.value })}
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none appearance-none bg-white"
                                            >
                                                <option>Activo</option>
                                                <option>Inactivo</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Info clave temporal */}
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                    <p className="text-xs text-blue-600">
                                        Se generará automáticamente una <strong>clave temporal</strong> y se enviará al correo del empleado. En su primer acceso, deberá cambiarla obligatoriamente.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2.5 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-60 flex items-center justify-center gap-2"
                                    >
                                        {saving ? (
                                            <><RefreshCw className="w-4 h-4 animate-spin" /> Procesando...</>
                                        ) : (
                                            <><UserPlus className="w-4 h-4" /> Agregar Empleado</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ERPLayout>
    );
}
