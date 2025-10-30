import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

import { obtenerTokenExterno } from './helpers/tokenConsumer.js';
import { verificarEstadoToken } from './helpers/checkTokenStatus.js';

function validarTokenVisual(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64'));
    const exp = new Date(payload.exp * 1000);
    const ahora = new Date();
    const minutosRestantes = Math.floor((exp - ahora) / 60000);

    const estado = minutosRestantes < 5 ? '🔴' : minutosRestantes < 30 ? '🟡' : '🟢';
    console.log(`${estado} Token expira en ${minutosRestantes} min`);
  } catch (err) {
    console.error('⚠️ No se pudo validar visualmente el token:', err.message);
  }
}

async function getData(itemId, token) {
  validarTokenVisual(token);

  const url = `https://api.mercadolibre.com/items/${itemId}`;
  const descUrl = `${url}/description`;

  try {
    const [itemRes, descRes] = await Promise.all([
      fetch(url, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(descUrl, { headers: { Authorization: `Bearer ${token}` } })
    ]);

    const item = await itemRes.json();
    const desc = await descRes.json();

    console.log({
      titulo: item.title,
      precio: item.price,
      moneda: item.currency_id,
      ubicacion: item.seller_address?.city?.name,
      descripcion: desc.plain_text,
      imagenes: item.pictures?.map(p => p.url)
    });
  } catch (err) {
    console.error('❌ Error al obtener datos:', err.message);
  }
}

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
  await getData('MLA1413050342', token); // Reemplazá con el ID que necesites
}

main()
  .then(() => {
    console.log('⏹️ Worker finalizado correctamente');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Error inesperado en el worker:', err.message);
    process.exit(1); // Salida con código de error
  });