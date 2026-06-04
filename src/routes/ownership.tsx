import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/ownership")({
  head: () => ({
    meta: [
      { title: "Ownership & Borrowing — rust/flow" },
      {
        name: "description",
        content:
          "Step through Rust ownership rules: moves, borrows, mutable references, and lifetimes — visualized line by line.",
      },
    ],
  }),
  component: OwnershipPage,
});

type Step = {
  line: number;
  narration: string;
  owners: { name: string; holds: string | null; kind?: "owner" | "borrow" | "mut" }[];
  value: { id: string; data: string; alive: boolean };
  error?: string;
};

const CODE = `fn main() {
    let s1 = String::from("hello");
    let s2 = s1;
    println!("{}", s1);
}`;

const STEPS: Step[] = [
  {
    line: 2,
    narration: "We create a String on the heap. s1 is its owner.",
    owners: [{ name: "s1", holds: "hello", kind: "owner" }],
    value: { id: "v1", data: "hello", alive: true },
  },
  {
    line: 3,
    narration: "Assignment moves ownership. s1 no longer owns anything — s2 does.",
    owners: [
      { name: "s1", holds: null },
      { name: "s2", holds: "hello", kind: "owner" },
    ],
    value: { id: "v1", data: "hello", alive: true },
  },
  {
    line: 4,
    narration: "Using s1 after a move is a compile error. Rust caught it before runtime.",
    owners: [
      { name: "s1", holds: null },
      { name: "s2", holds: "hello", kind: "owner" },
    ],
    value: { id: "v1", data: "hello", alive: true },
    error: "error[E0382]: borrow of moved value: `s1`",
  },
];

const BORROW_CODE = `fn main() {
    let mut s = String::from("hello");
    let r1 = &s;          // immutable borrow
    let r2 = &s;          // many immutable borrows: OK
    println!("{} {}", r1, r2);
    let r3 = &mut s;      // exclusive mutable borrow
    r3.push_str(", world");
    println!("{}", r3);
}`;

function OwnershipPage() {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-16 w-full">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Chapter 01</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Ownership: <span className="text-gradient-rust">one value, one owner</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          Rust replaces the garbage collector with a set of rules the compiler checks. Each value
          has exactly one owner. When the owner leaves scope, the value is dropped — automatically
          and deterministically.
        </p>

        {/* Interactive stepper */}
        <section className="mt-12 grid lg:grid-cols-2 gap-6">
          <div>
            <CodeBlock code={CODE} highlightLines={[current.line]} />
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="px-4 py-2 rounded-md border border-border hover:bg-accent disabled:opacity-40"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                disabled={step === STEPS.length - 1}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40"
              >
                Next step →
              </button>
              <span className="ml-auto text-sm text-muted-foreground">
                Step {step + 1} / {STEPS.length}
              </span>
            </div>
          </div>

          <div className="surface-panel p-6">
            <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
              Memory & owners
            </h3>

            <div className="space-y-3">
              {current.owners.map((o) => (
                <div
                  key={o.name}
                  className="flex items-center gap-4 p-3 rounded-md border border-border bg-card"
                >
                  <span className="font-mono text-primary w-10">{o.name}</span>
                  <span className="text-muted-foreground">→</span>
                  {o.holds ? (
                    <span
                      className="px-3 py-1 rounded font-mono text-sm"
                      style={{
                        background: `var(--${o.kind ?? "owner"})`,
                        color: "oklch(0.15 0.02 40)",
                      }}
                    >
                      heap("{o.holds}")
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded font-mono text-sm bg-destructive/20 text-destructive border border-destructive/40">
                      (moved — invalid)
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div
              className="mt-6 p-4 rounded-md bg-muted text-sm leading-relaxed animate-float-up"
              key={step}
            >
              {current.narration}
            </div>

            {current.error && (
              <div className="mt-3 p-4 rounded-md border border-destructive/50 bg-destructive/10 text-destructive font-mono text-xs animate-float-up">
                {current.error}
              </div>
            )}
          </div>
        </section>

        {/* The three rules */}
        <section className="mt-20">
          <h2 className="text-2xl font-semibold mb-6">The three rules</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              "Each value in Rust has a single owner.",
              "There can only be one owner at a time.",
              "When the owner goes out of scope, the value is dropped.",
            ].map((r, i) => (
              <div key={i} className="surface-panel p-5">
                <div className="text-primary font-mono text-sm mb-2">rule {i + 1}</div>
                <p className="text-foreground">{r}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Borrowing */}
        <section className="mt-20 grid lg:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-2xl font-semibold">Borrowing — references instead of moves</h2>
            <p className="text-muted-foreground mt-3">
              Sometimes you want to <em>use</em> a value without taking ownership. That's a{" "}
              <span className="text-borrow font-medium">reference</span> (a borrow). Rust's borrow
              checker enforces:
            </p>
            <ul className="mt-4 space-y-3">
              <li className="flex gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-borrow" />
                <span>
                  Any number of <strong>immutable</strong> references{" "}
                  <code className="text-borrow">&amp;T</code>, OR
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-mut" />
                <span>
                  Exactly one <strong>mutable</strong> reference{" "}
                  <code className="text-mut">&amp;mut T</code>.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-primary" />
                <span>References must always be valid (no dangling pointers — ever).</span>
              </li>
            </ul>
            <p className="text-muted-foreground mt-4">
              This single rule eliminates an entire class of bugs: data races, use-after-free,
              iterator invalidation.
            </p>
          </div>
          <CodeBlock code={BORROW_CODE} />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
