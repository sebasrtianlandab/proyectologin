// Router: Definición de rutas de la aplicación
import { createBrowserRouter } from 'react-router';
import { LoginView } from './components/auth/LoginView';
import { OTPVerificationView } from './components/auth/OTPVerificationView';
import { AuditView } from './components/auth/AuditView';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ForceChangePassword } from './components/auth/ForceChangePassword';
import { MainDashboard } from './components/erp/MainDashboard';
import { HRMView } from './components/erp/HRMView';
import { AnalyticsView } from './components/erp/AnalyticsView';
import { InternalManagementView } from './components/erp/InternalManagementView';
import { SalesView } from './components/erp/SalesView';
import { DevOpsView } from './components/erp/DevOpsView';

export const router = createBrowserRouter([
  // Ruta raíz
  {
    path: '/',
    element: <LoginView />,
  },
  // Autenticación
  {
    path: '/login',
    element: <LoginView />,
  },
  {
    path: '/verify-otp',
    element: <OTPVerificationView />,
  },
  // Cambio de contraseña obligatorio (accesible SIN sesión para empleados con clave temporal)
  {
    path: '/change-password',
    element: <ForceChangePassword />,
  },
  // ===== MÓDULOS ERP PROTEGIDOS =====
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <MainDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/crm/rrhh',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <HRMView />
      </ProtectedRoute>
    ),
  },
  {
    path: '/analytics',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AnalyticsView />
      </ProtectedRoute>
    ),
  },
  {
    path: '/audit',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AuditView />
      </ProtectedRoute>
    ),
  },
  // Gestión Interna (RRHH & Ops) - antes daba 404
  {
    path: '/gestion-interna',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <InternalManagementView />
      </ProtectedRoute>
    ),
  },
  {
    path: '/ventas',
    element: (
      <ProtectedRoute>
        <SalesView />
      </ProtectedRoute>
    ),
  },
  {
    path: '/devops',
    element: (
      <ProtectedRoute>
        <DevOpsView />
      </ProtectedRoute>
    ),
  },
]);
