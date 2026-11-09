export const MIN_VISITORS_PER_VARIANT = 2200;
export const MIN_DAYS = 14;
const SIGNIFICANCE = 0.05;

export interface Arm {
  visitors: number;
  conversions: number;
}

export type Verdict =
  | { status: "collecting"; visitorsMissing: number; daysMissing: number }
  | { status: "winner"; winner: "a" | "b"; pValue: number }
  | { status: "no_difference"; pValue: number };

export const conversionRate = ({ visitors, conversions }: Arm) =>
  visitors > 0 ? conversions / visitors : 0;

/** Función de distribución normal estándar (aproximación de Abramowitz y Stegun). */
function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const density = 0.3989423 * Math.exp((-z * z) / 2);
  const tail =
    density * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - tail : tail;
}

/** Prueba z de dos proporciones, a dos colas. */
export function pValue(a: Arm, b: Arm): number {
  const pooled = (a.conversions + b.conversions) / (a.visitors + b.visitors);
  const standardError = Math.sqrt(pooled * (1 - pooled) * (1 / a.visitors + 1 / b.visitors));
  if (!Number.isFinite(standardError) || standardError === 0) return 1;

  const z = (conversionRate(a) - conversionRate(b)) / standardError;
  return 2 * (1 - normalCdf(Math.abs(z)));
}

/** No declara ganador antes de tiempo: mirar a medio camino da falsos positivos. */
export function evaluate(a: Arm, b: Arm, daysRunning: number): Verdict {
  const visitorsMissing = Math.max(0, MIN_VISITORS_PER_VARIANT - Math.min(a.visitors, b.visitors));
  const daysMissing = Math.max(0, Math.ceil(MIN_DAYS - daysRunning));
  if (visitorsMissing > 0 || daysMissing > 0) {
    return { status: "collecting", visitorsMissing, daysMissing };
  }

  const p = pValue(a, b);
  if (p >= SIGNIFICANCE) return { status: "no_difference", pValue: p };
  return { status: "winner", winner: conversionRate(a) > conversionRate(b) ? "a" : "b", pValue: p };
}
