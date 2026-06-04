import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { to: "/", label: "Home" },
  { to: "/ownership", label: "Ownership" },
  { to: "/memory", label: "Memory" },
  { to: "/lifetimes", label: "Lifetimes" },
  { to: "/traits", label: "Traits" },
  { to: "/smart-pointers", label: "Pointers" },
  { to: "/concurrency", label: "Concurrency" },
  { to: "/async", label: "Async" },
  { to: "/macros", label: "Macros" },
  { to: "/testing", label: "Testing" },
  { to: "/frontend", label: "WASM" },
  { to: "/errors", label: "Errors" },
  { to: "/playground", label: "Code Tour" },
  { to: "/run", label: "Playground" },
  { to: "/quiz", label: "Quiz" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border">
      <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight shrink-0">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full bg-primary animate-pulse-glow"
            aria-hidden
          />
          <span>
            rust<span className="text-primary">/flow</span>
          </span>
        </Link>
        <nav
          aria-label="Primary"
          className="hidden xl:flex items-center gap-0.5 text-sm overflow-x-auto"
        >
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors whitespace-nowrap"
              activeProps={{
                className: "px-2.5 py-1.5 rounded-md text-foreground bg-accent whitespace-nowrap",
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            className="xl:hidden text-sm px-3 py-1.5 rounded-md border border-border"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {open && (
        <nav
          aria-label="Mobile"
          className="xl:hidden border-t border-border bg-background/95 px-6 py-3 flex flex-wrap gap-1 text-sm"
        >
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
              activeProps={{ className: "px-3 py-1.5 rounded-md text-foreground bg-accent" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-muted-foreground flex flex-col md:flex-row gap-2 justify-between">
        <p>Built to demonstrate how Rust works — interactively.</p>
        <p>Compile-time safety · Zero-cost abstractions · Fearless concurrency</p>
      </div>
    </footer>
  );
}
