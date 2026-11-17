import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useSeo } from "@/hooks/use-seo";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import WhatsAppButton from "@/components/sections/WhatsAppButton";
import { PUNTO_CERO, RADIO_KM, TERMINOS_PATH } from "@shared/terminos";

const ACTUALIZADO = "16 de noviembre de 2026";
const CARGO_VISITA = "$300 MXN";
const CORREO = "lavadodetinacosqueretaro@gmail.com";
const WHATSAPP = "442 501 6667";

function Seccion({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 mb-10">
      <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-3">{titulo}</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

function Lista({ children }: { children: ReactNode }) {
  return <ul className="list-disc pl-5 space-y-1.5">{children}</ul>;
}

export default function Terminos() {
  useSeo({
    title: "Términos y Condiciones del Servicio | MonsterCo Lavado de Tinacos",
    description:
      "Condiciones del servicio de lavado de tinacos y cisternas: cobertura y precios, agenda, cancelaciones, garantía, pagos y aviso de privacidad.",
    path: TERMINOS_PATH,
  });

  // La página se pinta después de cargar, así que el navegador no alcanza a bajar solo a #privacidad.
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const espera = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), 200);
    return () => clearTimeout(espera);
  }, [hash]);

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 md:py-16">
        <article className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
            Términos y condiciones del servicio
          </h1>
          <p className="text-sm text-muted-foreground mb-8">Última actualización: {ACTUALIZADO}</p>

          <p className="text-muted-foreground leading-relaxed mb-10">
            Estos términos aplican a todos los servicios de lavado y desinfección de tinacos y cisternas que se
            contratan con MonsterCo por este sitio, WhatsApp, teléfono o redes sociales. Al agendar un servicio
            aceptas estas condiciones. Si algo no te queda claro, pregúntanos antes de agendar.
          </p>

          <Seccion id="quien" titulo="1. Quién presta el servicio">
            <p>
              MonsterCo atiende, cotiza y agenda tu servicio. El trabajo en tu domicilio lo realiza un técnico o
              empresa aliada de nuestra red en tu ciudad, que trabaja con nuestros protocolos de lavado y
              desinfección. MonsterCo da seguimiento a cada servicio y atiende cualquier aclaración o queja.
            </p>
          </Seccion>

          <Seccion id="cobertura" titulo="2. Cobertura y precios">
            <Lista>
              <li>
                Los precios publicados son para <strong>casa habitación</strong> y aplican dentro de un radio de{" "}
                <strong>{RADIO_KM} km del punto cero</strong> de cada ciudad (tabla de abajo), medidos por el camino
                más corto en Google Maps.
              </li>
              <li>
                Si tu domicilio está más lejos, la tarifa <strong>se recalcula</strong> por el traslado. Te damos el
                total antes de confirmar la cita; nunca se cobra un extra que no hayas aceptado.
              </li>
              <li>
                El precio de tinaco aplica para depósitos de hasta 1,100 litros y el de cisterna para depósitos de
                hasta 5,000 litros. Depósitos más grandes, varios depósitos, edificios, comercios, industrias o
                depósitos subterráneos de difícil acceso se cotizan por separado.
              </li>
              <li>
                El precio incluye vaciado del remanente, retiro de lodos, lavado y desinfección del depósito. No
                incluye reparaciones, piezas (flotadores, válvulas, pichanchas, tapas, tuberías), trabajos de
                plomería o impermeabilización, ni análisis de laboratorio del agua. Si el técnico detecta algo que
                arreglar, te lo cotiza y sólo se hace si lo autorizas.
              </li>
              <li>
                Los precios están en pesos mexicanos y pueden cambiar sin previo aviso. Se respeta el precio que te
                confirmamos al agendar. Si necesitas factura, pídela al agendar: el precio puede ajustarse por
                impuestos.
              </li>
              <li>
                Las promociones y descuentos aplican sólo en las fechas, ciudades y condiciones que se indiquen, y no
                se combinan entre sí.
              </li>
            </Lista>

            <div className="overflow-x-auto mt-4 rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-foreground">
                  <tr>
                    <th className="text-left font-semibold px-4 py-2">Ciudad</th>
                    <th className="text-left font-semibold px-4 py-2">Punto cero ({RADIO_KM} km a la redonda)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(PUNTO_CERO).map(([slug, { ciudad, punto }]) => (
                    <tr key={slug} className="border-t border-border">
                      <td className="px-4 py-2 text-foreground">{ciudad}</td>
                      <td className="px-4 py-2">{punto}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Seccion>

          <Seccion id="agenda" titulo="3. Agenda y horario de llegada">
            <Lista>
              <li>
                Sólo el primer servicio del día tiene hora fija. En los demás te damos un horario aproximado, porque
                depende de cómo terminen los servicios anteriores, del tránsito y del clima. Te avisamos cuando el
                técnico vaya en camino.
              </li>
              <li>Te confirmamos la cita la noche anterior y la mañana del servicio.</li>
              <li>
                Un servicio tarda normalmente de una a dos horas por depósito; puede tardar más si hay mucho
                sedimento o el acceso es complicado.
              </li>
            </Lista>
          </Seccion>

          <Seccion id="cliente" titulo="4. Lo que necesitamos de ti">
            <Lista>
              <li>Que una persona mayor de edad esté en el domicilio para dar acceso y recibir el trabajo.</li>
              <li>
                Acceso seguro al depósito: azotea o techo con paso firme, escalera cuando haga falta, tapa de cisterna
                que se pueda abrir y espacio para trabajar.
              </li>
              <li>
                De preferencia, bajar el nivel de agua uno o dos días antes. El agua que quede en el depósito se
                desecha durante el lavado.
              </li>
              <li>Una toma de corriente cercana para el equipo y una llave de agua para el enjuague.</li>
              <li>Mascotas resguardadas durante el servicio.</li>
              <li>
                Avisarnos de cualquier condición especial: fugas, grietas, depósitos muy viejos, bomba con fallas o
                tinacos de asbesto.
              </li>
            </Lista>
            <p>
              El técnico puede negarse a trabajar, o detener el trabajo, si las condiciones no son seguras (azoteas
              sin protección, lluvia, instalaciones eléctricas expuestas, depósitos de asbesto dañados u otras). En
              ese caso se reprograma cuando las condiciones lo permitan.
            </p>
          </Seccion>

          <Seccion id="cancelaciones" titulo="5. Cambios y cancelaciones por nuestra parte">
            <p>
              Podemos reprogramar o cancelar un servicio, incluso el mismo día, por causas fuera de nuestro control,
              entre ellas:
            </p>
            <Lista>
              <li>Lluvia, tormenta eléctrica, viento fuerte u otras condiciones climáticas que hagan inseguro el trabajo.</li>
              <li>Falta de disponibilidad del técnico por enfermedad, accidente, falla del vehículo o del equipo.</li>
              <li>
                Contingencias: emergencias sanitarias, cortes de agua o luz, bloqueos, manifestaciones, problemas de
                seguridad, desastres naturales o disposiciones de las autoridades.
              </li>
            </Lista>
            <p>
              En esos casos te avisamos en cuanto lo sepamos y te damos prioridad para la nueva fecha. Si diste algún
              anticipo, te lo devolvemos completo si no quieres reprogramar. Fuera de esa devolución no se generan
              penalizaciones ni compensaciones adicionales.
            </p>
          </Seccion>

          <Seccion id="cancelacion-cliente" titulo="6. Cambios y cancelaciones por tu parte">
            <Lista>
              <li>Puedes cambiar o cancelar tu cita sin costo avisando al menos 12 horas antes.</li>
              <li>
                Si cancelas cuando el técnico ya va en camino, o si al llegar no puede trabajar por causas del
                domicilio (nadie abre, no hay acceso al depósito, el depósito no es el que se describió), se cobra un
                cargo de visita de {CARGO_VISITA} por el traslado.
              </li>
              <li>
                Si al llegar el depósito es más grande o está en condiciones distintas a las que nos dijiste, el
                técnico te informa el nuevo precio antes de empezar. Si no lo aceptas, aplica el cargo de visita.
              </li>
            </Lista>
          </Seccion>

          <Seccion id="pagos" titulo="7. Pagos">
            <Lista>
              <li>
                En servicios de casa habitación no pedimos anticipo: pagas al terminar, cuando ya revisaste el
                trabajo, en efectivo o transferencia al técnico que te atendió.
              </li>
              <li>
                Si un servicio requiere anticipo (zonas alejadas, servicios grandes o comerciales), te lo pedimos
                únicamente desde nuestro WhatsApp oficial ({WHATSAPP}). No hagas pagos a cuentas que te den por otro
                medio sin confirmarlo con nosotros.
              </li>
            </Lista>
          </Seccion>

          <Seccion id="garantia" titulo="8. Garantía y alcance del servicio">
            <Lista>
              <li>
                Antes de irse, el técnico te muestra el depósito limpio. Si encuentras sedimento o suciedad que debió
                retirarse, avísanos en las siguientes <strong>48 horas</strong> con fotos y regresamos a revisarlo sin
                costo.
              </li>
              <li>
                El servicio limpia y desinfecta el depósito. La calidad del agua que llega después depende de la red
                municipal, la pipa o el pozo que te abastece, de las tuberías y de que el depósito permanezca tapado.
                El agua turbia, el sarro o la contaminación que lleguen por el suministro no los cubre la garantía.
              </li>
              <li>
                El lavado no hace potable el agua ni sustituye un análisis de laboratorio. Para beber, usa agua
                purificada o un sistema de filtrado adecuado.
              </li>
              <li>
                Es normal que después del lavado entre aire en las tuberías o que la bomba deba cebarse. El técnico te
                ayuda a dejarla funcionando, pero no responde por bombas, hidroneumáticos o flotadores que ya
                tuvieran fallas.
              </li>
            </Lista>
          </Seccion>

          <Seccion id="danos" titulo="9. Daños y condiciones previas">
            <Lista>
              <li>
                Antes de empezar, el técnico revisa el depósito y te comenta lo que encuentre (grietas, fugas,
                piezas rotas, tinacos quebradizos por el sol). Puede tomar fotos como evidencia.
              </li>
              <li>
                No somos responsables de fallas que ya existían ni de las que aparezcan por el desgaste o la
                antigüedad de depósitos, conexiones, válvulas, tapas o tuberías al manipularlas de forma normal.
              </li>
              <li>
                Si consideras que el técnico causó un daño por descuido, repórtalo en las siguientes 24 horas con
                fotos. Lo revisamos con el técnico y te damos una respuesta.
              </li>
            </Lista>
          </Seccion>

          <Seccion id="fotos" titulo="10. Fotos del trabajo">
            <p>
              El técnico toma fotos del depósito antes y después del lavado para control de calidad. Podemos usar
              fotos del depósito (nunca de personas ni de datos que identifiquen tu domicilio) para mostrar nuestro
              trabajo. Si no quieres que se usen, dínoslo y no se publican.
            </p>
          </Seccion>

          <Seccion id="privacidad" titulo="11. Aviso de privacidad">
            <p>
              MonsterCo, con domicilio en Querétaro, Qro., es responsable de los datos personales que nos
              proporcionas (nombre, teléfono, domicilio, ciudad y detalles del servicio), conforme a la Ley Federal
              de Protección de Datos Personales en Posesión de los Particulares.
            </p>
            <p>
              Los usamos para darte informes, cotizar, agendar y confirmar tu servicio, darle seguimiento y
              recordarte el siguiente lavado. Para poder atenderte, compartimos tu nombre, teléfono, domicilio y los
              detalles del servicio con el técnico aliado que hará el trabajo. No vendemos tus datos ni los usamos
              para otros fines.
            </p>
            <p>
              Puedes pedir acceder, corregir o borrar tus datos, oponerte a su uso o dejar de recibir recordatorios
              escribiendo a {CORREO} o por WhatsApp al {WHATSAPP}.
            </p>
          </Seccion>

          <Seccion id="cambios" titulo="12. Cambios a estos términos">
            <p>
              Podemos actualizar estos términos. La versión vigente es la publicada en esta página; a tu servicio le
              aplica la que estaba vigente cuando lo agendaste.
            </p>
          </Seccion>

          <Seccion id="contacto" titulo="13. Contacto y aclaraciones">
            <p>
              Para cualquier duda, queja o aclaración escríbenos por WhatsApp al {WHATSAPP} o a {CORREO}. Si no
              llegamos a un acuerdo, puedes acudir a la Procuraduría Federal del Consumidor (PROFECO). Para lo no
              previsto aquí, aplican las leyes mexicanas y los tribunales de Querétaro, Qro.
            </p>
          </Seccion>
        </article>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
