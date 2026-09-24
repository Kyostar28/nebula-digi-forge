import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Dice5 } from "lucide-react";
import { useMining } from "@/lib/mining";

export const Route = createFileRoute("/games")({
  head: () => ({
    meta: [
      { title: "Games — NebulaMine" },
      {
        name: "description",
        content: "Juega dados, coinflip y minas para multiplicar tu poder de minado en la nube.",
      },
      { property: "og:title", content: "Games — NebulaMine" },
      { property: "og:description", content: "Juega y multiplica tu poder de minado." },
    ],
  }),
  component: Games,
});

const BET = 10;

function Games() {
  const { power, addPower } = useMining();
  const [log, setLog] = useState<string[]>([]);

  const play = (name: string, chance: number, multiplier: number) => {
    if (power < BET) {
      setLog((l) => [`Necesitas al menos ${BET} h/s para jugar.`, ...l].slice(0, 8));
      return;
    }
    addPower(-BET);
    const win = Math.random() < chance;
    if (win) {
      const prize = Math.round(BET * multiplier);
      addPower(prize);
      setLog((l) => [`${name}: ganaste +${prize} h/s`, ...l].slice(0, 8));
    } else {
      setLog((l) => [`${name}: perdiste ${BET} h/s`, ...l].slice(0, 8));
    }
  };

  const games = [
    { name: "Coin Flip", desc: "50% de probabilidad, paga x2", chance: 0.5, mult: 2 },
    { name: "Hash Dice", desc: "33% de probabilidad, paga x3", chance: 0.33, mult: 3 },
    { name: "Block Mines", desc: "20% de probabilidad, paga x5", chance: 0.2, mult: 5 },
    { name: "Nebula Crash", desc: "12% de probabilidad, paga x8", chance: 0.12, mult: 8 },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold glow-text">Games</h1>
      <p className="mt-2 text-muted-foreground">
        Apuesta {BET} h/s por ronda. Poder disponible:{" "}
        <span className="font-display font-bold text-primary">
          {power.toLocaleString("en-US")} h/s
        </span>
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {games.map((g) => (
          <div key={g.name} className="panel flex flex-col p-5">
            <div className="flex items-center gap-2 text-primary">
              <Dice5 className="h-4 w-4" />
              <span className="font-display text-sm font-bold uppercase tracking-widest">
                {g.name}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{g.desc}</p>
            <button
              type="button"
              onClick={() => play(g.name, g.chance, g.mult)}
              className="mt-4 rounded-md px-4 py-2.5 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--glow-primary)" }}
            >
              Jugar
            </button>
          </div>
        ))}
      </div>

      {log.length > 0 && (
        <div className="panel mt-8 p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Historial</p>
          <ul className="mt-3 space-y-1 font-mono text-sm text-foreground">
            {log.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
