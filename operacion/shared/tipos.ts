import type { TipoDeServicio } from "./precios.ts";

export type EstadoDeProveedor = "pendiente" | "activo" | "suspendido";
export type ModoDeLiquidacion = "por_servicio" | "semanal";
export type EstadoDeServicio = "agendado" | "tomado" | "en_camino" | "realizado" | "cancelado";
export type EstadoDeLiquidacion = "no_aplica" | "pendiente" | "reportada" | "pagada";

/** Las fechas con hora viajan como texto ISO en UTC; los días de calendario, como "AAAA-MM-DD". */
export interface Proveedor {
  id: number;
  nombre: string;
  telefono: string;
  estado: EstadoDeProveedor;
  comision_pct: number;
  liquidacion: ModoDeLiquidacion;
  equipo: string | null;
  experiencia: string | null;
  notas: string | null;
  protocolos_version: number | null;
  protocolos_aceptados_en: string | null;
  creado_en: string;
  ciudades: string[];
}

export interface Servicio {
  id: number;
  cliente_nombre: string;
  /** Vacío para un proveedor que todavía no toma el servicio. */
  cliente_telefono: string;
  ciudad: string;
  colonia: string | null;
  direccion: string | null;
  tipo: TipoDeServicio;
  litros: number | null;
  precio: number;
  fecha: string;
  bloque: string;
  estado: EstadoDeServicio;
  proveedor_id: number | null;
  proveedor_nombre: string | null;
  tomado_en: string | null;
  en_camino_en: string | null;
  realizado_en: string | null;
  cancelado_en: string | null;
  motivo_cancelacion: string | null;
  comision_pct: number | null;
  comision_monto: number | null;
  liquidacion_estado: EstadoDeLiquidacion;
  liquidacion_nota: string | null;
  origen: string;
  notas: string | null;
  creado_en: string;
}

export interface Espacio {
  fecha: string;
  bloque: string;
}

/** Un horario que se le puede ofrecer al cliente, con cuántos servicios más caben y cómo decirlo. */
export interface OpcionDeHorario extends Espacio {
  cupo: number;
  texto: string;
}

export interface Aviso {
  id: number;
  servicio_id: number | null;
  para: "proveedor" | "cliente" | "admin";
  proveedor_id: number | null;
  destinatario: string | null;
  telefono: string | null;
  motivo: string;
  texto: string;
  estado: "pendiente" | "enviado" | "fallido" | "descartado";
  /** Por qué WhatsApp no lo pudo mandar, si falló. */
  error: string | null;
  creado_en: string;
}

export interface Saldo {
  proveedor_id: number;
  nombre: string;
  telefono: string;
  liquidacion: ModoDeLiquidacion;
  servicios_realizados: number;
  /** Comisión de servicios terminados que la casa todavía no da por pagada. */
  por_cobrar: number;
  /** De lo anterior, lo que el proveedor ya dijo que transfirió. */
  reportado: number;
  cobrado: number;
}

export interface EventoDeServicio {
  tipo: string;
  actor: string;
  detalle: string | null;
  creado_en: string;
}

export interface DatosDeServicio {
  cliente_nombre: string;
  cliente_telefono: string;
  ciudad: string;
  colonia?: string | null;
  direccion?: string | null;
  tipo: TipoDeServicio;
  litros?: number | null;
  precio?: number;
  fecha: string;
  bloque: string;
  notas?: string | null;
  origen?: string;
}

export interface DatosDeProveedor {
  nombre: string;
  telefono: string;
  ciudades: string[];
  equipo?: string | null;
  experiencia?: string | null;
}

export const PROTOCOLOS_VERSION = 1;
