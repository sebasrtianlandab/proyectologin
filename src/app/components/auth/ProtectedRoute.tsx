// Component: Ruta protegida
import { Navigate } from 'react-router';
import { AuthService } from '../../../models/AuthService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'user')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const session = AuthService.getSession();

  // Sin sesión: ir al login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Con clave temporal pendiente: ir a cambio obligatorio de contraseña
  if (session.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  // Verificar roles permitidos
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    // Si no tiene permiso, lo mandamos al dashboard (o podrías mostrar una página de 403)
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

