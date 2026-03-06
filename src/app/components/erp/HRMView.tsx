import { useCallback, useEffect, useMemo, useState } from 'react';
import { ERPLayout } from '../layout/ERPLayout';
import { HRMTabs } from './HRMTabs';
import { ErpSearchInput } from '../ui/ErpSearchInput';
import { ExportTableButton } from '../ui/ExportTableButton';
import { StatCard } from '../ui/StatCard';
import { Button } from '../ui/button';
import { ErpDataTable } from '../ui/ErpDataTable';
import { AddEmployeeModal } from './AddEmployeeModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import {
    User, UserPlus, Filter, RefreshCw,
    Users, GraduationCap, ShieldCheck, HeadphonesIcon, Trash2
} from 'lucide-react';
import { motion } from 'motion/react';

import { useFilteredList } from '../../hooks/useFilteredList';
import { getEmployees, deleteEmployee } from '../../../api/client';

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

const EMPLOYEE_TYPES = ['Instructor', 'Administrador', 'Asist. Administrativo'];
const DEPARTMENTS = ['Docente', 'Administrativo', 'Dirección'];
const POSITIONS: Record<string, string[]> = {
    'Instructor': ['Instructor Senior', 'Instructor Junior', 'Coordinador de Contenidos'],
    'Administrador': ['Gerente General', 'Jefe de RRHH', 'Coordinador Admin'],
    'Asist. Administrativo': ['Asistente RRHH', 'Asistente Financiero', 'Recepcionista'],
};

const typeIcons: Record<string, React.ElementType> = {
    'Instructor': GraduationCap,
    'Administrador': ShieldCheck,
    'Asist. Administrativo': HeadphonesIcon,
};

const typeColors: Record<string, string> = {
    'Instructor': 'bg-viision-100 text-viision-700',
    'Administrador': 'bg-viision-100 text-viision-700',
    'Asist. Administrativo': 'bg-viision-100 text-viision-700',
};

export function HRMView() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [viewMode, setViewMode] = useState<'gallery' | 'table'>('gallery');

    const loadEmployees = async () => {
        setLoading(true);
        try {
            const data = await getEmployees();
            if (data.success) setEmployees(data.employees);
        } catch {
            toast.error('Error al cargar empleados');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadEmployees(); }, []);

    const handleDeleteEmployee = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este empleado? Esta acción no se puede deshacer y también eliminará su usuario asociado.')) return;

        try {
            const data = await deleteEmployee(id);
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

    const employeeFilter = useCallback((e: Employee, search: string) => {
        const matchSearch = search === '' || e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === 'all' || e.employeeType === filterType;
        const matchStatus = filterStatus === 'all' || e.status === filterStatus;
        return matchSearch && matchType && matchStatus;
    }, [filterType, filterStatus]);
    const { filtered, search, setSearch } = useFilteredList(employees, employeeFilter);

    const rrhhExportColumns = useMemo<{ key: string; label: string; format?: (value: unknown, row: Employee) => string }[]>(
        () => [
            { key: 'name', label: 'Empleado', format: (_v, row) => `${row.name} - ${row.email}` },
            { key: 'employeeType', label: 'Tipo' },
            { key: 'department', label: 'Departamento' },
            { key: 'position', label: 'Puesto', format: (v) => (v as string) || '—' },
            { key: 'hireDate', label: 'Fecha Alta', format: (v) => (v ? new Date(v as string).toLocaleDateString('es-ES') : '—') },
            { key: 'status', label: 'Estado', format: (v, row) => row.mustChangePassword ? 'Clave Temporal' : ((v as string) || '—') },
        ],
        []
    );

    const countByType = (type: string) => employees.filter(e => e.employeeType === type).length;

    return (
        <ERPLayout title="Recursos Humanos" subtitle="Gestión de personal y empleados">
            <HRMTabs />

            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Recursos Humanos</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Gestión de personal y empleados</p>
                </div>
                <div className="flex items-center gap-3">
                    <ExportTableButton
                        columns={rrhhExportColumns}
                        data={filtered}
                        filenamePrefix="personal-rrhh"
                        formats={['csv', 'pdf']}
                        disabled={filtered.length === 0}
                        buttonLabel="Exportar"
                    />
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                        <UserPlus className="w-4 h-4" /> Agregar Empleado
                    </Button>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <StatCard label="Total Personal" sub="Empleados registrados" value={employees.length} icon={Users} layout="valueFirst" iconClassName="w-6 h-6 text-gray-300" labelClassName="font-medium" />
                <StatCard label="Instructores" sub="Equipo docente" value={countByType('Instructor')} icon={GraduationCap} layout="valueFirst" iconClassName="w-6 h-6 text-gray-300" labelClassName="font-medium" />
                <StatCard label="Administradores" sub="Personal administrativo" value={countByType('Administrador')} icon={ShieldCheck} layout="valueFirst" iconClassName="w-6 h-6 text-gray-300" labelClassName="font-medium" />
                <StatCard label="Asist. Admin." sub="Personal de soporte" value={countByType('Asist. Administrativo')} icon={HeadphonesIcon} layout="valueFirst" iconClassName="w-6 h-6 text-gray-300" labelClassName="font-medium" />
            </div>

            {/* View tabs */}
            <div className="flex items-center gap-4 mb-4 border-b border-gray-100 pb-3">
                {['gallery', 'table'].map(mode => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode as 'gallery' | 'table')}
                        className={`text-sm font-medium pb-1 border-b-2 transition-colors ${viewMode === mode ? 'border-viision-600 text-viision-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
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
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm mb-4 card-glow">
                <div className="flex flex-wrap gap-3">
                    <ErpSearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Buscar por nombre, email o puesto..."
                        className="flex-1 min-w-48"
                    />
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los tipos</SelectItem>
                            {EMPLOYEE_TYPES.map(t => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los estados</SelectItem>
                            <SelectItem value="Activo">Activo</SelectItem>
                            <SelectItem value="Inactivo">Inactivo</SelectItem>
                        </SelectContent>
                    </Select>
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
                                className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm card-glow hover:shadow-md transition-shadow text-center"
                            >
                                <div className="w-14 h-14 bg-viision-100 rounded-full flex items-center justify-center mx-auto mb-2 relative">
                                    <span className="text-xl font-bold text-viision-600">{emp.name.charAt(0)}</span>
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
                <ErpDataTable<Employee>
                    keyExtractor={(emp) => emp.id}
                    data={filtered}
                    columns={[
                        {
                            id: 'empleado',
                            label: 'Empleado',
                            render: (emp) => (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-viision-100 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold text-viision-600">{emp.name.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{emp.name}</p>
                                        <p className="text-xs text-gray-400">{emp.email}</p>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            id: 'tipo',
                            label: 'Tipo',
                            render: (emp) => (
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeColors[emp.employeeType] || 'bg-gray-100 text-gray-700'}`}>
                                    {emp.employeeType}
                                </span>
                            ),
                        },
                        { id: 'departamento', label: 'Departamento', render: (emp) => <span className="text-xs text-gray-500">{emp.department}</span> },
                        { id: 'puesto', label: 'Puesto', render: (emp) => <span className="text-xs text-gray-500">{emp.position || '—'}</span> },
                        {
                            id: 'fecha',
                            label: 'Fecha Alta',
                            render: (emp) => <span className="text-xs text-gray-500">{emp.hireDate ? new Date(emp.hireDate).toLocaleDateString('es-ES') : '—'}</span>,
                        },
                        {
                            id: 'estado',
                            label: 'Estado',
                            render: (emp) =>
                                emp.mustChangePassword ? (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Clave Temporal</span>
                                ) : (
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${emp.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {emp.status}
                                    </span>
                                ),
                        },
                    ]}
                    renderRowActions={(emp) => (
                        <button
                            onClick={() => handleDeleteEmployee(emp.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar Empleado"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    emptyMessage="No hay empleados que coincidan con los filtros."
                />
            )}

            <AddEmployeeModal open={showModal} onClose={() => setShowModal(false)} onSuccess={loadEmployees} />
        </ERPLayout>
    );
}
