// index.js  micasayoutube
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

import { obtenerTokenExterno } from './helpers/tokenConsumer.js';
import { verificarEstadoToken } from './helpers/checkTokenStatus.js';

function validarTokenVisual(token) {
  if (typeof token !== 'string') {
    console.error('⚠️ Token no es string:', token);
    return;
  }

  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64'));
    const exp = new Date(payload.exp * 1000);
    const ahora = new Date();
    const minutosRestantes = Math.floor((exp - ahora) / 60000);

    const estado = minutosRestantes < 5 ? '🔴' : minutosRestantes < 30 ? '🟡' : '🟢';
    console.log(`${estado} Token expira en ${minutosRestantes} min`);
    console.log(`👤 Usuario asociado: ${payload.user_id || 'desconocido'}`);
  } catch (err) {
    console.error('⚠️ No se pudo validar visualmente el token:', err.message);
  }
}


import { validarItemCompleto } from './helpers/validarItemCompleto.js';

async function main() {
  const estado = await verificarEstadoToken();
  if (estado === 'expirado' || estado === 'por_expirar') {
    console.warn('🚫 Token no válido. Abortando ejecución.');
    return;
  }

  const token = await obtenerTokenExterno();
  if (!token) {
    console.error('❌ No se recibió token');
    return;
  }

  console.log('✅ Token recibido:', token);
    
  validarTokenVisual(token);

  const itemId = 'MLA1413050342';
  const url = `https://api.mercadolibre.com/items/${itemId}`;
  const descUrl = `${url}/description`;

  try {
    const [itemRes, descRes] = await Promise.all([
      fetch(url, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(descUrl, { headers: { Authorization: `Bearer ${token}` } })
    ]);

    const item = await itemRes.json();
    const desc = await descRes.json();

    const datos = validarItemCompleto(item, desc);
    if (!datos) {
      console.warn('⛔ Item descartado por datos incompletos');
      return;
    }

    console.log('✅ Item válido:', datos);
  } catch (err) {
    console.error('❌ Error al obtener datos:', err.message);
  }
}


 main()
  .then(() => {
    console.log('⏹️ Worker finalizado, manteniendo proceso vivo');
    setTimeout(() => {}, 1000 * 60 * 60); // espera 1 hora sin hacer nada
  })
  .catch((err) => {
    console.error('💥 Error inesperado en el worker:', err.message);
    setTimeout(() => {}, 1000 * 60 * 60); // también espera 1 hora en caso de error
});