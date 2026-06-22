import { dbQuery, dbRun, dbGet } from '../config/supabase.js';

// 🔐 REGISTRO REAL DE USUARIOS LOCALES
export const registrarUsuarioLocal = async (req, res) => {
    const { usuario, password } = req.body;
    if (!usuario || !password) {
        return res.status(400).json({ exito: false, mensaje: 'Usuario y contraseña obligatorios.' });
    }
    try {
        await dbRun("INSERT INTO usuarios (usuario, password) VALUES (?, ?)", [usuario.trim(), password]);
        res.status(201).json({ exito: true, mensaje: 'Usuario administrativo guardado y registrado con éxito.' });
    } catch (error) {
        if (error.message.includes('UNIQUE')) {
            return res.status(400).json({ exito: false, mensaje: 'El nombre de usuario ya se encuentra registrado.' });
        }
        res.status(500).json({ exito: false, error: error.message });
    }
};

// 🔑 LOGIN REAL CON VALIDACIÓN DE BASE DE DATOS LOCAL
export const loginUsuarioLocal = async (req, res) => {
    const { usuario, password } = req.body;
    try {
        const user = await dbGet("SELECT * FROM usuarios WHERE usuario = ? AND password = ?", [usuario.trim(), password]);
        if (!user) {
            return res.status(401).json({ exito: false, mensaje: 'Credenciales inválidas. Usuario o contraseña incorrectos.' });
        }
        res.status(200).json({ exito: true, token: 'acceso-local-autorizado', mensaje: 'Sesión iniciada' });
    } catch (error) {
        res.status(500).json({ exito: false, error: error.message });
    }
};

// --- MÉTODOS DE INVENTARIO ANTERIORES PRESERVA DE SEGURIDAD ---
export const obtenerCatalogos = async (req, res) => {
    try {
        const tiposMovimiento = await dbQuery("SELECT id, id as id_tipo, nombre FROM tipos_movimiento");
        const categories = await dbQuery("SELECT * FROM categorias");
        const insumos = await dbQuery(`
            SELECT i.id_insumo, i.nombre, i.id_categoria, u.sigla as sigla_unidad 
            FROM insumos i
            LEFT JOIN unidades_medida u ON i.id_unidad = u.id_unidad
        `);

        res.status(200).json({ 
            exito: true, tiposMovimiento, categorias: categories, 
            insumos: insumos.map(item => ({
                id_insumo: item.id_insumo, nombre: item.nombre, id_categoria: item.id_categoria,
                unidades_medida: { sigla: item.sigla_unidad }
            }))
        });
    } catch (error) { res.status(500).json({ exito: false, error: error.message }); }
};

export const registrarMovimiento = async (req, res) => {
    const { id_insumo, id_tipo, cantidad, observacion } = req.body;
    try {
        await dbRun(`INSERT INTO movimientos_inventario (id_insumo, id_tipo, cantidad, observacion) VALUES (?, ?, ?, ?)`, [id_insumo, id_tipo, cantidad, observacion]);
        res.status(201).json({ exito: true, mensaje: 'Movimiento transaccional guardado localmente' });
    } catch (error) { res.status(500).json({ exito: false, error: error.message }); }
};

export const obtenerEstadoInventario = async (req, res) => {
    try {
        const inventario = await dbQuery(`
            SELECT i.id_insumo, i.nombre as insumo, c.nombre as categoria, u.sigla as unidad,
                COALESCE(SUM(CASE WHEN m.id_tipo = 1 THEN m.cantidad ELSE 0 END), 0) -
                COALESCE(SUM(CASE WHEN m.id_tipo = 2 THEN m.cantidad ELSE 0 END), 0) as stock_actual,
                COALESCE(SUM(CASE WHEN m.id_tipo = 2 AND m.fecha_hora >= datetime('now', '-30 days') THEN m.cantidad ELSE 0 END), 0) as consumo_30d,
                COALESCE(SUM(CASE WHEN m.id_tipo = 2 AND m.fecha_hora >= datetime('now', '-7 days') THEN m.cantidad ELSE 0 END), 0) as consumo_7d
            FROM insumos i
            LEFT JOIN categorias c ON i.id_categoria = c.id_categoria
            LEFT JOIN unidades_medida u ON i.id_unidad = u.id_unidad
            LEFT JOIN movimientos_inventario m ON i.id_insumo = m.id_insumo
            GROUP BY i.id_insumo
        `);

        const datosProcesados = inventario.map(item => {
            const promDiario30 = item.consumo_30d / 30;
            const promDiario7 = item.consumo_7d / 7;
            return {
                ...item,
                dias_restantes_mensual: promDiario30 > 0 ? Math.round(item.stock_actual / promDiario30) : null,
                dias_restantes_semanal: promDiario7 > 0 ? Math.round(item.stock_actual / promDiario7) : null
            };
        });
        res.status(200).json({ exito: true, datos: datosProcesados });
    } catch (error) { res.status(500).json({ exito: false, error: error.message }); }
};

export const vaciarMovimientosLocal = async (req, res) => {
    try {
        await dbRun("DELETE FROM movimientos_inventario");
        res.status(200).json({ exito: true, mensaje: 'Historial de movimientos eliminado. Inventario en cero.' });
    } catch (error) { res.status(500).json({ exito: false, error: error.message }); }
};