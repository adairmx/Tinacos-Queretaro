import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createAdminToken, passwordMatches } from "../_lib/auth.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = passwordMatches(req.body?.password) ? createAdminToken() : null;
  if (!token) {
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ token });
}
