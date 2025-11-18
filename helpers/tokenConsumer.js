import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const ruta = './token.json';

// ✅ Función que convierte expires_in en expires_at
function calcularExpiracion(tokenData) {
  return Date.now() + tokenData.expires_in * 1000;
}

export async function obtenerTokenDesdeServicio() {
  try {
    const res = await axios.get(process.env.TOKEN_ENDPOINT, {
      headers: { 'x-api-key': process.env.API_KEY_MERCADOLIBRE }
    });

    const raw = res.data;

    // Agregamos expires_at al token original
    const tokenCompleto = {
      ...raw,
      expires_at: calcularExpiracion(raw)
    };

    fs.writeFileSync(ruta, JSON.stringify(tokenCompleto, null, 2));
    console.log('✅ Token guardado en formato Mercado Libre + expires_at');

    return tokenCompleto;
  } catch (err) {
    console.error('❌ Error al obtener token desde microservicio:', err.response?.data || err.message);
    return null;
  }
}
