// Vista: Registro de cliente (landing). Incluye verificación de email por OTP.
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AuthController } from '../../../controllers/AuthController';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';
import { Mail, Lock, UserPlus, User, Phone, Building2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export function RegisterClientView() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setIsLoading(true);
    try {
      const result = await AuthController.registerClient({
        full_name: fullName,
        email,
        password,
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
      });
      if (result.success) {
        toast.success(result.message, {
          description: result.requiresVerification ? 'Revisa tu correo e introduce el código de 6 dígitos.' : 'Ya puedes iniciar sesión.',
        });
        if (result.requiresVerification) {
          navigate('/verify-otp');
        } else {
          navigate('/login');
        }
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="w-full bg-slate-900/80 backdrop-blur-xl border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
          <CardHeader className="space-y-1">
            <div className="absolute top-4 left-4">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-white/5 rounded-full transition-all"
                title="Volver al inicio de sesión"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-full">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-white font-bold tracking-tight">Crear cuenta</CardTitle>
            <CardDescription className="text-center text-cyan-200/70">
              Regístrate desde la plataforma. Te enviaremos un código a tu correo para verificar tu cuenta.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-cyan-100">Nombre completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-cyan-400/70" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Tu nombre"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-9 bg-slate-800/50 border-cyan-500/30 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-cyan-100">Correo electrónico *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-cyan-400/70" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-slate-800/50 border-cyan-500/30 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-cyan-100">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-cyan-400/70" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Opcional"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9 bg-slate-800/50 border-cyan-500/30 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-cyan-100">Empresa</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-cyan-400/70" />
                  <Input
                    id="company"
                    type="text"
                    placeholder="Opcional"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="pl-9 bg-slate-800/50 border-cyan-500/30 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-cyan-100">Contraseña *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-cyan-400/70" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 bg-slate-800/50 border-cyan-500/30 text-white placeholder:text-slate-500"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-cyan-100">Confirmar contraseña *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-cyan-400/70" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 bg-slate-800/50 border-cyan-500/30 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 pt-2">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
                disabled={isLoading}
              >
                {isLoading ? 'Creando cuenta...' : 'Registrarme'}
              </Button>
              <p className="text-xs text-center text-slate-500">
                Tras registrarte recibirás un código por correo. Introdúcelo en la siguiente pantalla para activar tu cuenta.
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
