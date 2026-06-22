import { dbGet, dbRun } from '../config/supabase.js';

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
export const vaciarEstudiantesLocal = async (req, res) => {
    try {
        await dbRun("DELETE FROM estudiantes");
        res.status(200).json({ exito: true, mensaje: 'Base de datos de estudiantes vaciada por completo.' });
    } catch (error) {
        console.error("🔥 Error al vaciar estudiantes:", error);
        res.status(500).json({ exito: false, error: error.message });
    }
};