import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { actions, POOLS, SUPERBLOCK_MS, fmtDuration, useMining } from "@/lib/mining";

export const Route = createFileRoute("/pools")({
  head: () => ({
    meta: [
      { title: "Pools Cooperativas — NebulaMine" },
      { name: "description", content: "Únete a una pool de minería y comparte el botín de superbloques cada hora." },
      { property: "og:title", content: "Pools Cooperativas — NebulaMine" },
      { property: "og:description", content: "Mina en equipo y gana h/s extra con cada superbloque." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Pools,
});

function Pools() {
  const { pool, poolProgress, poolBlocks, power } = useMining();
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader title="Pools cooperativas" subtitle="La pool resuelve un superbloque cada hora y te da h/s temporales según tu aporte." />
      <p className="mt-4 text-sm text-muted-foreground">Superbloques ganados: <span className="font-display text-primary">{poolBlocks}</span></p>
      <div className="mt-6 grid gap-4">
        {POOLS.map((p) => {
          const mine = pool === p.id;
          const share = (power / (p.hash + power)) * 100;
          return (
            <div key={p.id} className="panel p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-bold">{p.name}</h2>
                <span className="text-sm text-muted-foreground">{p.members + (mine ? 1 : 0)} miembros · {p.hash.toLocaleString("en-US")} h/s</span>
                <button
                  type="button"
                  onClick={() => actions.joinPool(mine ? null : p.id)}
                  className={`ml-auto rounded-md px-4 py-2 text-xs font-bold uppercase tracking-widest ${mine ? "border border-destructive/50 text-destructive" : "text-primary-foreground"}`}
                  style={mine ? undefined : { background: "var(--gradient-primary)" }}
                >
                  {mine ? "Salir" : "Unirse"}
                </button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Botín base: {p.reward} h/s · Tu aporte: {share.toFixed(2)}%</p>
              {mine && (
                <div className="mt-3">
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${poolProgress * 100}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Próximo superbloque en {fmtDuration((1 - poolProgress) * SUPERBLOCK_MS)}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
