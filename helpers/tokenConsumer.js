// helpers/tokenConsumer.js

import axios from 'axios';

export async function obtenerTokenExterno() {
  try {
    const res = await axios.get('https://justo-scraper.onrender.com/api/token', {
      headers: {
        'x-api-key': process.env.API_KEY_MERCADOLIBRE
      }
    });
    if (!res.data?.token) {
      console.error('⚠️ Respuesta sin token válido');
      return null;
    }
    return res.data.token;
  } catch (err) {
    console.error('❌ Error al obtener token:', err.response?.data || err.message);
    return null;
  }
}


