import { formatCoin, type Coin } from "@/lib/mining";

type Props = {
  coin: Coin;
  balance: number;
  allocation: number;
  share: number;
  hashrate: number;
  onChange: (value: number) => void;
};

export function CoinCard({ coin, balance, allocation, share, hashrate, onChange }: Props) {
  const active = share > 0;

  return (
    <div
      className="panel relative flex shrink-0 flex-col justify-between overflow-hidden p-3"
      style={{ width: 290, height: 140 }}
    >
      <span
        className="absolute inset-x-0 top-0 h-[2px] transition-opacity"
        style={{ background: coin.color, opacity: active ? 0.9 : 0.25 }}
      />
      <div className="flex items-center gap-2">
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full font-display text-[10px] font-bold"
          style={{ background: `${coin.color}26`, color: coin.color, border: `1px solid ${coin.color}66` }}
        >
          {coin.symbol.slice(0, 3)}
        </span>
        <div className="min-w-0">
          <p className="font-display text-sm font-bold leading-none tracking-wider text-foreground">
            {coin.symbol}
          </p>
          <p className="truncate text-[11px] leading-tight text-muted-foreground">{coin.name}</p>
        </div>
        <span
          className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
            active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
          }`}
        >
          {hashrate.toFixed(1)} h/s
        </span>
      </div>

      <p className="font-mono text-[15px] font-semibold tabular-nums text-foreground">
        {formatCoin(balance, coin.decimals)}
      </p>

      <div>
        <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>Mining power</span>
          <span className="tabular-nums text-foreground">{(share * 100).toFixed(1)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={allocation}
          aria-label={`${coin.symbol} mining power`}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider w-full"
          style={{ ["--slider-color" as string]: coin.color, ["--fill" as string]: allocation }}
        />
      </div>
    </div>
  );
}
