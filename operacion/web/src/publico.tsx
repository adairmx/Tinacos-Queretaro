import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { CIUDADES } from "../../shared/ciudades.ts";
import { api } from "./api.ts";
import { useSesion } from "./sesion.tsx";
import { Boton, Campo, Cargando, CLASE_DE_ENTRADA, Entrada, Mensaje, Tarjeta, useAccion } from "./ui.tsx";

function Marco({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 py-8">
      <p className="mb-6 text-center text-2xl font-black tracking-tight text-marca">MonsterCo</p>
      {children}
    </div>
  );
}

/** Portada: quien ya tiene sesión va a su panel; quien no, ve la invitación a trabajar con nosotros. */
export function Inicio() {
  const { yo } = useSesion();
  if (yo === undefined) return <Cargando />;
  if (yo?.tipo === "admin") return <Navigate to="/admin" replace />;
  if (yo?.tipo === "proveedor") return <Navigate to="/proveedor" replace />;

  return (
    <Marco>
      <h1 className="text-3xl font-extrabold leading-tight">Lava tinacos y cisternas con nosotros</h1>
      <p className="mt-3 text-tenue">
        Nosotros conseguimos al cliente y le agendamos la cita. Tú haces el servicio en tu ciudad, en los horarios que
        tú marques, y el cliente te paga a ti.
      </p>
      <ul className="mt-4 space-y-2 text-sm">
        <li>• Recibes los servicios en tu celular y los tomas con un toque.</li>
        <li>• Tú decides qué días y a qué horas trabajas.</li>
        <li>• Trabajas con nuestros protocolos de servicio y de trato al cliente.</li>
      </ul>
      <Registro />
      <p className="mt-8 text-center text-sm text-tenue">
        ¿Ya trabajas con nosotros? Entra con el enlace que te mandamos por WhatsApp.
        <br />
        <Link to="/admin/entrar" className="underline">
          Administración
        </Link>
      </p>
    </Marco>
  );
}

function Registro() {
  const [ciudades, setCiudades] = useState<string[]>([]);
  const [enviado, setEnviado] = useState(false);
  const { ocupado, error, correr } = useAccion();

  const alternar = (slug: string) => setCiudades((actuales) => (actuales.includes(slug) ? actuales.filter((c) => c !== slug) : [...actuales, slug]));

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const campos = new FormData(evento.currentTarget);
    const bien = await correr(() =>
      api.registrarse({
        nombre: String(campos.get("nombre")),
        telefono: String(campos.get("telefono")),
        ciudades,
        equipo: String(campos.get("equipo") ?? ""),
        experiencia: String(campos.get("experiencia") ?? ""),
        sitio: String(campos.get("sitio") ?? ""),
      }),
    );
    if (bien) setEnviado(true);
  }

  if (enviado) {
    return (
      <Tarjeta className="mt-6">
        <h2 className="text-lg font-bold">¡Listo, recibimos tus datos!</h2>
        <p className="mt-2 text-tenue">Te vamos a contactar por WhatsApp para platicar contigo y darte tu acceso a la plataforma.</p>
      </Tarjeta>
    );
  }

  return (
    <Tarjeta className="mt-6">
      <h2 className="mb-4 text-lg font-bold">Quiero trabajar con ustedes</h2>
      <form onSubmit={enviar} className="space-y-4">
        <Campo etiqueta="Nombre completo">
          <Entrada name="nombre" required minLength={3} maxLength={120} autoComplete="name" />
        </Campo>
        <Campo etiqueta="WhatsApp" ayuda="10 dígitos. Ahí te vamos a escribir.">
          <Entrada name="telefono" required type="tel" inputMode="tel" autoComplete="tel" placeholder="442 123 4567" />
        </Campo>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">¿En qué ciudades puedes atender?</legend>
          <div className="flex flex-wrap gap-2">
            {CIUDADES.map((ciudad) => (
              <button
                key={ciudad.slug}
                type="button"
                aria-pressed={ciudades.includes(ciudad.slug)}
                onClick={() => alternar(ciudad.slug)}
                className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${ciudades.includes(ciudad.slug) ? "border-marca bg-marca text-white" : "border-linea bg-white text-tinta"}`}
              >
                {ciudad.nombre}
              </button>
            ))}
          </div>
        </fieldset>
        <Campo etiqueta="¿Con qué equipo cuentas?" ayuda="Por ejemplo: hidrolavadora, bomba de achique, escalera.">
          <textarea name="equipo" rows={2} maxLength={500} className={CLASE_DE_ENTRADA} />
        </Campo>
        <Campo etiqueta="¿Qué experiencia tienes?">
          <textarea name="experiencia" rows={2} maxLength={500} className={CLASE_DE_ENTRADA} />
        </Campo>
        {/* Campo trampa: una persona no lo ve; un robot lo llena. */}
        <input name="sitio" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
        {error && <Mensaje>{error}</Mensaje>}
        <Boton type="submit" tono="acento" ancho disabled={ocupado || ciudades.length === 0}>
          {ocupado ? "Enviando…" : "Enviar mis datos"}
        </Boton>
        {ciudades.length === 0 && <p className="text-center text-xs text-tenue">Elige al menos una ciudad.</p>}
      </form>
    </Tarjeta>
  );
}

/** Canjea el enlace de un solo uso. Lo hace la página y no el servidor al abrirla, para que la vista previa de WhatsApp no lo gaste. */
export function EntrarConAcceso() {
  const { acceso = "" } = useParams();
  const { recargar } = useSesion();
  const navegar = useNavigate();
  const [error, setError] = useState<string>();
  const intentado = useRef(false);

  useEffect(() => {
    if (intentado.current) return;
    intentado.current = true;
    api
      .entrarConAcceso(acceso)
      .then(recargar)
      .then(() => navegar("/proveedor", { replace: true }))
      .catch((fallo: Error) => setError(fallo.message));
  }, [acceso, recargar, navegar]);

  return (
    <Marco>
      {error ? (
        <Tarjeta>
          <h1 className="text-lg font-bold">No pudimos abrir tu acceso</h1>
          <p className="mt-2 text-tenue">{error}</p>
          <p className="mt-2 text-sm text-tenue">Pídenos un enlace nuevo por WhatsApp.</p>
        </Tarjeta>
      ) : (
        <Cargando />
      )}
    </Marco>
  );
}

export function EntrarComoAdmin() {
  const { yo, recargar } = useSesion();
  const { ocupado, error, correr } = useAccion();
  if (yo?.tipo === "admin") return <Navigate to="/admin" replace />;

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const clave = String(new FormData(evento.currentTarget).get("clave"));
    if (await correr(() => api.entrarComoAdmin(clave))) await recargar();
  }

  return (
    <Marco>
      <Tarjeta>
        <h1 className="mb-4 text-lg font-bold">Administración</h1>
        <form onSubmit={enviar} className="space-y-4">
          <Campo etiqueta="Clave">
            <Entrada name="clave" type="password" required autoComplete="current-password" autoFocus />
          </Campo>
          {error && <Mensaje>{error}</Mensaje>}
          <Boton type="submit" ancho disabled={ocupado}>
            {ocupado ? "Entrando…" : "Entrar"}
          </Boton>
        </form>
      </Tarjeta>
    </Marco>
  );
}
