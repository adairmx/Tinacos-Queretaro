import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ab_events (
      id SERIAL PRIMARY KEY,
      experiment TEXT NOT NULL,
      variant TEXT NOT NULL,
      visitor_id TEXT NOT NULL,
      event TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS ab_events_unique
    ON ab_events (experiment, visitor_id, event);
  `);
  console.log("Tabla ab_events lista.");
  await pool.end();
}

init().catch((error) => {
  console.error("No se pudo crear la tabla ab_events:", error);
  process.exit(1);
});
