import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { actions, PASS_DAYS, PASS_TIER_XP, PASS_TIERS, passReward, passTitle, useGame } from "@/lib/mining";

export const Route = createFileRoute("/missions")({
  head: () => ({
    meta: [
      { title: "Misiones y Nebula Pass — NebulaMine" },
      { name: "description", content: "Contratos diarios y un pase de temporada gratuito de 30 días con h/s permanentes y títulos." },
      { property: "og:title", content: "Misiones y Nebula Pass — NebulaMine" },
      { property: "og:description", content: "Completa contratos diarios y sube en el Nebula Pass." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Missions,
});

function Missions() {
  const s = useGame();
  const daysLeft = Math.max(0, Math.ceil((s.passStart + PASS_DAYS * 86400000 - Date.now()) / 86400000));
  const tier = Math.floor(s.passXp / PASS_TIER_XP);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeader title="Misiones diarias" subtitle="Nuevos contratos cada día. Cada contrato da XP del pase y 1 refrigerante." />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {s.missions.map((m) => {
          const pct = Math.min(100, (m.progress / m.target) * 100);
          return (
            <div key={m.id} className="panel p-5">
              <p className="font-semibold">{m.label}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{pct.toFixed(0)}% · +{m.reward} XP pase</span>
                <button
                  type="button"
                  disabled={!m.done || m.claimed}
                  onClick={() => actions.claimMission(m.id)}
                  className="rounded-md border border-primary/50 px-3 py-1 font-bold uppercase tracking-widest text-primary disabled:opacity-40"
                >
                  {m.claimed ? "Reclamado" : "Reclamar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel mt-10 p-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-lg font-bold uppercase tracking-widest">Nebula Pass</h2>
          <p className="text-sm text-muted-foreground">Nivel {tier} · {s.passXp} XP · {daysLeft} días restantes</p>
        </div>
        {s.titles.length > 0 && <p className="mt-2 text-sm">Títulos: <span className="text-primary">{s.titles.join(" · ")}</span></p>}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: PASS_TIERS }, (_, i) => i + 1).map((t) => {
            const claimed = s.passClaimed.includes(t);
            const ready = tier >= t && !claimed;
            return (
              <button
                key={t}
                type="button"
                disabled={!ready}
                onClick={() => actions.claimTier(t)}
                className={`w-24 shrink-0 rounded-md border p-2 text-center text-xs ${ready ? "border-primary shadow-[var(--glow-primary)]" : "border-border"} ${claimed ? "opacity-50" : ""}`}
              >
                <p className="font-display font-bold">{t}</p>
                <p className="text-primary">+{passReward(t)} h/s</p>
                {t % 5 === 0 && <p className="mt-1 text-[10px] text-accent">{passTitle(t)}</p>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
