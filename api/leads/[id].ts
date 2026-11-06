import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db } from "../lib/db.js";
import { leads } from "../../shared/schema.js";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // CORS
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "PATCH,OPTIONS");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (request.method === "OPTIONS") {
    return response.status(200).end();
  }

  const { id } = request.query;
  const leadId = parseInt(id as string, 10);

  if (isNaN(leadId)) {
    return response.status(400).json({ error: "Invalid lead ID" });
  }

  if (request.method === "PATCH") {
    try {
      let body;
      try {
        body = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
      } catch {
        return response.status(400).json({ error: "Invalid JSON in request body" });
      }

      const [updated] = await db
        .update(leads)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(leads.id, leadId))
        .returning();

      if (!updated) {
        return response.status(404).json({ error: "Lead not found" });
      }

      return response.status(200).json(updated);
    } catch (error) {
      console.error("Error updating lead:", error);
      return response.status(500).json({ error: "Failed to update lead" });
    }
  }

  return response.status(405).json({ error: "Method not allowed" });
}
