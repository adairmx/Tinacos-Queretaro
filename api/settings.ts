import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db } from "./_lib/db.js";
import { requireAdmin } from "./_lib/auth.js";
import { siteSettings, insertSiteSettingsSchema } from "../shared/schema.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
      return res.status(200).json(settings || {});
    }

    if (req.method === "PATCH") {
      if (!requireAdmin(req, res)) return;

      const validatedData = insertSiteSettingsSchema.partial().parse(req.body);
      const [existing] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
      const [settings] = existing
        ? await db.update(siteSettings).set(validatedData).where(eq(siteSettings.id, 1)).returning()
        : await db.insert(siteSettings).values({ ...validatedData, id: 1 } as any).returning();
      return res.status(200).json(settings);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Settings API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
