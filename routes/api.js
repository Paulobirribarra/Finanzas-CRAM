const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config({ path: '.local.env' });

const API_URL = process.env.API_URL;
const API_KEY = process.env.password_Api;
const USERNAME = "api";

const RUT_USUARIO = String(process.env.RUT_USUARIO);
const PASSWORD_SII = String(process.env.PASSWORD_SII);
const RUT_EMPRESA = String(process.env.RUT_EMPRESA);
const AMBIENTE = Number(process.env.AMBIENTE); // Convertimos solo este a número

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

        // 📌 Log para verificar que los datos están bien formateados antes de enviarlos
        console.log("🔍 Enviando consulta con body:", body);
        console.log("🔍 Headers:", headers);

        const response = await axios.post(url, body, { headers });

        console.log("✅ Respuesta de la API:", response.data);
        res.json(response.data);
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

console.log("🔍 Credenciales del SII:");
console.log("RutUsuario:", `"${RUT_USUARIO}"`);
console.log("PasswordSII:", `"${PASSWORD_SII}"`);
console.log("RutEmpresa:", `"${RUT_EMPRESA}"`);
console.log("Ambiente:", AMBIENTE);


module.exports = router;
