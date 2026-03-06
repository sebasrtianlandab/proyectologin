import { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, RefreshCw, Mail, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { ErpSearchInput } from '../../ui/ErpSearchInput';
import { ExportTableButton } from '../../ui/ExportTableButton';
import { StatCard } from '../../ui/StatCard';
import { ErpDataTable } from '../../ui/ErpDataTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { useFilteredList } from '../../../hooks/useFilteredList';
import { getClients, type Client } from '../../../../api/client';

export function ClientesTab() {
  const fetchClients = async () => {
    const data = await getClients();
    if (!data.success) {
      toast.error('No se pudo cargar el listado de clientes');
      throw new Error('Clients load failed');
    }
    return data.clients;
  };
  const { data: clientsData, loading, error, refetch } = useAsyncData(fetchClients, []);
  const clients = clientsData ?? [];

  useEffect(() => {
    if (error) toast.error('Error de conexión con el servidor');
  }, [error]);

  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'pending'>('all');
  const clientFilter = useCallback(
    (c: Client, search: string) => {
      const matchSearch =
        search === '' ||
        (c.fullName?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (c.email?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (c.company?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchVerified =
        filterVerified === 'all' ||
        (filterVerified === 'verified' && c.emailVerified) ||
        (filterVerified === 'pending' && !c.emailVerified);
      return matchSearch && matchVerified;
    },
    [filterVerified]
  );
  const { filtered, search, setSearch } = useFilteredList(clients, clientFilter);

  const verifiedCount = clients.filter((c) => c.emailVerified).length;
  const pendingCount = clients.filter((c) => !c.emailVerified).length;

  const exportColumns = useMemo(
    () => [
      { key: 'fullName', label: 'Nombre' },
      { key: 'email', label: 'Email' },
      { key: 'company', label: 'Empresa', format: (v: unknown) => (v as string) || '—' },
      { key: 'phone', label: 'Teléfono', format: (v: unknown) => (v as string) || '—' },
      {
        key: 'emailVerified',
        label: 'Email verificado',
        format: (v: unknown) => (v ? 'Sí' : 'No'),
      },
      {
        key: 'createdAt',
        label: 'Fecha registro',
        format: (v: unknown) =>
          v ? new Date(v as string).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—',
      },
    ],
    []
  );

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Clientes</h2>
          <p className="text-xs text-gray-400 mt-0.5">Usuarios registrados en la plataforma (landing)</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportTableButton
            columns={exportColumns}
            data={filtered}
            filenamePrefix="clientes"
            formats={['csv', 'pdf']}
            disabled={filtered.length === 0}
            buttonLabel="Exportar"
          />
          <button
            onClick={refetch}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors disabled:opacity-50"
            title="Actualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          layout="valueFirst"
          value={clients.length}
          label="Total clientes"
          sub="Registrados en la plataforma"
          icon={Users}
          iconClassName="w-6 h-6 text-gray-300"
          labelClassName="font-medium"
        />
        <StatCard
          layout="valueFirst"
          value={verifiedCount}
          label="Email verificado"
          sub="Cuentas verificadas"
          icon={CheckCircle2}
          iconClassName="w-6 h-6 text-green-500"
          labelClassName="font-medium"
        />
        <StatCard
          layout="valueFirst"
          value={pendingCount}
          label="Pendiente verificación"
          sub="Sin verificar"
          icon={Circle}
          iconClassName="w-6 h-6 text-amber-500"
          labelClassName="font-medium"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm mb-4 card-glow">
        <div className="flex flex-wrap gap-3">
          <ErpSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nombre, email o empresa..."
            className="flex-1 min-w-48"
          />
          <Select value={filterVerified} onValueChange={(v) => setFilterVerified(v as 'all' | 'verified' | 'pending')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="verified">Email verificado</SelectItem>
              <SelectItem value="pending">Pendiente verificación</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ErpDataTable<Client>
        keyExtractor={(c) => c.id}
        data={filtered}
        loading={loading}
        loadingMessage="Cargando clientes..."
        title={
          <>
            <Users className="w-4 h-4 text-viision-600" />
            <h3 className="text-sm font-bold text-gray-700">Registro de clientes</h3>
          </>
        }
        titleRight={`${filtered.length} de ${clients.length}`}
        emptyState={
          <div className="p-8 text-center text-gray-400">
            <Mail className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            <p className="text-sm">No hay clientes que coincidan con los filtros</p>
            <p className="text-xs mt-1">Los usuarios que se registren desde la landing aparecerán aquí.</p>
          </div>
        }
        columns={[
          {
            id: 'name',
            label: 'Nombre',
            render: (c) => <span className="font-medium text-gray-800">{c.fullName || '—'}</span>,
          },
          {
            id: 'email',
            label: 'Email',
            render: (c) => (
              <span className="text-gray-600 text-xs sm:text-sm" title={c.email}>
                {c.email || '—'}
              </span>
            ),
          },
          {
            id: 'company',
            label: 'Empresa',
            render: (c) => <span className="text-gray-500">{c.company || '—'}</span>,
          },
          {
            id: 'phone',
            label: 'Teléfono',
            render: (c) => <span className="text-gray-500 text-sm">{c.phone || '—'}</span>,
          },
          {
            id: 'verified',
            label: 'Verificado',
            align: 'center',
            render: (c) =>
              c.emailVerified ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Sí
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  <Circle className="w-3 h-3" /> No
                </span>
              ),
          },
          {
            id: 'createdAt',
            label: 'Fecha registro',
            render: (c) => (
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {c.createdAt
                  ? new Date(c.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : '—'}
              </span>
            ),
          },
        ]}
      />
    </>
  );
}
