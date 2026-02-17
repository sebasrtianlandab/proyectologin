import { createBrowserRouter, Navigate } from 'react-router';
import { RegisterView } from './components/auth/RegisterView';
import { LoginView } from './components/auth/LoginView';
import { OTPVerificationView } from './components/auth/OTPVerificationView';
import { DashboardView } from './components/auth/DashboardView';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/register',
    element: <RegisterView />,
  },
  {
    path: '/login',
    element: <LoginView />,
  },
  {
    path: '/verify-otp',
    element: <OTPVerificationView />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardView />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
