import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  mockGetServices,
  mockGetCategories,
  mockGetTechnologies,
  mockGetModuleTemplates,
  mockGetServiceWithDetails,
  mockUpdateService,
} from '../../../../mocks/api';
import type { Service, Category, Technology, ModuleTemplate } from '../../../../domain/sales/types';
import type { ServiceWithDetails } from '../../../../mocks/dataSales';
import { Pencil, Package, Cpu } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../ui/utils';

export function ServiciosTab() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [moduleTemplates, setModuleTemplates] = useState<ModuleTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ServiceWithDetails | null>(null);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState('');
  const [formShortDescription, setFormShortDescription] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formTechnologyIds, setFormTechnologyIds] = useState<string[]>([]);
  const [formBenefitIds, setFormBenefitIds] = useState<string[]>([]);
  const [formModuleIds, setFormModuleIds] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      mockGetServices(),
      mockGetCategories(),
      mockGetTechnologies(),
      mockGetModuleTemplates(),
    ]).then(([s, c, t, m]) => {
      setServices(s);
      setCategories(c);
      setTechnologies(t);
      setModuleTemplates(m);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!editOpen || !editingServiceId) return;
    mockGetServiceWithDetails(editingServiceId).then((d) => {
      if (d) {
        setDetail(d);
        setFormName(d.name);
        setFormShortDescription(d.short_description);
        setFormCategoryId(d.category_id);
        setFormTechnologyIds(d.technology_ids);
        setFormBenefitIds(d.benefit_ids);
        setFormModuleIds(d.modules.map((m) => m.module_template_id));
      } else {
        setDetail(null);
        setEditOpen(false);
      }
    });
  }, [editOpen, editingServiceId]);

  const openEdit = (serviceId: string) => {
    setEditingServiceId(serviceId);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditingServiceId(null);
    setDetail(null);
  };

  const toggleTechnology = (id: string) => {
    setFormTechnologyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (!editingServiceId) return;
    setSaving(true);
    mockUpdateService(editingServiceId, {
      name: formName,
      short_description: formShortDescription,
      category_id: formCategoryId,
      module_template_ids: formModuleIds,
      technology_ids: formTechnologyIds,
      benefit_ids: formBenefitIds,
    }).then(({ success }) => {
      setSaving(false);
      if (success) {
        toast.success('Servicio actualizado');
        mockGetServices().then(setServices);
        closeEdit();
      } else {
        toast.error('No se pudo actualizar');
      }
    });
  };

  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;

  if (loading) {
    return <div className="text-gray-500 py-8">Cargando servicios...</div>;
  }

  return (
    <>
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Servicios que se muestran en la landing. Aquí puedes ajustar nombre, descripción, categoría, tecnologías y módulos (piezas del catálogo con orden). Los módulos son ingredientes que el cliente elige al cotizar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card key={service.id} className="border-gray-100 overflow-hidden rounded-xl card-glow shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-4 h-4 text-viision-600" />
                  {service.name}
                </CardTitle>
                <Button variant="ghost" size="sm" className="shrink-0" onClick={() => openEdit(service.id)}>
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
              <Badge variant="secondary" className="w-fit text-xs">
                {getCategoryName(service.category_id)}
              </Badge>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 line-clamp-2">{service.short_description}</p>
              <p className="text-xs text-gray-400 mt-2">Código: {service.code}</p>
              <p className="text-xs text-gray-400 mt-1">
                Catálogo: {moduleTemplates.length} módulos, {technologies.length} tecnologías disponibles.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12 text-gray-500 border border-dashed rounded-xl">
          No hay servicios configurados. (Con backend se podrán crear y editar desde aquí.)
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent
          style={{ width: 'min(48rem, 94vw)', maxWidth: '48rem' }}
          className="flex flex-col bg-gray-100/95 text-gray-900 border-gray-200 max-h-[88vh] rounded-3xl shadow-2xl shadow-viision-900/10 p-0 overflow-hidden"
        >
          <DialogHeader className="flex-shrink-0 px-5 pt-4 pb-2 border-b border-gray-100 bg-gray-100/95">
            <DialogTitle className="text-gray-900 font-bold text-lg uppercase tracking-wide">
              Editar servicio
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="editar-servicio-modal flex-1 min-h-0 overflow-y-auto px-5 py-3">
            <div className="space-y-3">
              <Card className="border-gray-100 rounded-xl card-glow shadow-sm bg-white gap-2">
                <CardHeader className="pb-0 pt-3 px-4">
                  <CardTitle className="text-sm font-medium text-gray-600">Datos del servicio</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-gray-700 text-xs">Nombre</Label>
                      <Input
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="mt-1 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                        placeholder="Nombre del servicio"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 text-xs">Categoría</Label>
                      <Select value={formCategoryId} onValueChange={setFormCategoryId}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-gray-700 text-xs">Descripción breve</Label>
                      <Textarea
                        value={formShortDescription}
                        onChange={(e) => setFormShortDescription(e.target.value)}
                        className="mt-1 min-h-[64px] bg-gray-50 border-gray-200 resize-none text-gray-900 placeholder:text-gray-400"
                        placeholder="Descripción corta para la landing"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 text-xs" title="Código del servicio">Código</Label>
                      <Input value={detail.code} disabled className="mt-1 bg-gray-100 text-gray-700" title={detail.code} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-100 rounded-xl card-glow shadow-sm bg-white gap-2">
                <CardHeader className="pb-0 pt-3 px-4">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Cpu className="size-4 text-viision-600" /> Tecnologías
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-3">
                  <p className="text-xs text-gray-500 mb-2">Selecciona las tecnologías (clic en la card).</p>
                  <div className="flex flex-wrap gap-2">
                    {technologies.map((t) => {
                      const selected = formTechnologyIds.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggleTechnology(t.id)}
                          className={cn(
                            'px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border',
                            selected
                              ? 'bg-viision-50 border-viision-200 text-viision-700 ring-2 ring-viision-200'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                          )}
                        >
                          {t.name}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>
          )}
          <DialogFooter className="flex-shrink-0 gap-2 pt-3 pb-4 px-5 border-t border-gray-100 bg-gray-100/95">
            <Button type="button" variant="outline" onClick={closeEdit} className="border-gray-200">
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || !formName.trim()}
              className="bg-viision-600 hover:bg-viision-700 text-white rounded-lg shadow-sm"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
