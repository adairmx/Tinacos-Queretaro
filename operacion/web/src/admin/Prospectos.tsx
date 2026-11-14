import { useState } from "react";
import { Link } from "react-router-dom";
import { NOMBRE_DE_TIPO } from "../../../shared/precios.ts";
import { enlaceWhatsApp, telefonoBonito } from "../../../shared/telefono.ts";
import type { EstadoDeProspecto, Prospecto } from "../../../shared/tipos.ts";
import { api } from "../api.ts";
import { Boton, Cargando, CLASE_DE_ENTRADA, EnlaceBoton, Etiqueta, Mensaje, Tarjeta, Vacio, useAccion } from "../ui.tsx";
import { haceCuanto, nombreDeCiudad } from "./comunes.tsx";

const ORIGEN: Record<string, string> = {
  web_contacto: "Formulario de contacto",
  web_cotizador: "Cotizador del sitio",
  web: "Sitio",
  whatsapp: "WhatsApp",
  llamada: "Llamada",
};

const FILTROS: { clave: "abiertos" | EstadoDeProspecto; texto: string }[] = [
  { clave: "abiertos", texto: "Por atender" },
  { clave: "agendado", texto: "Agendados" },
  { clave: "descartado", texto: "Descartados" },
];

const ESTADO: Record<EstadoDeProspecto, { texto: string; color: "ambar" | "azul" | "verde" | "gris" }> = {
  nuevo: { texto: "Nuevo", color: "ambar" },
  contactado: { texto: "Contactado", color: "azul" },
  agendado: { texto: "Agendado", color: "verde" },
  descartado: { texto: "Descartado", color: "gris" },
};

interface Props {
  datos: Prospecto[] | undefined;
  error: string | undefined;
  recargar: () => Promise<void>;
}

/** Bandeja de leads: gente que pidió informes y todavía no tiene cita. */
export function Prospectos({ datos, error, recargar }: Props) {
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]["clave"]>("abiertos");
  const visibles = datos?.filter((p) => (filtro === "abiertos" ? p.estado === "nuevo" || p.estado === "contactado" : p.estado === filtro));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar leads">
        {FILTROS.map(({ clave, texto }) => (
          <Boton key={clave} chico tono={filtro === clave ? "primario" : "claro"} aria-pressed={filtro === clave} onClick={() => setFiltro(clave)}>
            {texto}
          </Boton>
        ))}
      </div>
      {error && <Mensaje>{error}</Mensaje>}
      {!visibles ? (
        !error && <Cargando />
      ) : visibles.length === 0 ? (
        <Vacio>{filtro === "abiertos" ? "No hay leads por atender." : "Nada por aquí todavía."}</Vacio>
      ) : (
        visibles.map((prospecto) => <TarjetaDeProspecto key={prospecto.id} prospecto={prospecto} alCambiar={recargar} />)
      )}
    </div>
  );
}

function TarjetaDeProspecto({ prospecto, alCambiar }: { prospecto: Prospecto; alCambiar: () => Promise<void> }) {
  const { ocupado, error, correr } = useAccion();
  const [descartando, setDescartando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const abierto = prospecto.estado === "nuevo" || prospecto.estado === "contactado";

  const marcar = (estado: "nuevo" | "contactado" | "descartado") =>
    correr(async () => {
      await api.marcarProspecto(prospecto.id, estado, estado === "descartado" ? motivo : undefined);
      await alCambiar();
    });

  return (
    <Tarjeta className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-lg font-bold">
          {prospecto.nombre} <Etiqueta color={ESTADO[prospecto.estado].color}>{ESTADO[prospecto.estado].texto}</Etiqueta>
        </p>
        <span className="text-xs text-tenue">
          {ORIGEN[prospecto.origen] ?? prospecto.origen} · {haceCuanto(prospecto.creado_en)}
        </span>
      </div>
      <p className="text-sm">
        <span className="font-semibold">{prospecto.telefono_valido ? telefonoBonito(prospecto.telefono) : prospecto.telefono}</span>
        {!prospecto.telefono_valido && <span className="ml-2 text-red-700">Revisa el teléfono: no tiene 10 dígitos.</span>}
        <span className="text-tenue">
          {" "}
          · {prospecto.ciudad ? nombreDeCiudad(prospecto.ciudad) : "Ciudad por confirmar"}
          {prospecto.colonia ? `, ${prospecto.colonia}` : ""} · {NOMBRE_DE_TIPO[prospecto.tipo]}
          {prospecto.litros ? ` de ${prospecto.litros.toLocaleString("es-MX")} L` : ""}
        </span>
      </p>
      {prospecto.notas && <p className="whitespace-pre-wrap rounded-xl bg-fondo p-3 text-sm">{prospecto.notas}</p>}
      {prospecto.estado === "descartado" && prospecto.motivo_descarte && <p className="text-sm text-tenue">Motivo: {prospecto.motivo_descarte}</p>}
      {prospecto.estado === "agendado" && prospecto.servicio_id && <p className="text-sm text-tenue">Quedó como servicio #{prospecto.servicio_id}.</p>}
      {error && <Mensaje>{error}</Mensaje>}

      {descartando ? (
        <div className="space-y-2">
          <input
            className={CLASE_DE_ENTRADA}
            placeholder="¿Por qué se descarta? (opcional)"
            aria-label="Motivo para descartar"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            maxLength={300}
          />
          <div className="flex gap-2">
            <Boton chico tono="peligro" disabled={ocupado} onClick={() => void marcar("descartado")}>
              Descartar lead
            </Boton>
            <Boton chico tono="claro" onClick={() => setDescartando(false)}>
              Cancelar
            </Boton>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {abierto && (
            <Link to={`/admin?prospecto=${prospecto.id}`} className="inline-flex items-center rounded-xl bg-acento px-3 py-1.5 text-sm font-semibold text-white hover:brightness-95">
              Agendar cita
            </Link>
          )}
          {prospecto.telefono_valido && abierto && (
            <>
              <EnlaceBoton chico href={`tel:+52${prospecto.telefono}`}>
                Llamar
              </EnlaceBoton>
              <EnlaceBoton chico href={enlaceWhatsApp(prospecto.telefono, "")}>
                WhatsApp
              </EnlaceBoton>
            </>
          )}
          {prospecto.estado === "nuevo" && (
            <Boton chico tono="claro" disabled={ocupado} onClick={() => void marcar("contactado")}>
              Ya lo contacté
            </Boton>
          )}
          {abierto && (
            <Boton chico tono="claro" onClick={() => setDescartando(true)}>
              Descartar
            </Boton>
          )}
          {prospecto.estado === "descartado" && (
            <Boton chico tono="claro" disabled={ocupado} onClick={() => void marcar("nuevo")}>
              Regresar a la bandeja
            </Boton>
          )}
        </div>
      )}
    </Tarjeta>
  );
}
