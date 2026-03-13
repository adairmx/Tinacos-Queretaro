import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db } from "./lib/db.js";
import { authors } from "../shared/schema.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const [author] = await db.select().from(authors).where(eq(authors.id, 1));
    return res.status(200).json(author || {});
  } catch (error) {
    console.error("Author API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
