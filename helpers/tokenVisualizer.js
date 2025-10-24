export function validarTokenVisual(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64'));
    const exp = payload.exp * 1000;
    const now = Date.now();
    const minutosRestantes = Math.floor((exp - now) / 60000);

    let color = '🔴';
    if (minutosRestantes > 30) color = '🟢';
    else if (minutosRestantes > 10) color = '🟡';

    console.log(`${color} Token válido por ${minutosRestantes} min`);
  } catch (err) {
    console.error('❌ Token inválido o mal formado');
  }
}