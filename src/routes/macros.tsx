import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/macros")({
  head: () => ({
    meta: [
      { title: "Macros — rust/flow" },
      {
        name: "description",
        content:
          "How Rust's declarative macro_rules! macros expand at compile time, and a peek at procedural macros.",
      },
      { property: "og:title", content: "Macros — rust/flow" },
      {
        property: "og:description",
        content: "Watch macro_rules! patterns expand into real Rust code before compilation.",
      },
    ],
  }),
  component: MacrosPage,
});

const MACRO_DEF = `macro_rules! repeat {
    ($value:expr; $count:expr) => {{
        let mut v = Vec::new();
        for _ in 0..$count { v.push($value); }
        v
    }};
}`;

type Demo = { call: string; expanded: string };

const DEMOS: Demo[] = [
  {
    call: `let xs = repeat!("hi"; 3);`,
    expanded: `let xs = {
    let mut v = Vec::new();
    for _ in 0..3 { v.push("hi"); }
    v
};`,
  },
  {
    call: `let zeros = repeat!(0; 5);`,
    expanded: `let zeros = {
    let mut v = Vec::new();
    for _ in 0..5 { v.push(0); }
    v
};`,
  },
  {
    call: `let dyn_n = 10;
let big = repeat!(1.0; dyn_n);`,
    expanded: `let dyn_n = 10;
let big = {
    let mut v = Vec::new();
    for _ in 0..dyn_n { v.push(1.0); }
    v
};`,
  },
];

const VEC_MACRO = `// The famous vec! macro is built the same way:
macro_rules! vec {
    ( $( $x:expr ),* $(,)? ) => {{
        let mut v = Vec::new();
        $( v.push($x); )*
        v
    }};
}`;

const PROC = `// Procedural macros: take a TokenStream, return a TokenStream
use proc_macro::TokenStream;

#[proc_macro_derive(Hello)]
pub fn derive_hello(input: TokenStream) -> TokenStream {
    // parse input, build new code, return it
    "impl Hello for X { fn hello() { println!(\\"hi\\") } }"
        .parse().unwrap()
}

// Used like:
#[derive(Hello)]
struct X;`;

function MacrosPage() {
  const [demo, setDemo] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const d = DEMOS[demo];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-16 w-full">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Chapter 12</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          <span className="text-gradient-rust">Macros</span> — code that writes code
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          A macro is matched on syntax patterns and expanded before the compiler ever type-checks.
          Whatever appears in your source after expansion is what actually compiles.
        </p>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-3">
            Declarative — <code className="text-primary">macro_rules!</code>
          </h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
            Patterns on the left, replacement on the right. <code>$value:expr</code> says "capture
            an expression here." Below: a tiny <code>repeat!</code> macro and what it becomes.
          </p>

          <CodeBlock code={MACRO_DEF} />

          <div className="mt-6 surface-panel p-6">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-sm text-muted-foreground">pick a call:</span>
              {DEMOS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDemo(i);
                    setExpanded(false);
                  }}
                  className={`px-3 py-1.5 text-xs rounded-md border ${
                    i === demo
                      ? "border-primary bg-primary/10"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  call {i + 1}
                </button>
              ))}
              <button
                onClick={() => setExpanded((e) => !e)}
                className="ml-auto px-4 py-1.5 text-sm rounded-md bg-primary text-primary-foreground"
                aria-label={expanded ? "Collapse expansion" : "Expand macro"}
              >
                {expanded ? "← collapse" : "expand →"}
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-4 items-stretch">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  source you wrote
                </div>
                <CodeBlock code={d.call} />
              </div>
              <div
                className={`transition-all duration-500 ${expanded ? "opacity-100 translate-x-0" : "opacity-30 -translate-x-2"}`}
              >
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  {expanded ? "what the compiler sees" : "(press expand)"}
                </div>
                <CodeBlock code={expanded ? d.expanded : "// hidden until expanded"} />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold mb-3">
            <code className="text-primary">vec!</code> is just a macro
          </h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
            The repetition syntax <code>$( … ),*</code> matches zero-or-more expressions separated
            by commas. Inside the body, <code>$( … )*</code> emits the body once per match.
          </p>
          <CodeBlock code={VEC_MACRO} />
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold mb-3">
            Procedural macros — full Rust at compile time
          </h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
            For more than pattern matching, you can write a Rust function that runs{" "}
            <em>during compilation</em>, takes a <code>TokenStream</code> in and returns one out.
            This is how
            <code> #[derive(Serialize)]</code>, <code>#[tokio::main]</code>, and <code>html!</code>
            -style DSLs work.
          </p>
          <CodeBlock code={PROC} />
        </section>

        <section className="mt-16 grid md:grid-cols-3 gap-4 text-sm">
          {[
            {
              t: "Macros are hygienic",
              b: "Identifiers introduced by a macro can't collide with names at the call site.",
            },
            {
              t: "Expansion happens before type-check",
              b: "If a macro expands to invalid code, the error points at the expansion.",
            },
            {
              t: "Use sparingly",
              b: "Macros are powerful but harder to read. Reach for a function first.",
            },
          ].map((c) => (
            <div key={c.t} className="surface-panel p-5">
              <h3 className="font-semibold text-primary">{c.t}</h3>
              <p className="text-muted-foreground mt-1">{c.b}</p>
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
