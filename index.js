// index.js
// Simulación de puerto para Render Web Service gratuito
import express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (_, res) => res.send('🟢 Worker corriendo en modo Web Service'));

app.listen(PORT, () => {
  console.log(`🌐 Puerto simulado abierto en ${PORT}`);
});


import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';
import { cargarToken } from './helpers/tokenStore.js';
import { obtenerTokenDesdeServicio, refrescarToken } from './helpers/tokenConsumer.js';



async function ensureToken() {
  let tokenData = cargarToken();

  // Si no hay token o está por expirar, pedimos uno nuevo al servicio
  if (!tokenData || Date.now() >= tokenData.expires_at - 5 * 60 * 1000) {
    console.warn('🔄 Token inexistente o por expirar. Consultando servicio...');
    tokenData = await obtenerTokenDesdeServicio();
    if (!tokenData) {
      console.error('🚫 No se pudo obtener token desde servicio');
      return null;
    }
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

    if (item.code === 'unauthorized') {
      console.error('🚫 Token inválido o expirado. Intentando refrescar...');
      const nuevo = await refrescarToken(tokenData.refresh_token);
      if (nuevo) {
        console.log('✅ Token refrescado, reintentando consulta...');
        const retryRes = await fetch(url, { headers: { Authorization: `Bearer ${nuevo.access_token}` } });
        const retryItem = await retryRes.json();
        console.log('📦 Item recibido:', JSON.stringify(retryItem, null, 2));
      }
    } else {
      console.log('📦 Item recibido:', JSON.stringify(item, null, 2));
    }
  } catch (err) {
    console.error('💥 Error al consumir API ML:', err.message);
  }
}

// 🚀 Ejecutar cada X ms
const INTERVAL_MS = Number(process.env.WORKER_INTERVAL_MS || 120000);
console.log(`🏁 Worker iniciado. Intervalo: ${INTERVAL_MS} ms`);

main(); // primera ejecución inmediata
setInterval(main, INTERVAL_MS);
