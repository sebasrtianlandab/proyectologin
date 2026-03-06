import { ERPLayout } from '../layout/ERPLayout';
import { SalesTabs } from './sales';

export function SalesView() {
  return (
    <ERPLayout title="Módulo de Ventas" subtitle="Cotizaciones, monitoreo y servicios">
      <SalesTabs />
    </ERPLayout>
  );
}
