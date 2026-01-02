import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../lib/db";
import { blogPosts, insertBlogPostSchema } from "../../shared/schema";
import { eq } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;

  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "Slug is required" });
  }

  try {
    if (req.method === "GET") {
      const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
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
        .where(eq(blogPosts.slug, slug))
        .returning();
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      return res.status(200).json(post);
    }

    if (req.method === "DELETE") {
      await db.delete(blogPosts).where(eq(blogPosts.slug, slug));
      return res.status(204).send(null);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Blog API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
