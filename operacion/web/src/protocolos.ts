/**
 * Protocolos de servicio que acepta cada proveedor. Si cambian, sube PROTOCOLOS_VERSION en shared/tipos.ts
 * para que todos los vuelvan a leer y aceptar.
 */
export const PROTOCOLOS: { titulo: string; puntos: string[] }[] = [
  {
    titulo: "Trato con el cliente",
    puntos: [
      "Amabilidad siempre: saluda, preséntate por tu nombre y di que vienes de MonsterCo.",
      "Todos los clientes reciben el mismo nivel de servicio, sin importar el tamaño del trabajo.",
      "Explica lo que vas a hacer antes de empezar y enseña el resultado al terminar.",
    ],
  },
  {
    titulo: "El trabajo",
    puntos: [
      "No nos vamos hasta que el trabajo quede bien.",
      "Se saca el lodo, se lava a presión y se desinfecta el depósito.",
      "Deja limpia el área donde trabajaste.",
    ],
  },
  {
    titulo: "Horarios y avisos",
    puntos: [
      "Mantén tu disponibilidad al día: de ella salen las citas que se le dan al cliente.",
      "Sólo el primer servicio del día tiene hora fija. En los demás la hora es aproximada.",
      "Marca «Voy en camino» cuando salgas hacia el domicilio, para que el sistema le avise al cliente.",
      "Si se te complica llegar, avisa de inmediato para reprogramar con el cliente.",
    ],
  },
  {
    titulo: "Cobro",
    puntos: [
      "El cliente te paga a ti el precio que se le dio al agendar. No se cobra de más.",
      "La comisión de la casa se liquida servicio por servicio, por transferencia, al terminar.",
      "Marca el servicio como terminado y después registra tu transferencia.",
    ],
  },
];
