// View: Login/Registro Unificado – Estética Minimalista de Lujo (Alineado con StoreFront)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { resetSidebarForNextEntry } from '../layout/sidebarState';
import { AuthController } from '../../../controllers/AuthController';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';
import { Mail, Lock, User, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function LoginView() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    resetSidebarForNextEntry();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isRegister && password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    try {
      if (isRegister) {
        const result = await AuthController.register(name, email, password);
        if (result.success) {
          toast.success('Cuenta creada', { description: 'Verifica tu correo.' });
          navigate('/verify-otp');
        } else {
          toast.error(result.message);
        }
      } else {
        const result = await AuthController.login(email, password);
        if (result.success) {
          if (result.requiresOTP) {
            navigate('/verify-otp');
          } else if (result.user?.mustChangePassword) {
            navigate('/change-password', { state: { email: result.user.email } });
          } else {
            toast.success(`Bienvenido`);
            if (result.user?.role === 'admin' || result.user?.role === 'empleado' || email.toLowerCase().endsWith('@senati.pe')) {
              navigate('/dashboard');
            } else {
              navigate('/tienda');
            }
          }
        } else {
          toast.error(result.message);
        }
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF8] text-stone-900 font-sans p-6 selection:bg-stone-200">

      {/* Background Decor - Subtle Line */}
      <div className="absolute top-0 left-1/2 w-px h-full bg-stone-200 -z-10 hidden md:block" />

      {/* Top Brand (Alineado con Nav de la tienda) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 flex flex-col items-center gap-2 cursor-pointer"
        onClick={() => navigate('/tienda')}
      >
        <span className="text-3xl font-black text-stone-900 tracking-[0.3em] uppercase">
          VII<span className="text-stone-400">S</span>ION
        </span>
        <div className="h-px w-12 bg-stone-900 mt-2" />
      </motion.div>

      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] z-10"
      >
        <Card className="bg-white border border-stone-200 shadow-none rounded-none p-4 md:p-8">
          <CardHeader className="space-y-4 pt-4 pb-8 text-center md:text-left px-0">
            <div className="inline-block py-1 px-4 bg-stone-100 text-stone-600 font-semibold text-[9px] tracking-[0.3em] uppercase w-fit mx-auto md:mx-0 border border-stone-200 mb-2">
              {isRegister ? 'Registro de Cliente' : 'Acceso Privado'}
            </div>
            <CardTitle className="text-3xl font-light text-stone-900 tracking-tight leading-none">
              {isRegister ? (
                <>Crea tu <span className="font-serif italic font-medium text-stone-800">perfil.</span></>
              ) : (
                <>Bienvenido de <span className="font-serif italic font-medium text-stone-800">nuevo.</span></>
              )}
            </CardTitle>
            <CardDescription className="text-stone-500 font-light text-sm tracking-wide">
              {isRegister
                ? 'Únete a nuestra exclusiva selección de clientes contemporáneos.'
                : 'Ingresa tus credenciales para acceder a tu ecosistema digital.'}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleAuth}>
            <CardContent className="space-y-6 px-0">
              <AnimatePresence mode="wait">
                {isRegister && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-900">Nombre Completo</Label>
                    <div className="relative group">
                      <User className="absolute left-0 top-3 h-4 w-4 text-stone-400 group-focus-within:text-stone-900 transition-colors" strokeWidth={1.5} />
                      <Input
                        placeholder="Escribe tu nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-transparent pl-7 border-0 border-b border-stone-200 focus-visible:ring-0 focus-visible:border-stone-900 rounded-none h-11 transition-all placeholder:text-stone-400 text-sm text-stone-900"
                        required={isRegister}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-900">Dirección Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-0 top-3 h-4 w-4 text-stone-400 group-focus-within:text-stone-900 transition-colors" strokeWidth={1.5} />
                  <Input
                    type="email"
                    placeholder="email@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent pl-7 border-0 border-b border-stone-200 focus-visible:ring-0 focus-visible:border-stone-900 rounded-none h-11 transition-all placeholder:text-stone-400 text-sm text-stone-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-900">Contraseña</Label>
                <div className="relative group">
                  <Lock className="absolute left-0 top-3 h-4 w-4 text-stone-400 group-focus-within:text-stone-900 transition-colors" strokeWidth={1.5} />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent pl-7 border-0 border-b border-stone-200 focus-visible:ring-0 focus-visible:border-stone-900 rounded-none h-11 transition-all placeholder:text-stone-400 text-sm text-stone-900"
                    required
                  />
                </div>
                {!isRegister && (
                  <button type="button" className="text-[10px] uppercase tracking-widest text-stone-600 hover:text-stone-900 transition-colors mt-2 block ml-auto">
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>

              {isRegister && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-900">Confirmar Contraseña</Label>
                  <div className="relative group">
                    <Lock className="absolute left-0 top-3 h-4 w-4 text-stone-400 group-focus-within:text-stone-900 transition-colors" strokeWidth={1.5} />
                    <Input
                      type="password"
                      placeholder="Repite tu contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-transparent pl-7 border-0 border-b border-stone-200 focus-visible:ring-0 focus-visible:border-stone-900 rounded-none h-11 transition-all placeholder:text-stone-400 text-sm text-stone-900"
                      required={isRegister}
                    />
                  </div>
                </motion.div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-6 px-0 pb-4 mt-12">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-stone-900 hover:bg-stone-800 text-white rounded-none uppercase text-xs tracking-[0.2em] font-medium shadow-xl shadow-stone-900/10 transition-transform active:scale-95 transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">Cargando...</span>
                ) : (
                  <span className="flex items-center gap-2 tracking-[0.2em]">
                    {isRegister ? 'Crear Perfil' : 'Acceder'}
                    <ArrowRight size={14} strokeWidth={2} />
                  </span>
                )}
              </Button>

              <div className="flex items-center justify-center gap-4 text-[11px] uppercase tracking-widest text-stone-400">
                <span className="w-8 h-px bg-stone-100" />
                <span>O</span>
                <span className="w-8 h-px bg-stone-100" />
              </div>

              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="w-full h-12 border border-stone-200 hover:border-stone-900 hover:bg-stone-50 text-stone-900 rounded-none uppercase text-[10px] tracking-[0.2em] font-semibold transition-all"
              >
                {isRegister ? 'Ya tengo cuenta' : 'Crear nueva cuenta'}
              </button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>

      {/* Footer Details - Minimalista */}
      <div className="mt-16 flex flex-col md:flex-row gap-10 opacity-50 pointer-events-none">
        <div className="flex items-center gap-3 text-stone-900">
          <ShoppingBag className="w-5 h-5" strokeWidth={1} />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Safe Retail Store</span>
        </div>
        <div className="flex items-center gap-3 text-stone-900">
          <ShieldCheck className="w-5 h-5" strokeWidth={1} />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Business Enterprise Ops</span>
        </div>
      </div>

    </div>
  );
}
