import { NavLink } from 'react-router';

const tabs = [
    { path: '/crm/rrhh', label: 'Personal', end: true },
    { path: '/crm/rrhh/desempeno', label: 'Desempeño', end: false },
    { path: '/crm/rrhh/objetivos', label: 'Objetivos', end: false },
    { path: '/crm/rrhh/auditoria', label: 'Auditoría', end: false },
];

export function HRMTabs() {
    return (
        <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-6">
                {tabs.map(({ path, label, end }) => (
                    <NavLink
                        key={path}
                        to={path}
                        end={end}
                        className={({ isActive }) =>
                            `pb-3 text-sm font-medium border-b-2 transition-colors ${
                                isActive ? 'border-viision-600 text-viision-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`
                        }
                    >
                        {label}
                    </NavLink>
                ))}
            </div>
        </div>
    );
}
