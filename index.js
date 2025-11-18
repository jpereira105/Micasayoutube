// index.js
// 1. Carga de dependencias
import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';
import express from 'express';
import { obtenerTokenDesdeServicio } from './helpers/tokenConsumer.js';

// 2. Simulación de puerto para Render
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (_, res) => res.send('🟢 Worker corriendo en modo Web Service'));
app.listen(PORT, () => {
  console.log(`🌐 Puerto simulado abierto en ${PORT}`);
});

// 3. Función para calcular expiración (si no está en tokenConsumer.js)
function calcularExpiracion(tokenData) {
  return Date.now() + tokenData.expires_in * 1000;
}

// 4. ✅ Tu función ensureToken va acá
async function ensureToken() {
  const tokenData = await obtenerTokenDesdeServicio();
  if (!tokenData) return null;

  const expires_at = calcularExpiracion(tokenData);
  console.log(`⏳ Token válido por ${Math.floor((expires_at - Date.now()) / 60000)} minutos`);

  return tokenData;
}

// 5. Ciclo principal
async function main() {
  const tokenData = await ensureToken();
  if (!tokenData) return;

  const { access_token: token } = tokenData;
  const itemId = process.env.ITEM_ID || 'MLA1507461989';
  const url = `https://api.mercadolibre.com/items/${itemId}`;

  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const item = await res.json();
    console.log('📦 Item recibido:', JSON.stringify(item, null, 2));
  } catch (err) {
    console.error('💥 Error al consumir API ML:', err.message);
  }
}

// 6. Ejecutar ciclo automático
const INTERVAL_MS = Number(process.env.WORKER_INTERVAL_MS || 120000);
console.log(`🏁 Worker iniciado. Intervalo: ${INTERVAL_MS} ms`);

main();
setInterval(main, INTERVAL_MS);
