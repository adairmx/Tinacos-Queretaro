import pg from "pg";
const { Pool } = pg;

async function findPost() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query(`
      SELECT id, title, slug FROM blog_posts WHERE title ILIKE '%Enfermedades%'
    `);
    console.log("Found posts:");
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

findPost();
