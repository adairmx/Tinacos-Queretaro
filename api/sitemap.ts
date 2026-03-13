import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./lib/db.js";
import { blogPosts } from "../shared/schema.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const posts = await db.select().from(blogPosts).orderBy(blogPosts.createdAt);

    const baseUrl = "https://lavadotinacos.com";
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${posts
    .map((post) => `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`)
    .join("")}
</urlset>`;

    res.setHeader("Content-Type", "text/xml");
    res.write(sitemap);
    res.end();
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
