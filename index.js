// MICASAYOUTUBE - INDEX.JS
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const { obtenerTokenExterno } = require('./helpers/tokenConsumer');

async function getData(itemId) {
  const token = await obtenerTokenExterno();
  if (!token) return;

  const url = `https://api.mercadolibre.com/items/${itemId}`;
  const descUrl = `${url}/description`;

  try {
    const [itemRes, descRes] = await Promise.all([
      fetch(url, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(descUrl, { headers: { Authorization: `Bearer ${token}` } })
    ]);

    const item = await itemRes.json();
    const desc = await descRes.json();

    console.log({
      titulo: item.title,
      precio: item.price,
      moneda: item.currency_id,
      ubicacion: item.seller_address?.city?.name,
      descripcion: desc.plain_text,
      imagenes: item.pictures?.map(p => p.url)
    });
  } catch (err) {
    console.error('❌ Error al obtener datos:', err.message);
  }
}

getData('MLA1413050342'); // Reemplazá con el ID que necesites

