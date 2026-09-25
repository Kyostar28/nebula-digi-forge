import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Droplets } from "lucide-react";
import { FAUCET_COOLDOWN, FAUCET_ODDS, useMining } from "@/lib/mining";

export const Route = createFileRoute("/faucet")({
  head: () => ({
    meta: [
      { title: "Faucet — NebulaMine" },
      {
        name: "description",
        content: "Reclama de 1 a 10 h/s temporales cada 5 minutos en el faucet de NebulaMine.",
      },
      { property: "og:title", content: "Faucet — NebulaMine" },
      { property: "og:description", content: "Gana hashpower temporal gratis cada 5 minutos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Faucet,
});

function fmt(ms: number) {
  const t = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}h ${mm}m ${ss}s` : `${mm}:${ss}`;
}

function Faucet() {
  const { claimFaucet, lastFaucet, boosts, boostPower, basePower, hydrated } = useMining();
  const [now, setNow] = useState(() => Date.now());
  const [last, setLast] = useState<number | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const left = hydrated ? lastFaucet + FAUCET_COOLDOWN - now : 0;
  const active = boosts.filter((b) => b.expiresAt > now).sort((a, b) => a.expiresAt - b.expiresAt);

  const claim = () => {
    const r = claimFaucet();
    if (r !== null) setLast(r);
    setNow(Date.now());
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold glow-text">Faucet</h1>
      <p className="mt-2 text-muted-foreground">
        Reclama entre 1 y 10 h/s temporales cada 5 minutos. Cada reclamo dura 24 horas.
      </p>

      <div className="panel mt-8 p-6">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Base</p>
            <p className="font-display text-xl font-bold">{basePower} h/s</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Faucet</p>
            <p className="font-display text-xl font-bold text-primary">+{boostPower} h/s</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Total</p>
            <p className="font-display text-xl font-bold">{basePower + boostPower} h/s</p>
          </div>
        </div>

        <button
          type="button"
          onClick={claim}
          disabled={left > 0}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground disabled:opacity-50"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--glow-strong)" }}
        >
          <Droplets className="h-4 w-4" />
          {left > 0 ? `Espera ${fmt(left)}` : "Reclamar h/s"}
        </button>

        {last !== null && (
          <p className="mt-4 text-center font-mono text-sm text-primary">
            +{last} h/s añadidos por 24 horas
          </p>
        )}
      </div>

      <div className="panel mt-6 p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest">Probabilidades</h2>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {FAUCET_ODDS.map((p, i) => (
            <div key={i} className="rounded-md border border-border bg-muted/40 p-2 text-center">
              <p className="font-display text-sm font-bold">{i + 1} h/s</p>
              <p className="text-xs text-muted-foreground">{p}%</p>
            </div>
          ))}
        </div>
      </div>

      <div className="panel mt-6 p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest">Poder temporal activo</h2>
        {active.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Aún no tienes reclamos activos.</p>
        ) : (
          <ul className="mt-3 max-h-72 space-y-2 overflow-auto">
            {active.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
              >
                <span className="font-display font-bold text-primary">+{b.amount} h/s</span>
                <span className="font-mono text-xs text-muted-foreground">
                  expira en {fmt(b.expiresAt - now)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
