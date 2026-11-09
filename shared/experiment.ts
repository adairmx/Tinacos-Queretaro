export const AB_EXPERIMENT = "home_layout_v1";
export const AB_VARIANTS = ["classic", "quote"] as const;
export const AB_EVENTS = ["view", "whatsapp_click", "call_click", "quote_submit", "form_submit"] as const;

export type AbVariant = (typeof AB_VARIANTS)[number];
export type AbEvent = (typeof AB_EVENTS)[number];

/** Una fila por versión: visitantes únicos por evento y visitantes que contactaron. */
export type AbVariantResult = Record<AbEvent | "contact", number>;

export interface AbResults {
  startedAt: string | null;
  variants: Record<AbVariant, AbVariantResult>;
}
