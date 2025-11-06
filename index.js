import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

import { obtenerTokenExterno } from './helpers/tokenConsumer.js';
import { verificarEstadoToken } from './helpers/checkTokenStatus.js';
import { validarItemCompleto } from './helpers/validarItemCompleto.js';

function validarTokenVisual(token) {
  if (!token || typeof token !== 'string') {
    console.error('⚠️ Token inválido: no es string');
    return;
  }

  if (!token.includes('.')) {
    console.warn('🔒 Token recibido no es JWT. Saltando validación visual.');
    return;
  }

  // Si es JWT, continuar con la decodificación
  try {
    const partes = token.split('.');
    const payload = JSON.parse(Buffer.from(partes[1], 'base64'));
    const exp = new Date(payload.exp * 1000);
    const ahora = new Date();
    const minutosRestantes = Math.floor((exp - ahora) / 60000);

    const estado = minutosRestantes < 5 ? '🔴' : minutosRestantes < 30 ? '🟡' : '🟢';
    console.log(`${estado} Token expira en ${minutosRestantes} min`);
    console.log(`👤 Usuario asociado: ${payload.user_id || 'desconocido'}`);
    console.log(`🔍 Scope del token: ${payload.scope || 'no especificado'}`);
  } catch (err) {
    console.warn('⚠️ No se pudo validar visualmente el token:', err.message);
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

  if (token.includes('.')) {
  validarTokenVisual(token);
} else {
  console.warn('🔒 Token no es JWT. Saltando validación visual.');
}

  const itemId = 'MLA1507461989';
  const url = `https://api.mercadolibre.com/items/${itemId}`;
  const descUrl = `${url}/description`;

  if (!token.includes('.') || token.split('.').length !== 3) {
    console.error('🚫 Token no tiene formato JWT. MercadoLibre requiere OAuth2 JWT válido.');
    return;
  }


  try {
    const [itemRes, descRes] = await Promise.all([
      
      fetch(url, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(descUrl, { headers: { Authorization: `Bearer ${token}` } })
    ]);

    const item = await itemRes.json();
    console.log('🧾 Item recibido:', JSON.stringify(item, null, 2));
    let desc = {};

    // 👇 Acá va tu chequeo de error 404
  if (descRes.status === 404) {
    console.warn('📭 Descripción no disponible (404)');
  }

    if (!descRes.ok) {
      console.warn(`⚠️ No se pudo obtener descripción: ${descRes.status}`);
      const descripcionAlternativa = item.attributes?.find(attr =>
        attr.name?.toLowerCase().includes('descripción') ||
        attr.id?.toLowerCase().includes('description')       
      );
       console.log('🔍 Descripción alternativa:', descripcionAlternativa);
      desc.plain_text = descripcionAlternativa?.value_name || '';
    } else {
      desc = await descRes.json();
    }

    const datos = validarItemCompleto(item, desc);

    // 👇 Acá va tu chequeo
    if (!datos) {
      console.warn('Item incompleto. Faltan datos clave');
    } else {
      console.log('📦 Datos validados:', datos);
    }

    console.log('📦 Datos validados:', datos);
  } catch (err) {
    console.error('💥 Error inesperado en el worker:', err.message);
  }
}

main()
  .then(() => {
    console.log('⏹️ Worker finalizado, manteniendo proceso vivo');
    // setTimeout(() => {}, 1000 * 60 * 60);
  })
  .catch((err) => {
    console.error('💥 Error en ejecución principal:', err.message);
    // setTimeout(() => {}, 1000 * 60 * 60);
  });
