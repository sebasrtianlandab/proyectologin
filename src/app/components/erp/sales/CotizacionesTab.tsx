import { useEffect, useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Label } from '../../ui/label';
import { DatePickerField } from '../../ui/DatePickerField';
import { Textarea } from '../../ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../../ui/sheet';
import { mockGetQuotes, mockGetQuoteById, mockUpdateQuoteStatus, mockGetServices } from '../../../../mocks/api';
import type { Quote, QuoteStatus } from '../../../../domain/sales/types';
import { KpiCard } from './KpiCard';
import { Eye, RefreshCw, Pencil, FileText, BarChart3, User, Package, Layers, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../ui/utils';

const STATUS_LABELS: Record<QuoteStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  ganada: 'Efectuada',
  perdida: 'Cancelada',
};

const STATUS_BADGE_BASE = 'inline-flex items-center justify-center min-w-[5.5rem] rounded-full px-2 py-0.5 text-[11px] font-medium border';

const STATUS_BADGE_CLASS: Record<QuoteStatus, string> = {
  pendiente: `${STATUS_BADGE_BASE} bg-slate-50 text-slate-600 border-slate-200/70`,
  en_proceso: `${STATUS_BADGE_BASE} bg-viision-50/80 text-viision-700 border-viision-200/50`,
  ganada: `${STATUS_BADGE_BASE} bg-emerald-50 text-emerald-700 border-emerald-200/60`,
  perdida: `${STATUS_BADGE_BASE} bg-slate-100 text-slate-500 border-slate-200/80`,
};

export function CotizacionesTab() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterService, setFilterService] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<QuoteStatus | null>(null);
  const [editingObservations, setEditingObservations] = useState('');

  const loadQuotes = () => {
    setLoading(true);
    const filters = {
      ...(filterService !== 'all' && { serviceId: filterService }),
      ...(filterStatus !== 'all' && { status: filterStatus as QuoteStatus }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
    };
    mockGetQuotes(filters).then(setQuotes).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQuotes();
  }, [filterService, filterStatus, dateFrom, dateTo]);

  useEffect(() => {
    mockGetServices().then(s => setServices(s.map(x => ({ id: x.id, name: x.name }))));
  }, []);

  const openDetail = (id: string) => {
    mockGetQuoteById(id).then(q => {
      if (q) {
        setSelectedQuote(q);
        setEditingStatus(q.status);
        setEditingObservations(q.observations || '');
        setDetailOpen(true);
      }
    });
  };

  const handleSaveStatus = () => {
    if (!selectedQuote || editingStatus === null) return;
    mockUpdateQuoteStatus(selectedQuote.id, editingStatus, editingObservations || null).then(({ success }) => {
      if (success) {
        toast.success('Cotización actualizada');
        setSelectedQuote(prev => prev ? { ...prev, status: editingStatus, observations: editingObservations || null } : null);
        loadQuotes();
      } else toast.error('Error al actualizar');
    });
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatMoney = (n: number) => `S/ ${n.toLocaleString('es-PE')}`;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total cotizaciones" value={quotes.length} icon={FileText} subtitle="En el listado actual" />
        <KpiCard label="Pendientes" value={quotes.filter(q => q.status === 'pendiente').length} icon={Eye} iconClassName="text-amber-600 bg-amber-50" />
        <KpiCard label="Efectuadas" value={quotes.filter(q => q.status === 'ganada').length} icon={BarChart3} iconClassName="text-emerald-600 bg-emerald-50" />
        <KpiCard label="En proceso" value={quotes.filter(q => q.status === 'en_proceso').length} icon={Pencil} iconClassName="text-blue-600 bg-blue-50" />
      </div>

      <Card className="border-gray-100 rounded-xl card-glow shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="text-lg">Listado de cotizaciones</CardTitle>
            <Button variant="outline" size="sm" onClick={loadQuotes} disabled={loading}>
              <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} /> Actualizar
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Select value={filterService} onValueChange={setFilterService}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Servicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los servicios</SelectItem>
                {services.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {(Object.keys(STATUS_LABELS) as QuoteStatus[]).map(s => (
                  <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-gray-500 whitespace-nowrap">Desde</Label>
              <DatePickerField
                value={dateFrom}
                onChange={setDateFrom}
                placeholder="dd/mm/aaaa"
                triggerClassName="w-[160px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-gray-500 whitespace-nowrap">Hasta</Label>
              <DatePickerField
                value={dateTo}
                onChange={setDateTo}
                placeholder="dd/mm/aaaa"
                triggerClassName="w-[160px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Estado</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">Cargando...</TableCell></TableRow>
                ) : quotes.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">No hay cotizaciones</TableCell></TableRow>
                ) : (
                  quotes.map(q => (
                    <TableRow key={q.id} className="cursor-pointer hover:bg-gray-50" onClick={() => openDetail(q.id)}>
                      <TableCell className="text-gray-600">{formatDate(q.created_at)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{q.user_name || '—'}</div>
                        <div className="text-xs text-gray-500">{q.user_email}</div>
                      </TableCell>
                      <TableCell>{q.service_name || q.service_id}</TableCell>
                      <TableCell className="text-right font-medium">{formatMoney(q.total)}</TableCell>
                      <TableCell className="text-right">
                        <span className={cn(STATUS_BADGE_CLASS[q.status])}>{STATUS_LABELS[q.status]}</span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); openDetail(q.id); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-gray-100/95 text-gray-900 border-l border-gray-200 rounded-l-xl shadow-2xl shadow-viision-900/10 px-5">
          <SheetHeader className="pt-5 pb-2">
            <SheetTitle className="text-gray-900 font-bold text-lg uppercase tracking-wide">Informe de la venta</SheetTitle>
          </SheetHeader>
          {selectedQuote && (
            <div className="space-y-4 pt-2">
              <Card className="border-gray-100 rounded-xl card-glow shadow-sm bg-white gap-2">
                <CardHeader className="pb-0 pt-4 px-4">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <User className="size-4 text-viision-600" /> Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-4 space-y-1">
                  <p className="font-medium text-gray-900">{selectedQuote.user_name}</p>
                  <p className="text-sm text-gray-600">{selectedQuote.user_email}</p>
                  {selectedQuote.user_phone && <p className="text-sm text-gray-600">{selectedQuote.user_phone}</p>}
                  {selectedQuote.user_company && <p className="text-sm text-gray-600">{selectedQuote.user_company}</p>}
                </CardContent>
              </Card>

              <Card className="border-gray-100 rounded-xl card-glow shadow-sm bg-white gap-2">
                <CardHeader className="pb-0 pt-4 px-4">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Package className="size-4 text-viision-600" /> Servicio
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-4">
                  <p className="font-medium text-gray-900">{selectedQuote.service_name}</p>
                </CardContent>
              </Card>

              {selectedQuote.message && (
                <Card className="border-gray-100 rounded-xl card-glow shadow-sm bg-white gap-2">
                  <CardHeader className="pb-0 pt-4 px-4">
                    <CardTitle className="text-sm font-medium text-gray-600">Mensaje del cliente</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 pb-4">
                    <p className="text-sm text-gray-700">{selectedQuote.message}</p>
                  </CardContent>
                </Card>
              )}

              <Card className="border-gray-100 rounded-xl card-glow shadow-sm bg-white gap-2">
                <CardHeader className="pb-0 pt-4 px-4">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Layers className="size-4 text-viision-600" /> Módulos elegidos
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-4">
                  <ul className="space-y-2">
                    {(selectedQuote.modules || []).map(m => (
                      <li key={m.id} className="flex justify-between text-sm text-gray-700">
                        <span>{m.module_name || m.module_template_id}</span>
                        <span className="font-medium tabular-nums">{formatMoney(m.unit_price)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="font-bold mt-3 pt-3 border-t border-gray-100 text-gray-900 flex justify-between"><span>Total:</span><span className="tabular-nums">{formatMoney(selectedQuote.total)}</span></p>
                </CardContent>
              </Card>

              <Card className="border-gray-100 rounded-xl card-glow shadow-sm bg-white gap-2">
                <CardHeader className="pb-0 pt-4 px-4">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <ClipboardList className="size-4 text-viision-600" /> Seguimiento
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-4 space-y-3">
                  <div>
                    <Label className="text-gray-700 text-xs">Estado</Label>
                    <Select value={editingStatus ?? selectedQuote.status} onValueChange={v => setEditingStatus(v as QuoteStatus)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(STATUS_LABELS) as QuoteStatus[]).map(s => (
                          <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700 text-xs">Observaciones del asesor</Label>
                    <Textarea value={editingObservations} onChange={e => setEditingObservations(e.target.value)} placeholder="Notas para seguimiento..." className="mt-1 min-h-[80px] bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 resize-none" />
                  </div>
                  <Button onClick={handleSaveStatus} className="w-full rounded-lg bg-viision-600 hover:bg-viision-700 text-white shadow-sm" size="sm">
                    Guardar cambios
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

