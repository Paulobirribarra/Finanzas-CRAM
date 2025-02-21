const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const Usuario = require('../models/Usuario'); // Importamos el modelo
const session = require('express-session');

router.use(session({
    secret: 'claveSecreta', 
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 60 * 1000 } // 30 minutos de sesión
}));

// Ruta para iniciar sesión (login)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    const user = await Usuario.findOne({ username });
    if (!user) {
        console.log("Usuario no encontrado");
        return res.status(400).json({ error: "Usuario o contraseña incorrectos" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        console.log("Contraseña incorrecta");
        return res.status(400).json({ error: "Usuario o contraseña incorrectos" });
    }

    req.session.user = { id: user._id, username: user.username, role: user.role };
    console.log("Usuario autenticado:", req.session.user);
    res.json({ mensaje: "Inicio de sesión exitoso" });
});

// Ruta para cerrar sesión (logout)
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log("Error al cerrar sesión");
            return res.status(500).json({ error: "No se pudo cerrar sesión" });
        }
        console.log("Sesión cerrada");
        res.json({ mensaje: "Sesión cerrada" });
    });
});

module.exports = router;
