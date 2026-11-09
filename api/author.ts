import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db } from "./_lib/db.js";
import { requireAdmin } from "./_lib/auth.js";
import { authors, insertAuthorSchema } from "../shared/schema.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const [author] = await db.select().from(authors).where(eq(authors.id, 1));
      return res.status(200).json(author || {});
    }

    if (req.method === "PATCH") {
      if (!requireAdmin(req, res)) return;

      const validatedData = insertAuthorSchema.partial().parse(req.body);
      const [existing] = await db.select().from(authors).where(eq(authors.id, 1));
      const [author] = existing
        ? await db.update(authors).set(validatedData).where(eq(authors.id, 1)).returning()
        : await db.insert(authors).values(validatedData as any).returning();
      return res.status(200).json(author);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Author API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
