import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cityForLocation } from "../shared/cities.js";

const header = (req: VercelRequest, name: string) => {
  const value = req.headers[name];
  return typeof value === "string" ? value : undefined;
};

/** Dice qué página de ciudad corresponde a la visita, según la ubicación aproximada de su conexión. */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const cityName = header(req, "x-vercel-ip-city");
  const city = cityForLocation(
    header(req, "x-vercel-ip-country"),
    header(req, "x-vercel-ip-country-region"),
    cityName && decodeURIComponent(cityName),
  );

  res.setHeader("Cache-Control", "private, no-store");
  return res.status(200).json({ city: city ?? null });
}
