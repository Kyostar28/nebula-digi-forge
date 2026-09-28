import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { actions, RIG_PARTS, RIG_SLOTS, useMining } from "@/lib/mining";

export const Route = createFileRoute("/rigs")({
  head: () => ({
    meta: [
      { title: "Rigs de Minería — NebulaMine" },
      { name: "description", content: "Arma tu rack de servidores con ASICs, GPUs, ventiladores y fuentes que dan bonus reales." },
      { property: "og:title", content: "Rigs de Minería — NebulaMine" },
      { property: "og:description", content: "Rack isométrico con componentes que mejoran tu minería." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Rigs,
});

const KIND_COLOR = { ASIC: "#f7931a", GPU: "#14f195", FAN: "#4da2ff", PSU: "#c084fc" } as const;

function Rigs() {
  const { rigs, rawPower } = useMining();
  const [msg, setMsg] = useState<string | null>(null);
  const slots = Array.from({ length: RIG_SLOTS }, (_, i) => RIG_PARTS.find((p) => p.id === rigs[i]));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeader title="Rigs de Minería" subtitle={`Desbloquea componentes al subir tu poder (${rawPower} h/s). Instala hasta ${RIG_SLOTS}.`} />

      <div className="panel mt-8 grid place-items-center overflow-hidden p-10">
        <div style={{ transform: "rotateX(55deg) rotateZ(-40deg)", transformStyle: "preserve-3d" }} className="flex flex-col gap-3">
          {slots.map((p, i) => (
            <div
              key={i}
              className="relative flex h-14 w-72 items-center gap-3 rounded-md border px-4"
              style={{
                borderColor: p ? KIND_COLOR[p.kind] : "var(--color-border)",
                background: p ? `${KIND_COLOR[p.kind]}22` : "var(--color-muted)",
                boxShadow: p ? `0 0 18px ${KIND_COLOR[p.kind]}, 10px 10px 0 oklch(0.1 0.04 260)` : "10px 10px 0 oklch(0.1 0.04 260)",
              }}
            >
              {[0, 1, 2].map((d) => (
                <span key={d} className={`h-2 w-2 rounded-full ${p ? "live-dot" : ""}`} style={{ background: p ? KIND_COLOR[p.kind] : "var(--color-border)" }} />
              ))}
              <span className="font-display text-xs font-bold uppercase tracking-widest">{p ? p.name : `Bahía ${i + 1} vacía`}</span>
            </div>
          ))}
        </div>
      </div>

      {msg && <p className="mt-4 text-sm text-muted-foreground">{msg}</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {RIG_PARTS.map((p) => {
          const unlocked = rawPower >= p.req;
          const on = rigs.includes(p.id);
          return (
            <div key={p.id} className="panel p-4" style={{ ["--neon" as string]: KIND_COLOR[p.kind] }}>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: KIND_COLOR[p.kind] }}>{p.kind}</p>
              <p className="font-display text-sm font-bold">{p.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              <button
                type="button"
                disabled={!unlocked}
                onClick={() => setMsg(actions.toggleRig(p.id) ? null : "Todas las bahías están ocupadas. Retira un componente primero.")}
                className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-bold uppercase tracking-widest disabled:opacity-40"
              >
                {!unlocked ? (<><Lock className="h-3 w-3" /> {p.req} h/s</>) : on ? "Retirar" : "Instalar"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
