import React from 'react';

export interface ErpDataTableColumn<T> {
    id: string;
    label: string;
    align?: 'left' | 'right' | 'center';
    render: (row: T) => React.ReactNode;
}

export interface ErpDataTableProps<T> {
    columns: ErpDataTableColumn<T>[];
    data: T[];
    keyExtractor: (row: T) => string;
    /** Optional row actions (e.g. delete button), rendered in an extra column. */
    renderRowActions?: (row: T) => React.ReactNode;
    emptyMessage?: React.ReactNode;
    className?: string;
    /** Optional header row above the table (e.g. title + count). */
    title?: React.ReactNode;
    titleRight?: React.ReactNode;
    /** When true, show loading message instead of table. */
    loading?: boolean;
    loadingMessage?: React.ReactNode;
    /** When data is empty and not loading, show this instead of the default empty row. */
    emptyState?: React.ReactNode;
}

const wrapperClass = 'bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden card-glow';
const tableClass = 'w-full text-sm';
const theadClass = 'bg-gray-50 border-b border-gray-100';
const thClass = 'px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider';
const tbodyClass = 'divide-y divide-gray-50';
const tdClass = 'px-4 py-3';

/**
 * Tabla reutilizable con estilo ERP (card-glow, cabecera gris, filas alternadas).
 */
const headerClass = 'px-5 py-4 border-b border-gray-100 flex items-center gap-2';

export function ErpDataTable<T>({
    columns,
    data,
    keyExtractor,
    renderRowActions,
    emptyMessage = 'No hay datos',
    className = '',
    title,
    titleRight,
    loading = false,
    loadingMessage = 'Cargando...',
    emptyState,
}: ErpDataTableProps<T>) {
    const hasActions = Boolean(renderRowActions);
    const showHeader = title != null || titleRight != null;

    return (
        <div className={`${wrapperClass} ${className}`.trim()}>
            {showHeader && (
                <div className={headerClass}>
                    {title}
                    {titleRight != null && <span className="ml-auto text-xs text-gray-400">{titleRight}</span>}
                </div>
            )}
            {loading ? (
                <div className="text-center py-16 text-gray-400 text-sm">{loadingMessage}</div>
            ) : data.length === 0 && emptyState ? (
                emptyState
            ) : (
            <div className="overflow-x-auto">
            <table className={tableClass}>
                <thead className={theadClass}>
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.id}
                                className={`${thClass} ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}
                            >
                                {col.label}
                            </th>
                        ))}
                        {hasActions && <th key="_actions" className={`${thClass} text-right`} />}
                    </tr>
                </thead>
                <tbody className={tbodyClass}>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + (hasActions ? 1 : 0)} className={`${tdClass} text-center text-gray-400 py-8`}>
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row) => (
                            <tr key={keyExtractor(row)} className="hover:bg-gray-50 transition-colors">
                                {columns.map((col) => (
                                    <td
                                        key={col.id}
                                        className={`${tdClass} ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}
                                    >
                                        {col.render(row)}
                                    </td>
                                ))}
                                {hasActions && (
                                    <td className={`${tdClass} text-right`}>
                                        {renderRowActions!(row)}
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            </div>
            )}
        </div>
    );
}
