import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

async function cleanup() {
    console.log('--- Limpiando Usuarios Huérfanos ---');

    // Buscar correos que están en usuarios pero no en empleados (excepto el admin)
    const { data: users } = await supabase.from('usuarios').select('id, correo').neq('correo', 'admin@erp.com');
    const { data: emps } = await supabase.from('empleados').select('usuario_id');
    const empUserIds = emps.map(e => e.usuario_id);

    const orphans = users.filter(u => !empUserIds.includes(u.id));

    if (orphans.length === 0) {
        console.log('No se encontraron usuarios huérfanos.');
        return;
    }

    console.log(`Borrando ${orphans.length} usuarios huérfanos...`);
    for (const orphan of orphans) {
        console.log(`Borrando: ${orphan.correo}`);
        const { error } = await supabase.from('usuarios').delete().eq('id', orphan.id);
        if (error) console.error(`Error borrando ${orphan.correo}:`, error);
    }
    console.log('Limpieza completada.');
}

cleanup();
