import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

import { validarItemCompleto } from './helpers/validarItemCompleto.js';
import { guardarToken, cargarToken } from './helpers/tokenStore.js';
import { obtenerTokenExterno, refrescarToken } from './helpers/tokenConsumer.js';



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
  let tokenData = cargarToken();

  if (!tokenData) {
    console.warn('📭 No hay token guardado. Obteniendo nuevo...');
    tokenData = await obtenerTokenExterno();
    if (!tokenData) {
      console.error('🚫 No se pudo obtener token externo');
      return;
    }
    guardarToken(tokenData);
  }

  let { access_token: token, refresh_token, expires_at } = tokenData;

  const minutosRestantes = Math.floor((expires_at - Date.now()) / 60000);
  console.log(`⏳ Token expira en ${minutosRestantes} min`);

  if (minutosRestantes < 5 && refresh_token) {
    console.warn('🔄 Token por expirar. Refrescando...');
    const nuevo = await refrescarToken(refresh_token);
    if (nuevo?.access_token) {
      token = nuevo.access_token;
      refresh_token = nuevo.refresh_token;
      expires_at = nuevo.expires_at;
      guardarToken(nuevo);
      console.log('✅ Token actualizado y guardado');
    } else {
      console.error('🚫 Falló el refresco de token');
      return;
    }
  }

  // Validación visual si es JWT
  if (token.includes('.') && token.split('.').length === 3) {
    validarTokenVisual(token);
  } else {
    console.warn('🔒 Token no es JWT. Saltando validación visual.');
  }

  // Consulta de item
  const itemId = 'MLA1507461989';
  const url = `https://api.mercadolibre.com/items/${itemId}`;
  const descUrl = `${url}/description`;

  try {
    const [itemRes, descRes] = await Promise.all([
      fetch(url, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(descUrl, { headers: { Authorization: `Bearer ${token}` } })
    ]);

    const item = await itemRes.json();
    console.log('🧾 Item recibido:', JSON.stringify(item, null, 2));
    let desc = {};

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

    if (!datos) {
      console.warn('Item incompleto. Faltan datos clave');
    } else {
      console.log('📦 Datos validados:', datos);
    }
  } catch (err) {
    console.error('💥 Error inesperado en el worker:', err.message);
  }
}

main()
  .then(() => console.log('⏹️ Worker finalizado, manteniendo proceso vivo'))
  .catch((err) => console.error('💥 Error en ejecución principal:', err.message));