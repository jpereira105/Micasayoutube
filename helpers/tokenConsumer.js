// helpers/tokenConsumer.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function obtenerTokenDesdeServicio() {
  try {
    const res = await axios.get(process.env.TOKEN_ENDPOINT, {
      headers: { 'x-api-key': process.env.API_KEY_MERCADOLIBRE }
    });

    const { access_token, refresh_token, expires_at } = res.data;
    if (!access_token || !refresh_token || !expires_at) {
      console.error('⚠️ Respuesta incompleta del servicio:', res.data);
      return null;
    }

    console.log('✅ Token obtenido desde servicio externo');
    return { access_token, refresh_token, expires_at };
  } catch (err) {
    console.error('❌ Error al obtener token desde servicio:', err.response?.data || err.message);
    return null;
  }
}



