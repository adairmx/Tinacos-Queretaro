import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db } from "../_lib/db.js";
import { requireAdmin } from "../_lib/auth.js";
import { leads } from "../../shared/schema.js";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {

  const { id } = request.query;
  const leadId = parseInt(id as string, 10);

  if (isNaN(leadId)) {
    return response.status(400).json({ error: "Invalid lead ID" });
  }

  if (request.method === "PATCH") {
    if (!requireAdmin(request, response)) return;
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

