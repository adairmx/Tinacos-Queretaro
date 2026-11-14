import { api, type AvisoConEnlace } from "../api.ts";
import { Boton, Cargando, EnlaceBoton, Etiqueta, Mensaje, Tarjeta, Vacio, useAccion, useDatos } from "../ui.tsx";
import { haceCuanto } from "./comunes.tsx";

const GRUPOS: { para: AvisoConEnlace["para"]; titulo: string }[] = [
  { para: "proveedor", titulo: "Proveedores" },
  { para: "cliente", titulo: "Clientes" },
  { para: "admin", titulo: "Administración" },
];

interface Props {
  datos: AvisoConEnlace[] | undefined;
  error: string | undefined;
  recargar: () => Promise<void>;
}

export function Avisos({ datos, error, recargar }: Props) {
  // Pendientes y fallidos: lo que falta por mandar y lo que WhatsApp no pudo entregar.
  const pendientes = datos?.filter((aviso) => aviso.estado === "pendiente" || aviso.estado === "fallido");
  const estado = useDatos(api.estado);

  return (
    <div className="space-y-4">
      {estado.datos?.whatsapp ? (
        <Mensaje tipo="bien">WhatsApp está conectado: los avisos salen solos. Aquí quedan los que están por salir y los que no se pudieron mandar.</Mensaje>
      ) : (
        <Mensaje tipo="nota">WhatsApp todavía no está conectado: estos avisos se mandan a mano.</Mensaje>
      )}
      {error && <Mensaje>{error}</Mensaje>}
      {!pendientes ? (
        !error && <Cargando />
      ) : pendientes.length === 0 ? (
        <Vacio>No hay avisos pendientes.</Vacio>
      ) : (
        GRUPOS.map(({ para, titulo }) => {
          const grupo = pendientes.filter((aviso) => aviso.para === para);
          if (grupo.length === 0) return null;
          return (
            <section key={para} aria-label={titulo} className="space-y-3">
              <h2 className="text-base font-bold">
                {titulo} ({grupo.length})
              </h2>
              {grupo.map((aviso) => (
                <TarjetaDeAviso key={aviso.id} aviso={aviso} alResolver={recargar} />
              ))}
            </section>
          );
        })
      )}
    </div>
  );
}

function TarjetaDeAviso({ aviso, alResolver }: { aviso: AvisoConEnlace; alResolver: () => Promise<void> }) {
  const { ocupado, error, correr } = useAccion();
  const resolver = (estado: "enviado" | "descartado") =>
    correr(async () => {
      await api.resolverAviso(aviso.id, estado);
      await alResolver();
    });

  return (
    <Tarjeta className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold">
          {aviso.destinatario ?? "Administración"}
          {aviso.telefono && <span className="ml-2 font-normal text-tenue">{aviso.telefono}</span>}
        </p>
        <span className="text-xs text-tenue">{haceCuanto(aviso.creado_en)}</span>
      </div>
      <p className="whitespace-pre-wrap rounded-xl bg-fondo p-3 text-sm">{aviso.texto}</p>
      {aviso.estado === "fallido" && (
        <p className="text-sm text-red-700">
          <Etiqueta color="rojo">No se pudo mandar</Etiqueta> {aviso.error}
        </p>
      )}
      {error && <Mensaje>{error}</Mensaje>}
      <div className="flex flex-wrap gap-2">
        {aviso.para === "admin" ? (
          <Boton chico disabled={ocupado} onClick={() => void resolver("descartado")}>
            Enterado
          </Boton>
        ) : (
          <>
            {aviso.whatsapp && (
              <EnlaceBoton chico tono="acento" href={aviso.whatsapp}>
                Abrir WhatsApp
              </EnlaceBoton>
            )}
            {aviso.whatsapp && (
              <Boton chico disabled={ocupado} onClick={() => void resolver("enviado")}>
                Ya lo envié
              </Boton>
            )}
            <Boton chico tono="claro" disabled={ocupado} onClick={() => void resolver("descartado")}>
              Descartar
            </Boton>
          </>
        )}
      </div>
    </Tarjeta>
  );
}
