import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

async function checkUser() {
    console.log('--- Verificando Tabla Usuarios ---');
    const { data: users, error: errU } = await supabase.from('usuarios').select('id, nombre, correo, rol');
    if (errU) console.error('Error usuarios:', errU);
    else console.table(users);

    console.log('\n--- Verificando Tabla Empleados ---');
    const { data: emps, error: errE } = await supabase.from('empleados').select('id, nombre, correo');
    if (errE) console.error('Error empleados:', errE);
    else console.table(emps);
}

checkUser();
