import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Ticket } from "lucide-react";
import { useMining } from "@/lib/mining";

export const Route = createFileRoute("/lottery")({
  head: () => ({
    meta: [
      { title: "Lottery — NebulaMine" },
      {
        name: "description",
        content: "Compra tickets con tu hashpower y gana grandes premios de poder de minado.",
      },
      { property: "og:title", content: "Lottery — NebulaMine" },
      { property: "og:description", content: "Compra tickets y gana premios de hashpower." },
    ],
  }),
  component: Lottery,
});

const TICKET_COST = 20;

function Lottery() {
  const { power, addPower } = useMining();
  const [tickets, setTickets] = useState<number[]>([]);
  const [result, setResult] = useState<string | null>(null);

  const buy = () => {
    if (power < TICKET_COST) {
      setResult("No tienes suficiente hashpower para un ticket.");
      return;
    }
    addPower(-TICKET_COST);
    const n = Math.floor(100000 + Math.random() * 900000);
    setTickets((t) => [n, ...t].slice(0, 12));
    setResult(`Ticket #${n} registrado para el sorteo.`);
  };

  const draw = () => {
    if (tickets.length === 0) {
      setResult("Compra al menos un ticket antes del sorteo.");
      return;
    }
    const win = Math.random() < 0.35;
    if (win) {
      const prize = [50, 120, 300, 750][Math.floor(Math.random() * 4)]!;
      addPower(prize);
      setResult(`¡Ganaste! +${prize} h/s añadidos a tu poder de minado.`);
    } else {
      setResult("Sin premio esta vez. El próximo sorteo es en 1 hora.");
    }
    setTickets([]);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold glow-text">Lottery</h1>
      <p className="mt-2 text-muted-foreground">
        Cada ticket cuesta {TICKET_COST} h/s. Premios hasta 750 h/s.
      </p>

      <div className="panel mt-8 p-6">
        <p className="text-sm text-muted-foreground">
          Poder disponible:{" "}
          <span className="font-display font-bold text-primary">
            {power.toLocaleString("en-US")} h/s
          </span>
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={buy}
            className="inline-flex items-center gap-2 rounded-md px-4 py-2.5 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--glow-primary)" }}
          >
            <Ticket className="h-4 w-4" /> Comprar ticket
          </button>
          <button
            type="button"
            onClick={draw}
            className="rounded-md border border-primary/50 px-4 py-2.5 font-display text-sm font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/10"
          >
            Sortear
          </button>
        </div>

        {result && <p className="mt-5 text-sm text-foreground">{result}</p>}

        <div className="mt-6 flex flex-wrap gap-2">
          {tickets.map((t) => (
            <span
              key={t}
              className="rounded-md border border-border bg-secondary/60 px-3 py-1.5 font-mono text-xs text-foreground"
            >
              #{t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
