import { useEffect } from "react";

export const SITE_URL = "https://lavadotinacos.com";
export const SITE_NAME = "MonsterCo Lavado de Tinacos";
export const DEFAULT_IMAGE = `${SITE_URL}/opengraph.jpg`;

export const absoluteUrl = (pathOrUrl: string) =>
  /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${SITE_URL}${pathOrUrl}`;

interface SeoOptions {
  title?: string;
  description?: string;
  path?: string;
  image?: string | null;
  type?: "website" | "article";
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
}

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = href;
}

/** Actualiza título, descripción, redes sociales y datos estructurados de la página. */
export function useSeo({ title, description, path, image, type = "website", noindex, jsonLd }: SeoOptions) {
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    if (!title) return;

    const url = absoluteUrl(path ?? window.location.pathname);
    const imageUrl = absoluteUrl(image || DEFAULT_IMAGE);
    const text = description || title;

    document.title = title;
    setMeta("name", "description", text);
    setMeta("name", "robots", noindex ? "noindex, follow" : "index, follow, max-image-preview:large");
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", text);
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", imageUrl);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", text);
    setMeta("name", "twitter:image", imageUrl);
    setCanonical(url);

    if (!jsonLdText) return;

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = jsonLdText;
    document.head.appendChild(script);
    return () => script.remove();
  }, [title, description, path, image, type, noindex, jsonLdText]);
}
