import sqlite3 from 'sqlite3';
import { promisify } from 'util';

// Crea o abre el archivo de la base de datos localmente
const db = new sqlite3.Database('./comedor.db', (err) => {
    if (err) {
        console.error('❌ Error al abrir la base de datos local:', err.message);
    } else {
        console.log('✅ Base de datos local conectada correctamente (comedor.db)');
    }
});

// Convertimos las funciones de SQLite a Promesas para poder usar async/await
export const dbQuery = promisify(db.all.bind(db));
export const dbRun = promisify(db.run.bind(db));
export const dbGet = promisify(db.get.bind(db));

// Exportamos un objeto simulado para no romper importaciones masivas si fuesen necesarias
export const supabase = {};