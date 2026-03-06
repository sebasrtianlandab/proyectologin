// Service: datos mock (sin backend). Cuando exista API, se reconecta aquí.
import { mockLogin, mockRegister, mockVerifyOTP, mockGetUser } from '../mocks/api';

export interface Session {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  loginAt: string;
  mustChangePassword?: boolean;
}

export class AuthService {
  // ===== REGISTRO (mock) =====
  static async register(name: string, email: string, password: string) {
    return mockRegister(name, email, password);
  }

  // ===== LOGIN (mock) =====
  static async login(email: string, password: string) {
    return mockLogin(email, password);
  }

  // ===== VERIFICAR OTP (mock) =====
  static async verifyOTP(email: string, code: string) {
    return mockVerifyOTP(email, code);
  }

  // ===== OBTENER USUARIO (mock) =====
  static async getUser(email: string) {
    return mockGetUser(email);
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
