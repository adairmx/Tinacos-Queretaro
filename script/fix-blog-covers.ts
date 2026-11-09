import pg from "pg";

const covers: Record<string, string> = {
  "sarro-en-tinaco-y-calentador-como-evitar-que-tape-tuberias": "/images/blog/sarro-en-tinaco-y-calentador.webp",
  "cuanto-cuesta-lavado-de-tinacos-y-cisternas-precios-mexico": "/images/blog/precio-lavado-tinacos-y-cisternas.webp",
  "como-eliminar-lama-verde-verdin-del-tinaco": "/images/blog/eliminar-lama-verde-tinaco.webp",
  "cada-cuanto-tiempo-lavar-tinaco-y-cisterna-cofepris": "/images/blog/cada-cuanto-lavar-tinaco-cisterna.webp",
  "por-que-sale-agua-amarilla-o-mal-olor-en-la-regadera": "/images/blog/agua-amarilla-mal-olor-regadera.webp",
};

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  for (const [slug, image] of Object.entries(covers)) {
    const { rowCount } = await pool.query("UPDATE blog_posts SET image = $1 WHERE slug = $2", [image, slug]);
    console.log(`${rowCount === 1 ? "OK" : "SIN CAMBIOS"}: ${slug}`);
  }
  await pool.end();
}

main().catch((error) => {
  console.error("No se pudieron actualizar las portadas:", error);
  process.exit(1);
});
