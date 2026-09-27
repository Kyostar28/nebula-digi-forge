import { useEffect, useState } from "react";
import { Flame, Snowflake, Power } from "lucide-react";
import { actions, fmtDuration, OC_MULT, TEMP_IDLE, TEMP_MAX, useGame } from "@/lib/mining";

export function OverclockPanel() {
  const s = useGame();
  const [now, setNow] = useState(() => Date.now());
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, []);

  const oc = s.ocUntil > now;
  const throttled = s.throttleUntil > now;
  const pct = Math.min(100, ((s.temp - TEMP_IDLE) / (TEMP_MAX - TEMP_IDLE)) * 100);
  const hot = s.temp >= 80;

  return (
    <div className="panel p-5" style={{ ["--neon" as string]: throttled ? "var(--color-destructive)" : oc ? "#ff8a3d" : undefined }}>
      <div className="flex flex-wrap items-center gap-3">
        <Flame className={`h-5 w-5 ${oc ? "text-[#ff8a3d]" : "text-primary"}`} />
        <h2 className="text-sm font-bold uppercase tracking-widest">Overclocking</h2>
        <span className="ml-auto rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-muted text-muted-foreground">
          {throttled ? `Throttling −50% · ${fmtDuration(s.throttleUntil - now)}` : oc ? `+50% · ${fmtDuration(s.ocUntil - now)}` : "Normal"}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Temperatura del nodo</span>
          <span className={`font-mono font-semibold ${hot ? "text-destructive" : "text-foreground"}`}>{s.temp.toFixed(1)}°C</span>
        </div>
        <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--color-primary), #ffb020, var(--color-destructive))" }}
          />
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">A {TEMP_MAX}°C el hardware entra en enfriamiento forzado (−50% durante 15 min).</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {oc ? (
          <button type="button" onClick={() => actions.stopOverclock()} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-bold uppercase tracking-widest">
            <Power className="h-4 w-4" /> Detener
          </button>
        ) : (
          <button
            type="button"
            disabled={throttled}
            onClick={() => setMsg(actions.startOverclock() ? `Overclock activo: x${OC_MULT} por 30 min.` : null)}
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground disabled:opacity-50"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Flame className="h-4 w-4" /> Forzar +50%
          </button>
        )}
        <button
          type="button"
          onClick={() => setMsg(actions.applyCoolant() ? "Refrigerante inyectado: −30°C." : "No tienes refrigerante. Gánalo en misiones o el faucet.")}
          className="inline-flex items-center gap-2 rounded-md border border-primary/50 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary"
        >
          <Snowflake className="h-4 w-4" /> Refrigerante ({s.coolant})
        </button>
      </div>
      {msg && <p className="mt-3 text-xs text-muted-foreground">{msg}</p>}
    </div>
  );
}
