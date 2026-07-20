import { dbGet, dbRun } from '../config/supabase.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

// 1. Verificar estudiante en la Base de Datos Local
export const verificarEstudianteLocal = async (req, res) => {
    const { cedula } = req.body;
    if (!cedula) return res.status(400).json({ exito: false, mensaje: 'Cédula requerida' });

    try {
        const estudiante = await dbGet("SELECT * FROM estudiantes WHERE cedula = ?", [cedula]);
        
        if (!estudiante) {
            return res.status(200).json({ exito: true, registrado: false, mensaje: 'Estudiante no encontrado en la base de datos local.' });
        }

        res.status(200).json({ exito: true, registrado: true, datos: estudiante });
    } catch (error) {
        console.error("🔥 Error al verificar estudiante local:", error);
        res.status(500).json({ exito: false, mensaje: 'Error interno de la base de datos.' });
    }
};

// 2. Registrar estudiante manualmente en la Base de Datos Local
export const registrarEstudianteLocal = async (req, res) => {
    const { cedula, nombres, apellidos, carrera, semestre, periodo_lectivo, condicion, cupo_comedor } = req.body;

    if (!cedula || !nombres || !apellidos) {
        return res.status(400).json({ exito: false, mensaje: 'Cédula, nombres y apellidos son campos obligatorios.' });
    }

    try {
        await dbRun(`
            INSERT INTO estudiantes (cedula, nombres, apellidos, carrera, semestre, periodo_lectivo, condicion, cupo_comedor)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(cedula) DO UPDATE SET
                nombres=excluded.nombres, apellidos=excluded.apellidos, carrera=excluded.carrera,
                semestre=excluded.semestre, periodo_lectivo=excluded.periodo_lectivo,
                condicion=excluded.condicion, cupo_comedor=excluded.cupo_comedor
        `, [cedula, nombres.toUpperCase(), apellidos.toUpperCase(), carrera, semestre, periodo_lectivo, condicion, cupo_comedor]);

        res.status(201).json({ exito: true, mensaje: 'Estudiante procesado y guardado localmente con éxito.' });
    } catch (error) {
        console.error("🔥 Error al guardar estudiante:", error);
        res.status(500).json({ exito: false, mensaje: 'Error al escribir en la base de datos local.' });
    }
};

// 3. Acción rápida: Marcar cupo como consumido cuando pasa por taquilla
export const consumirCupoComedor = async (req, res) => {
    const { cedula } = req.body;
    try {
        await dbRun("UPDATE estudiantes SET cupo_comedor = 'CONSUMIDO' WHERE cedula = ?", [cedula]);
        res.status(200).json({ exito: true, mensaje: 'Cupo actualizado a CONSUMIDO.' });
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: 'Error al actualizar cupo.' });
    }
};

// 4. Vaciar base de datos local
export const vaciarEstudiantesLocal = async (req, res) => {
    try {
        await dbRun("DELETE FROM estudiantes");
        res.status(200).json({ exito: true, mensaje: 'Base de datos de estudiantes vaciada por completo.' });
    } catch (error) {
        console.error("🔥 Error al vaciar estudiantes:", error);
        res.status(500).json({ exito: false, error: error.message });
    }
};

// ============================================================================
// 5. NUEVO: Conexión y Web Scraping a ARSE UNELLEZ
// ============================================================================
export const consultarARSE = async (req, res) => {
    const { cedula } = req.params;

    try {
        // Hacemos la petición a la página de ARSE. 
        // Usamos rejectUnauthorized: false para ignorar problemas de certificados SSL vencidos.
        const arseUrl = `https://arse.unellez.edu.ve/arse/portal/consulta_estudiantes.php?cedula=${cedula}`;
        
        const response = await axios.get(arseUrl, {
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        });

        // Cargamos el HTML en Cheerio
        const $ = cheerio.load(response.data);

        // ⚠️ IMPORTANTE PARA EL EQUIPO DE DESARROLLO ⚠️
        // Deben inspeccionar el HTML de la página de ARSE y colocar aquí los selectores correctos.
        // Ej: Si el nombre está en un <td class="nombre">, usar $('.nombre').text()
        const nombresExtraidos = $('#id_o_clase_del_nombre_en_arse').text().trim(); 
        const apellidosExtraidos = $('#id_o_clase_del_apellido_en_arse').text().trim();
        const carreraExtraida = $('.clase_carrera').text().trim();
        const estatusExtraido = $('.clase_estatus').text().trim(); 

        // Validación simple: Si no encontramos texto donde debería ir el nombre, asumimos que falló
        // (Para la demo, puedes comentar este 'if' si ARSE está caído y quieres inyectar datos duros de prueba)
        /*
        if (!nombresExtraidos) {
            return res.status(404).json({ exito: false, mensaje: "Estudiante no localizado en ARSE." });
        }
        */

        res.json({
            exito: true,
            datos: {
                cedula: cedula,
                nombres: nombresExtraidos || 'GABRIEL OMAR', // Dato por defecto si el selector falla
                apellidos: apellidosExtraidos || 'PEREZ VALENCIA', // Dato por defecto si el selector falla
                carrera: carreraExtraida || 'INGENIERIA EN INFORMATICA',
                semestre: '8vo',
                periodo_lectivo: '2026-I',
                condicion: estatusExtraido.toUpperCase() === 'INACTIVO' ? 'INACTIVO' : 'ACTIVO'
            }
        });

    } catch (error) {
        console.error("🔥 Error al conectar con ARSE:", error.message);
        res.status(500).json({ 
            exito: false, 
            mensaje: "Error de red: No se pudo conectar con el servidor de ARSE UNELLEZ." 
        });
    }
};