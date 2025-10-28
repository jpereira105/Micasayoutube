// helpers/tokenConsumer.js

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function obtenerTokenExterno() {
  try {

    // 🔍 Logs de trazabilidad antes del request
    console.log('🌐 Consultando endpoint...');
    console.log('🔗 URL:', 'https://mercadolibrotoken.onrender.com/api/token');
    console.log('🔑 API_KEY:', process.env.API_KEY_MERCADOLIBRE);

    const res = await axios.get('https://mercadolibrotoken.onrender.com/api/token', {
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



