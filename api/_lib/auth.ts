import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

const sha256 = (value: string) => createHash("sha256").update(value).digest();

// trim: al capturarla desde una terminal puede quedar un salto de línea al final.
const adminPassword = () => process.env.ADMIN_PASSWORD?.trim();

function signingKey(): Buffer | null {
  const password = adminPassword();
  return password ? sha256(`lavadotinacos-admin:${password}`) : null;
}

const sign = (expiresAt: string, key: Buffer) =>
  createHmac("sha256", key).update(expiresAt).digest("base64url");

function safeEqual(a: Buffer, b: Buffer) {
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Sin ADMIN_PASSWORD configurada nadie puede entrar: falla cerrado. */
export function passwordMatches(candidate: unknown): boolean {
  const password = adminPassword();
  if (!password || typeof candidate !== "string") return false;
  return safeEqual(sha256(candidate), sha256(password));
}

export function createAdminToken(): string | null {
  const key = signingKey();
  if (!key) return null;
  const expiresAt = String(Date.now() + TOKEN_TTL_MS);
  return `${expiresAt}.${sign(expiresAt, key)}`;
}

function isValidToken(token: string): boolean {
  const key = signingKey();
  const [expiresAt, signature] = token.split(".");
  if (!key || !expiresAt || !signature || Number(expiresAt) < Date.now()) return false;
  return safeEqual(Buffer.from(signature), Buffer.from(sign(expiresAt, key)));
}

/** Devuelve false y responde 401 cuando la petición no viene de un admin. */
export function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (token && isValidToken(token)) return true;
  res.status(401).json({ error: "Unauthorized" });
  return false;
}
