import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/lifetimes")({
  head: () => ({
    meta: [
      { title: "Lifetimes — rust/flow" },
      {
        name: "description",
        content:
          "Visualize how Rust reference lifetimes overlap, shrink, and prevent dangling pointers.",
      },
      { property: "og:title", content: "Lifetimes — rust/flow" },
      {
        property: "og:description",
        content: "An animated walkthrough of Rust's lifetime annotations.",
      },
    ],
  }),
  component: LifetimesPage,
});

type Scope = {
  name: string;
  color: string;
  start: number;
  end: number;
  kind: "value" | "ref";
  note: string;
};

type Demo = {
  title: string;
  code: string;
  rows: Scope[];
  totalLines: number;
  verdict: "ok" | "err";
  message: string;
};

const DEMOS: Demo[] = [
  {
    title: "✓ Reference dies before the value",
    code: `fn main() {
    let s = String::from("hello");  // s born
    let r = &s;                     // r borrows s
    println!("{r}");                // r used
}                                   // r dies, then s dies`,
    rows: [
      {
        name: "s : String",
        color: "var(--owner)",
        start: 2,
        end: 5,
        kind: "value",
        note: "owns the heap buffer",
      },
      {
        name: "r : &String",
        color: "var(--borrow)",
        start: 3,
        end: 5,
        kind: "ref",
        note: "lifetime ⊆ s",
      },
    ],
    totalLines: 5,
    verdict: "ok",
    message: "Borrow checker: r's lifetime fits inside s's. Compiles.",
  },
  {
    title: "✗ Dangling reference — value dies first",
    code: `fn dangle() -> &String {
    let s = String::from("oops");   // s born
    &s                              // return reference…
}                                   // …but s dies here!`,
    rows: [
      {
        name: "s : String",
        color: "var(--owner)",
        start: 2,
        end: 4,
        kind: "value",
        note: "lives only inside dangle()",
      },
      {
        name: "&s (returned)",
        color: "var(--mut)",
        start: 3,
        end: 6,
        kind: "ref",
        note: "would outlive s — rejected",
      },
    ],
    totalLines: 6,
    verdict: "err",
    message:
      "error[E0106]: missing lifetime specifier — the reference would outlive the value it points to.",
  },
  {
    title: "✓ Explicit 'a tying two references together",
    code: `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let a = String::from("loooong");
    let b = String::from("hi");
    let r = longest(&a, &b);        // r lives ≤ min('a of a, 'a of b)
    println!("{r}");
}`,
    rows: [
      { name: "a : String", color: "var(--owner)", start: 6, end: 9, kind: "value", note: "owner" },
      { name: "b : String", color: "var(--owner)", start: 7, end: 9, kind: "value", note: "owner" },
      {
        name: "r : &'a str",
        color: "var(--borrow)",
        start: 8,
        end: 9,
        kind: "ref",
        note: "'a = min(a, b)",
      },
    ],
    totalLines: 9,
    verdict: "ok",
    message:
      "The 'a annotation lets the compiler check both inputs and the return share a compatible scope.",
  },
];

function LifetimesPage() {
  const [active, setActive] = useState(0);
  const demo = DEMOS[active];
  const [hoverLine, setHoverLine] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-16 w-full">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Chapter 07</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          <span className="text-gradient-rust">Lifetimes</span>, visualized
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          A lifetime is just "this reference is valid for this stretch of code." The bars below show
          how long each owner lives, and how long each reference is allowed to live.
        </p>

        <div className="mt-10 flex flex-wrap gap-2">
          {DEMOS.map((d, i) => (
            <button
              key={i}
              onClick={() => {
                setActive(i);
                setHoverLine(null);
              }}
              className={`px-3 py-2 text-sm rounded-md border transition ${
                i === active
                  ? "border-primary bg-primary/10"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {d.title}
            </button>
          ))}
        </div>

        <section className="mt-8 grid lg:grid-cols-2 gap-6">
          <CodeBlock code={demo.code} highlightLines={hoverLine ? [hoverLine] : []} />

          <div className="surface-panel p-6">
            <h2 className="font-semibold mb-1">Scope timeline</h2>
            <p className="text-xs text-muted-foreground mb-5">
              Each bar spans the lines where that binding is alive. Hover a bar to highlight in the
              code.
            </p>

            <div className="space-y-4">
              {demo.rows.map((r) => {
                const left = ((r.start - 1) / demo.totalLines) * 100;
                const width = ((r.end - r.start + 1) / demo.totalLines) * 100;
                return (
                  <div key={r.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-mono">{r.name}</span>
                      <span className="text-muted-foreground">
                        lines {r.start}–{r.end}
                      </span>
                    </div>
                    <div
                      className="relative h-7 bg-muted/40 rounded"
                      onMouseEnter={() => setHoverLine(r.start)}
                      onMouseLeave={() => setHoverLine(null)}
                    >
                      <div
                        className="absolute top-0 h-full rounded flex items-center justify-center text-[10px] font-mono"
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          background: r.color,
                          color: "oklch(0.15 0.02 40)",
                          opacity: 0.9,
                        }}
                      >
                        {r.kind === "ref" ? "& borrow" : "owns"}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{r.note}</div>
                  </div>
                );
              })}
            </div>

            <div
              className={`mt-6 p-4 rounded-md border text-sm font-mono ${
                demo.verdict === "ok"
                  ? "border-heap/40 bg-heap/10 text-foreground"
                  : "border-mut/40 bg-mut/10 text-foreground"
              }`}
            >
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                rustc says
              </div>
              {demo.message}
            </div>
          </div>
        </section>

        <section className="mt-12 surface-panel p-6 text-sm text-muted-foreground">
          <p>
            Most of the time you don't write lifetimes — Rust infers them. You only annotate when
            the compiler can't tell which input a returned reference comes from (that's what{" "}
            <code className="text-primary">'a</code> is for).
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
