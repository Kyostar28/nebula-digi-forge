import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { actions, useGame, type Theme } from "@/lib/mining";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Ajustes — NebulaMine" },
      { name: "description", content: "Elige tema visual, densidad del fondo y alertas del navegador." },
      { property: "og:title", content: "Ajustes — NebulaMine" },
      { property: "og:description", content: "Temas, fondo de nodos y notificaciones." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Settings,
});

const THEMES: { id: Theme; name: string; colors: string[] }[] = [
  { id: "cyber", name: "Neon Cyberpunk", colors: ["#0b1530", "#38bdf8", "#c084fc"] },
  { id: "matrix", name: "Matrix Green", colors: ["#03120a", "#22ff88", "#9dff3a"] },
  { id: "solar", name: "Solar Flare Gold", colors: ["#1a1005", "#ffb020", "#ff5a36"] },
  { id: "mono", name: "Monochrome", colors: ["#121212", "#e5e5e5", "#8a8a8a"] },
];

const ALERTS = [
  { k: "faucet", label: "El faucet está listo para reclamar" },
  { k: "expiring", label: "Un boost expira en menos de 15 minutos" },
  { k: "events", label: "Empieza un evento de red (incluida doble recompensa)" },
] as const;

function Settings() {
  const s = useGame();
  const [perm, setPerm] = useState<string>(() => (typeof Notification === "undefined" ? "unsupported" : Notification.permission));

  const toggle = async (k: (typeof ALERTS)[number]["k"], v: boolean) => {
    if (v && typeof Notification !== "undefined" && Notification.permission !== "granted") {
      const p = await Notification.requestPermission();
      setPerm(p);
      if (p !== "granted") return;
    }
    actions.setNotify(k, v);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageHeader title="Ajustes" subtitle="Personaliza la interfaz y tus alertas." />

      <div className="panel mt-8 p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest">Tema</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => actions.setTheme(t.id)}
              className={`flex items-center gap-3 rounded-md border p-3 text-left ${s.theme === t.id ? "border-primary shadow-[var(--glow-primary)]" : "border-border"}`}
            >
              <span className="flex">
                {t.colors.map((c) => (
                  <span key={c} className="h-6 w-6 rounded-full border border-border" style={{ background: c }} />
                ))}
              </span>
              <span className="font-display text-sm font-bold">{t.name}</span>
            </button>
          ))}
        </div>

        <h2 className="mt-6 text-sm font-bold uppercase tracking-widest">Densidad de nodos: {Math.round(s.density * 100)}%</h2>
        <input
          type="range"
          min={0}
          max={2}
          step={0.25}
          value={s.density}
          onChange={(e) => actions.setDensity(Number(e.target.value))}
          className="slider mt-3 w-full"
          style={{ ["--fill" as string]: s.density * 50 }}
        />
      </div>

      <div className="panel mt-6 p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest">Notificaciones del navegador</h2>
        {perm === "denied" && <p className="mt-2 text-sm text-destructive">Bloqueaste las notificaciones en el navegador. Actívalas en la configuración del sitio.</p>}
        {perm === "unsupported" && <p className="mt-2 text-sm text-muted-foreground">Tu navegador no soporta notificaciones.</p>}
        <div className="mt-4 space-y-3">
          {ALERTS.map((a) => (
            <label key={a.k} className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={s.notify[a.k]} onChange={(e) => toggle(a.k, e.target.checked)} className="h-4 w-4 accent-[var(--color-primary)]" />
              <span className="text-sm">{a.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
