import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles } from "lucide-react";
import { recommendAllocations } from "@/lib/advisor.functions";
import { COINS } from "@/lib/mining";

type Rec = { summary: string; allocations: { symbol: string; percent: number; reason: string }[] };

export function AiAdvisor({ power, onApply }: { power: number; onApply: (a: Record<string, number>) => void }) {
  const run = useServerFn(recommendAllocations);
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rec, setRec] = useState<Rec | null>(null);

  const ask = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await run({ data: { goal, power } });
      if (r.ok) setRec({ summary: r.summary, allocations: r.allocations });
      else setError(r.error);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const apply = () => {
    if (!rec) return;
    const a: Record<string, number> = {};
    for (const x of rec.allocations) a[x.symbol] = x.percent;
    onApply(a);
  };

  return (
    <div className="panel mt-8 p-5">
      <h2 className="flex items-center gap-2 text-lg font-bold uppercase tracking-widest">
        <Sparkles className="h-5 w-5 text-primary" /> Asesor IA de minería
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Describe tus metas (ej. "quiero acumular monedas estables a largo plazo" o "prefiero memecoins").
      </p>
      <textarea
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        rows={3}
        maxLength={1000}
        className="mt-3 w-full rounded-md border border-border bg-muted/40 p-3 text-sm text-foreground outline-none focus:border-primary"
        placeholder="Mis metas de minería..."
      />
      <button
        type="button"
        onClick={ask}
        disabled={loading || goal.trim().length < 3}
        className="mt-3 rounded-md px-4 py-2 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground disabled:opacity-50"
        style={{ background: "var(--gradient-primary)", boxShadow: "var(--glow-primary)" }}
      >
        {loading ? "Analizando..." : "Recomendar reparto"}
      </button>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {rec && (
        <div className="mt-4">
          <p className="text-sm text-foreground">{rec.summary}</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {rec.allocations.map((x) => {
              const coin = COINS.find((c) => c.symbol === x.symbol);
              return (
                <li key={x.symbol} className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
                  <span className="font-display font-bold" style={{ color: coin?.color }}>{x.symbol}</span>{" "}
                  <span className="font-mono text-primary">{x.percent}%</span>
                  <p className="text-xs text-muted-foreground">{x.reason}</p>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={apply}
            className="mt-3 rounded-md border border-primary/50 px-4 py-2 font-display text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/10"
          >
            Aplicar reparto
          </button>
          <p className="mt-2 text-xs text-muted-foreground">Sugerencia generada por IA, no es consejo financiero.</p>
        </div>
      )}
    </div>
  );
}
