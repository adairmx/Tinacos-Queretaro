import type { VercelRequest, VercelResponse } from "@vercel/node";
import { desc } from "drizzle-orm";
import { db } from "./lib/db.js";
import { leads, insertLeadSchema } from "../shared/schema.js";

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
      const items = await db.select().from(leads).orderBy(desc(leads.createdAt));
      return response.status(200).json(items);
    } catch (error) {
      console.error("Error fetching leads:", error);
      return response.status(500).json({ error: "Failed to fetch leads" });
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

      let estimatedPrice = body.estimatedPrice;
      let providerPayout = body.providerPayout;
      let commissionAmount = body.commissionAmount;
      const serviceType = (body.serviceType || "tinaco").toLowerCase();

      if (!estimatedPrice) {
        if (serviceType.includes("ambos") || serviceType.includes("paquete")) {
          estimatedPrice = 2200;
          providerPayout = 1500;
          commissionAmount = 700;
        } else if (serviceType.includes("cisterna")) {
          estimatedPrice = 1350;
          providerPayout = 950;
          commissionAmount = 400;
        } else {
          estimatedPrice = 1050;
          providerPayout = 750;
          commissionAmount = 300;
        }
      }

      const leadData = {
        clientName: body.clientName || body.name || "Cliente por clasificar",
        clientPhone: body.clientPhone || body.phone || "",
        city: body.city || "Querétaro",
        addressColonia: body.addressColonia || body.address || "",
        serviceType: serviceType,
        capacityLiters: body.capacityLiters ? Number(body.capacityLiters) : null,
        estimatedPrice,
        providerPayout,
        commissionAmount,
        preferredDate: body.preferredDate || "",
        source: body.source || "web_cotizador",
        status: body.status || "nuevo",
        assignedProviderId: body.assignedProviderId ? Number(body.assignedProviderId) : null,
        notes: body.notes || "",
      };

      const validated = insertLeadSchema.parse(leadData);
      const [newLead] = await db.insert(leads).values(validated).returning();

      return response.status(201).json({
        success: true,
        message: "Lead registrado exitosamente",
        lead: newLead,
      });
    } catch (error) {
      console.error("Error creating lead:", error);
      return response.status(400).json({ error: "Invalid input data", details: error });
    }
  }

  return response.status(405).json({ error: "Method not allowed" });
}
