import { useCallback, useEffect, useRef, useState } from "react";

export type Coin = {
  symbol: string;
  name: string;
  color: string;
  /** coins mined per hash/s per second */
  ratePerHash: number;
  decimals: number;
};

export const COINS: Coin[] = [
  { symbol: "BTC", name: "Bitcoin", color: "#f7931a", ratePerHash: 1.2e-9, decimals: 10 },
  { symbol: "ETH", name: "Ethereum", color: "#8a92b2", ratePerHash: 2.4e-8, decimals: 9 },
  { symbol: "LTC", name: "Litecoin", color: "#a6a9aa", ratePerHash: 9.5e-7, decimals: 8 },
  { symbol: "SHIB", name: "Shiba Inu", color: "#f00500", ratePerHash: 4.2e-1, decimals: 4 },
  { symbol: "DOGE", name: "Dogecoin", color: "#c3a634", ratePerHash: 4.1e-4, decimals: 6 },
  { symbol: "TRX", name: "Tron", color: "#eb0029", ratePerHash: 5.6e-4, decimals: 6 },
  { symbol: "BNB", name: "BNB Chain", color: "#f3ba2f", ratePerHash: 1.1e-7, decimals: 9 },
  { symbol: "SOL", name: "Solana", color: "#14f195", ratePerHash: 4.8e-7, decimals: 8 },
  { symbol: "POL", name: "Polygon", color: "#8247e5", ratePerHash: 1.4e-4, decimals: 6 },
  { symbol: "ETC", name: "Eth Classic", color: "#3ab83a", ratePerHash: 3.1e-6, decimals: 8 },
  { symbol: "BCH", name: "Bitcoin Cash", color: "#0ac18e", ratePerHash: 2.6e-7, decimals: 9 },
  { symbol: "XRP", name: "Ripple", color: "#23a2d9", ratePerHash: 2.9e-5, decimals: 6 },
  { symbol: "ADA", name: "Cardano", color: "#4a7fd4", ratePerHash: 8.7e-5, decimals: 6 },
  { symbol: "ATOM", name: "Cosmos", color: "#6f7390", ratePerHash: 1.9e-5, decimals: 7 },
];

export const BASE_POWER = 100;

type State = {
  power: number;
  allocations: Record<string, number>;
  balances: Record<string, number>;
  lastTick: number;
  boosts: Boost[];
  lastFaucet: number;
};

export type Boost = { id: string; amount: number; expiresAt: number };
export const BOOST_DURATION = 24 * 60 * 60 * 1000;
export const FAUCET_COOLDOWN = 5 * 60 * 1000;
/** Probability (%) of each faucet reward 1..10 h/s. Sums to 100. */
export const FAUCET_ODDS = [50, 10, 8, 7, 6, 5, 4, 3, 2, 5] as const;

export function rollFaucet(): number {
  let r = Math.random() * 100;
  for (let i = 0; i < FAUCET_ODDS.length; i++) {
    r -= FAUCET_ODDS[i]!;
    if (r < 0) return i + 1;
  }
  return 1;
}

export function activeBoostPower(boosts: Boost[], now = Date.now()) {
  return boosts.reduce((a, b) => (b.expiresAt > now ? a + b.amount : a), 0);
}

const KEY = "nebula-mining-state-v1";

function initial(): State {
  const allocations: Record<string, number> = {};
  const balances: Record<string, number> = {};
  for (const c of COINS) {
    allocations[c.symbol] = c.symbol === "BTC" ? 1 : 0;
    balances[c.symbol] = 0;
  }
  return { power: BASE_POWER, allocations, balances, lastTick: Date.now(), boosts: [], lastFaucet: 0 };
}

function load(): State {
  if (typeof window === "undefined") return initial();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initial();
    const parsed = JSON.parse(raw) as State;
    const base = initial();
    return {
      power: parsed.power ?? base.power,
      allocations: { ...base.allocations, ...parsed.allocations },
      balances: { ...base.balances, ...parsed.balances },
      lastTick: parsed.lastTick ?? Date.now(),
      boosts: (parsed.boosts ?? []).filter((b) => b.expiresAt > Date.now()),
      lastFaucet: parsed.lastFaucet ?? 0,
    };
  } catch {
    return initial();
  }
}

/** Share of total power (0..1) each coin receives, normalized across all sliders. */
export function shares(allocations: Record<string, number>): Record<string, number> {
  const total = Object.values(allocations).reduce((a, b) => a + (b || 0), 0);
  const out: Record<string, number> = {};
  for (const c of COINS) {
    out[c.symbol] = total > 0 ? (allocations[c.symbol] || 0) / total : 0;
  }
  return out;
}

export function useMining() {
  const [state, setState] = useState<State>(initial);
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  // live mining ticker
  useEffect(() => {
    if (!hydrated) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      if (dt >= 0.08) {
        last = now;
        setState((s) => {
          const t = Date.now();
          const boosts = s.boosts.some((b) => b.expiresAt <= t)
            ? s.boosts.filter((b) => b.expiresAt > t)
            : s.boosts;
          const total = s.power + activeBoostPower(boosts, t);
          const sh = shares(s.allocations);
          const balances = { ...s.balances };
          for (const c of COINS) {
            const hash = total * (sh[c.symbol] ?? 0);
            if (hash > 0) balances[c.symbol] = (balances[c.symbol] ?? 0) + hash * c.ratePerHash * dt;
          }
          return { ...s, balances, boosts, lastTick: t };
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [hydrated]);

  // persist
  useEffect(() => {
    if (!hydrated) return;
    const id = window.setInterval(() => {
      window.localStorage.setItem(KEY, JSON.stringify(stateRef.current));
    }, 2000);
    return () => window.clearInterval(id);
  }, [hydrated]);

  const setAllocation = useCallback((symbol: string, value: number) => {
    setState((s) => ({ ...s, allocations: { ...s.allocations, [symbol]: value } }));
  }, []);

  const addPower = useCallback((amount: number) => {
    setState((s) => ({ ...s, power: s.power + amount }));
  }, []);

  const addBalance = useCallback((symbol: string, amount: number) => {
    setState((s) => ({
      ...s,
      balances: { ...s.balances, [symbol]: (s.balances[symbol] || 0) + amount },
    }));
  }, []);

  const claimFaucet = useCallback((): number | null => {
    const s = stateRef.current;
    const now = Date.now();
    if (now - s.lastFaucet < FAUCET_COOLDOWN) return null;
    const amount = rollFaucet();
    const boost: Boost = { id: `${now}-${Math.random()}`, amount, expiresAt: now + BOOST_DURATION };
    const next = { ...s, boosts: [...s.boosts, boost], lastFaucet: now };
    stateRef.current = next;
    setState(next);
    window.localStorage.setItem(KEY, JSON.stringify(next));
    return amount;
  }, []);

  const reset = useCallback(() => {
    setState(initial());
    if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
  }, []);

  return {
    ...state,
    basePower: state.power,
    boostPower: activeBoostPower(state.boosts),
    power: state.power + activeBoostPower(state.boosts),
    hydrated,
    claimFaucet,
    shares: shares(state.allocations),
    setAllocation,
    addPower,
    addBalance,
    reset,
  };
}

export function formatCoin(value: number, decimals: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
