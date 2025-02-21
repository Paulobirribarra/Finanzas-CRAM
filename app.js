//app.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: '.local.env' });


//servidor
const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

//Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/facturas')
    .then(() => console.log('Conectado a MongoDB'))
    .catch(error => console.log('Error al conectar a MongoDB', error));


//Importar Rutas
const routeApi = require('./routes/api');
const authRoutes = require('./routes/auth');

//Usar Rutas Importadas
app.use('/api', routeApi);
app.use('/auth', authRoutes);

//Iniciar Servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto http://localhost:${process.env.PORT}`)
})

//Ruta Principal
app.get('/', (req, res) => {
    res.redirect('/facturas');
})