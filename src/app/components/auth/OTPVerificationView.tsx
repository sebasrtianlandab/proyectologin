// View: Verificación OTP – Estética Minimalista de Lujo (Alineado con StoreFront)
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AuthController } from '../../../controllers/AuthController';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { toast } from 'sonner';
import { ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export function OTPVerificationView() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error('Ingresa el código de 6 dígitos');
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      const result = await AuthController.verifyOTP(otp);

      if (result.success) {
        toast.success('Identidad verificada');

        // --- REDIRECCIÓN INTELIGENTE ---
        const userEmail = result.user?.email || localStorage.getItem('pendingEmail') || '';
        const isEmployee = userEmail.toLowerCase().endsWith('@senati.pe');

        setTimeout(() => {
          if (isEmployee) {
            navigate('/dashboard');
          } else {
            navigate('/tienda');
          }
        }, 800);
      } else {
        toast.error(result.message);
        if (result.attemptsLeft !== undefined) {
          setAttemptsLeft(result.attemptsLeft);
          if (result.attemptsLeft === 0) {
            setTimeout(() => navigate('/login'), 2000);
          }
        } else {
          setTimeout(() => navigate('/login'), 2000);
        }
        setOtp('');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF8] text-stone-900 font-sans p-6 selection:bg-stone-200">

      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 w-px h-full bg-stone-200 -z-10 hidden md:block" />

      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 flex flex-col items-center gap-2"
      >
        <span className="text-3xl font-black text-stone-900 tracking-[0.3em] uppercase">
          VII<span className="text-stone-400">S</span>ION
        </span>
        <div className="h-px w-12 bg-stone-900 mt-2" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] z-10"
      >
        <Card className="bg-white border border-stone-200 shadow-none rounded-none p-4 md:p-8">
          <CardHeader className="space-y-4 pt-4 pb-8 text-center md:text-left px-0">
            <div className="inline-block py-1 px-4 bg-stone-100 text-stone-600 font-semibold text-[9px] tracking-[0.3em] uppercase w-fit mx-auto md:mx-0 border border-stone-200 mb-2">
              Seguridad de Cuenta
            </div>
            <CardTitle className="text-3xl font-light text-stone-900 tracking-tight leading-none">
              Verifica tu <span className="font-serif italic font-medium text-stone-800">identidad.</span>
            </CardTitle>
            <CardDescription className="text-stone-500 font-light text-sm tracking-wide">
              Hemos enviado un código de seguridad a tu dirección de correo electrónico vinculada.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleVerify}>
            <CardContent className="space-y-8 px-0">
              <div className="flex justify-center py-4">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={isLoading}
                >
                  <InputOTPGroup className="gap-3">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className="bg-transparent border-0 border-b-2 border-stone-200 text-stone-900 text-2xl font-light focus:border-stone-900 focus:ring-0 rounded-none w-10 md:w-12 h-14 transition-all"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {attemptsLeft < 3 && (
                <div className="flex items-center justify-center gap-2 py-2 px-4 bg-stone-50 border border-stone-100 italic text-[11px] text-stone-500">
                  <ShieldCheck className="w-3 h-3" />
                  Intentos restantes: <span className="font-bold text-stone-900">{attemptsLeft}</span>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-6 px-0 pb-4 mt-8">
              <Button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full h-14 bg-stone-900 hover:bg-stone-800 text-white rounded-none uppercase text-xs tracking-[0.2em] font-medium shadow-xl shadow-stone-900/10 transition-transform active:scale-95 transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2 tracking-[0.2em]">Verificando...</span>
                ) : (
                  <span className="flex items-center gap-2 tracking-[0.2em]">
                    Confirmar Código
                    <ArrowRight size={14} strokeWidth={2} />
                  </span>
                )}
              </Button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors w-full"
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                Reenviar código de acceso
              </button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors block mx-auto mt-2"
              >
                ← Volver al inicio
              </button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>

      {/* Footer Branding */}
      <div className="mt-16 opacity-30 pointer-events-none text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Safe Retail Store Ecosystem</p>
      </div>
    </div>
  );
}
