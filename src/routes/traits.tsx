import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/traits")({
  head: () => ({
    meta: [
      { title: "Traits & Generics — rust/flow" },
      {
        name: "description",
        content:
          "How Rust traits and generics work, and how monomorphization specializes them at compile time — visualized step by step.",
      },
      { property: "og:title", content: "Traits & Generics — rust/flow" },
      {
        property: "og:description",
        content:
          "Watch a single generic function turn into many specialized functions at compile time.",
      },
    ],
  }),
  component: TraitsPage,
});

const SOURCE = `trait Greet {
    fn hello(&self) -> String;
}

impl Greet for &str   { fn hello(&self) -> String { format!("Hi, {self}!") } }
impl Greet for i32    { fn hello(&self) -> String { format!("Number {self}")  } }
impl Greet for bool   { fn hello(&self) -> String { format!("Bool {self}")    } }

fn say<T: Greet>(value: T) -> String {
    value.hello()
}

fn main() {
    let a = say("Ada");
    let b = say(42);
    let c = say(true);
}`;

type Stage = 0 | 1 | 2 | 3 | 4;

const STAGES: { title: string; blurb: string }[] = [
  {
    title: "1 · You write one generic function",
    blurb: "`fn say<T: Greet>(value: T)` is a template: any T that implements Greet will fit.",
  },
  {
    title: "2 · Compiler scans every call site",
    blurb: 'rustc finds say("Ada"), say(42), say(true) — three distinct concrete T values.',
  },
  {
    title: "3 · Monomorphization",
    blurb:
      "The compiler stamps out one specialized copy of `say` per T. No runtime dispatch, no vtable.",
  },
  {
    title: "4 · Each copy is inlined & optimized",
    blurb:
      "LLVM optimizes each specialization independently — like you had hand-written all three.",
  },
  {
    title: "5 · Final binary",
    blurb:
      "Generics had zero runtime cost. The binary contains the three monomorphic functions only.",
  },
];

const COPIES = [
  { t: "&str", call: `say("Ada")`, body: `value.hello()  // → "Hi, Ada!"`, color: "owner" },
  { t: "i32", call: `say(42)`, body: `value.hello()  // → "Number 42"`, color: "stack" },
  { t: "bool", call: `say(true)`, body: `value.hello()  // → "Bool true"`, color: "heap" },
];

const DYN_CODE = `// Same trait, but now we choose at RUNTIME with dyn Trait + vtable
fn say_dyn(value: &dyn Greet) -> String {
    value.hello()
}

let items: Vec<Box<dyn Greet>> = vec![
    Box::new("Ada"),
    Box::new(42),
    Box::new(true),
];
for item in &items { say_dyn(item.as_ref()); }`;

function TraitsPage() {
  const [stage, setStage] = useState<Stage>(0);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-16 w-full">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Chapter 10</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Traits, generics & <span className="text-gradient-rust">monomorphization</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          Traits define shared behaviour; generics let one function work for many types. Press
          "next" to watch what the compiler actually does with them.
        </p>

        <section className="mt-12 grid lg:grid-cols-2 gap-6">
          <CodeBlock
            code={SOURCE}
            highlightLines={stage === 1 ? [14, 15, 16] : stage === 0 ? [10, 11, 12] : []}
          />

          <div className="surface-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Pipeline</p>
                <h2 className="font-semibold mt-1">{STAGES[stage].title}</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStage((s) => Math.max(0, s - 1) as Stage)}
                  disabled={stage === 0}
                  className="px-3 py-1.5 text-sm rounded-md border border-border disabled:opacity-40"
                  aria-label="Previous stage"
                >
                  ←
                </button>
                <button
                  onClick={() => setStage((s) => Math.min(4, s + 1) as Stage)}
                  disabled={stage === 4}
                  className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground disabled:opacity-40"
                  aria-label="Next stage"
                >
                  next →
                </button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6 animate-float-up" key={stage}>
              {STAGES[stage].blurb}
            </p>

            <div className="space-y-3">
              {COPIES.map((c, i) => {
                const visible = stage >= 2;
                const optimized = stage >= 3;
                const finalBin = stage >= 4;
                return (
                  <div
                    key={c.t}
                    className={`border rounded-md p-3 transition-all duration-500 ${
                      visible ? "opacity-100 translate-y-0" : "opacity-30 translate-y-2"
                    }`}
                    style={{
                      borderColor: visible ? `var(--${c.color})` : "var(--color-border)",
                      background: visible
                        ? `color-mix(in oklab, var(--${c.color}) 12%, transparent)`
                        : "transparent",
                      animationDelay: `${i * 80}ms`,
                    }}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span style={{ color: `var(--${c.color})` }}>say::&lt;{c.t}&gt;</span>
                      <span className="text-muted-foreground">
                        {finalBin
                          ? "in binary ✓"
                          : optimized
                            ? "inlined & optimized"
                            : visible
                              ? "specialized"
                              : "—"}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      call: <code>{c.call}</code>
                    </div>
                    {visible && (
                      <pre className="mt-2 text-[11px] font-mono whitespace-pre-wrap text-foreground/80">
                        {`fn say_${c.t.replace(/[^a-z0-9]/gi, "")}(value: ${c.t}) -> String {\n    ${c.body}\n}`}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                step {stage + 1} / {STAGES.length}
              </span>
              <button onClick={() => setStage(0)} className="px-2 py-1 rounded hover:bg-accent">
                reset
              </button>
            </div>
          </div>
        </section>

        <section className="mt-16 grid md:grid-cols-2 gap-6">
          <div className="surface-panel p-6">
            <h3 className="font-semibold">Static dispatch — what you just saw</h3>
            <p className="text-sm text-muted-foreground mt-2">
              <code className="text-primary">&lt;T: Trait&gt;</code> picks the implementation at
              compile time. Pros: zero runtime cost, full inlining. Cons: bigger binary (one copy
              per T).
            </p>
          </div>
          <div className="surface-panel p-6">
            <h3 className="font-semibold">
              Dynamic dispatch — <code className="text-primary">dyn Trait</code>
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Choose the implementation at runtime through a vtable. One function, many types in a
              Vec. Pros: smaller binary, heterogeneous collections. Cons: an indirect call per use.
            </p>
          </div>
        </section>

        <section className="mt-8">
          <CodeBlock code={DYN_CODE} />
        </section>

        <section className="mt-16 surface-panel p-6 text-sm text-muted-foreground">
          <p>
            <span className="text-primary font-semibold">Rule of thumb — </span>
            reach for generics first (free speed), switch to <code>dyn</code> only when you need a
            collection of mixed concrete types or want to keep code size down.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
