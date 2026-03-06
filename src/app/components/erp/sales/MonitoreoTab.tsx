import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { mockGetEventsSummary, mockGetQuoteCountsByStatus } from '../../../../mocks/api';
import type { EventsSummary, EventType } from '../../../../domain/sales/types';
import { KpiCard } from './KpiCard';
import { MousePointer, FileCheck, Eye, ShoppingCart, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const EVENT_LABELS: Record<EventType, string> = {
  page_view: 'Vista de página',
  click_servicio: 'Clic en servicio',
  click_cotizar: 'Clic en Cotizar',
  cotizacion_confirmada: 'Cotización confirmada',
};

const STATUS_CHART_LABELS: Record<string, string> = {
  pendiente: 'Pendientes',
  en_proceso: 'En proceso',
  ganada: 'Efectuadas',
  perdida: 'Canceladas',
};

const CHART_COLORS = ['#6164ff', '#3413fc', '#22c55e', '#64748b'];

export function MonitoreoTab() {
  const [summary, setSummary] = useState<EventsSummary | null>(null);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [period, setPeriod] = useState('7');

  useEffect(() => {
    const days = parseInt(period, 10) || 7;
    mockGetEventsSummary(days).then(setSummary);
    mockGetQuoteCountsByStatus().then(setCounts);
  }, [period]);

  if (!summary) {
    return <div className="text-gray-500 py-8">Cargando analítica...</div>;
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Rendimiento y uso de la landing</h3>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 días</SelectItem>
            <SelectItem value="14">Últimos 14 días</SelectItem>
            <SelectItem value="30">Últimos 30 días</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="Total eventos"
          value={summary.totalEvents}
          icon={MousePointer}
          subtitle={`En ${summary.periodDays} días`}
        />
        <KpiCard
          label="Cotizaciones confirmadas"
          value={summary.cotizacionesConfirmadas}
          icon={FileCheck}
          iconClassName="text-emerald-600 bg-emerald-50"
          subtitle="En el periodo"
        />
        <KpiCard
          label="Clics en servicios"
          value={summary.byType.click_servicio}
          icon={Eye}
          iconClassName="text-blue-600 bg-blue-50"
        />
        <KpiCard
          label="Clics en Cotizar"
          value={summary.byType.click_cotizar}
          icon={ShoppingCart}
          iconClassName="text-viision-600 bg-viision-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-100 rounded-xl card-glow shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Eventos por tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={(Object.entries(summary.byType) as [EventType, number][]).map(([type, count]) => ({ name: EVENT_LABELS[type], cantidad: count }))}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-gray-600" />
                  <YAxis tick={{ fontSize: 12 }} className="text-gray-600" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid rgb(229 231 235)' }}
                    formatter={(value: number) => [value, 'Cantidad']}
                    labelFormatter={(label) => label}
                  />
                  <Bar dataKey="cantidad" fill="#6164ff" radius={[4, 4, 0, 0]} name="Cantidad" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 rounded-xl card-glow shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="w-4 h-4" /> Estado de cotizaciones (total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {counts ? (() => {
              const pieData = [
                { name: STATUS_CHART_LABELS.pendiente, value: counts.pendiente ?? 0 },
                { name: STATUS_CHART_LABELS.en_proceso, value: counts.en_proceso ?? 0 },
                { name: STATUS_CHART_LABELS.ganada, value: counts.ganada ?? 0 },
                { name: STATUS_CHART_LABELS.perdida, value: counts.perdida ?? 0 },
              ].filter((d) => d.value > 0);
              return (
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData.length ? pieData : [{ name: 'Sin datos', value: 1 }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={pieData.length ? ({ name, value }) => `${name}: ${value}` : false}
                    >
                      {(pieData.length ? pieData : [{ name: 'Sin datos', value: 1 }]).map((_, i) => (
                        <Cell key={i} fill={pieData.length ? CHART_COLORS[i % CHART_COLORS.length] : '#e2e8f0'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid rgb(229 231 235)' }}
                      formatter={(value: number) => [value, 'Cotizaciones']}
                    />
                    {pieData.length > 0 && <Legend />}
                  </PieChart>
                </ResponsiveContainer>
              </div>
              );
            })() : (
              <p className="text-sm text-gray-500">Cargando...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {Object.keys(summary.byService).length > 0 && (
        <Card className="border-gray-100 mt-6 rounded-xl card-glow shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Eventos por servicio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(summary.byService).map(([serviceId, count]) => ({ name: serviceId, eventos: count }))}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis type="number" tick={{ fontSize: 12 }} className="text-gray-600" />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} className="text-gray-600" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid rgb(229 231 235)' }}
                    formatter={(value: number) => [value, 'Eventos']}
                    labelFormatter={(label) => `Servicio: ${label}`}
                  />
                  <Bar dataKey="eventos" fill="#3413fc" radius={[0, 4, 4, 0]} name="Eventos" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
