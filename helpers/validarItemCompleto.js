// helpers/validarItemCompleto.js
export function validarItemCompleto(item, desc) {
  const campos = {
    titulo: item?.title,
    precio: item?.price,
    moneda: item?.currency_id,
    ubicacion: item?.seller_address?.city?.name,
    descripcion: desc?.plain_text,
    imagenes: item?.pictures?.map(p => p.url)
  };

  const faltantes = Object.entries(campos)
    .filter(([_, valor]) => !valor || (Array.isArray(valor) && valor.length === 0))
    .map(([clave]) => clave);

  if (faltantes.length > 0) {
    console.warn(`⚠️ Item incompleto. Faltan: ${faltantes.join(', ')}`);
    return null;
  }

  return campos;
}