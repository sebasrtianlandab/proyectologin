// View: Panel protegido
import { useNavigate } from 'react-router';
import { AuthController } from '../../../controllers/AuthController';
import { AuthService } from '../../../models/AuthService';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';
import { LogOut, Shield, User, Mail, Calendar, CheckCircle2, Sparkles, Activity, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';

export function DashboardView() {
  const navigate = useNavigate();
  const session = AuthService.getSession();

  const handleLogout = () => {
    AuthController.logout();
    toast.success('Sesión cerrada exitosamente');
    navigate('/login');
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black relative overflow-hidden">
      {/* Efectos de fondo dinámicos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-cyan-500/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg relative">
                <Shield className="w-6 h-6 text-white" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg blur-lg opacity-50"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl text-white">Panel Protegido</h1>
                <p className="text-sm text-cyan-200/70">Sistema de Autenticación MVC</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                onClick={handleLogout}
                className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 hover:border-red-500/50 transition-all"
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Información del usuario */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-slate-900/80 backdrop-blur-xl border-cyan-500/20 shadow-xl shadow-cyan-500/5 card-glow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-cyan-400" />
                  <CardTitle className="text-white">Información del Usuario</CardTitle>
                </div>
                <CardDescription className="text-cyan-200/70">Datos de tu cuenta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-cyan-500/10">
                  <User className="w-5 h-5 text-cyan-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-cyan-200/70">Nombre</p>
                    <p className="font-medium text-white">{session.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-cyan-500/10">
                  <Mail className="w-5 h-5 text-cyan-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-cyan-200/70">Email</p>
                    <p className="font-medium text-white">{session.email}</p>
                  </div>
                </div>


              </CardContent>
            </Card>
          </motion.div>

          {/* Información de sesión */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-slate-900/80 backdrop-blur-xl border-cyan-500/20 shadow-xl shadow-cyan-500/5 card-glow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  <CardTitle className="text-white">Información de Sesión</CardTitle>
                </div>
                <CardDescription className="text-cyan-200/70">Detalles de tu sesión activa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-300">Sesión activa</p>
                    <p className="font-medium text-green-200">Autenticado correctamente</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-cyan-500/10">
                  <Calendar className="w-5 h-5 text-cyan-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-cyan-200/70">Inicio de sesión</p>
                    <p className="font-medium text-white">
                      {new Date(session.loginAt).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Módulo de Administración (Prototipo Frontend) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-r from-slate-900/90 to-blue-900/40 backdrop-blur-xl border-blue-500/30 shadow-xl shadow-blue-500/10 h-full card-glow">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <CardTitle className="text-white">Seguridad y Auditoría</CardTitle>
                  </div>
                  <CardDescription className="text-blue-200/70">Monitoreo de accesos y logs</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-slate-300">
                    Visualización de logs de auditoría, intentos de inicio de sesión y registro de IPs en tiempo real.
                  </p>
                  <Button
                    onClick={() => navigate('/audit')}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Ver Auditoría
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Módulo de Recursos Humanos (NUEVO) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-gradient-to-r from-slate-900/90 to-indigo-900/40 backdrop-blur-xl border-indigo-500/30 shadow-xl shadow-indigo-500/10 h-full card-glow">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-indigo-400" />
                    <CardTitle className="text-white">Gestión de Personal</CardTitle>
                  </div>
                  <CardDescription className="text-indigo-200/70">Módulo exclusivo de Recursos Humanos</CardDescription>
                </div>
                <div className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-1 rounded border border-indigo-500/30 uppercase tracking-tighter">
                  RRHH
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-slate-300">
                    Utilice esta herramienta para dar de alta a nuevos empleados en el sistema y disparar el flujo de verificación.
                  </p>
                  <Button
                    onClick={() => navigate('/register')}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Registrar Nuevo Empleado
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Características implementadas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="mt-6 bg-slate-900/80 backdrop-blur-xl border-cyan-500/20 shadow-xl shadow-cyan-500/5 card-glow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <CardTitle className="text-white">Características del Sistema</CardTitle>
              </div>
              <CardDescription className="text-cyan-200/70">Sistema de autenticación con arquitectura MVC limpia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { icon: User, label: 'Registro de usuarios', color: 'text-blue-400' },
                  { icon: Shield, label: 'Login con email + contraseña', color: 'text-green-400' },
                  { icon: Mail, label: 'Verificación OTP de 6 dígitos', color: 'text-purple-400' },
                  { icon: CheckCircle2, label: 'Límite de 3 intentos OTP', color: 'text-amber-400' },
                  { icon: LogOut, label: 'Gestión de sesiones', color: 'text-red-400' },
                  { icon: Calendar, label: 'Panel protegido', color: 'text-indigo-400' },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-cyan-500/10"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                  >
                    <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    <span className="text-sm text-white">{feature.label}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}