import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { sql, eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull().default("MonsterCo"),
  image: text("image").notNull(),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
});

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  const sqlClient = neon(process.env.DATABASE_URL);
  return drizzle(sqlClient);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;

  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "Slug is required" });
  }

  try {
    const db = getDb();
    
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
