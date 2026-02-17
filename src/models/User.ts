// Model: User
export interface User {
  id: string;
  name: string; // Nombre del usuario
  email: string;
  password: string; // En producción, esto debería estar hasheado
  verified: boolean;
  createdAt: string;
}

export interface OTPData {
  userId: string;
  code: string;
  attempts: number;
  maxAttempts: number;
  expiresAt: string;
}

export interface Session {
  userId: string;
  email: string;
  loginAt: string;
}
