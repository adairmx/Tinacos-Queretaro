# Operación — guía para Claude

Sección de operación del proyecto **MonsterCo Lavado de Tinacos y Cisternas**: el servidor, la base y los portales
de proveedores y de administración. Háblale a Adair en español, de tú. Su terminal es PowerShell 5.1.

**Es el mismo proyecto que el sitio, en dos secciones** (Adair, 14 nov 2026: «es el mismo proyecto»):

- La raíz del repositorio (`client/`, `api/`, `shared/`) es la página pública lavadotinacos.com, que se publica en
  Vercel. Vercel ignora esta carpeta (`.vercelignore`).
- `operacion/` (esta carpeta) tiene su propio `package.json` y se publicará en su propio servidor, porque Vercel no
  sostiene llamadas de voz en vivo ni tareas programadas.

De lo que sí va aparte: Hustly (no se toca) y Justicia (`C:\proyectos\Justicia`, crítico, sólo se lee para adaptar
piezas). Pendiente de unificar con el sitio: las ciudades y los precios hoy están copiados en `operacion/shared/`.

## El negocio (dictado por Adair el 14 de noviembre de 2026)

- MonsterCo promociona y vende; **el servicio lo hace un proveedor externo en todas las ciudades**, Querétaro
  incluida. Adair recluta a los proveedores; ellos se adaptan a sus protocolos y estándares.
- **El cliente le paga directo al proveedor.** El proveedor le liquida a la casa su comisión **servicio por
  servicio**, por transferencia, al terminar («tenemos que hacer historial»). Con quien ya cumplió se puede pasar a
  corte semanal. La comisión es por proveedor y puede ir en cero: hoy la prioridad es conseguir clientes y armar la
  red, «incluso si hay que regalar». En Querétaro Adair se arregla directo con ellos.
- Sin bloqueos automáticos por adeudo todavía: sólo se ve quién debe. Se ajusta con la experiencia.

## El flujo que el sistema tiene que cumplir

1. Entra el lead (llamada, WhatsApp, Messenger, formulario). Se aplica el speech, se cierra y **se agenda en esa
   misma conversación, sin esperar ni preguntarle a nadie**.
2. Los horarios salen en tiempo real de la **disponibilidad que cada proveedor carga** en su cuenta.
3. Se le ofrecen **dos opciones** («hoy a tal hora o mañana a tal hora»). **Sólo el primer servicio del día tiene
   hora fija**; los demás son hora aproximada, porque dependen de los servicios anteriores.
4. Ya agendado, se avisa a los proveedores de la ciudad (WhatsApp y plataforma). **El primero que lo toma se lo
   queda** y el servicio queda con candado.
5. Confirmación al cliente **la noche anterior** y **en la mañana, al menos una hora antes**.
6. El proveedor marca **«Voy en camino»** y el sistema le avisa al cliente que llegan en la próxima hora.
7. Seguimiento posterior, protocolos y **recordatorio cada 6 meses**: los controla el sistema.

Reglas que propuse y Adair no objetó: cada cita descuenta un lugar del horario, para no prometer de más; si nadie
toma un servicio en 30 minutos se le avisa a Adair.

## Qué está construido (etapa 1: plataforma de proveedores)

- Registro público de proveedores (quedan pendientes), alta y aprobación por la casa, acceso sin contraseña con
  enlace de un solo uso.
- Disponibilidad por día y bloque de dos horas (`shared/bloques.ts`), con copia a la semana siguiente.
- Agenda con cupo: las dos opciones para el cliente, candado de «el primero que lo toma», un servicio por
  proveedor y bloque, «voy en camino», terminado, comisión fijada al tomar y cuenta de lo que se debe.
- Avisos: se guardan en la tabla `avisos`, cada uno con su plantilla de WhatsApp y sus valores
  (`server/lib/plantillas.ts`). Con `WHATSAPP_TOKEN` y `WHATSAPP_PHONE_ID` salen solos por la API de Meta cada 10 s
  (`server/repos/despacho.ts`: aparta, manda, reintenta lo pasajero hasta 5 veces y deja como «fallido» lo demás).
  Sin esas variables se mandan a mano desde el panel con un enlace `wa.me`. **Al 14 nov 2026 no hay credenciales:
  el envío real contra Meta no se ha probado**, sólo con un WhatsApp de mentiras en las pruebas.
- Webhook de Meta en `/api/whatsapp/webhook` (firma con `WHATSAPP_APP_SECRET`): anota entregado y leído, regresa al
  panel lo que no se pudo entregar y guarda lo que contesta la gente (`mensajes_entrantes`), avisándole a la casa.
- `npm run plantillas` imprime las plantillas que hay que tener aprobadas en Meta; con `-- --registrar` intenta
  darlas de alta por la API (sin probar).
- Bitácora por servicio (`servicio_eventos`) que no se edita.
- Avisos por reloj (`server/repos/programados.ts`, los genera el vigía cada minuto, cada uno una sola vez):
  confirmación al cliente la víspera a las 7 p.m., otra el día del servicio a las 7 a.m., y recordatorio a los 180
  días de un servicio terminado (de 10 a 18 h, sólo si el cliente no ha vuelto). Si la víspera nadie ha tomado el
  servicio, no se le confirma al cliente: se le avisa a la casa.

## Lo que sigue, en orden

1. ~~Avisos al cliente programados~~ (hecho el 14 nov 2026).
2. Conectar WhatsApp: el código ya está; falta de Adair el número, la cuenta de WhatsApp Business en Meta (token,
   id del número, id de la cuenta, secreto de la app), aprobar las plantillas y publicar el servidor para que Meta
   alcance el webhook.
3. Agente de mensajes (WhatsApp y Messenger) con el guion que salga de las grabaciones de llamadas de Adair.
4. Agente de voz entrante y luego saliente (Twilio + los motores que ya usa Justicia: Phonic, PolyAI, Deepgram).
5. Publicarlo (Railway, con Postgres, desde esta carpeta). Falta decidir la dirección de los portales (por ejemplo
   un subdominio de lavadotinacos.com) y qué pasa con el número 442 501 6667.
6. Que el sitio mande sus leads aquí, para que formulario, mensajes y llamadas caigan en el mismo lugar.

## Técnica

- **Servidor:** Node 22+ con TypeScript corrido por `tsx`, Express 5, zod. Un solo proceso; el vigía de servicios
  sin proveedor corre cada minuto dentro del proceso.
- **Base:** Postgres. En producción `DATABASE_URL`; sin ella usa PGlite (Postgres dentro del proceso) guardado en
  `.datos/`, y en memoria para las pruebas. SQL a mano en `server/repos/`; migraciones en `server/migrations/`
  (las nuevas van en archivo nuevo, nunca se edita una aplicada).
- **Panel:** React 19 + Vite + Tailwind v4 en `web/`. `/` registro público, `/proveedor` la app del proveedor
  (celular primero), `/admin` administración.
- **Compartido:** `shared/` (ciudades, bloques, fechas, precios, tipos) lo usan servidor y panel.
- Las fechas de servicio son días de calendario de la ciudad (`AAAA-MM-DD`); «hoy» depende de su zona horaria.
- Los errores de regla de negocio son `Rechazo` (código estable + texto para la persona).

### Correr

```powershell
Set-Location operacion
npm install
Copy-Item .env.example .env   # y pon ADMIN_PASSWORD
npm run dev                   # servidor en :3100 y panel en :5173
npm run pruebas               # reglas de agenda y flujo completo por HTTP
npm run pruebas:postgres      # lo mismo contra un Postgres real temporal
npm run build                 # tipos + pruebas + panel compilado en dist/
```

### Cuidados

- `npm run pruebas` usa el Postgres dentro del proceso, que es de una sola conexión. `npm run pruebas:postgres` corre lo
  mismo contra un Postgres real temporal, con el controlador de producción y conexiones simultáneas: córrelo antes
  de publicar cambios en la agenda o en la toma de servicios.
- El freno de intentos de entrada vive en memoria: sirve para un solo servidor.
- `vite.config.ts` fija PostCSS vacío a propósito: sin eso el panel hereda el `postcss.config.js` del sitio (una
  carpeta arriba, otra versión de Tailwind) y no compila.
- No guardar secretos en el repositorio; `.env` y `.datos/` están en `.gitignore`.
