// Service: Conexión con Backend API
const API_URL = 'http://localhost:3001/api';

export interface Session {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  loginAt: string;
  mustChangePassword?: boolean;
}

export class AuthService {
  // ===== REGISTRO =====
  static async register(name: string, email: string, password: string) {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    return await response.json();
  }

  // ===== LOGIN =====
  static async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    return await response.json();
  }

  // ===== VERIFICAR OTP =====
  static async verifyOTP(email: string, code: string) {
    const response = await fetch(`${API_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    return await response.json();
  }

  // ===== OBTENER USUARIO =====
  static async getUser(email: string) {
    const response = await fetch(`${API_URL}/user/${email}`);
    return await response.json();
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
