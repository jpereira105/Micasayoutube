// helpers/tokenConsumer.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function obtenerTokenExterno() {
  try {
    const res = await axios.get('https://mercadolibretoken.onrender.com/api/token', {
      headers: { 'x-api-key': process.env.API_KEY_MERCADOLIBRE },
      timeout: 5000
    });

    const token = res.data?.access_token;
    const refresh = res.data?.refresh_token;
    const exp = res.data?.expires_at;

    if (!token || typeof token !== 'string' || token.length < 20) {
      console.error('⚠️ Token inválido');
      return null;
    }

    return { access_token: token, refresh_token: refresh, expires_at: exp };
  } catch (err) {
    console.error('❌ Error al obtener token:', err.response?.data || err.message);
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
