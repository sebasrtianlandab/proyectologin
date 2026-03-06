// Service: conectado al backend real (VITE_API_URL). Sin mocks.
const getApiUrl = () => (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '';

export interface Session {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'client';
  loginAt: string;
  mustChangePassword?: boolean;
}

export class AuthService {
  // ===== REGISTRO (API real → Auth + public.users; opcional OTP) =====
  static async register(name: string, email: string, password: string): Promise<{ success: boolean; message?: string; userId?: string; requiresOTP?: boolean }> {
    const base = getApiUrl();
    if (!base) return { success: false, message: 'API no configurada (VITE_API_URL)' };
    try {
      const res = await fetch(`${base}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { success: false, message: data.message || 'Error al registrarse' };
      return {
        success: true,
        message: data.message,
        userId: data.userId,
        requiresOTP: data.requiresOTP ?? false,
      };
    } catch (err) {
      console.error('Register API error:', err);
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  }

  // ===== REGISTRO CLIENTE (landing) - con verificación de email por OTP =====
  static async registerClient(payload: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    company?: string;
  }): Promise<{ success: boolean; message?: string; userId?: string; requiresVerification?: boolean }> {
    const base = getApiUrl();
    if (!base) return { success: false, message: 'API no configurada (VITE_API_URL)' };
    try {
      const res = await fetch(`${base}/api/register-client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { success: false, message: data.message || 'Error al registrarse' };
      return {
        success: true,
        message: data.message,
        userId: data.userId,
        requiresVerification: data.requiresVerification ?? false,
      };
    } catch (err) {
      console.error('RegisterClient API error:', err);
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  }

  // ===== LOGIN (API real → Supabase public.users) =====
  static async login(email: string, password: string): Promise<{ success: boolean; message?: string; requiresOTP?: boolean; user?: any }> {
    const base = getApiUrl();
    if (!base) {
      return { success: false, message: 'API no configurada (VITE_API_URL)' };
    }
    try {
      const res = await fetch(`${base}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, message: data.message || 'Credenciales inválidas' };
      }
      if (!data.success || !data.user) {
        return { success: false, message: data.message || 'Error al iniciar sesión' };
      }
      return {
        success: true,
        user: {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          mustChangePassword: data.user.mustChangePassword ?? false,
        },
      };
    } catch (err) {
      console.error('Login API error:', err);
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  }

  // ===== VERIFICAR OTP (API real) =====
  static async verifyOTP(email: string, code: string): Promise<{ success: boolean; message?: string; user?: any }> {
    const base = getApiUrl();
    if (!base) return { success: false, message: 'API no configurada' };
    try {
      const res = await fetch(`${base}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { success: false, message: data.message || 'Código incorrecto' };
      if (!data.success || !data.user) return { success: false, message: data.message };
      return { success: true, user: data.user };
    } catch (err) {
      console.error('VerifyOTP API error:', err);
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  }

  // ===== OBTENER USUARIO POR EMAIL (API real) =====
  static async getUser(email: string): Promise<{ success: boolean; user?: any }> {
    const base = getApiUrl();
    if (!base) return { success: false };
    try {
      const q = new URLSearchParams({ email: (email || '').trim() });
      const res = await fetch(`${base}/api/users/by-email?${q}`);
      const data = await res.json().catch(() => ({}));
      if (!data.success || !data.user) return { success: false };
      return { success: true, user: data.user };
    } catch {
      return { success: false };
    }
  }

  // ===== SESIÓN (localStorage) =====
  static saveSession(session: Session): void {
    localStorage.setItem('session', JSON.stringify(session));
  }

  static getSession(): Session | null {
    const sessionStr = localStorage.getItem('session');
    if (!sessionStr) return null;

    try {
      const session = JSON.parse(sessionStr);
      // 🔥 Fallback: Si la sesión es antigua y no tiene rol, asignamos 'user'
      if (!session.role) session.role = 'user';
      return session;
    } catch {
      return null;
    }
  }

  static clearSession(): void {
    localStorage.removeItem('session');
  }

  static isAuthenticated(): boolean {
    return this.getSession() !== null;
  }
}
