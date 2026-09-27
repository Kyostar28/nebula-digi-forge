import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { eventLabel, fmtDuration, useGame } from "@/lib/mining";

/** Applies the chosen theme and shows live network event alerts. */
export function GameShell() {
  const s = useGame();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    document.documentElement.dataset.theme = s.theme;
  }, [s.theme]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const e = s.event && s.event.endsAt > now ? s.event : null;
  if (!e) return null;
  return (
    <div className="sticky top-[57px] z-40 border-b border-accent/50 bg-accent/15 backdrop-blur-md animate-fade-in">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 text-sm">
        <Zap className="h-4 w-4 shrink-0 text-accent live-dot" />
        <span className="font-display text-xs font-bold uppercase tracking-widest text-accent">Evento de red</span>
        <span className="text-foreground">{eventLabel(e)}</span>
        <span className="ml-auto font-mono text-xs text-muted-foreground">{fmtDuration(e.endsAt - now)}</span>
      </div>
    </div>
  );
}
