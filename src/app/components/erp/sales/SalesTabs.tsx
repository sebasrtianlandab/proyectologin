import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs';
import { FileText, BarChart3, Settings } from 'lucide-react';
import { CotizacionesTab } from './CotizacionesTab';
import { MonitoreoTab } from './MonitoreoTab';
import { ServiciosTab } from './ServiciosTab';

export function SalesTabs() {
  return (
    <Tabs defaultValue="cotizaciones" className="w-full">
      <TabsList className="mb-6 bg-gray-100 p-1 rounded-xl">
        <TabsTrigger value="cotizaciones" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
          <FileText className="w-4 h-4" /> Cotizaciones
        </TabsTrigger>
        <TabsTrigger value="monitoreo" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
          <BarChart3 className="w-4 h-4" /> Monitoreo
        </TabsTrigger>
        <TabsTrigger value="servicios" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
          <Settings className="w-4 h-4" /> Servicios
        </TabsTrigger>
      </TabsList>
      <TabsContent value="cotizaciones">
        <CotizacionesTab />
      </TabsContent>
      <TabsContent value="monitoreo">
        <MonitoreoTab />
      </TabsContent>
      <TabsContent value="servicios">
        <ServiciosTab />
      </TabsContent>
    </Tabs>
  );
}
