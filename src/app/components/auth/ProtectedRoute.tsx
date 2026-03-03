// Component: Ruta protegida
import { Navigate } from 'react-router';
import { AuthService } from '../../../models/AuthService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'user')[];
  allowedDomains?: string[]; // Ejemplo: ['gmail.com', 'outlook.com']
  excludeDomains?: string[]; // Ejemplo: ['senati.pe'] para evitar que empleados entren a la tienda
  allowPublic?: boolean;     // Para permitir acceso a la tienda sin estar logueado
}

export function ProtectedRoute({ children, allowedRoles, allowedDomains, excludeDomains, allowPublic }: ProtectedRouteProps) {
  const session = AuthService.getSession();

  // Si no hay sesión y la ruta es pública, dejamos pasar
  if (!session && allowPublic) {
    return <>{children}</>;
  }

  // Sin sesión: ir al login (si no es pública)
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Con clave temporal pendiente: ir a cambio obligatorio de contraseña
  if (session.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  const userDomain = session.email.split('@')[1];

  // Si el dominio está en la lista de excluidos (ej. empleados en la tienda)
  if (excludeDomains && excludeDomains.includes(userDomain)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si se requieren dominios específicos y el usuario no tiene uno de ellos
  if (allowedDomains && !allowedDomains.includes(userDomain)) {
    // Si es un empleado intentando entrar a zona de clientes, al dashboard
    if (userDomain === 'senati.pe') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Verificar roles permitidos
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

