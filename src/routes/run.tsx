import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";

export const Route = createFileRoute("/run")({
  head: () => ({
    meta: [
      { title: "Rust Playground — rust/flow" },
      {
        name: "description",
        content:
          "Edit Rust code and run it on the official Rust Playground (play.rust-lang.org) without leaving the tour.",
      },
      { property: "og:title", content: "Rust Playground — rust/flow" },
      {
        property: "og:description",
        content:
          "Open editable snippets straight into play.rust-lang.org and run real Rust against the real compiler.",
      },
    ],
  }),
  component: RunPage,
});

const SNIPPETS: { name: string; code: string }[] = [
  {
    name: "Hello, world",
    code: `fn main() {
    println!("Hello, world!");
}`,
  },
  {
    name: "Ownership move",
    code: `fn main() {
    let s = String::from("hello");
    let t = s;
    // println!("{s}"); // <- uncomment to see the borrow-checker error
    println!("{t}");
}`,
  },
  {
    name: "Threads + channel",
    code: `use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();
    for id in 0..4 {
        let tx = tx.clone();
        thread::spawn(move || tx.send(format!("worker {id}")).unwrap());
    }
    drop(tx);
    for msg in rx { println!("{msg}"); }
}`,
  },
  {
    name: "Iterators",
    code: `fn main() {
    let total: i32 = (1..=10)
        .filter(|n| n % 2 == 0)
        .map(|n| n * n)
        .sum();
    println!("sum of squares of evens 1..=10 = {total}");
}`,
  },
  {
    name: "Result + ?",
    code: `fn double(s: &str) -> Result<i32, std::num::ParseIntError> {
    Ok(s.trim().parse::<i32>()? * 2)
}

fn main() {
    println!("{:?}", double(" 21 "));
    println!("{:?}", double("oops"));
}`,
  },
];

function urlFor(code: string) {
  return `https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&code=${encodeURIComponent(code)}`;
}

function RunPage() {
  const [idx, setIdx] = useState(0);
  const [code, setCode] = useState(SNIPPETS[0].code);

  function pick(i: number) {
    setIdx(i);
    setCode(SNIPPETS[i].code);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-16 w-full">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Chapter 14</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          The <span className="text-gradient-rust">Rust Playground</span>, embedded
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          Edit any snippet and open it in the official{" "}
          <a
            href="https://play.rust-lang.org"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            play.rust-lang.org
          </a>{" "}
          — real <code>rustc</code>, real stdout, real compile errors. Your edits travel along in
          the URL.
        </p>

        <section className="mt-10 grid lg:grid-cols-[220px_1fr] gap-6 items-start">
          <aside className="surface-panel p-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground px-2 pb-2">
              Snippets
            </div>
            {SNIPPETS.map((s, i) => (
              <button
                key={s.name}
                onClick={() => pick(i)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
                  i === idx
                    ? "bg-primary/15 text-foreground"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {s.name}
              </button>
            ))}
          </aside>

          <div className="surface-panel p-0 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2 bg-card text-xs text-muted-foreground font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-mut/70" aria-hidden />
              <span className="w-2.5 h-2.5 rounded-full bg-owner/70" aria-hidden />
              <span className="w-2.5 h-2.5 rounded-full bg-heap/70" aria-hidden />
              <span className="ml-3">{SNIPPETS[idx].name} · editable</span>
              <a
                href={urlFor(code)}
                target="_blank"
                rel="noreferrer"
                className="ml-auto px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs hover:opacity-90"
              >
                ▶ Run on play.rust-lang.org
              </a>
            </div>
            <label className="sr-only" htmlFor="rust-editor">
              Rust code editor
            </label>
            <textarea
              id="rust-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full min-h-[420px] resize-y bg-background p-4 font-mono text-sm focus:outline-none border-0"
            />
            <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
              <span>edits sent to the playground via URL (no account needed)</span>
              <button
                onClick={() => setCode(SNIPPETS[idx].code)}
                className="px-2 py-1 rounded hover:bg-accent"
              >
                reset snippet
              </button>
            </div>
          </div>
        </section>

        <section className="mt-12 surface-panel p-6 text-sm text-muted-foreground">
          <p>
            <span className="text-primary font-semibold">Why a separate tab? </span>
            play.rust-lang.org sets headers that prevent embedding it in an iframe, for security.
            Opening it in a new tab is the supported integration — and you get the full editor,
            release/debug toggle, and shareable Gist export.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
