import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq, or } from "drizzle-orm";
import { db } from "../lib/db.js";
import { blogPosts, insertBlogPostSchema } from "../../shared/schema.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug: identifier } = req.query;

  if (!identifier || typeof identifier !== "string") {
    return res.status(400).json({ error: "Identifier (id or slug) is required" });
  }

  try {
    if (req.method === "GET") {
      const [post] = await db
        .select()
        .from(blogPosts)
        .where(or(eq(blogPosts.id, identifier), eq(blogPosts.slug, identifier)));
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      return res.status(200).json(post);
    }

    if (req.method === "PATCH") {
      const validatedData = insertBlogPostSchema.partial().parse(req.body);
      const [post] = await db
        .update(blogPosts)
        .set(validatedData)
        .where(or(eq(blogPosts.id, identifier), eq(blogPosts.slug, identifier)))
        .returning();
      
      if (!post) {
        console.error(`Vercel API: Post not found for update with identifier: ${identifier}`);
        return res.status(404).json({ 
          error: "Post not found",
          message: `No se encontró el artículo con ID o Slug: [${identifier}]`
        });
      }
      return res.status(200).json(post);
    }

    if (req.method === "DELETE") {
      await db
        .delete(blogPosts)
        .where(or(eq(blogPosts.id, identifier), eq(blogPosts.slug, identifier)));
      return res.status(204).send(null);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Blog API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
