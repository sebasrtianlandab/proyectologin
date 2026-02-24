export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  verified: boolean;
  role: 'admin' | 'user';
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
  role: 'admin' | 'user';
  loginAt: string;
  name?: string;
  mustChangePassword?: boolean;
}
