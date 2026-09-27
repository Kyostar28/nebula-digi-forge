import { useCallback, useEffect, useSyncExternalStore } from "react";

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
  { symbol: "SUI", name: "Sui", color: "#4da2ff", ratePerHash: 6.3e-5, decimals: 7 },
  { symbol: "AVAX", name: "Avalanche", color: "#e84142", ratePerHash: 7.8e-6, decimals: 8 },
];

export const BASE_POWER = 100;

export type Boost = { id: string; amount: number; expiresAt: number };
export type Claim = Boost & { claimedAt: number; totalAfter: number };
export const BOOST_DURATION = 24 * 60 * 60 * 1000;
export const FAUCET_COOLDOWN = 5 * 60 * 1000;
/** Base probability (%) of each faucet reward 1..10 h/s. Sums to 100. */
export const FAUCET_ODDS = [50, 10, 8, 7, 6, 5, 4, 3, 2, 5] as const;

// ---------- Overclock ----------
export const OC_MULT = 1.5;
export const OC_DURATION = 30 * 60 * 1000;
export const THROTTLE_DURATION = 15 * 60 * 1000;
export const TEMP_IDLE = 45;
export const TEMP_MAX = 90;

// ---------- Levels ----------
export const RANKS = ["Nodo Satélite", "Nodo Orbital", "Nodo Relay", "Nodo Validador", "Nodo Estelar", "Núcleo Nebular", "Núcleo Cuántico"];
/** XP (seconds mined) needed to reach level n */
export const xpForLevel = (n: number) => n * n * 600;
export function levelFromXp(xp: number) {
  let l = 0;
  while (xp >= xpForLevel(l + 1)) l++;
  return l;
}
export const rankName = (level: number) => RANKS[Math.min(RANKS.length - 1, Math.floor(level / 3))]!;
export type SkillKey = "eff" | "luck" | "cap";
export const SKILL_MAX = 3;

// ---------- Events ----------
export type NetEvent = { type: "storm" | "difficulty" | "double"; coin: string; endsAt: number };
export const EVENT_DURATION = 10 * 60 * 1000;

// ---------- Rigs ----------
export type RigPart = {
  id: string;
  name: string;
  kind: "ASIC" | "GPU" | "FAN" | "PSU";
  req: number; // total power required to unlock
  desc: string;
  global?: number; // % bonus all coins
  coin?: string;
  coinPct?: number;
  cool?: number; // % extra heat dissipation
  faucetHours?: number; // extra hours of faucet boost duration
};
export const RIG_SLOTS = 4;
export const RIG_PARTS: RigPart[] = [
  { id: "gpu1", name: "GPU Photon 3060", kind: "GPU", req: 100, desc: "+5% ETH/ETC", coin: "ETH", coinPct: 5 },
  { id: "fan1", name: "Ventilador RGB Aurora", kind: "FAN", req: 110, desc: "+15% disipación", cool: 15 },
  { id: "asic1", name: "ASIC Antminer S9x", kind: "ASIC", req: 150, desc: "+10% BTC", coin: "BTC", coinPct: 10 },
  { id: "psu1", name: "PSU Titanium 1200W", kind: "PSU", req: 200, desc: "+4h duración faucet", faucetHours: 4 },
  { id: "gpu2", name: "GPU Quantum 5090", kind: "GPU", req: 300, desc: "+5% todas las monedas", global: 5 },
  { id: "asic2", name: "ASIC Scrypt L9", kind: "ASIC", req: 400, desc: "+15% DOGE", coin: "DOGE", coinPct: 15 },
  { id: "fan2", name: "Refrigeración Criogénica", kind: "FAN", req: 500, desc: "+35% disipación", cool: 35 },
  { id: "psu2", name: "PSU Fusión Nebular", kind: "PSU", req: 750, desc: "+8h duración faucet", faucetHours: 8 },
];

// ---------- Pools ----------
export type Pool = { id: string; name: string; members: number; hash: number; reward: number };
export const POOLS: Pool[] = [
  { id: "orion", name: "Orion Collective", members: 128, hash: 18400, reward: 25 },
  { id: "vega", name: "Vega Hash Guild", members: 64, hash: 9200, reward: 15 },
  { id: "andromeda", name: "Andromeda DAO", members: 312, hash: 41000, reward: 40 },
];
export const SUPERBLOCK_MS = 60 * 60 * 1000;

// ---------- Missions ----------
export type Mission = { id: string; kind: "coins" | "faucet" | "mine" | "oc"; label: string; target: number; coin?: string; progress: number; done: boolean; claimed: boolean; reward: number };
export const PASS_TIER_XP = 100;
export const PASS_TIERS = 30;
export const PASS_DAYS = 30;

export type Theme = "cyber" | "matrix" | "solar" | "mono";

type State = {
  power: number;
  allocations: Record<string, number>;
  balances: Record<string, number>;
  lastTick: number;
  boosts: Boost[];
  lastFaucet: number;
  history: Claim[];
  // new
  xp: number;
  skills: Record<SkillKey, number>;
  temp: number;
  ocUntil: number;
  throttleUntil: number;
  coolant: number;
  event: NetEvent | null;
  nextEventAt: number;
  tickets: number;
  ticketFrag: number;
  rigs: string[];
  pool: string | null;
  poolProgress: number;
  poolBlocks: number;
  missionDay: string;
  missions: Mission[];
  passXp: number;
  passStart: number;
  passClaimed: number[];
  titles: string[];
  notify: { faucet: boolean; expiring: boolean; events: boolean };
  notified: string[];
  theme: Theme;
  density: number;
};

const KEY = "nebula-mining-state-v1";

function dayKey(t = Date.now()) {
  return new Date(t).toISOString().slice(0, 10);
}

function seeded(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function genMissions(day: string): Mission[] {
  const r = seeded(day);
  const coin = COINS[Math.floor(r() * COINS.length)]!;
  const nCoins = 2 + Math.floor(r() * 3);
  const mins = 20 + Math.floor(r() * 5) * 10;
  const claims = 2 + Math.floor(r() * 3);
  const ocMin = 5 + Math.floor(r() * 3) * 5;
  const amt = Number((coin.ratePerHash * 100 * 1800).toPrecision(2));
  return [
    { id: "coins", kind: "coins", label: `Mina ${nCoins} monedas distintas durante ${mins} min`, target: mins * 60, progress: 0, done: false, claimed: false, reward: 40 },
    { id: "faucet", kind: "faucet", label: `Reclama el faucet ${claims} veces`, target: claims, progress: 0, done: false, claimed: false, reward: 30 },
    { id: "mine", kind: "mine", coin: coin.symbol, label: `Consigue ${amt} ${coin.symbol}`, target: amt, progress: 0, done: false, claimed: false, reward: 50 },
    { id: "oc", kind: "oc", label: `Mantén el overclock ${ocMin} min`, target: ocMin * 60, progress: 0, done: false, claimed: false, reward: 35 },
  ].map((m) => (m.kind === "coins" ? { ...m, coin: String(nCoins) } : m)) as Mission[];
}

function initial(): State {
  const allocations: Record<string, number> = {};
  const balances: Record<string, number> = {};
  for (const c of COINS) {
    allocations[c.symbol] = c.symbol === "BTC" ? 1 : 0;
    balances[c.symbol] = 0;
  }
  const now = Date.now();
  return {
    power: BASE_POWER, allocations, balances, lastTick: now, boosts: [], lastFaucet: 0, history: [],
    xp: 0, skills: { eff: 0, luck: 0, cap: 0 }, temp: TEMP_IDLE, ocUntil: 0, throttleUntil: 0, coolant: 1,
    event: null, nextEventAt: now + 3 * 60 * 1000, tickets: 0, ticketFrag: 0, rigs: [],
    pool: null, poolProgress: 0, poolBlocks: 0,
    missionDay: dayKey(now), missions: genMissions(dayKey(now)), passXp: 0, passStart: now, passClaimed: [], titles: [],
    notify: { faucet: false, expiring: false, events: false }, notified: [], theme: "cyber", density: 1,
  };
}

function load(): State {
  const base = initial();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return base;
    const p = JSON.parse(raw) as Partial<State>;
    const s: State = {
      ...base,
      ...p,
      allocations: { ...base.allocations, ...p.allocations },
      balances: { ...base.balances, ...p.balances },
      skills: { ...base.skills, ...p.skills },
      notify: { ...base.notify, ...p.notify },
      boosts: (p.boosts ?? []).filter((b) => b.expiresAt > Date.now()),
      history: (p.history ?? []).slice(0, 200),
    };
    if (s.missionDay !== dayKey()) {
      s.missionDay = dayKey();
      s.missions = genMissions(s.missionDay);
    }
    if (Date.now() - s.passStart > PASS_DAYS * 86400000) {
      s.passStart = Date.now();
      s.passXp = 0;
      s.passClaimed = [];
    }
    return s;
  } catch {
    return base;
  }
}

/** Share of total power (0..1) each coin receives, normalized across all sliders. */
export function shares(allocations: Record<string, number>): Record<string, number> {
  const total = Object.values(allocations).reduce((a, b) => a + (b || 0), 0);
  const out: Record<string, number> = {};
  for (const c of COINS) out[c.symbol] = total > 0 ? (allocations[c.symbol] || 0) / total : 0;
  return out;
}

export function activeBoostPower(boosts: Boost[], now = Date.now()) {
  return boosts.reduce((a, b) => (b.expiresAt > now ? a + b.amount : a), 0);
}

// ---------- derived helpers ----------
export function faucetCooldown(s: Pick<State, "skills">) {
  return FAUCET_COOLDOWN - s.skills.eff * 40 * 1000; // 5m → 3m
}
export function faucetOdds(s: Pick<State, "skills">): number[] {
  const extra = (s.skills.luck * 10) / 3; // 10 h/s: 5% → 15%
  const o = [...FAUCET_ODDS] as number[];
  o[0] = o[0]! - extra;
  o[9] = o[9]! + extra;
  return o;
}
export function rollFaucet(odds: readonly number[] = FAUCET_ODDS): number {
  let r = Math.random() * 100;
  for (let i = 0; i < odds.length; i++) {
    r -= odds[i]!;
    if (r < 0) return i + 1;
  }
  return 1;
}
function installed(s: Pick<State, "rigs">) {
  return RIG_PARTS.filter((p) => s.rigs.includes(p.id));
}
export function boostDuration(s: Pick<State, "skills" | "rigs">) {
  const rigH = installed(s).reduce((a, p) => a + (p.faucetHours ?? 0), 0);
  return BOOST_DURATION + s.skills.cap * 8 * 3600000 + rigH * 3600000;
}
export function coolFactor(s: Pick<State, "skills" | "rigs">) {
  return 1 + s.skills.cap * 0.1 + installed(s).reduce((a, p) => a + (p.cool ?? 0), 0) / 100;
}
export function powerMultiplier(s: Pick<State, "ocUntil" | "throttleUntil">, now = Date.now()) {
  if (s.throttleUntil > now) return 0.5;
  if (s.ocUntil > now) return OC_MULT;
  return 1;
}
export function coinMultiplier(s: State, symbol: string, now = Date.now()) {
  let m = 1;
  for (const p of installed(s)) {
    m += (p.global ?? 0) / 100;
    if (p.coin === symbol || (p.coin === "ETH" && symbol === "ETC")) m += (p.coinPct ?? 0) / 100;
  }
  const e = s.event && s.event.endsAt > now ? s.event : null;
  if (e?.type === "double") m *= 2;
  if (e?.coin === symbol && e.type === "storm") m *= 3;
  if (e?.coin === symbol && e.type === "difficulty") m *= 0.7;
  return m;
}

// ---------- global store ----------
let state: State = initial();
let hydrated = false;
const listeners = new Set<() => void>();
export type Sample = { t: number; hash: number; temp: number };
export let telemetry: Sample[] = [];

function emit() {
  for (const l of listeners) l();
}
function set(fn: (s: State) => State) {
  state = fn(state);
  emit();
}
function save() {
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

function notify(title: string, body: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "/favicon.png" });
  } catch {
    /* ignore */
  }
}

function pickEvent(now: number): NetEvent {
  const r = Math.random();
  const coin = COINS[Math.floor(Math.random() * COINS.length)]!.symbol;
  const type = r < 0.45 ? "storm" : r < 0.8 ? "difficulty" : "double";
  return { type, coin, endsAt: now + EVENT_DURATION };
}

function tick(dt: number) {
  const now = Date.now();
  set((s) => {
    const n: State = { ...s, lastTick: now };
    n.boosts = s.boosts.some((b) => b.expiresAt <= now) ? s.boosts.filter((b) => b.expiresAt > now) : s.boosts;
    // day rollover
    if (n.missionDay !== dayKey(now)) {
      n.missionDay = dayKey(now);
      n.missions = genMissions(n.missionDay);
    }
    // events
    if (n.event && n.event.endsAt <= now) {
      n.event = null;
      n.nextEventAt = now + (4 + Math.random() * 8) * 60000;
    }
    if (!n.event && now >= n.nextEventAt) {
      n.event = pickEvent(now);
      if (n.notify.events) notify("Evento de red", eventLabel(n.event));
    }
    // temperature
    const oc = n.ocUntil > now && n.throttleUntil <= now;
    if (oc) n.temp = Math.min(100, n.temp + (dt * (TEMP_MAX - TEMP_IDLE)) / (18 * 60) / coolFactor(n));
    else n.temp = Math.max(TEMP_IDLE, n.temp - dt * 0.15 * coolFactor(n));
    if (oc && n.temp >= TEMP_MAX) {
      n.ocUntil = 0;
      n.throttleUntil = now + THROTTLE_DURATION;
    }
    // mining
    const total = (n.power + activeBoostPower(n.boosts, now)) * powerMultiplier(n, now);
    const sh = shares(n.allocations);
    const balances = { ...n.balances };
    let mined: Record<string, number> = {};
    let activeCount = 0;
    for (const c of COINS) {
      const hash = total * (sh[c.symbol] ?? 0);
      if (hash > 0) {
        activeCount++;
        const amt = hash * c.ratePerHash * coinMultiplier(n, c.symbol, now) * dt;
        balances[c.symbol] = (balances[c.symbol] ?? 0) + amt;
        mined[c.symbol] = amt;
        if (n.event?.type === "difficulty" && n.event.coin === c.symbol) n.ticketFrag += dt / 60;
      }
    }
    n.balances = balances;
    if (n.ticketFrag >= 1) {
      n.tickets += Math.floor(n.ticketFrag);
      n.ticketFrag %= 1;
    }
    if (activeCount > 0) n.xp += dt;
    // pool
    if (n.pool) {
      const p = POOLS.find((x) => x.id === n.pool);
      if (p) {
        n.poolProgress += dt / (SUPERBLOCK_MS / 1000);
        if (n.poolProgress >= 1) {
          n.poolProgress = 0;
          n.poolBlocks++;
          const share = total / (p.hash + total);
          const amount = Math.max(2, Math.round(p.reward * (0.5 + share * 50)));
          n.boosts = [...n.boosts, { id: `pool-${now}`, amount, expiresAt: now + boostDuration(n) }];
        }
      }
    }
    // missions
    n.missions = n.missions.map((m) => {
      if (m.done) return m;
      let progress = m.progress;
      if (m.kind === "coins" && activeCount >= Number(m.coin)) progress += dt;
      if (m.kind === "mine" && m.coin) progress += mined[m.coin] ?? 0;
      if (m.kind === "oc" && oc) progress += dt;
      return { ...m, progress, done: progress >= m.target };
    });
    return n;
  });
}

function checkNotifications() {
  const s = state;
  const now = Date.now();
  const notified = new Set(s.notified);
  let changed = false;
  const fKey = `faucet-${s.lastFaucet}`;
  if (s.notify.faucet && s.lastFaucet > 0 && now - s.lastFaucet >= faucetCooldown(s) && !notified.has(fKey)) {
    notify("Faucet listo", "Ya puedes reclamar h/s temporales.");
    notified.add(fKey);
    changed = true;
  }
  if (s.notify.expiring) {
    for (const b of s.boosts) {
      const k = `exp-${b.id}`;
      if (b.expiresAt - now < 15 * 60000 && !notified.has(k)) {
        notify("Boost por expirar", `+${b.amount} h/s expiran en menos de 15 minutos.`);
        notified.add(k);
        changed = true;
      }
    }
  }
  if (changed) set((x) => ({ ...x, notified: [...notified].slice(-100) }));
}

export function eventLabel(e: NetEvent) {
  if (e.type === "storm") return `Crypto Storm: ${e.coin} produce x3 durante 10 minutos`;
  if (e.type === "difficulty") return `Dificultad de Red: ${e.coin} -30%, pero genera tickets de lotería`;
  return "Doble recompensa global: todas las monedas x2 durante 10 minutos";
}

let started = false;
function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  state = load();
  // offline catch-up for level/XP isn't simulated; mining resumes from now
  state.lastTick = Date.now();
  hydrated = true;
  emit();
  let last = performance.now();
  const loop = (t: number) => {
    const dt = (t - last) / 1000;
    if (dt >= 0.08) {
      last = t;
      tick(Math.min(dt, 5));
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  window.setInterval(save, 2000);
  window.setInterval(() => {
    const s = state;
    const now = Date.now();
    const hash = (s.power + activeBoostPower(s.boosts, now)) * powerMultiplier(s, now);
    telemetry = [...telemetry, { t: now, hash, temp: s.temp }].slice(-90);
    checkNotifications();
  }, 2000);
  window.addEventListener("beforeunload", save);
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnap = () => state;
const serverSnap = initial();
const getServerSnap = () => serverSnap;

export function useGame() {
  useEffect(start, []);
  return useSyncExternalStore(subscribe, getSnap, getServerSnap);
}

// ---------- actions ----------
export const actions = {
  setAllocation(symbol: string, value: number) {
    set((s) => ({ ...s, allocations: { ...s.allocations, [symbol]: value } }));
  },
  setAllAllocations(alloc: Record<string, number>) {
    set((s) => {
      const next: Record<string, number> = {};
      for (const c of COINS) next[c.symbol] = Math.max(0, Math.min(100, Math.round(alloc[c.symbol] ?? 0)));
      return { ...s, allocations: next };
    });
  },
  addPower(amount: number) {
    set((s) => ({ ...s, power: s.power + amount }));
  },
  addBalance(symbol: string, amount: number) {
    set((s) => ({ ...s, balances: { ...s.balances, [symbol]: (s.balances[symbol] || 0) + amount } }));
  },
  claimFaucet(): number | null {
    const s = state;
    const now = Date.now();
    if (now - s.lastFaucet < faucetCooldown(s)) return null;
    const amount = rollFaucet(faucetOdds(s));
    const boost: Boost = { id: `${now}-${Math.random()}`, amount, expiresAt: now + boostDuration(s) };
    const boosts = [...s.boosts.filter((b) => b.expiresAt > now), boost];
    const claim: Claim = { ...boost, claimedAt: now, totalAfter: s.power + activeBoostPower(boosts, now) };
    const coolant = s.coolant + (Math.random() < 0.2 ? 1 : 0);
    const missions = s.missions.map((m) =>
      m.kind === "faucet" && !m.done ? { ...m, progress: m.progress + 1, done: m.progress + 1 >= m.target } : m,
    );
    set(() => ({ ...s, boosts, coolant, missions, lastFaucet: now, history: [claim, ...s.history].slice(0, 200) }));
    save();
    return amount;
  },
  startOverclock(): boolean {
    const now = Date.now();
    if (state.throttleUntil > now || state.ocUntil > now) return false;
    set((s) => ({ ...s, ocUntil: now + OC_DURATION }));
    return true;
  },
  stopOverclock() {
    set((s) => ({ ...s, ocUntil: 0 }));
  },
  useCoolant(): boolean {
    if (state.coolant <= 0) return false;
    set((s) => ({ ...s, coolant: s.coolant - 1, temp: Math.max(TEMP_IDLE, s.temp - 30), throttleUntil: 0 }));
    return true;
  },
  upgradeSkill(k: SkillKey): boolean {
    const s = state;
    const spent = s.skills.eff + s.skills.luck + s.skills.cap;
    if (levelFromXp(s.xp) - spent <= 0 || s.skills[k] >= SKILL_MAX) return false;
    set((x) => ({ ...x, skills: { ...x.skills, [k]: x.skills[k] + 1 } }));
    return true;
  },
  resetSkills() {
    set((s) => ({ ...s, skills: { eff: 0, luck: 0, cap: 0 } }));
  },
  toggleRig(id: string): boolean {
    const s = state;
    if (s.rigs.includes(id)) {
      set((x) => ({ ...x, rigs: x.rigs.filter((r) => r !== id) }));
      return true;
    }
    if (s.rigs.length >= RIG_SLOTS) return false;
    set((x) => ({ ...x, rigs: [...x.rigs, id] }));
    return true;
  },
  joinPool(id: string | null) {
    set((s) => ({ ...s, pool: id, poolProgress: 0 }));
  },
  claimMission(id: string) {
    set((s) => {
      const m = s.missions.find((x) => x.id === id);
      if (!m || !m.done || m.claimed) return s;
      return {
        ...s,
        passXp: s.passXp + m.reward,
        coolant: s.coolant + 1,
        missions: s.missions.map((x) => (x.id === id ? { ...x, claimed: true } : x)),
      };
    });
  },
  claimTier(tier: number) {
    set((s) => {
      if (s.passClaimed.includes(tier) || s.passXp < tier * PASS_TIER_XP) return s;
      const titles = tier % 5 === 0 ? [...s.titles, passTitle(tier)] : s.titles;
      return { ...s, power: s.power + passReward(tier), passClaimed: [...s.passClaimed, tier], titles };
    });
  },
  useTicket(): boolean {
    if (state.tickets <= 0) return false;
    set((s) => ({ ...s, tickets: s.tickets - 1 }));
    return true;
  },
  setNotify(k: keyof State["notify"], v: boolean) {
    set((s) => ({ ...s, notify: { ...s.notify, [k]: v } }));
  },
  setTheme(theme: Theme) {
    set((s) => ({ ...s, theme }));
  },
  setDensity(density: number) {
    set((s) => ({ ...s, density }));
  },
  reset() {
    state = initial();
    window.localStorage.removeItem(KEY);
    emit();
  },
};

export const passReward = (tier: number) => (tier % 5 === 0 ? 10 : 2);
const TITLE_NAMES = ["Minero Novato", "Forjador de Hash", "Guardián del Bloque", "Arquitecto Nebular", "Señor del Hash", "Leyenda Cuántica"];
export const passTitle = (tier: number) => TITLE_NAMES[Math.min(TITLE_NAMES.length - 1, tier / 5 - 1)]!;

/** Backwards-compatible hook used by the pages. */
export function useMining() {
  const s = useGame();
  const now = Date.now();
  const boostPower = activeBoostPower(s.boosts, now);
  const mult = powerMultiplier(s, now);
  const claimFaucet = useCallback(() => actions.claimFaucet(), []);
  return {
    ...s,
    basePower: s.power,
    boostPower,
    rawPower: s.power + boostPower,
    multiplier: mult,
    power: Math.round((s.power + boostPower) * mult * 10) / 10,
    hydrated,
    claimFaucet,
    faucetCooldown: faucetCooldown(s),
    faucetOdds: faucetOdds(s),
    boostDuration: boostDuration(s),
    level: levelFromXp(s.xp),
    shares: shares(s.allocations),
    ...actions,
  };
}

export function formatCoin(value: number, decimals: number) {
  return value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function fmtDuration(ms: number) {
  const t = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}h ${mm}m ${ss}s` : `${mm}:${ss}`;
}
