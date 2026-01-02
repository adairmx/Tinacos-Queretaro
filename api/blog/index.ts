import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../lib/db";
import { blogPosts, insertBlogPostSchema } from "../../shared/schema";
import { desc } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const posts = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
      return res.status(200).json(posts);
    }

    if (req.method === "POST") {
      const validatedData = insertBlogPostSchema.parse(req.body);
      const [post] = await db.insert(blogPosts).values(validatedData).returning();
      return res.status(201).json(post);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Blog API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
