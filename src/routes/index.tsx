import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "rust/flow — Learn how Rust works, visually" },
      {
        name: "description",
        content:
          "An interactive, demonstrative tour of the Rust programming language: ownership, memory, concurrency, and how Rust connects to the frontend.",
      },
      { property: "og:title", content: "rust/flow — Learn how Rust works, visually" },
      {
        property: "og:description",
        content:
          "Interactive demonstrations of Rust's core ideas: ownership, borrowing, memory, threads, and WebAssembly.",
      },
    ],
  }),
  component: HomePage,
});

const HERO_CODE = `fn main() {
    let greeting = String::from("Hello, Rustacean!");
    let shouted = shout(&greeting);
    println!("{shouted}");
}

fn shout(text: &str) -> String {
    format!("{}!!!", text.to_uppercase())
}`;

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--gradient-hero)" }}>
      <SiteNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-float-up">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary mb-6">
              <span className="w-8 h-px bg-primary" /> A visual tour of Rust
            </p>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              See how <span className="text-gradient-rust">Rust</span> thinks, moves, and connects.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Forget the textbook. Watch ownership transfer between variables, borrowing flicker in
              and out of scope, threads run in parallel, and Rust code stream into the browser
              through WebAssembly — live, in your browser.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/ownership"
                className="px-5 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition glow-rust"
              >
                Start with Ownership →
              </Link>
              <Link
                to="/playground"
                className="px-5 py-3 rounded-md border border-border hover:bg-accent transition"
              >
                Walk through real code
              </Link>
            </div>
          </div>

          <div className="animate-float-up" style={{ animationDelay: "120ms" }}>
            <div className="surface-panel overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card">
                <span className="w-3 h-3 rounded-full bg-mut/70" />
                <span className="w-3 h-3 rounded-full bg-owner/70" />
                <span className="w-3 h-3 rounded-full bg-heap/70" />
                <span className="ml-3 text-xs text-muted-foreground">main.rs</span>
              </div>
              <CodeBlock code={HERO_CODE} className="!border-0 !shadow-none rounded-none" />
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <h2 className="text-2xl font-semibold mb-2">All the chapters</h2>
          <p className="text-muted-foreground mb-10 max-w-2xl">
            Each idea has its own interactive page. Visit in any order.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                to: "/ownership",
                title: "Ownership & Borrowing",
                color: "owner",
                desc: "Every value has a single owner. The compiler tracks who holds what.",
              },
              {
                to: "/memory",
                title: "Stack & Heap",
                color: "heap",
                desc: "C-level control of memory placement, with safety guaranteed at compile time.",
              },
              {
                to: "/lifetimes",
                title: "Lifetimes",
                color: "borrow",
                desc: "How long does a reference live? Watch scopes overlap on a timeline.",
              },
              {
                to: "/traits",
                title: "Traits & Generics",
                color: "rust-glow",
                desc: "Watch monomorphization stamp out one specialized function per concrete type.",
              },
              {
                to: "/smart-pointers",
                title: "Smart Pointers",
                color: "heap",
                desc: "Box, Rc, Arc, RefCell — with a live reference-count animation.",
              },
              {
                to: "/concurrency",
                title: "Fearless Concurrency",
                color: "stack",
                desc: "Data races become compile errors. Threads and channels, safely.",
              },
              {
                to: "/async",
                title: "Async & Futures",
                color: "rust",
                desc: "Watch the executor poll tasks and resume them at .await points.",
              },
              {
                to: "/macros",
                title: "Macros",
                color: "borrow",
                desc: "Code that writes code — declarative macros expanded step by step.",
              },
              {
                to: "/testing",
                title: "Testing & cargo",
                color: "owner",
                desc: "Unit tests, doctests, integration tests, and the full cargo workflow.",
              },
              {
                to: "/frontend",
                title: "Frontend + WASM",
                color: "ember",
                desc: "A real wasm-bindgen demo: JS calls compiled Rust in your browser.",
              },
              {
                to: "/errors",
                title: "Compiler Errors",
                color: "mut",
                desc: "Read the famously helpful rustc messages — recreated with carets and notes.",
              },
              {
                to: "/playground",
                title: "Code Tour",
                color: "owner",
                desc: "Annotated walkthroughs of structs, enums, traits, Result, iterators.",
              },
              {
                to: "/run",
                title: "Rust Playground",
                color: "rust",
                desc: "Edit snippets and run them on the real play.rust-lang.org compiler.",
              },
              {
                to: "/quiz",
                title: "Will it compile?",
                color: "heap",
                desc: "Quick predict-the-outcome quiz with explanations.",
              },
            ].map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="surface-panel p-6 group hover:border-primary/50 transition-all hover:-translate-y-0.5"
              >
                <div
                  className="w-10 h-10 rounded-md mb-4 flex items-center justify-center font-mono text-sm"
                  style={{ background: `var(--${c.color})`, color: "oklch(0.15 0.02 40)" }}
                >
                  &gt;_
                </div>
                <h3 className="font-semibold text-lg">{c.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{c.desc}</p>
                <span className="inline-block mt-4 text-sm text-primary group-hover:translate-x-1 transition-transform">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Flow diagram */}
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="surface-panel p-8 md:p-12">
            <h2 className="text-2xl font-semibold">From source to your browser</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              How a single <code className="text-primary">.rs</code> file becomes something a user
              clicks on.
            </p>

            <div className="mt-10 grid md:grid-cols-5 gap-3 items-stretch">
              {[
                { t: ".rs source", d: "You write Rust", c: "rust" },
                { t: "rustc / cargo", d: "Type & borrow check", c: "owner" },
                { t: "LLVM IR", d: "Optimized", c: "stack" },
                { t: "Binary / WASM", d: "Native or web target", c: "heap" },
                { t: "Frontend", d: "JS calls Rust funcs", c: "borrow" },
              ].map((s, i) => (
                <div key={i} className="relative">
                  <div className="surface-panel h-full p-4 text-center">
                    <div
                      className="w-8 h-8 mx-auto rounded-full mb-3 flex items-center justify-center text-xs font-mono"
                      style={{ background: `var(--${s.c})`, color: "oklch(0.15 0.02 40)" }}
                    >
                      {i + 1}
                    </div>
                    <p className="font-medium">{s.t}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.d}</p>
                  </div>
                  {i < 4 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-px bg-primary/50" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 text-sm text-muted-foreground">
              Want to see the bridge to the browser?{" "}
              <Link to="/frontend" className="text-primary hover:underline">
                Jump to Frontend + WASM →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
