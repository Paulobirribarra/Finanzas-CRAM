const express = require('express');
const router = express.Router();
const axios = require('axios');
const Facturas = require('../models/Facturas');
require('dotenv').config({ path: '.local.env' });
const auth = require('../middlewares/auth');

const API_URL = process.env.API_URL;
const API_KEY = process.env.password_Api;
const USERNAME = "api";

const RUT_USUARIO = String(process.env.RUT_USUARIO);
const PASSWORD_SII = String(process.env.PASSWORD_SII);
const RUT_EMPRESA = String(process.env.RUT_EMPRESA);
const AMBIENTE = Number(process.env.AMBIENTE);


router.get('/consulta', async (req, res) => {
    try {
        const mes = req.query.mes || '01';
        const anio = req.query.anio || '2024';

        const url = `${API_URL}/api/RCV/ventas/${mes}/${anio}`;
        const body = {
            RutUsuario: RUT_USUARIO,
            PasswordSII: PASSWORD_SII,
            RutEmpresa: RUT_EMPRESA,
            Ambiente: AMBIENTE
        };

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(`${USERNAME}:${API_KEY}`).toString('base64')
        };

        console.log("🔍 Enviando consulta con body:", body);
        console.log("🔍 Headers:", headers);

        const response = await axios.post(url, body, { headers });

        console.log("✅ Respuesta de la API:", response.data);

        const ventas = response.data.ventas.detalleVentas;

        // Iteramos sobre las ventas y las guardamos en la base de datos
        for (const venta of ventas) {
            const factura = new Facturas({
                folio: venta.FOLIO,
                razonSocial: venta.RAZON_SOCIAL,
                rutCliente: venta.RUT_CLIENTE,
                tipoDTE: venta.TIPO_DTE,
                fechaEmision: venta.FECHA_EMISION,
                estado: venta.ESTADO,
                montoNeto: venta.MONTO_NETO,
                montoIVA: venta.MONTO_IVA,
                montoTotal: venta.MONTO_TOTAL,
                montoIVARecuperable: venta.MONTO_IVA_RECUPERABLE,
                idInterno: venta.ID_INTERNO,
                dia: venta.DIA,
                mes: venta.MES,
                anio: venta.ANIO,
                pagada: false, // Asumiendo que no está pagada inicialmente
                comentario: "",
                numeroDeOperacion: venta.NUMERO_OPERACION
            });

            // Guardamos la factura
            await factura.save();
        }

        // Redirigimos a la raíz para mostrar las facturas guardadas
        res.redirect('/');
    } catch (error) {
        console.error("❌ Error en la consulta:", error.response?.data || error.message);

        if (error.response?.status === 401) {
            return res.status(401).json({ error: "Error de autenticación en Simple API" });
        }

        if (error.response?.status === 400 && error.response?.data?.mensaje?.includes('Error de autenticación en el SII')) {
            return res.status(400).json({ error: "Las credenciales del SII no son válidas." });
        }

        res.status(500).json({ error: error.response?.data || "Error en la consulta" });
    }
});

// Ruta para mostrar las facturas guardadas
router.get('/', async (req, res) => {
    try {
        const facturas = await Facturas.find();
        res.json(facturas); // Devolvemos las facturas en formato JSON
    } catch (error) {
        console.error("❌ Error al obtener facturas:", error);
        res.status(500).json({ error: "No se pudieron obtener las facturas" });
    }
});


module.exports = router;

