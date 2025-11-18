/// helpers/tokenConsumer.js
import axios from 'axios';
import dotenv from 'dotenv';
import { guardarToken } from './tokenStore.js';
dotenv.config();

// ✅ Obtiene token desde tu servicio externo o desde ML /login
export async function obtenerTokenDesdeServicio() {
  try {
    const res = await axios.get(process.env.TOKEN_ENDPOINT, {
      headers: { 'x-api-key': process.env.API_KEY_MERCADOLIBRE }
    });

    const raw = res.data;

    // Convertimos automáticamente la respuesta cruda al formato esperado
    const tokenData = {
      access_token: raw.access_token,
      refresh_token: raw.refresh_token,
      expires_at: Date.now() + (raw.expires_in * 1000) // ahora + segundos
    };

    guardarToken(tokenData); // lo persiste en token.json
    console.log('✅ Token obtenido y convertido desde servicio externo');
    return tokenData;
  } catch (err) {
    console.error('❌ Error al obtener token desde servicio:', err.response?.data || err.message);
    return null;
  }
}

// ✅ Refresca token usando refresh_token
export async function refrescarToken(refresh_token) {
  try {
    const res = await axios.post('https://api.mercadolibre.com/oauth/token', {
      grant_type: 'refresh_token',
      client_id: process.env.CLIENT_ID_ML,
      client_secret: process.env.CLIENT_SECRET_ML,
      refresh_token
    });

    const raw = res.data;

    const tokenData = {
      access_token: raw.access_token,
      refresh_token: raw.refresh_token,
      expires_at: Date.now() + (raw.expires_in * 1000)
    };

    guardarToken(tokenData);
    console.log('🔄 Token refrescado y guardado');
    return tokenData;
  } catch (err) {
    console.error('❌ Error al refrescar token:', err.response?.data || err.message);
    return null;
  }
}


