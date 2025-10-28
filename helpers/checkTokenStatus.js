import axios from 'axios';

export async function verificarEstadoToken() {
  try {
    const res = await axios.get('https://mercadolibrotoken.onrender.com/api/token/status');
    const { estado, tiempo_restante, usuario } = res.data;

    console.log(`📊 Estado del token: ${estado}`);
    console.log(`⏱️ Tiempo restante: ${Math.floor(tiempo_restante / 1000)} segundos`);
    console.log(`👤 Usuario asociado: ${usuario}`);

    return estado;
  } catch (err) {
    console.error('❌ Error al verificar estado del token:', err.message);
    return 'error';
  }
}