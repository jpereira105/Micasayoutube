import fs from 'fs';
import path from 'path';

const ruta = path.resolve('./token.json');

export function guardarToken({ access_token, refresh_token, expires_at }) {
  const datos = {
    access_token,
    refresh_token,
    expires_at
  };
  fs.writeFileSync(ruta, JSON.stringify(datos, null, 2));
  console.log('💾 Token guardado en token.json');
}

export function cargarToken() {
  if (!fs.existsSync(ruta)) {
    console.warn('📭 No existe token.json');
    return null;
  }

  try {
    const datos = JSON.parse(fs.readFileSync(ruta));
    return datos;
  } catch (err) {
    console.error('⚠️ Error al leer token.json:', err.message);
    return null;
  }
}
