import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db } from "../lib/db.js";
import { siteSettings, insertSiteSettingsSchema } from "../../shared/schema.js";

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
      const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
      return res.status(200).json(settings || {});
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch settings" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const validatedData = insertSiteSettingsSchema.partial().parse(req.body);
      
      const [existing] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
      if (!existing) {
        const [settings] = await db.insert(siteSettings).values({ ...validatedData, id: 1 } as any).returning();
        return res.status(200).json(settings);
      }
      
      const [settings] = await db.update(siteSettings).set(validatedData).where(eq(siteSettings.id, 1)).returning();
      return res.status(200).json(settings);
    } catch (error) {
      console.error("Admin Settings update error:", error);
      return res.status(500).json({ error: "Failed to update settings" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
