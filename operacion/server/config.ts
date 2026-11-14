import { normalizarTelefono } from "../shared/telefono.ts";

const numero = (nombre: string, porOmision: number) => {
  const valor = Number(process.env[nombre]);
  return Number.isFinite(valor) && valor > 0 ? valor : porOmision;
};

export const config = {
  /** En desarrollo PUERTO_API (del .env) manda sobre PORT, que algunas herramientas fijan al puerto del panel. */
  puerto: numero("PUERTO_API", numero("PORT", 3100)),
  databaseUrl: process.env.DATABASE_URL,
  /** Carpeta del Postgres local cuando no hay DATABASE_URL. */
  carpetaDeDatos: process.env.CARPETA_DE_DATOS ?? ".datos",
  /** Dirección pública de la plataforma, para los enlaces que van en los avisos. */
  urlPublica: (process.env.URL_PUBLICA ?? "http://localhost:5173").replace(/\/$/, ""),
  adminPassword: process.env.ADMIN_PASSWORD,
  produccion: process.env.NODE_ENV === "production",
  /** No se ofrece un bloque de hoy que empiece antes de este margen. */
  anticipacionMinutos: numero("ANTICIPACION_MINUTOS", 90),
  /** Pasado este tiempo sin que nadie tome un servicio, se le avisa a la casa. */
  minutosSinProveedor: numero("MINUTOS_SIN_PROVEEDOR", 30),
  marca: "MonsterCo Lavado de Tinacos",
  /**
   * WhatsApp por la API de Meta. Con token y número, los avisos salen solos; sin ellos se mandan a mano desde el panel.
   * El secreto de la app y el token de verificación son para el webhook (entregas y respuestas).
   */
  whatsapp: {
    token: process.env.WHATSAPP_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_ID,
    appSecret: process.env.WHATSAPP_APP_SECRET,
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    wabaId: process.env.WHATSAPP_WABA_ID,
  },
  /** Secreto que comparte con el sitio público para que sólo él pueda mandar leads a la bandeja. */
  claveDelSitio: process.env.CLAVE_DEL_SITIO,
  /** WhatsApp de 10 dígitos donde la casa recibe sus avisos. Sin él sólo se ven en el panel. */
  adminWhatsapp: normalizarTelefono(process.env.ADMIN_WHATSAPP ?? ""),
};
