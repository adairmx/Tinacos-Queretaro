import type {
  Aviso, DatosDeProveedor, DatosDeServicio, Espacio, EventoDeServicio, EstadoDeProveedor, ModoDeLiquidacion, OpcionDeHorario,
  Prospecto, Proveedor, Saldo, Servicio,
} from "../../shared/tipos.ts";

/** Lo que el servidor contestó cuando dijo que no: un código estable y un texto para mostrarle a la persona. */
export class ErrorDeApi extends Error {
  constructor(
    readonly status: number,
    readonly codigo: string,
    mensaje: string,
  ) {
    super(mensaje);
  }
}

async function pedir<T>(metodo: string, ruta: string, cuerpo?: unknown): Promise<T> {
  let respuesta: globalThis.Response;
  try {
    respuesta = await fetch(`/api${ruta}`, {
      method: metodo,
      headers: cuerpo === undefined ? undefined : { "Content-Type": "application/json" },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    throw new ErrorDeApi(0, "sin_conexion", "No hay conexión. Revisa tu internet e intenta de nuevo.");
  }
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new ErrorDeApi(respuesta.status, datos.codigo ?? "error", datos.mensaje ?? "Algo falló. Intenta de nuevo.");
  return datos as T;
}

export type Yo = { tipo: "admin" } | { tipo: "proveedor"; proveedor: Proveedor; protocolosVigentes: boolean };
export interface TurnoDePrueba {
  rol: "cliente" | "agente";
  texto: string;
}

export interface RespuestaDelAgente {
  texto: string;
  herramientas: { nombre: string; entrada: unknown; resultado: string }[];
  pasoAHumano: boolean;
}

export type AvisoConEnlace = Aviso & { whatsapp: string | null };

export interface CambiosDeProveedor {
  nombre?: string;
  estado?: EstadoDeProveedor;
  comision_pct?: number;
  liquidacion?: ModoDeLiquidacion;
  notas?: string | null;
  ciudades?: string[];
}

export const api = {
  // Sesión
  yo: () => pedir<Yo>("GET", "/yo"),
  entrarComoAdmin: (clave: string) => pedir<{ tipo: "admin" }>("POST", "/admin/entrar", { clave }),
  entrarConAcceso: (acceso: string) => pedir<{ tipo: "proveedor" }>("POST", "/entrar", { acceso }),
  salir: () => pedir<{ ok: true }>("POST", "/salir"),
  registrarse: (datos: DatosDeProveedor & { sitio?: string }) => pedir<{ ok: true }>("POST", "/registro", datos),

  // Proveedor
  miDisponibilidad: () => pedir<{ hoy: string; dias: number; espacios: Espacio[] }>("GET", "/proveedor/disponibilidad"),
  fijarDisponibilidad: (fecha: string, bloque: string, disponible: boolean) =>
    pedir<{ ok: true }>("PUT", "/proveedor/disponibilidad", { fecha, bloque, disponible }),
  copiarSemana: (desde: string) => pedir<{ copiados: number }>("POST", "/proveedor/disponibilidad/copiar", { desde }),
  misServicios: () => pedir<{ abiertos: Servicio[]; mios: Servicio[] }>("GET", "/proveedor/servicios"),
  aceptarProtocolos: () => pedir<{ ok: true }>("POST", "/proveedor/protocolos"),
  tomar: (id: number) => pedir<Servicio>("POST", `/proveedor/servicios/${id}/tomar`),
  enCamino: (id: number) => pedir<Servicio>("POST", `/proveedor/servicios/${id}/en-camino`),
  realizado: (id: number) => pedir<Servicio>("POST", `/proveedor/servicios/${id}/realizado`),
  liquidar: (id: number, nota?: string) => pedir<Servicio>("POST", `/proveedor/servicios/${id}/liquidar`, { nota: nota || null }),

  // Administración
  proveedores: () => pedir<Proveedor[]>("GET", "/admin/proveedores"),
  crearProveedor: (datos: DatosDeProveedor) => pedir<Proveedor>("POST", "/admin/proveedores", datos),
  cambiarProveedor: (id: number, cambios: CambiosDeProveedor) => pedir<Proveedor>("PATCH", `/admin/proveedores/${id}`, cambios),
  accesoDeProveedor: (id: number) => pedir<{ enlace: string; whatsapp: string }>("POST", `/admin/proveedores/${id}/acceso`),
  horarios: (ciudad: string) => pedir<{ opciones: OpcionDeHorario[]; todos: OpcionDeHorario[] }>("GET", `/admin/horarios?ciudad=${encodeURIComponent(ciudad)}`),
  servicios: (filtro: { estado?: string; desde?: string; hasta?: string } = {}) =>
    pedir<Servicio[]>("GET", `/admin/servicios?${new URLSearchParams(Object.entries(filtro).filter(([, valor]) => valor) as [string, string][])}`),
  agendar: (datos: DatosDeServicio & { forzar?: boolean }) => pedir<Servicio>("POST", "/admin/servicios", datos),
  servicio: (id: number) => pedir<{ servicio: Servicio; eventos: EventoDeServicio[] }>("GET", `/admin/servicios/${id}`),
  cancelar: (id: number, motivo: string) => pedir<Servicio>("POST", `/admin/servicios/${id}/cancelar`, { motivo }),
  soltar: (id: number) => pedir<Servicio>("POST", `/admin/servicios/${id}/soltar`),
  confirmarLiquidacion: (id: number) => pedir<Servicio>("POST", `/admin/servicios/${id}/liquidacion`),
  avisos: () => pedir<AvisoConEnlace[]>("GET", "/admin/avisos"),
  resolverAviso: (id: number, estado: "enviado" | "descartado") => pedir<{ ok: true }>("POST", `/admin/avisos/${id}`, { estado }),
  prospectos: () => pedir<Prospecto[]>("GET", "/admin/prospectos"),
  prospecto: (id: number) => pedir<Prospecto>("GET", `/admin/prospectos/${id}`),
  marcarProspecto: (id: number, estado: "nuevo" | "contactado" | "descartado", motivo?: string) =>
    pedir<Prospecto>("POST", `/admin/prospectos/${id}`, { estado, motivo: motivo || null }),
  cuentas: () => pedir<Saldo[]>("GET", "/admin/cuentas"),
  estado: () => pedir<{ whatsapp: boolean }>("GET", "/admin/estado"),
  agente: () => pedir<{ configurado: boolean; contestaSolo: boolean; modelo: string; guion: string }>("GET", "/admin/agente"),
  probarAgente: (mensajes: TurnoDePrueba[]) => pedir<RespuestaDelAgente>("POST", "/admin/agente/probar", { mensajes }),
};
