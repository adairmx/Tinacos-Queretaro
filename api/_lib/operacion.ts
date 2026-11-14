interface LeadDelSitio {
  clientName: string;
  clientPhone: string;
  city?: string | null;
  addressColonia?: string | null;
  serviceType?: string | null;
  capacityLiters?: number | null;
  notes?: string | null;
  source?: string | null;
}

/**
 * Manda el lead a la bandeja de la plataforma de operación (carpeta `operacion/`, publicada aparte) para que se
 * atienda y se agende desde ahí. Nunca tumba el formulario: si la plataforma no contesta, sólo se anota en el
 * registro y el lead queda guardado aquí como siempre. Sin OPERACION_URL y OPERACION_CLAVE no hace nada.
 */
export async function reenviarAOperacion(lead: LeadDelSitio, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  const url = process.env.OPERACION_URL?.replace(/\/$/, "");
  const clave = process.env.OPERACION_CLAVE;
  if (!url || !clave) return false;

  try {
    const respuesta = await fetchImpl(`${url}/api/prospectos`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Clave-Del-Sitio": clave },
      body: JSON.stringify({
        nombre: lead.clientName,
        telefono: lead.clientPhone,
        ciudad: lead.city,
        colonia: lead.addressColonia,
        tipo: lead.serviceType,
        litros: lead.capacityLiters,
        notas: lead.notes,
        origen: lead.source,
      }),
      signal: AbortSignal.timeout(4000),
    });
    if (!respuesta.ok) console.error("Operación no aceptó el lead:", respuesta.status, await respuesta.text().catch(() => ""));
    return respuesta.ok;
  } catch (error) {
    console.error("No se pudo mandar el lead a operación:", error);
    return false;
  }
}
