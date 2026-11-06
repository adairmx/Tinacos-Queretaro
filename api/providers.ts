import type { VercelRequest, VercelResponse } from "@vercel/node";
import { desc, eq } from "drizzle-orm";
import { db } from "./lib/db.js";
import { providers, insertProviderSchema } from "../shared/schema.js";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // CORS
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (request.method === "OPTIONS") {
    return response.status(200).end();
  }

  if (request.method === "GET") {
    try {
      const city = request.query.city as string | undefined;
      const items = city
        ? await db.select().from(providers).where(eq(providers.city, city)).orderBy(desc(providers.rating))
        : await db.select().from(providers).orderBy(desc(providers.createdAt));

      return response.status(200).json(items);
    } catch (error) {
      console.error("Error fetching providers:", error);
      return response.status(500).json({ error: "Failed to fetch providers" });
    }
  }

  if (request.method === "POST") {
    try {
      let body;
      try {
        body = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
      } catch {
        return response.status(400).json({ error: "Invalid JSON in request body" });
      }

      const providerData = {
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        city: body.city || "Querétaro",
        state: body.state || "Querétaro",
        coverageAreas: body.coverageAreas || "",
        status: body.status || "prospecto",
        experienceYears: body.experienceYears ? Number(body.experienceYears) : 1,
        hasOwnEquipment: body.hasOwnEquipment !== undefined ? Number(body.hasOwnEquipment) : 1,
        commissionAgreedPct: body.commissionAgreedPct ? Number(body.commissionAgreedPct) : 30,
        notes: body.notes || "",
      };

      const validated = insertProviderSchema.parse(providerData);
      const [newProv] = await db.insert(providers).values(validated).returning();

      return response.status(201).json({
        success: true,
        message: "Proveedor registrado con éxito",
        provider: newProv,
      });
    } catch (error) {
      console.error("Error creating provider:", error);
      return response.status(400).json({ error: "Invalid input data", details: error });
    }
  }

  return response.status(405).json({ error: "Method not allowed" });
}

