// index.js
import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';
import { obtenerTokenDesdeServicio } from './helpers/tokenConsumer.js';

async function main() {
  const tokenData = await obtenerTokenDesdeServicio();
  if (!tokenData) return;

  const { access_token: token, expires_at } = tokenData;
  const minutosRestantes = Math.floor((expires_at - Date.now()) / 60000);
  console.log(`⏳ Token expira en ${minutosRestantes} min`);

  const itemId = process.env.ITEM_ID || 'MLA1507461989';
  const url = `https://api.mercadolibre.com/items/${itemId}`;

  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const item = await res.json();
    console.log('📦 Item recibido:', item);
  } catch (err) {
    console.error('💥 Error al consumir API ML:', err.message);
  }
}

const INTERVAL_MS = Number(process.env.WORKER_INTERVAL_MS || 120000);
console.log('🏁 Worker iniciado. Intervalo:', INTERVAL_MS, 'ms');
main();
setInterval(main, INTERVAL_MS);
