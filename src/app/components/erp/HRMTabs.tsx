import { NavLink } from 'react-router';
import { getRRHHTabs } from '../../config/nav';

export function HRMTabs() {
    const tabs = getRRHHTabs();
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
