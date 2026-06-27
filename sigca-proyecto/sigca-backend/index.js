import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rutasInventario from './routes/inventario.routes.js';
import { dbRun, dbGet } from './config/supabase.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Radar de peticiones
app.use((req, res, next) => {
    console.log(`[Ruta Solicitada] -> ${req.method} ${req.url}`);
    next();
});

app.use('/api/inventario', rutasInventario);

// Script de Inicialización Automática e Independiente
async function inicializarBaseDatosLocal() {
    try {
        // 1. Crear las tablas base del sistema si no existen
        await dbRun(`CREATE TABLE IF NOT EXISTS tipos_movimiento (id INTEGER PRIMARY KEY, nombre TEXT)`);
        await dbRun(`CREATE TABLE IF NOT EXISTS categorias (id_categoria INTEGER PRIMARY KEY, nombre TEXT)`);
        await dbRun(`CREATE TABLE IF NOT EXISTS unidades_medida (id_unidad INTEGER PRIMARY KEY, sigla TEXT, nombre TEXT)`);
        await dbRun(`CREATE TABLE IF NOT EXISTS insumos (
            id_insumo INTEGER PRIMARY KEY AUTOINCREMENT, 
            nombre TEXT, 
            id_categoria INTEGER, 
            id_unidad INTEGER
        )`);
        await dbRun(`CREATE TABLE IF NOT EXISTS movimientos_inventario (
            id_movimiento INTEGER PRIMARY KEY AUTOINCREMENT,
            id_insumo INTEGER,
            id_tipo INTEGER,
            cantidad REAL,
            observacion TEXT,
            fecha_hora TEXT DEFAULT CURRENT_TIMESTAMP
        )`);

        await dbRun(`CREATE TABLE IF NOT EXISTS estudiantes (
            cedula TEXT PRIMARY KEY,
            nombres TEXT,
            apellidos TEXT,
            carrera TEXT,
            semestre TEXT,
            periodo_lectivo TEXT,
            condicion TEXT DEFAULT 'ACTIVO',
            cupo_comedor TEXT DEFAULT 'DISPONIBLE'
        )`);

        // 🔐 NUEVA TABLA LOCAL: Registro de Usuarios Administrativos
        await dbRun(`CREATE TABLE IF NOT EXISTS usuarios (
            id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT UNIQUE,
            password TEXT
        )`);

        // 2. Verificación INDEPENDIENTE de Tipos de Movimiento (Entrada/Salida)
        const tipoCheck = await dbGet("SELECT COUNT(*) as count FROM tipos_movimiento");
        if (tipoCheck.count === 0) {
            await dbRun(`INSERT INTO tipos_movimiento (id, nombre) VALUES (1, 'Entrada'), (2, 'Salida')`);
            console.log('✅ Tipos de movimiento (Entrada/Salida) inyectados correctamente.');
        }

        // 3. Verificación INDEPENDIENTE de Categorías
        const catCheck = await dbGet("SELECT COUNT(*) as count FROM categorias");
        if (catCheck.count === 0) {
            await dbRun(`INSERT INTO categorias (id_categoria, nombre) VALUES (1, 'Víveres'), (2, 'Cárnicos'), (3, 'Verduras / Hortalizas')`);
            console.log('✅ Categorías base inyectadas correctamente.');
        }

        // 4. Verificación INDEPENDIENTE de Unidades e Insumos base (En cero absoluto)
        const unidadCheck = await dbGet("SELECT COUNT(*) as count FROM unidades_medida");
        if (unidadCheck.count === 0) {
            await dbRun(`INSERT INTO unidades_medida (id_unidad, sigla, nombre) VALUES (1, 'KG', 'Kilogramos'), (2, 'UNID', 'Unidades')`);
            await dbRun(`INSERT INTO insumos (nombre, id_categoria, id_unidad) VALUES 
                ('Arroz Blanco', 1, 1),
                ('Pollo Beneficiado', 2, 1),
                ('Harina de Maíz', 1, 1),
                ('Carne de Res', 2, 1)
            `);
            console.log('✅ Alimentos base inicializados en cero.');
        }

    } catch (error) {
        console.error('❌ Error inicializando las tablas locales en index.js:', error);
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log("\n=== DIAGNÓSTICO DE ARRANQUE LOCAL ===");
    console.log("Entorno de red: Fuera de línea (Seguro)");
    console.log("Base de datos: SQLite activa (comedor.db)");
    console.log("=====================================\n");
    
    await inicializarBaseDatosLocal();
    
    console.log(`🚀 Servidor SIGCA operando localmente en el puerto ${PORT}`);
});