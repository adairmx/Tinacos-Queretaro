/** Deja un teléfono mexicano en sus 10 dígitos; undefined si no lo es. */
export function normalizarTelefono(texto: string) {
  let digitos = texto.replace(/\D/g, "");
  if (digitos.length === 13 && digitos.startsWith("521")) digitos = digitos.slice(3);
  else if (digitos.length === 12 && digitos.startsWith("52")) digitos = digitos.slice(2);
  return digitos.length === 10 ? digitos : undefined;
}

export const telefonoBonito = (diez: string) => `${diez.slice(0, 3)} ${diez.slice(3, 6)} ${diez.slice(6)}`;

/** Enlace que abre WhatsApp con el mensaje ya escrito. */
export const enlaceWhatsApp = (diez: string, texto: string) => `https://wa.me/52${diez}?text=${encodeURIComponent(texto)}`;
