import pg from "pg";
const { Pool } = pg;

async function checkData() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query(`
      SELECT id, title, slug FROM blog_posts LIMIT 5
    `);
    console.log("Post IDs and titles:");
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkData();
