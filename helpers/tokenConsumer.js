// helpers/tokenConsumer.js

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function obtenerTokenExterno() {
  try {
    const res = await axios.get('https://mercadolibretoken.onrender.com/api/token', {
      headers: {
        'x-api-key': process.env.API_KEY_MERCADOLIBRE
      },
      timeout: 5000
    });

    if (!res.data?.token) {
      console.error('⚠️ Token no disponible');
      return null;
    }

    return res.data.token;
  } catch (err) {
    console.error('❌ Error al obtener token:', err.response?.data || err.message);
    return null;
  }
}



