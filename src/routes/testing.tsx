import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/testing")({
  head: () => ({
    meta: [
      { title: "Testing & cargo — rust/flow" },
      {
        name: "description",
        content:
          "How testing in Rust works: unit tests, integration tests, doctests, and the cargo workflow.",
      },
      { property: "og:title", content: "Testing & cargo — rust/flow" },
      {
        property: "og:description",
        content: "A tour of cargo test, doctests, and the rest of the cargo workflow.",
      },
    ],
  }),
  component: TestingPage,
});

const UNIT = `// src/lib.rs
pub fn add(a: i32, b: i32) -> i32 { a + b }

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn adds_two_numbers() {
        assert_eq!(add(2, 2), 4);
    }

    #[test]
    fn negatives_work() {
        assert_eq!(add(-3, 1), -2);
    }

    #[test]
    #[should_panic(expected = "overflow")]
    fn overflows() {
        let _ = i32::MAX + 1;
    }
}`;

const DOC = `/// Adds two numbers together.
///
/// # Examples
///
/// \`\`\`
/// use my_crate::add;
/// assert_eq!(add(2, 2), 4);
/// \`\`\`
pub fn add(a: i32, b: i32) -> i32 { a + b }`;

const INTEGRATION = `// tests/api.rs   — separate file, compiled as its own crate
use my_crate::add;

#[test]
fn adds_across_module_boundary() {
    assert_eq!(add(10, 20), 30);
}`;

const BENCH = `// benches/math.rs  — with criterion = "0.5"
use criterion::{black_box, criterion_group, criterion_main, Criterion};
use my_crate::add;

fn bench_add(c: &mut Criterion) {
    c.bench_function("add", |b| b.iter(|| add(black_box(2), black_box(2))));
}

criterion_group!(benches, bench_add);
criterion_main!(benches);`;

const COMMANDS = [
  { cmd: "cargo new my_app", out: "Created binary (application) `my_app` package" },
  { cmd: "cargo build", out: "Compiling my_app v0.1.0\n  Finished dev [unoptimized] target(s)" },
  { cmd: "cargo run", out: "Hello, world!" },
  {
    cmd: "cargo test",
    out: "running 3 tests\ntest tests::adds_two_numbers ... ok\ntest tests::negatives_work ... ok\ntest tests::overflows ... ok\n\ntest result: ok. 3 passed; 0 failed",
  },
  {
    cmd: "cargo doc --open",
    out: "Documenting my_app v0.1.0\n  Opening …/target/doc/my_app/index.html",
  },
  { cmd: "cargo clippy", out: "Checking my_app v0.1.0\n  Finished — no warnings" },
  { cmd: "cargo fmt", out: "(formats every .rs file in place)" },
  { cmd: "cargo publish", out: "Uploading my_app v0.1.0 to crates.io" },
];

function TestingPage() {
  const [cmd, setCmd] = useState(3);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-16 w-full">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Chapter 13</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Testing & the <span className="text-gradient-rust">cargo</span> workflow
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          Rust ships with a test runner, a doc-test runner, a formatter, a linter, a docs generator,
          and a package manager — all under one CLI: <code className="text-primary">cargo</code>.
        </p>

        <section className="mt-12 grid lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Unit tests live with the code</h2>
            <p className="text-sm text-muted-foreground mb-3">
              A <code>#[cfg(test)]</code> module is only compiled when you run{" "}
              <code>cargo test</code>. Each <code>#[test]</code> function runs in its own thread.
            </p>
            <CodeBlock code={UNIT} />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Doctests — examples that get tested</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Code in your doc comments is compiled and run by <code>cargo test</code>.
              Documentation that can't go stale.
            </p>
            <CodeBlock code={DOC} />
          </div>
        </section>

        <section className="mt-12 grid lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Integration tests use the public API</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Files in <code>tests/</code> are compiled as separate crates that only see your public
              API — exactly like a downstream user would.
            </p>
            <CodeBlock code={INTEGRATION} />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Benchmarks with <code className="text-primary">criterion</code>
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              For statistically meaningful benchmarks. Detects regressions across runs.
            </p>
            <CodeBlock code={BENCH} />
          </div>
        </section>

        <section className="mt-16 surface-panel p-0 overflow-hidden">
          <div className="border-b border-border bg-card px-4 py-2 text-xs text-muted-foreground font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-mut/70" aria-hidden />
            <span className="w-2.5 h-2.5 rounded-full bg-owner/70" aria-hidden />
            <span className="w-2.5 h-2.5 rounded-full bg-heap/70" aria-hidden />
            <span className="ml-3">~/my_app</span>
          </div>

          <div className="grid md:grid-cols-[260px_1fr] divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="p-3 space-y-1">
              {COMMANDS.map((c, i) => (
                <button
                  key={c.cmd}
                  onClick={() => setCmd(i)}
                  className={`w-full text-left px-3 py-1.5 rounded text-sm font-mono transition ${
                    i === cmd
                      ? "bg-primary/15 text-foreground"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  $ {c.cmd}
                </button>
              ))}
            </div>
            <pre className="p-5 text-sm font-mono whitespace-pre-wrap text-foreground/90 min-h-[180px]">
              <span className="text-primary">$ {COMMANDS[cmd].cmd}</span>
              {"\n"}
              <span className="text-muted-foreground">{COMMANDS[cmd].out}</span>
            </pre>
          </div>
        </section>

        <section className="mt-12 grid md:grid-cols-3 gap-4 text-sm">
          {[
            {
              t: "Cargo.toml",
              b: "Single manifest: dependencies, version, edition, features, build scripts.",
            },
            {
              t: "crates.io",
              b: "Open registry. `cargo add serde` pulls a package, locks its version.",
            },
            {
              t: "Cargo.lock",
              b: "Records exact versions of every transitive dep. Commit it for apps, ignore for libs.",
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
