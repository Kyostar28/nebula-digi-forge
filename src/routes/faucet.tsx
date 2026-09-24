import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Droplets } from "lucide-react";
import { COINS, formatCoin, useMining } from "@/lib/mining";

export const Route = createFileRoute("/faucet")({
  head: () => ({
    meta: [
      { title: "Faucet — NebulaMine" },
      {
        name: "description",
        content: "Reclama cripto gratis cada 60 segundos desde el faucet de NebulaMine.",
      },
      { property: "og:title", content: "Faucet — NebulaMine" },
      { property: "og:description", content: "Reclama cripto gratis cada 60 segundos." },
    ],
  }),
  component: Faucet,
});

const COOLDOWN = 60;

function Faucet() {
  const { balances, addBalance, hydrated } = useMining();
  const [symbol, setSymbol] = useState("DOGE");
  const [left, setLeft] = useState(0);
  const [last, setLast] = useState<string | null>(null);

  useEffect(() => {
    if (left <= 0) return;
    const id = window.setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => window.clearInterval(id);
  }, [left]);

  const coin = COINS.find((c) => c.symbol === symbol)!;

  const claim = () => {
    if (left > 0) return;
    const amount = coin.ratePerHash * 100 * 900;
    addBalance(symbol, amount);
    setLast(`+${formatCoin(amount, coin.decimals)} ${symbol}`);
    setLeft(COOLDOWN);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold glow-text">Faucet</h1>
      <p className="mt-2 text-muted-foreground">
        Una recompensa gratuita cada {COOLDOWN} segundos, directa a tu balance.
      </p>

      <div className="panel mt-8 p-6">
        <label className="text-xs uppercase tracking-widest text-muted-foreground">
          Elige moneda
        </label>
        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="mt-2 w-full rounded-md border border-border bg-input px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
        >
          {COINS.map((c) => (
            <option key={c.symbol} value={c.symbol}>
              {c.symbol} — {c.name}
            </option>
          ))}
        </select>

        <p className="mt-4 text-sm text-muted-foreground">
          Balance actual:{" "}
          <span className="font-mono text-foreground">
            {formatCoin(hydrated ? balances[symbol] : 0, coin.decimals)} {symbol}
          </span>
        </p>

        <button
          type="button"
          onClick={claim}
          disabled={left > 0}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground disabled:opacity-50"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--glow-strong)" }}
        >
          <Droplets className="h-4 w-4" />
          {left > 0 ? `Espera ${left}s` : "Reclamar"}
        </button>

        {last && <p className="mt-4 text-center font-mono text-sm text-primary">{last}</p>}
      </div>
    </div>
  );
}
