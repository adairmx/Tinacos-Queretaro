import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { sql, desc } from "drizzle-orm";
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
  try {
    const db = getDb();
    
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
