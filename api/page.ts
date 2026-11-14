import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db } from "./_lib/db.js";
import { blogPosts } from "../shared/schema.js";
import { citiesData, cityJsonLd, SITE_URL, type CitySEOData } from "../shared/cities.js";

const SITE_NAME = "MonsterCo Lavado de Tinacos";

const SOCIAL_AND_TITLE_TAGS =
  /\s*<(?:title>[\s\S]*?<\/title>|meta\s+(?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>)/g;

// La plantilla trae la ubicación y los datos de negocio de Querétaro; cada ciudad lleva los suyos.
const QUERETARO_LOCAL_TAGS =
  /\s*<(?:meta\s+name="(?:geo\.[^"]+|ICBM)"[^>]*>|script type="application\/ld\+json">[\s\S]*?<\/script>)/g;

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

const absoluteUrl = (value: string) => (/^https?:\/\//.test(value) ? value : `${SITE_URL}${value}`);

let cachedShell: string | undefined;

async function loadShell(): Promise<string> {
  if (cachedShell) return cachedShell;

  const origin =
    process.env.VERCEL_ENV === "production" || !process.env.VERCEL_URL
      ? SITE_URL
      : `https://${process.env.VERCEL_URL}`;
  const response = await fetch(`${origin}/index.html`);
  if (!response.ok) throw new Error(`index.html respondió ${response.status}`);

  cachedShell = await response.text();
  return cachedShell;
}

function withHead(shell: string, tags: string[]) {
  return shell.replace(SOCIAL_AND_TITLE_TAGS, "").replace("</head>", `    ${tags.join("\n    ")}\n  </head>`);
}

function metaTags(title: string, description: string, url: string, image: string, type: "article" | "website" = "article") {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeUrl = escapeHtml(url);
  const safeImage = escapeHtml(image);

  return [
    `<title>${safeTitle}</title>`,
    `<meta name="description" content="${safeDescription}" />`,
    `<link rel="canonical" href="${safeUrl}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${safeTitle}" />`,
    `<meta property="og:description" content="${safeDescription}" />`,
    `<meta property="og:url" content="${safeUrl}" />`,
    `<meta property="og:image" content="${safeImage}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${safeTitle}" />`,
    `<meta name="twitter:description" content="${safeDescription}" />`,
    `<meta name="twitter:image" content="${safeImage}" />`,
  ];
}

function cityHtml(shell: string, city: CitySEOData) {
  const { latitude, longitude } = city.geoCoordinates;
  const jsonLd = JSON.stringify(cityJsonLd(city)).replace(/</g, "\\u003c");

  return withHead(shell.replace(QUERETARO_LOCAL_TAGS, ""), [
    ...metaTags(city.seoTitle, city.seoDescription, `${SITE_URL}/${city.slug}`, `${SITE_URL}/opengraph.jpg`, "website"),
    `<meta name="geo.placename" content="${escapeHtml(city.name)}" />`,
    `<meta name="geo.position" content="${latitude};${longitude}" />`,
    `<meta name="ICBM" content="${latitude}, ${longitude}" />`,
    `<script type="application/ld+json" id="local-seo-schema">${jsonLd}</script>`,
  ]);
}

function sendHtml(res: VercelResponse, status: number, html: string, cacheControl: string) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", cacheControl);
  return res.status(status).send(html);
}

/** Sirve la app con el SEO de cada artículo o ciudad y con un 404 real cuando la URL no existe. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const shell = await loadShell();
  const slug = typeof req.query.slug === "string" ? req.query.slug : undefined;
  const notFoundHtml = withHead(shell, ['<title>Página no encontrada | MonsterCo</title>', '<meta name="robots" content="noindex" />']);

  const citySlug = typeof req.query.city === "string" ? req.query.city : "";
  const city = Object.hasOwn(citiesData, citySlug) ? citiesData[citySlug] : undefined;
  if (city) return sendHtml(res, 200, cityHtml(shell, city), "public, s-maxage=3600, stale-while-revalidate=86400");

  if (!slug) return sendHtml(res, 404, notFoundHtml, "no-store");

  try {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    if (!post) return sendHtml(res, 404, notFoundHtml, "public, s-maxage=60");

    const url = `${SITE_URL}/blog/${post.slug}`;
    const html = withHead(shell, metaTags(`${post.title} | MonsterCo`, post.excerpt, url, absoluteUrl(post.image)));
    return sendHtml(res, 200, html, "public, s-maxage=600, stale-while-revalidate=86400");
  } catch (error) {
    // Una caída de la base de datos no debe parecerle un 404 a Google.
    console.error("Page render error:", error);
    return sendHtml(res, 200, shell, "no-store");
  }
}
