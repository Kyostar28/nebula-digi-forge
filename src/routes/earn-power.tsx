import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Cpu } from "lucide-react";
import { useMining } from "@/lib/mining";

export const Route = createFileRoute("/earn-power")({
  head: () => ({
    meta: [
      { title: "Earn Power — NebulaMine" },
      {
        name: "description",
        content: "Suma hashpower gratis con tareas, referidos y boosts para minar más rápido.",
      },
      { property: "og:title", content: "Earn Power — NebulaMine" },
      {
        property: "og:description",
        content: "Suma hashpower gratis con tareas, referidos y boosts.",
      },
    ],
  }),
  component: EarnPower,
});

const tasks = [
  { id: "daily", title: "Check-in diario", desc: "Entra cada día a tu panel", reward: 25 },
  { id: "referral", title: "Invita un amigo", desc: "Comparte tu enlace de referido", reward: 150 },
  { id: "social", title: "Sigue la comunidad", desc: "Únete al canal de anuncios", reward: 50 },
  { id: "survey", title: "Completa una encuesta", desc: "2 minutos de tu tiempo", reward: 75 },
  { id: "video", title: "Mira un video sponsor", desc: "30 segundos", reward: 40 },
  { id: "node", title: "Activa 5 monedas", desc: "Diversifica tu minería", reward: 100 },
];

function EarnPower() {
  const { power, addPower } = useMining();
  const [claimed, setClaimed] = useState<string[]>([]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold glow-text">Earn Power</h1>
      <p className="mt-2 text-muted-foreground">
        Poder actual:{" "}
        <span className="font-display font-bold text-primary">
          {power.toLocaleString("en-US")} h/s
        </span>
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tasks.map((t) => {
          const done = claimed.includes(t.id);
          return (
            <div key={t.id} className="panel flex flex-col p-4">
              <div className="flex items-center gap-2 text-primary">
                <Cpu className="h-4 w-4" />
                <span className="font-display text-sm font-bold">+{t.reward} h/s</span>
              </div>
              <p className="mt-2 font-semibold text-foreground">{t.title}</p>
              <p className="text-sm text-muted-foreground">{t.desc}</p>
              <button
                type="button"
                disabled={done}
                onClick={() => {
                  addPower(t.reward);
                  setClaimed((c) => [...c, t.id]);
                }}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: "var(--gradient-primary)", boxShadow: "var(--glow-primary)" }}
              >
                {done ? (
                  <>
                    <Check className="h-4 w-4" /> Reclamado
                  </>
                ) : (
                  "Reclamar"
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
