import { Router } from 'express';
import { 
    obtenerCatalogos, 
    registrarMovimiento, 
    obtenerEstadoInventario,
    vaciarMovimientosLocal,
    registrarUsuarioLocal, // Importado
    loginUsuarioLocal      // Importado
} from '../controllers/inventario.controller.js';
import { 
    verificarEstudianteLocal, 
    registrarEstudianteLocal,
    consumirCupoComedor,
    vaciarEstudiantesLocal
} from '../controllers/taquilla.controller.js';

const router = Router();

// 🚪 PUERTAS DE AUTENTICACIÓN LOCAL REAL
router.post('/registrar-usuario', registrarUsuarioLocal);
router.post('/login', loginUsuarioLocal);

// Rutas de Inventario
router.get('/catalogos', obtenerCatalogos);
router.post('/movimiento', registrarMovimiento);
router.get('/estado', obtenerEstadoInventario);
router.post('/movimiento/vaciar', vaciarMovimientosLocal);

// Rutas de la Taquilla de Estudiantes Locales
router.post('/taquilla/verificar', verificarEstudianteLocal);
router.post('/taquilla/registrar', registrarEstudianteLocal);
router.post('/taquilla/consumir', consumirCupoComedor);
router.post('/taquilla/vaciar', vaciarEstudiantesLocal);

export default router;