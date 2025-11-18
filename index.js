// index.js
// index.js
import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch'; // 👈 faltaba este import
import { cargarToken, guardarToken } from './helpers/tokenStore.js';
import { obtenerTokenDesdeServicio } from './helpers/tokenConsumer.js';

async function ensureToken() {
  let tokenData = cargarToken();

  if (!tokenData || Date.now() >= tokenData.expires_at - 5 * 60 * 1000) {
    console.warn('🔄 Token inexistente o por expirar. Consultando servicio...');
    tokenData = await obtenerTokenDesdeServicio();
    if (!tokenData) {
      console.error('🚫 No se pudo obtener token desde servicio');
      return null;
    }
    guardarToken(tokenData);
  } else {
    console.log('🟢 Token vigente. No se consulta el servicio');
  }

  return tokenData;
}

// 🧠 Ciclo principal
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

// 🚀 Ejecutar cada X ms
const INTERVAL_MS = Number(process.env.WORKER_INTERVAL_MS || 120000);
console.log(`🏁 Worker iniciado. Intervalo: ${INTERVAL_MS} ms`);

main(); // primera ejecución inmediata
setInterval(main, INTERVAL_MS);
