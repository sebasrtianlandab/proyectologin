import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ERPLayout } from '../layout/ERPLayout';
import { SalesTabs } from './sales';

export function SalesView() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/ventas') {
      navigate('/ventas/cotizaciones', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <ERPLayout title="Módulo de Ventas" subtitle="Cotizaciones, monitoreo y servicios">
      <SalesTabs />
    </ERPLayout>
  );
}
