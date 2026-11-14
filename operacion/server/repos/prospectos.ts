import { CIUDADES, ciudadPorSlug } from "../../shared/ciudades.ts";
import { NOMBRE_DE_TIPO, type TipoDeServicio } from "../../shared/precios.ts";
import { normalizarTelefono, telefonoBonito } from "../../shared/telefono.ts";
import type { EstadoDeProspecto, Prospecto } from "../../shared/tipos.ts";
import type { Consulta, Db } from "../db.ts";
import { Rechazo } from "../lib/rechazo.ts";
import { iso } from "../lib/sql.ts";
import { avisarALaCasa } from "./avisos.ts";

/** Lo que manda quien capta el lead. Viene de formularios hechos por otros, así que casi todo es texto libre. */
export interface DatosDeProspecto {
  nombre?: string | null;
  telefono?: string | null;
  ciudad?: string | null;
  colonia?: string | null;
  tipo?: string | null;
  litros?: number | null;
  notas?: string | null;
  origen?: string | null;
}

/** Un lead repetido en estos días se junta con el que ya estaba abierto en vez de duplicarse. */
const DIAS_PARA_JUNTAR = 7;

const COLUMNAS = `id, nombre, telefono, telefono_valido, ciudad, colonia, tipo, litros, notas, origen, estado, motivo_descarte, servicio_id,
  ${iso("creado_en")}, ${iso("actualizado_en")}`;

const sinAcentos = (texto: string) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Reconoce la ciudad aunque venga como "CDMX", "Guadalajara" o "san luis potosí"; undefined si no es ninguna. */
export function ciudadDeTexto(texto: string | null | undefined) {
  const buscado = sinAcentos(texto ?? "");
  if (buscado.length < 3) return undefined;
  return CIUDADES.find((ciudad) => {
    const nombre = sinAcentos(ciudad.nombre);
    return buscado === sinAcentos(ciudad.slug) || nombre.includes(buscado) || buscado.includes(nombre.split(" y ")[0]!);
  })?.slug;
}

export function tipoDeTexto(texto: string | null | undefined): TipoDeServicio {
  const buscado = sinAcentos(texto ?? "");
  if (/ambos|paquete|tinaco y cisterna|cisterna y tinaco/.test(buscado)) return "ambos";
  if (buscado.includes("cisterna")) return "cisterna";
  if (buscado.includes("tinaco") || buscado === "") return "tinaco";
  return "otro";
}

export async function obtenerProspecto(q: Consulta, id: number) {
  const [prospecto] = await q.query<Prospecto>(`SELECT ${COLUMNAS} FROM prospectos WHERE id = $1`, [id]);
  return prospecto;
}

export const listarProspectos = (q: Consulta) =>
  q.query<Prospecto>(`SELECT ${COLUMNAS} FROM prospectos ORDER BY (estado = 'nuevo') DESC, (estado = 'contactado') DESC, creado_en DESC LIMIT 300`);

/** Guarda un lead y le avisa a la casa. Si esa persona ya tenía uno abierto, le suma lo nuevo en vez de duplicarlo. */
export async function recibirProspecto(db: Db, datos: DatosDeProspecto) {
  const crudo = (datos.telefono ?? "").trim();
  const diez = normalizarTelefono(crudo);
  if (!diez && crudo.replace(/\D/g, "").length < 7) throw new Rechazo("telefono_invalido", "Sin un teléfono no se puede atender el lead.", 400);

  const telefono = diez ?? crudo.slice(0, 40);
  const nombre = datos.nombre?.trim() || "Sin nombre";
  const ciudad = ciudadDeTexto(datos.ciudad) ?? null;
  const tipo = tipoDeTexto(datos.tipo);
  const notas = datos.notas?.trim() || null;
  const origen = datos.origen?.trim() || "web";

  return db.transaccion(async (tx) => {
    const [abierto] = await tx.query<{ id: number; notas: string | null }>(
      `SELECT id, notas FROM prospectos
        WHERE telefono = $1 AND estado IN ('nuevo', 'contactado') AND creado_en > now() - make_interval(days => $2)
        ORDER BY id DESC LIMIT 1`,
      [telefono, DIAS_PARA_JUNTAR],
    );
    if (abierto) {
      const juntas = [abierto.notas, notas].filter(Boolean).join("\n— Volvió a escribir —\n") || null;
      await tx.query(
        "UPDATE prospectos SET notas = $2, ciudad = COALESCE(ciudad, $3), colonia = COALESCE(colonia, $4), actualizado_en = now() WHERE id = $1",
        [abierto.id, juntas, ciudad, datos.colonia?.trim() || null],
      );
      return { prospecto: (await obtenerProspecto(tx, abierto.id))!, repetido: true };
    }

    const [nuevo] = await tx.query<{ id: number }>(
      `INSERT INTO prospectos (nombre, telefono, telefono_valido, ciudad, colonia, tipo, litros, notas, origen)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [nombre, telefono, Boolean(diez), ciudad, datos.colonia?.trim() || null, tipo, Number.isInteger(datos.litros) && datos.litros! > 0 ? datos.litros : null, notas, origen],
    );
    const donde = ciudad ? ` de ${ciudadPorSlug(ciudad)!.nombre}` : "";
    await avisarALaCasa(
      tx,
      "lead_nuevo",
      `Lead nuevo${donde}: ${nombre}, ${diez ? telefonoBonito(diez) : telefono}. ${NOMBRE_DE_TIPO[tipo]}.${notas ? ` Dice: «${notas.slice(0, 300)}»` : ""}`,
    );
    return { prospecto: (await obtenerProspecto(tx, nuevo!.id))!, repetido: false };
  });
}

/** La casa marca qué pasó con un lead que no terminó en cita, o lo regresa a nuevo. */
export async function marcarProspecto(q: Consulta, id: number, estado: Exclude<EstadoDeProspecto, "agendado">, motivo?: string | null) {
  const filas = await q.query(
    `UPDATE prospectos SET estado = $2, motivo_descarte = CASE WHEN $2 = 'descartado' THEN $3 ELSE NULL END, actualizado_en = now()
      WHERE id = $1 AND estado <> 'agendado' RETURNING id`,
    [id, estado, motivo?.trim() || null],
  );
  if (filas.length === 0) throw new Rechazo("no_se_puede", "Ese lead no existe o ya tiene cita.");
  return (await obtenerProspecto(q, id))!;
}

/** Al agendar la cita de un lead, queda ligado a su servicio. */
export const ligarAServicio = (q: Consulta, prospectoId: number, servicioId: number) =>
  q.query("UPDATE prospectos SET estado = 'agendado', servicio_id = $2, actualizado_en = now() WHERE id = $1 AND estado <> 'agendado'", [prospectoId, servicioId]);
