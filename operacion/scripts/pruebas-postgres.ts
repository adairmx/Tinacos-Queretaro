/**
 * Corre todas las pruebas contra un Postgres de verdad en vez del que vive dentro del proceso. Sirve para
 * comprobar lo que el Postgres local no puede: el controlador de producción y varias conexiones a la vez
 * (por ejemplo, dos proveedores tomando el mismo servicio en el mismo instante).
 *
 *   npm run pruebas:postgres
 *
 * Levanta un Postgres temporal (embedded-postgres lo baja por npm), corre las pruebas de una en una y lo apaga.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import EmbeddedPostgres from "embedded-postgres";

const PUERTO = Number(process.env.PG_PRUEBA_PUERTO || 5544);
const postgres = new EmbeddedPostgres({
  databaseDir: path.join(mkdtempSync(path.join(tmpdir(), "operacion-pg-")), "datos"),
  user: "postgres",
  password: "postgres",
  port: PUERTO,
  persistent: false,
  // UTF-8 como en producción; sin esto Windows lo crea en WIN1252 y los acentos truenan.
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
  onLog: () => {},
});

let salida = 1;
try {
  await postgres.initialise();
  await postgres.start();
  await postgres.createDatabase("operacion_prueba");

  // Los archivos de prueba comparten una sola base, así que van de uno en uno.
  const corrida = spawnSync(process.execPath, ["--import", "tsx", "--test", "--test-concurrency=1", "pruebas/*.test.ts"], {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL_PRUEBA: `postgres://postgres:postgres@localhost:${PUERTO}/operacion_prueba` },
  });
  salida = corrida.status ?? 1;
} finally {
  await postgres.stop();
}
process.exit(salida);
