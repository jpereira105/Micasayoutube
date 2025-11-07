// helpers/tokenConsumer.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function refrescarToken(refreshToken) {
  try {
    const res = await axios.post('https://api.mercadolibre.com/oauth/token', new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.CLIENT_ID_ML,
      client_secret: process.env.CLIENT_SECRET_ML,
      refresh_token: refreshToken
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const nuevoToken = res.data?.access_token;
    const nuevoRefresh = res.data?.refresh_token;
    const expiresIn = res.data?.expires_in;

    if (!nuevoToken || !nuevoRefresh || !expiresIn) {
      console.error('⚠️ Respuesta incompleta al refrescar token:', res.data);
      return null;
    }

    const expires_at = Date.now() + expiresIn * 1000;

    console.log('🔄 Token refrescado correctamente');
    console.log('🕒 Nuevo expires_at:', new Date(expires_at).toISOString());

    return {
      access_token: nuevoToken,
      refresh_token: nuevoRefresh,
      expires_at
    };
  } catch (err) {
    console.error('❌ Error al refrescar token:', err.response?.data || err.message);
    return null;
  }
}

export async function refrescarToken(refreshToken) {
  try {
    const res = await axios.post('https://api.mercadolibre.com/oauth/token', new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.CLIENT_ID_ML,
      client_secret: process.env.CLIENT_SECRET_ML,
      refresh_token: refreshToken
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return {
      access_token: res.data.access_token,
      refresh_token: res.data.refresh_token,
      expires_at: Date.now() + res.data.expires_in * 1000
    };
  } catch (err) {
    console.error('❌ Error al refrescar token:', err.response?.data || err.message);
    return null;
  }
}
