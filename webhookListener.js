// webhookListener.js
import axios from 'axios';
import chalk from 'chalk';
import 'dotenv/config';

async function obtenerToken() {
  try {
    const res = await axios.get(process.env.TOKEN_ENDPOINT, {
      headers: { 'x-api-key': process.env.API_KEY }
    });
    console.log(chalk.green('✅ Token obtenido correctamente'));
    return res.data.token;
  } catch (err) {
    console.log(chalk.red('❌ Error al obtener token:'), err.message);
    return null;
  }
}
