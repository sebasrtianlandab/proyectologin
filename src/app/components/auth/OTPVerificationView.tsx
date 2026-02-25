// View: Componente de Verificación OTP
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AuthController } from '../../../controllers/AuthController';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { toast } from 'sonner';
import { ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export function OTPVerificationView() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error('Por favor ingresa el código completo de 6 dígitos');
      return;
    }

    setIsLoading(true);

    // Llamar al controlador actualizado (async)
    setTimeout(async () => {
      const result = await AuthController.verifyOTP(otp);

      if (result.success) {
        toast.success(result.message, {
          description: 'Redirigiendo al panel...',
        });
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        toast.error(result.message);
        if (result.attemptsLeft !== undefined) {
          setAttemptsLeft(result.attemptsLeft);
          if (result.attemptsLeft === 0) {
            setTimeout(() => {
              navigate('/login');
            }, 2000);
          }
        } else {
          // Si no hay intentos restantes o expiró, redirigir al login
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
        setOtp('');
      }

      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black p-4 relative overflow-hidden">
      {/* Efectos de fondo dinámicos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-72 h-72 bg-indigo-500/20 rounded-full blur-[80px]"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="w-full bg-slate-900/80 backdrop-blur-xl border-cyan-500/20 shadow-2xl shadow-cyan-500/10 card-glow">
          <CardHeader className="space-y-1">
            <motion.div
              className="flex items-center justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-full relative">
                <ShieldCheck className="w-8 h-8 text-white" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-xl opacity-50"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>
            <CardTitle className="text-2xl text-center text-white">Verificación OTP</CardTitle>
            <CardDescription className="text-center text-cyan-200/70">
              Ingresa el código de 6 dígitos enviado a tu email
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleVerify}>
            <CardContent className="space-y-6">
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={isLoading}
                >
                  <InputOTPGroup className="gap-2">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className="bg-slate-800/50 border-cyan-500/30 text-white text-xl focus:border-cyan-400 focus:ring-cyan-400/20 transition-all w-12 h-14"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </motion.div>

              {attemptsLeft < 3 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <p className="text-sm text-amber-300">
                    Intentos restantes: <span className="font-bold">{attemptsLeft}</span>
                  </p>
                </motion.div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-2">
              <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 relative overflow-hidden group"
                  disabled={isLoading || otp.length !== 6}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      'Verificar código'
                    )}
                  </span>
                </Button>
              </motion.div>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-cyan-200/60 hover:text-cyan-400 transition-colors"
              >
                Volver al inicio de sesión
              </button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}