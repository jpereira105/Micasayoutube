// validaritemCompleto

export function validarItemCompleto(item, desc) {
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
    return null;
  }

  // Validar otros campos clave
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
