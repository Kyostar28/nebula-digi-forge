import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Cpu, Gauge, Layers, Zap } from "lucide-react";
import { CoinCard } from "@/components/CoinCard";
import { AiAdvisor } from "@/components/AiAdvisor";
import { COINS, useMining } from "@/lib/mining";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — NebulaMine Cloud Mining" },
      {
        name: "description",
        content:
          "Mina BTC, ETH, DOGE y 11 monedas más desde la nube. Reparte tu hashpower y mira tus balances crecer en vivo.",
      },
      { property: "og:title", content: "Dashboard — NebulaMine Cloud Mining" },
      {
        property: "og:description",
        content: "Reparte tu hashpower entre 16 criptomonedas y mina en la nube en tiempo real.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [notice, setNotice] = useState<string | null>(null);
  const { power, boostPower, balances, allocations, shares, setAllocation, setAllAllocations, hydrated } = useMining();
  const activeCoins = COINS.filter((c) => (shares[c.symbol] ?? 0) > 0).length;
  const allocated = Object.values(allocations).reduce((a, b) => a + (b || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold glow-text">Virtual-Cloud Mining</h1>
          <p className="mt-1 text-muted-foreground">
            Tu hashpower se reparte al 100% entre las monedas que actives.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setNotice("Los depósitos estarán disponibles próximamente.")}
            className="panel inline-flex items-center gap-2 px-4 py-2 font-display text-xs font-bold uppercase tracking-widest text-primary"
          >
            <ArrowDownToLine className="h-4 w-4" /> Depósito
          </button>
          <button
            type="button"
            onClick={() => setNotice("Los retiros estarán disponibles próximamente.")}
            className="panel inline-flex items-center gap-2 px-4 py-2 font-display text-xs font-bold uppercase tracking-widest text-accent"
          >
            <ArrowUpFromLine className="h-4 w-4" /> Retiro
          </button>
        <span className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
          <span className="live-dot h-2 w-2 rounded-full bg-primary" /> Live
        </span>
        </div>
      </div>
      {notice && <p className="mt-3 text-right text-sm text-muted-foreground">{notice}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={<Cpu className="h-4 w-4" />}
          label="Poder de minado"
          value={`${power.toLocaleString("en-US")} h/s`}
          hint={boostPower > 0 ? `Incluye +${boostPower} h/s temporales del faucet` : "100 h/s gratis por registro"}
        />
        <Stat
          icon={<Layers className="h-4 w-4" />}
          label="Monedas activas"
          value={`${activeCoins} / ${COINS.length}`}
          hint="Mina varias a la vez"
        />
        <Stat
          icon={<Gauge className="h-4 w-4" />}
          label="Poder asignado"
          value={allocated > 0 ? "100%" : "0%"}
          hint={allocated > 0 ? "Distribuido por slider" : "Mueve un slider para empezar"}
        />
        <Stat
          icon={<Zap className="h-4 w-4" />}
          label="Plan"
          value="Free Node"
          hint="Mejora en Earn Power"
        />
      </div>

      <AiAdvisor power={power} onApply={setAllAllocations} />

      <h2 className="mt-10 text-lg font-bold uppercase tracking-widest text-foreground">
        Monedas minables
      </h2>
      <div className="mt-4 flex flex-wrap gap-4">
        {COINS.map((coin) => (
          <CoinCard
            key={coin.symbol}
            coin={coin}
            balance={hydrated ? (balances[coin.symbol] ?? 0) : 0}
            allocation={allocations[coin.symbol] ?? 0}
            share={shares[coin.symbol] ?? 0}
            hashrate={power * (shares[coin.symbol] ?? 0)}
            onChange={(v) => setAllocation(coin.symbol, v)}
          />
        ))}
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <p className="mt-2 font-display text-2xl font-bold tabular-nums text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
