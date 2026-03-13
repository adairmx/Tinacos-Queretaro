import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db } from "../lib/db.js";
import { authors, insertAuthorSchema } from "../../shared/schema.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    try {
      const [author] = await db.select().from(authors).where(eq(authors.id, 1));
      return res.status(200).json(author || {});
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch author" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const validatedData = insertAuthorSchema.partial().parse(req.body);
      
      const [existing] = await db.select().from(authors).where(eq(authors.id, 1));
      if (!existing) {
        // Fallback for first time
        const [author] = await db.insert(authors).values(validatedData as any).returning();
        return res.status(200).json(author);
      }
      
      const [author] = await db.update(authors).set(validatedData).where(eq(authors.id, 1)).returning();
      return res.status(200).json(author);
    } catch (error) {
      console.error("Admin Author update error:", error);
      return res.status(500).json({ error: "Failed to update author" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
