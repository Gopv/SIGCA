import jwt from 'jsonwebtoken';

export const loginAdmin = async (req, res) => {
    const { usuario, password } = req.body;

    if (usuario === 'admin_vipi' && password === 'comedor2026') {
        const payload = { id: 1, rol: 'admin', nombre: 'Coordinador Bienestar' };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
        return res.status(200).json({ exito: true, token, usuario: payload });
    }
    
    return res.status(401).json({ exito: false, error: 'Credenciales inválidas del sistema.' });
};