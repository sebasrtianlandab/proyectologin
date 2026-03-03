// View: Componente de Login – Marca VIISION
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { resetSidebarForNextEntry } from '../layout/sidebarState';
import { AuthController } from '../../../controllers/AuthController';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { ShinyText } from '../ui/ShinyText';
import { toast } from 'sonner';
import { Mail, Lock, Sparkles, User, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    resetSidebarForNextEntry();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(async () => {
      if (isRegistering) {
        const result = await AuthController.register(name, email, password);
        if (result.success) {
          toast.success("¡Registro exitoso! Por favor verifica tu correo.");
          navigate('/verify-otp');
        } else {
          toast.error(result.message);
        }
      } else {
        const result = await AuthController.login(email, password);

        if (result.success) {
          if (result.requiresOTP) {
            toast.info(result.message, {
              description: 'Revisa tu correo electrónico',
            });
            navigate('/verify-otp');
          } else if (result.user?.mustChangePassword) {
            toast.warning('¡Bienvenido! Debes cambiar tu contraseña temporal para continuar.', {
              duration: 5000,
            });
            navigate('/change-password', { state: { email: result.user.email } });
          } else {
            toast.success(result.message);

            // Guardar usuario en LocalStorage para persistencia en la sesión
            localStorage.setItem('viision_user', JSON.stringify(result.user));

            // Redirección basada en dominio/rol (los customers van a Landing, empleados/admin al ERP)
            if (result.user?.role === 'customer') {
              navigate('/');
            } else if (result.user?.role === 'admin') {
              navigate('/dashboard');
            } else {
              navigate('/ventas');
            }
          }
        } else {
          toast.error(result.message);
        }
      }

      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-[#0f0a1a] to-black p-4 relative overflow-hidden">
      {/* Efectos de fondo – tonos VIISION (púrpura-azul) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-viision-600/20 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-viision-500/20 rounded-full blur-[100px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-72 h-72 bg-viision-400/15 rounded-full blur-[80px]"
          animate={{ scale: [1, 1.3, 1], x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-viision-400/40 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -100, 0], opacity: [0, 1, 0] }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Botón de Regresar Página Principal */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 z-50 flex items-center gap-2 text-gray-400 hover:text-white transition-all group"
      >
        <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">Regresar a la tienda</span>
      </motion.button>

      {/* Marca: logo + VIISION con ShinyText */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-3 mb-8 relative z-10"
      >
        <img
          src="/logo/viision-logo.png"
          alt="VIISION"
          className="w-16 h-16 object-contain drop-shadow-lg"
        />
        <ShinyText
          text="VIISION"
          speed={5}
          className="text-4xl md:text-5xl font-bold uppercase tracking-wide"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="w-full bg-card/90 backdrop-blur-xl card-glow border-viision-600/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-black text-center tracking-tight text-white">
              {isRegistering ? 'Crear mi cuenta' : 'Inicio de sesión'}
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              {isRegistering
                ? 'Únete a la nueva generación de hardware'
                : 'Ingresa tus credenciales para continuar tu compra'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-5">
              {isRegistering && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <Label htmlFor="name" className="text-white font-medium">Nombre completo</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-3 h-4 w-4 text-viision-400/80 group-focus-within:text-viision-400 transition-colors" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Jhon Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-black/40 border-viision-600/30 text-white placeholder:text-gray-600 focus:border-viision-500 focus:ring-1 focus:ring-viision-500/20 rounded-xl pl-9"
                      required={isRegistering}
                    />
                  </div>
                </motion.div>
              )}

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-viision-400/80 group-focus-within:text-viision-400 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-black/40 border-viision-600/30 text-white placeholder:text-gray-600 focus:border-viision-500 focus:ring-1 focus:ring-viision-500/20 rounded-xl pl-9"
                    required
                  />
                </div>
              </motion.div>
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Label htmlFor="password" className="text-foreground">Contraseña</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-viision-400/80 group-focus-within:text-viision-400 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/40 border-viision-600/30 text-white placeholder:text-gray-600 focus:border-viision-500 focus:ring-1 focus:ring-viision-500/20 rounded-xl pl-9"
                    required
                  />
                </div>
              </motion.div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-8">
              <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-viision-700 text-primary-foreground border-0 shadow-lg shadow-viision-600/30 hover:shadow-viision-600/40 transition-all duration-300 relative overflow-hidden"
                  disabled={isLoading}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        {isRegistering ? 'Creando cuenta...' : 'Iniciando sesión...'}
                      </>
                    ) : (
                      isRegistering ? 'Crear mi Cuenta' : 'Iniciar sesión'
                    )}
                  </span>
                </Button>
              </motion.div>

              <div className="text-center pt-2">
                <p className="text-sm text-gray-500">
                  {isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
                  <button
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="ml-2 text-viision-400 font-bold hover:underline"
                  >
                    {isRegistering ? 'Inicia sesión' : 'Regístrate aquí'}
                  </button>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div >
  );
}