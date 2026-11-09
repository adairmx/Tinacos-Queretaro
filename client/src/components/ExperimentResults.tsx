import { useQuery } from "@tanstack/react-query";
import type { AbResults, AbVariant } from "@shared/experiment";
import { adminFetch } from "@/lib/adminAuth";
import { conversionRate, evaluate, type Arm, type Verdict } from "@/lib/abStats";

const VARIANT_LABELS: Record<AbVariant, string> = {
  classic: "A · Diseño anterior",
  quote: "B · Diseño nuevo con cotizador",
};

const ROWS = [
  { key: "view", label: "Visitantes" },
  { key: "whatsapp_click", label: "Clic en WhatsApp" },
  { key: "call_click", label: "Clic en llamar" },
  { key: "quote_submit", label: "Cotizador enviado" },
  { key: "form_submit", label: "Formulario de contacto enviado" },
  { key: "contact", label: "Visitantes que contactaron" },
] as const;

const percent = (value: number) => `${(value * 100).toFixed(2)}%`;

function verdictMessage(verdict: Verdict): { title: string; detail: string } {
  if (verdict.status === "collecting") {
    const pending = [
      verdict.visitorsMissing > 0 && `${verdict.visitorsMissing.toLocaleString("es-MX")} visitas más por versión`,
      verdict.daysMissing > 0 && `${verdict.daysMissing} días más`,
    ].filter(Boolean);
    return {
      title: "Todavía no hay resultado",
      detail: `Faltan ${pending.join(" y ")}. Evita decidir antes: al inicio las diferencias suelen ser casualidad.`,
    };
  }
  if (verdict.status === "no_difference") {
    return {
      title: "Sin diferencia clara",
      detail: "Ninguna versión convierte claramente mejor. Puedes quedarte con la que prefieras.",
    };
  }
  const winner = verdict.winner === "a" ? VARIANT_LABELS.classic : VARIANT_LABELS.quote;
  return {
    title: `Gana ${winner}`,
    detail: "Con esta cantidad de visitas, es poco probable que la diferencia sea casualidad.",
  };
}

export default function ExperimentResults() {
  const { data, isLoading, isError } = useQuery<AbResults>({
    queryKey: ["admin-ab-results"],
    queryFn: async () => {
      const res = await adminFetch("/api/ab");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  if (isLoading) return <p className="p-6 text-sm text-slate-500">Cargando resultados...</p>;
  if (isError || !data) return <p className="p-6 text-sm text-red-600">No se pudieron cargar los resultados.</p>;

  const toArm = (variant: AbVariant): Arm => ({
    visitors: data.variants[variant].view,
    conversions: data.variants[variant].contact,
  });
  const a = toArm("classic");
  const b = toArm("quote");
  const daysRunning = data.startedAt ? (Date.now() - new Date(data.startedAt).getTime()) / 86_400_000 : 0;
  const { title, detail } = verdictMessage(evaluate(a, b, daysRunning));

  return (
    <div className="bg-white rounded-2xl border shadow-xs overflow-hidden">
      <div className="p-5 border-b bg-slate-50/50">
        <h2 className="font-bold text-slate-900 text-lg">{title}</h2>
        <p className="text-sm text-slate-600 mt-1">{detail}</p>
        <p className="text-xs text-slate-500 mt-2">
          {data.startedAt
            ? `Midiendo desde el ${new Date(data.startedAt).toLocaleDateString("es-MX")}`
            : "Aún no se ha registrado ninguna visita."}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b">
              <th className="p-4 font-bold">Métrica</th>
              <th className="p-4 font-bold">{VARIANT_LABELS.classic}</th>
              <th className="p-4 font-bold">{VARIANT_LABELS.quote}</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(({ key, label }) => (
              <tr key={key} className="border-b last:border-0">
                <td className="p-4 text-slate-700">{label}</td>
                <td className="p-4 font-semibold tabular-nums">{data.variants.classic[key].toLocaleString("es-MX")}</td>
                <td className="p-4 font-semibold tabular-nums">{data.variants.quote[key].toLocaleString("es-MX")}</td>
              </tr>
            ))}
            <tr className="bg-primary/5">
              <td className="p-4 font-bold text-slate-900">Tasa de contacto</td>
              <td className="p-4 font-black text-primary tabular-nums">{percent(conversionRate(a))}</td>
              <td className="p-4 font-black text-primary tabular-nums">{percent(conversionRate(b))}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
