import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/earn-power", label: "Earn Power" },
  { to: "/faucet", label: "Faucet" },
  { to: "/lottery", label: "Lottery" },
  { to: "/games", label: "Games" },
  { to: "/faq", label: "FAQ" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[var(--gradient-primary)] font-display text-sm font-bold text-primary-foreground shadow-[var(--glow-primary)]">
            N
          </span>
          <span className="font-display text-lg font-bold tracking-widest text-foreground">
            NEBULA<span className="text-primary">MINE</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-primary bg-primary/10 shadow-[var(--glow-primary)]" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="ml-2 rounded-md border border-destructive/40 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/15"
          >
            Logout
          </button>
        </nav>

        <button
          type="button"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto rounded-md border border-border p-2 text-foreground md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-border/60 px-4 pb-4 pt-2 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-primary bg-primary/10" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground"
            >
              {l.label}
            </Link>
          ))}
          <button
            type="button"
            className="mt-1 rounded-md border border-destructive/40 px-3 py-2 text-left text-sm font-medium text-destructive"
          >
            Logout
          </button>
        </nav>
      )}
    </header>
  );
}
