import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { mockGetServices, mockGetCategories, mockGetTechnologies, mockGetModuleTemplates } from '../../../../mocks/api';
import type { Service, Category, Technology, ModuleTemplate } from '../../../../domain/sales/types';
import { Pencil, Package } from 'lucide-react';

export function ServiciosTab() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [moduleTemplates, setModuleTemplates] = useState<ModuleTemplate[]>([]);
  const [loading, setLoading] = useState(true);

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

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name ?? id;

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
        {services.map(service => (
          <Card key={service.id} className="border-gray-100 overflow-hidden rounded-xl card-glow shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-4 h-4 text-viision-600" />
                  {service.name}
                </CardTitle>
                <Button variant="ghost" size="sm" className="shrink-0">
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
    </>
  );
}
