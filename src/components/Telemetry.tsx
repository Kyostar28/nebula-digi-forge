import { useEffect, useState } from "react";
import { COINS, coinMultiplier, powerMultiplier, activeBoostPower, shares, telemetry, useGame, type Sample } from "@/lib/mining";

function Line({ data, pick, color, label, unit }: { data: Sample[]; pick: (s: Sample) => number; color: string; label: string; unit: string }) {
  const W = 400;
  const H = 120;
  const vals = data.map(pick);
  const max = Math.max(1, ...vals) * 1.1;
  const min = Math.min(...vals, 0);
  const pts = vals.map((v, i) => `${(i / Math.max(1, vals.length - 1)) * W},${H - ((v - min) / (max - min)) * H}`).join(" ");
  return (
    <div className="panel p-4">
      <div className="flex justify-between text-xs uppercase tracking-widest text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono text-foreground">{(vals.at(-1) ?? 0).toFixed(1)} {unit}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-32 w-full" preserveAspectRatio="none">
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} stroke="currentColor" className="text-border" strokeDasharray="4 4" />
        ))}
        {vals.length > 1 && (
          <>
            <polyline points={`0,${H} ${pts} ${W},${H}`} fill={color} opacity={0.12} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth={2} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
          </>
        )}
      </svg>
    </div>
  );
}

export function Telemetry() {
  const s = useGame();
  const [data, setData] = useState<Sample[]>(telemetry);
  useEffect(() => {
    const id = window.setInterval(() => setData(telemetry), 1000);
    return () => window.clearInterval(id);
  }, []);

  const now = Date.now();
  const total = (s.power + activeBoostPower(s.boosts, now)) * powerMultiplier(s, now);
  const sh = shares(s.allocations);
  const rows = COINS.map((c) => {
    const perSec = total * (sh[c.symbol] ?? 0) * c.ratePerHash * coinMultiplier(s, c.symbol, now);
    return { c, perSec, share: sh[c.symbol] ?? 0 };
  });

  // radar
  const R = 110;
  const cx = 140;
  const cy = 140;
  const maxShare = Math.max(0.01, ...rows.map((r) => r.share));
  const point = (i: number, v: number) => {
    const a = (i / rows.length) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v] as const;
  };
  const poly = rows.map((r, i) => point(i, r.share / maxShare).join(",")).join(" ");

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <Line data={data} pick={(x) => x.hash} color="var(--color-primary)" label="Tasa de hash efectiva" unit="h/s" />
      <Line data={data} pick={(x) => x.temp} color="#ff8a3d" label="Temperatura del nodo" unit="°C" />

      <div className="panel p-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Radar del portafolio</p>
        <svg viewBox="0 0 280 280" className="mx-auto mt-2 h-72 w-72">
          {[0.33, 0.66, 1].map((f) => (
            <polygon key={f} points={rows.map((_, i) => point(i, f).join(",")).join(" ")} fill="none" stroke="currentColor" className="text-border" />
          ))}
          {rows.map((r, i) => {
            const [x, y] = point(i, 1.12);
            return (
              <text key={r.c.symbol} x={x} y={y} fontSize={9} textAnchor="middle" dominantBaseline="middle" fill={r.c.color}>
                {r.c.symbol}
              </text>
            );
          })}
          <polygon points={poly} fill="var(--color-primary)" fillOpacity={0.25} stroke="var(--color-primary)" strokeWidth={2} />
        </svg>
      </div>

      <div className="panel overflow-x-auto p-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Proyección acumulada (ritmo actual)</p>
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="py-1">Moneda</th><th>7 días</th><th>30 días</th><th>365 días</th></tr>
          </thead>
          <tbody className="font-mono">
            {rows.filter((r) => r.perSec > 0).map((r) => (
              <tr key={r.c.symbol} className="border-t border-border/50">
                <td className="py-1.5 font-display" style={{ color: r.c.color }}>{r.c.symbol}</td>
                {[7, 30, 365].map((d) => (
                  <td key={d}>{(r.perSec * 86400 * d).toPrecision(4)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.every((r) => r.perSec === 0) && <p className="mt-3 text-sm text-muted-foreground">Activa una moneda para ver proyecciones.</p>}
      </div>
    </div>
  );
}
