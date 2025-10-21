// helpers/tokenConsumer.js
// helpers/tokenConsumer.js
const axios = require('axios');

async function obtenerTokenExterno() {
  try {
    const res = await axios.get('https://justo-scraper.onrender.com/api/token', {
      headers: {
        'x-api-key': process.env.API_KEY_MERCADOLIBRE
      }
    });
    return res.data.token;
  } catch (err) {
    console.error('❌ Error al obtener token:', err.response?.data || err.message);
    return null;
  }
}

module.exports = { obtenerTokenExterno };

