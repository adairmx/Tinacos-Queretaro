import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db } from "./lib/db.js";
import { siteSettings } from "../shared/schema.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
    return res.status(200).json(settings || {});
  } catch (error) {
    console.error("Settings API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
