import type { SyntheticEvent } from "react";

const FALLBACK_COVER = "/opengraph.jpg";

/** Si una portada falla, muestra la imagen general del sitio en vez de un hueco. */
export function onCoverError(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  if (!image.src.endsWith(FALLBACK_COVER)) image.src = FALLBACK_COVER;
}
