import pg from "pg";
const { Pool } = pg;

async function listAll() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query(`
      SELECT id, title, date, created_at FROM blog_posts ORDER BY created_at DESC
    `);
    console.log("All posts:");
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

listAll();
