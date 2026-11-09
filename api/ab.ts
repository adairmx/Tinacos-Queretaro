import type { VercelRequest, VercelResponse } from "@vercel/node";
import { and, eq, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "./_lib/db.js";
import { requireAdmin } from "./_lib/auth.js";
import { abEvents } from "../shared/schema.js";
import {
  AB_EVENTS,
  AB_EXPERIMENT,
  AB_VARIANTS,
  type AbEvent,
  type AbResults,
  type AbVariant,
  type AbVariantResult,
} from "../shared/experiment.js";

const eventSchema = z.object({
  experiment: z.literal(AB_EXPERIMENT),
  variant: z.enum(AB_VARIANTS),
  event: z.enum(AB_EVENTS),
  visitorId: z.string().uuid(),
});

const emptyResult = (): AbVariantResult => ({
  view: 0,
  whatsapp_click: 0,
  call_click: 0,
  quote_submit: 0,
  form_submit: 0,
  contact: 0,
});

async function loadResults(): Promise<AbResults> {
  const visitors = sql<number>`count(distinct ${abEvents.visitorId})::int`;
  const inExperiment = eq(abEvents.experiment, AB_EXPERIMENT);

  const [perEvent, contacts, [{ startedAt }]] = await Promise.all([
    db
      .select({ variant: abEvents.variant, event: abEvents.event, visitors })
      .from(abEvents)
      .where(inExperiment)
      .groupBy(abEvents.variant, abEvents.event),
    db
      .select({ variant: abEvents.variant, visitors })
      .from(abEvents)
      .where(and(inExperiment, ne(abEvents.event, "view")))
      .groupBy(abEvents.variant),
    db
      .select({ startedAt: sql<string | null>`min(${abEvents.createdAt})` })
      .from(abEvents)
      .where(inExperiment),
  ]);

  const variants = { classic: emptyResult(), quote: emptyResult() };
  for (const row of perEvent) {
    variants[row.variant as AbVariant][row.event as AbEvent] = row.visitors;
  }
  for (const row of contacts) {
    variants[row.variant as AbVariant].contact = row.visitors;
  }

  return { startedAt, variants };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const parsed = eventSchema.safeParse(body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid event" });

      await db.insert(abEvents).values(parsed.data).onConflictDoNothing();
      return res.status(204).end();
    }

    if (req.method === "GET") {
      if (!requireAdmin(req, res)) return;
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json(await loadResults());
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("A/B API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
