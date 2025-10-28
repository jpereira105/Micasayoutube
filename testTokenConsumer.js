import { obtenerTokenExterno } from './helpers/tokenConsumer.js';

async function test() {
  const token = await obtenerTokenExterno();
  if (!token) {
    console.error('❌ No se recibió token');
    return;
  }

  console.log('✅ Token recibido:', token);
}

test();