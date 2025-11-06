// helpers/tokenConsumer.js

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function obtenerTokenExterno() {
  try {
    console.log('🌐 Consultando endpoint...');
    console.log('🔗 URL:', 'https://mercadolibretoken.onrender.com/api/token');
    console.log('🔑 API_KEY usada para consumir:', process.env.API_KEY_MERCADOLIBRE);

    const res = await axios.get('https://mercadolibretoken.onrender.com/api/token', {
      headers: {
        'x-api-key': process.env.API_KEY_MERCADOLIBRE
      },
      timeout: 5000
    });

    const token = res.data?.access_token;
    const exp = res.data?.expires_at;

    if (!token || typeof token !== 'string' || token.length < 20) {
      console.error('⚠️ Token no disponible o inválido');
      console.log('🧪 Token recibido:', token);
      return null;
    }

    // 🔍 Validación visual si es JWT
    if (token.includes('.')) {
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64'));
        const minutosRestantes = Math.floor((exp - Date.now()) / 60000);
        const estado = minutosRestantes < 5 ? '🔴' : minutosRestantes < 30 ? '🟡' : '🟢';
        console.log(`${estado} Token expira en ${minutosRestantes} min`);
        console.log(`👤 Usuario asociado: ${payload.user_id || res.data.user_id}`);
      } catch (err) {
        console.warn('⚠️ No se pudo decodificar el token:', err.message);
      }
    }

    return token;
  } catch (err) {
    console.error('❌ Error al obtener token:', err.response?.data || err.message);
    return null;
  }
}



