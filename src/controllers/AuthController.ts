// Controller: Lógica de autenticación (conectado al Backend)
import { AuthService } from '../models/AuthService';

export interface RegisterResult {
  success: boolean;
  message: string;
  userId?: string;
  requiresOTP?: boolean;
}

export interface RegisterClientResult {
  success: boolean;
  message: string;
  userId?: string;
  requiresVerification?: boolean;
}

export interface LoginResult {
  success: boolean;
  message: string;
  requiresOTP?: boolean;
  userId?: string;
  user?: any;
}

export interface OTPResult {
  success: boolean;
  message: string;
  attemptsLeft?: number;
  user?: any;
}

export class AuthController {
  // Registrar nuevo usuario
  static async register(name: string, email: string, password: string): Promise<RegisterResult> {
    // Validaciones
    if (!name || !email || !password) {
      return { success: false, message: 'Nombre, email y contraseña son requeridos' };
    }

    if (!this.validateEmail(email)) {
      return { success: false, message: 'Email inválido' };
    }

    if (password.length < 6) {
      return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }

    try {
      const result = await AuthService.register(name, email, password);

      // Guardar email temporalmente solo si el backend exige verificación OTP
      if (result.success && result.requiresOTP) {
        localStorage.setItem('pendingEmail', email);
      } else if (result.success) {
        localStorage.removeItem('pendingEmail');
      }

      return result;
    } catch (error) {
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  }

  // Login de usuario
  static async login(email: string, password: string): Promise<LoginResult> {
    // Validaciones
    if (!email || !password) {
      return { success: false, message: 'Email y contraseña son requeridos' };
    }

    try {
      const result = await AuthService.login(email, password);

      // Guardar sesión si no requiere OTP
      if (result.success && !result.requiresOTP && result.user) {
        AuthService.saveSession({
          userId: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          loginAt: new Date().toISOString(),
          mustChangePassword: result.user.mustChangePassword || false,
        });
      }

      // Guardar email temporalmente para OTP si lo requiere
      if (result.requiresOTP) {
        localStorage.setItem('pendingEmail', email);
      }

      return result;
    } catch (error) {
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  }

  // Registrar cliente (landing) — con verificación de email por OTP
  static async registerClient(payload: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    company?: string;
  }): Promise<RegisterClientResult> {
    if (!payload.full_name?.trim() || !payload.email?.trim() || !payload.password) {
      return { success: false, message: 'Nombre, email y contraseña son requeridos' };
    }
    if (!this.validateEmail(payload.email)) {
      return { success: false, message: 'Email inválido' };
    }
    if (payload.password.length < 6) {
      return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }
    try {
      const result = await AuthService.registerClient({
        full_name: payload.full_name.trim(),
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        phone: payload.phone?.trim(),
        company: payload.company?.trim(),
      });
      if (result.success && result.requiresVerification) {
        localStorage.setItem('pendingEmail', payload.email.trim().toLowerCase());
      } else if (result.success) {
        localStorage.removeItem('pendingEmail');
      }
      return result;
    } catch (error) {
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  }

  // Verificar OTP
  static async verifyOTP(code: string): Promise<OTPResult> {
    const email = localStorage.getItem('pendingEmail');

    if (!email) {
      return { success: false, message: 'No hay email pendiente de verificación' };
    }

    try {
      const result = await AuthService.verifyOTP(email, code);

      if (result.success && result.user) {
        // Guardar sesión
        AuthService.saveSession({
          userId: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          loginAt: new Date().toISOString(),
        });

        // Limpiar email pendiente
        localStorage.removeItem('pendingEmail');
      }

      return result;
    } catch (error) {
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  }

  // Logout
  static logout(): void {
    AuthService.clearSession();
    localStorage.removeItem('pendingEmail');
  }

  // Validar email
  private static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
