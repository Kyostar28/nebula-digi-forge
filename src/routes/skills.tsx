import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { actions, levelFromXp, rankName, SKILL_MAX, xpForLevel, useGame, type SkillKey } from "@/lib/mining";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Niveles y Habilidades — NebulaMine" },
      { name: "description", content: "Sube de nivel tu nodo y mejora el faucet con el árbol de habilidades." },
      { property: "og:title", content: "Niveles y Habilidades — NebulaMine" },
      { property: "og:description", content: "Árbol de habilidades: eficiencia, suerte y capacidad." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Skills,
});

const BRANCHES: { key: SkillKey; name: string; desc: (l: number) => string }[] = [
  { key: "eff", name: "Eficiencia", desc: (l) => `Cooldown del faucet: ${(5 - (l * 2) / 3).toFixed(1)} min` },
  { key: "luck", name: "Suerte", desc: (l) => `Probabilidad de 10 h/s: ${(5 + (l * 10) / 3).toFixed(1)}%` },
  { key: "cap", name: "Capacidad", desc: (l) => `Duración h/s temporales: ${24 + l * 8}h · disipación +${l * 10}%` },
];

function Skills() {
  const s = useGame();
  const level = levelFromXp(s.xp);
  const spent = s.skills.eff + s.skills.luck + s.skills.cap;
  const sp = level - spent;
  const cur = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const pct = ((s.xp - cur) / (next - cur)) * 100;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader title="Nodo y Habilidades" subtitle="Cada segundo minando da 1 XP. Cada nivel otorga 1 punto de habilidad." />
      <div className="panel mt-8 p-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Rango</p>
            <p className="font-display text-2xl font-bold text-primary">{rankName(level)}</p>
          </div>
          <p className="font-display text-lg">Nivel {level} · {sp} SP</p>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--gradient-primary)" }} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{Math.floor(s.xp)} / {next} XP</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {BRANCHES.map((b) => {
          const l = s.skills[b.key];
          return (
            <div key={b.key} className="panel p-5">
              <h2 className="text-sm font-bold uppercase tracking-widest">{b.name}</h2>
              <div className="mt-3 flex gap-2">
                {Array.from({ length: SKILL_MAX }, (_, i) => (
                  <span key={i} className={`h-3 flex-1 rounded-full ${i < l ? "bg-primary shadow-[var(--glow-primary)]" : "bg-muted"}`} />
                ))}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{b.desc(l)}</p>
              <button
                type="button"
                disabled={sp <= 0 || l >= SKILL_MAX}
                onClick={() => actions.upgradeSkill(b.key)}
                className="mt-4 w-full rounded-md px-3 py-2 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground disabled:opacity-40"
                style={{ background: "var(--gradient-primary)" }}
              >
                {l >= SKILL_MAX ? "Máximo" : "Mejorar (1 SP)"}
              </button>
            </div>
          );
        })}
      </div>
      <button type="button" onClick={() => actions.resetSkills()} className="mt-4 text-xs text-muted-foreground underline">
        Reiniciar puntos
      </button>
    </div>
  );
}
