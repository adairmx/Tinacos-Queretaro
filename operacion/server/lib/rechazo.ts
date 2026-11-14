/** Una regla del negocio dijo que no. Lleva un código estable para el panel y un texto para la persona. */
export class Rechazo extends Error {
  constructor(
    readonly codigo: string,
    mensaje: string,
    readonly status = 409,
  ) {
    super(mensaje);
  }
}
