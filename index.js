// index.js  micasayoutube
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

import { obtenerTokenExterno } from './helpers/tokenConsumer.js';
import { verificarEstadoToken } from './helpers/checkTokenStatus.js';


function validarTokenVisual(token) {
  if (!token || typeof token !== 'string') {
    console.error('⚠️ Token inválido: no es string');
    return;
  }

  const partes = token.split('.');
  if (partes.length < 3) {
    console.warn('⚠️ Token no tiene formato JWT. Saltando validación visual.');
    return;
  }

  try {
    const payload = JSON.parse(Buffer.from(partes[1], 'base64'));
    const exp = new Date(payload.exp * 1000);
    const ahora = new Date();
    const minutosRestantes = Math.floor((exp - ahora) / 60000);

    const estado = minutosRestantes < 5 ? '🔴' : minutosRestantes < 30 ? '🟡' : '🟢';
    console.log(`${estado} Token expira en ${minutosRestantes} min`);
    console.log(`👤 Usuario asociado: ${payload.user_id || 'desconocido'}`);
  } catch (err) {
    console.error('⚠️ No se pudo validar visualmente el token:', err.message);
  }
}


import { validarItemCompleto } from './helpers/validarItemCompleto.js';

async function main() {
  const estado = await verificarEstadoToken();
  if (estado === 'expirado' || estado === 'por_expirar') {
    console.warn('🚫 Token no válido. Abortando ejecución.');
    return;
  }

  const token = await obtenerTokenExterno();

  console.log('🧪 Tipo de token:', typeof token);
  console.log('🧪 Token crudo:', token);


  if (!token) {
    console.error('❌ No se recibió token');
    return;
  }

  console.log('✅ Token recibido:', token);

    
  validarTokenVisual(token);

  const itemId = 'MLA1139118232';
  const url = `https://api.mercadolibre.com/items/${itemId}`;
  const descUrl = `${url}/description`;

  try {
    const [itemRes, descRes] = await Promise.all([
      fetch(url, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(descUrl, { headers: { Authorization: `Bearer ${token}` } })
    ]);

    const item = await itemRes.json();

let desc = {};
if (!descRes.ok) {
  console.warn(`⚠️ No se pudo obtener descripción: ${descRes.status}`);
  // Intentar obtener descripción desde atributos
  const descripcionAlternativa = item.attributes?.find(attr =>
    attr.name?.toLowerCase().includes('descripción') ||
    attr.id?.toLowerCase().includes('description')
  );
  desc.plain_text = descripcionAlternativa?.value_name || ''; // o .value dependiendo del formato
} else {
  desc = await descRes.json();
}



    const datos = validarItemCompleto(item, desc);


   function validarItemCompleto(item, desc) {
  const descripcion = desc?.plain_text?.trim();

  // Si no hay descripción, intentar extraer desde atributos
  let descripcionFinal = descripcion;
  if (!descripcionFinal) {
    const alternativa = item.attributes?.find(attr =>
      attr.name?.toLowerCase().includes('descripción') ||
      attr.id?.toLowerCase().includes('description')
    );
    descripcionFinal = alternativa?.value_name || alternativa?.value || '';
  }

  if (!descripcionFinal.trim()) {
    console.warn('❌ Descripción no disponible');
    return null; // o continuar si querés permitir ítems sin descripción
  }

  // Validar otros campos como título, precio, etc.
  if (!item.title || !item.price || !item.currency_id || !item.seller_address || !item.pictures?.length) {
    console.warn('⛔ Item incompleto. Faltan datos clave');
    return null;
  }

  return {
    id: item.id,
    titulo: item.title,
    precio: item.price,
    moneda: item.currency_id,
    ubicacion: item.seller_address.city.name,
    descripcion: descripcionFinal,
    imagenes: item.pictures.map(pic => pic.secure_url)
  };
}


 main()
  .then(() => {
    console.log('⏹️ Worker finalizado, manteniendo proceso vivo');
    // setTimeout(() => {}, 1000 * 60 * 60); // espera 1 hora sin hacer nada
  })
  .catch((err) => {
    console.error('💥 Error inesperado en el worker:', err.message);
    // setTimeout(() => {}, 1000 * 60 * 60); // también espera 1 hora en caso de error
});