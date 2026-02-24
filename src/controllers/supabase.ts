import { createClient } from '@supabase/supabase-js';

// Configuración del cliente de Supabase para el Frontend
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Falta la configuración de Supabase en el archivo .env');
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
