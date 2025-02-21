const jwt = require('jsonwebtoken');

module.exports = (rolesPermitidos) => {
    return (req, res, next) => {
        const token = req.headers['authorization'];
        if (!token) return res.status(401).json({ error: 'Acceso denegado' });

        try {
            const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
            if (!rolesPermitidos.includes(decoded.rol)) {
                return res.status(403).json({ error: 'No tienes permisos' });
            }
            req.usuario = decoded;
            next();
        } catch (error) {
            res.status(400).json({ error: 'Token inválido' });
        }
    };
};
