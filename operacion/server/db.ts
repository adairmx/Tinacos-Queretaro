import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { CIUDADES } from "../shared/ciudades.ts";

/** Lo mínimo que usan los repos: una consulta con parámetros que regresa filas. */
export interface Consulta {
  query<Fila = Record<string, unknown>>(sql: string, parametros?: unknown[]): Promise<Fila[]>;
}

export interface Db extends Consulta {
  transaccion<T>(trabajo: (tx: Consulta) => Promise<T>): Promise<T>;
  /** Corre varias sentencias sin parámetros (migraciones). */
  ejecutar(sql: string): Promise<void>;
  cerrar(): Promise<void>;
}

const CARPETA_DE_MIGRACIONES = path.join(path.dirname(fileURLToPath(import.meta.url)), "migrations");

async function conPostgres(url: string): Promise<Db> {
  const { default: pg } = await import("pg");
  const pool = new pg.Pool({ connectionString: url, max: 10 });

  return {
    query: async (sql, parametros) => (await pool.query(sql, parametros)).rows,
    ejecutar: async (sql) => void (await pool.query(sql)),
    cerrar: () => pool.end(),
    async transaccion(trabajo) {
      const cliente = await pool.connect();
      try {
        await cliente.query("BEGIN");
        const resultado = await trabajo({ query: async (sql, parametros) => (await cliente.query(sql, parametros)).rows });
        await cliente.query("COMMIT");
        return resultado;
      } catch (error) {
        await cliente.query("ROLLBACK");
        throw error;
      } finally {
        cliente.release();
      }
    },
  };
}

/** Postgres dentro del proceso, para trabajar en la laptop y para las pruebas sin instalar nada. */
async function conPglite(carpeta?: string): Promise<Db> {
  const { PGlite } = await import("@electric-sql/pglite");
  const base = await PGlite.create(carpeta);

  return {
    query: async (sql, parametros) => (await base.query(sql, parametros)).rows as never,
    ejecutar: async (sql) => void (await base.exec(sql)),
    cerrar: () => base.close(),
    transaccion: (trabajo) =>
      base.transaction((tx) => trabajo({ query: async (sql, parametros) => (await tx.query(sql, parametros)).rows as never })) as never,
  };
}

async function migrar(db: Db) {
  await db.ejecutar("CREATE TABLE IF NOT EXISTS migraciones (nombre text PRIMARY KEY, aplicada_en timestamptz NOT NULL DEFAULT now())");
  const aplicadas = new Set((await db.query<{ nombre: string }>("SELECT nombre FROM migraciones")).map((m) => m.nombre));

  for (const nombre of readdirSync(CARPETA_DE_MIGRACIONES).filter((n) => n.endsWith(".sql")).sort()) {
    if (aplicadas.has(nombre)) continue;
    const sql = readFileSync(path.join(CARPETA_DE_MIGRACIONES, nombre), "utf8");
    await db.ejecutar(`BEGIN;\n${sql}\nINSERT INTO migraciones (nombre) VALUES ('${nombre}');\nCOMMIT;`);
  }

  for (const ciudad of CIUDADES) {
    await db.query(
      "INSERT INTO ciudades (slug, nombre, zona) VALUES ($1, $2, $3) ON CONFLICT (slug) DO UPDATE SET nombre = $2, zona = $3",
      [ciudad.slug, ciudad.nombre, ciudad.zona],
    );
  }
}

/**
 * Abre la base y la deja al día. Con `url` usa ese Postgres (producción); sin ella, uno dentro del proceso
 * guardado en `carpeta`, o en memoria si tampoco hay carpeta.
 */
export async function abrirDb(opciones: { url?: string; carpeta?: string } = {}): Promise<Db> {
  const deprueba = !opciones.url && !opciones.carpeta ? process.env.DATABASE_URL_PRUEBA : undefined;
  const db = deprueba ? await postgresDePrueba(deprueba) : opciones.url ? await conPostgres(opciones.url) : await conPglite(opciones.carpeta);
  await migrar(db);
  return db;
}

/**
 * Para correr las pruebas contra un Postgres de verdad (`npm run pruebas:postgres`): cada prueba empieza con la base
 * vacía. Como eso borra todo, sólo se acepta una base cuyo nombre diga que es de prueba.
 */
async function postgresDePrueba(url: string) {
  if (!/prueba/.test(new URL(url).pathname)) throw new Error("DATABASE_URL_PRUEBA debe apuntar a una base cuyo nombre contenga «prueba».");
  const db = await conPostgres(url);
  await db.ejecutar("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  return db;
}
