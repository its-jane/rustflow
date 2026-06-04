import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { CodeBlock } from "@/components/CodeBlock";
import { loadRustWasm, rust } from "@/lib/wasm";

export const Route = createFileRoute("/frontend")({
  head: () => ({
    meta: [
      { title: "Frontend + WASM — How Rust meets the browser" },
      {
        name: "description",
        content:
          "How Rust connects to the frontend: WebAssembly, wasm-bindgen, and HTTP APIs. JS calls a real compiled Rust function and gets a result, live.",
      },
      { property: "og:title", content: "Frontend + WASM — How Rust meets the browser" },
      {
        property: "og:description",
        content:
          "A real wasm-bindgen demo: this page calls Rust functions compiled to WebAssembly, in your browser.",
      },
    ],
  }),
  component: FrontendPage,
});

const RUST_LIB = `// wasm-crate/src/lib.rs   —  compiled to WebAssembly
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn fibonacci(n: u32) -> u64 {
    let (mut a, mut b) = (0u64, 1u64);
    for _ in 0..n { let t = a.wrapping_add(b); a = b; b = t; }
    a
}

#[wasm_bindgen]
pub fn count_primes(limit: u32) -> u32 {
    // sieve of Eratosthenes — see src/lib.rs in this project
}

#[wasm_bindgen]
pub fn reverse_string(input: &str) -> String {
    input.chars().rev().collect()
}`;

const JS_SIDE = `// in your React / TS frontend
import init, { fibonacci, count_primes, reverse_string }
  from "./pkg/rustflow_wasm";

await init();                    // load & instantiate the .wasm
const f = fibonacci(40);         // → 102334155n (BigInt — Rust u64)
const p = count_primes(100_000); // → 9592
const r = reverse_string("hi");  // → "ih"`;

const BACKEND = `// Axum HTTP server — Rust on the backend
use axum::{routing::get, Router, Json};
use serde::Serialize;

#[derive(Serialize)]
struct Greeting { msg: String }

#[tokio::main]
async fn main() {
    let app = Router::new().route(
        "/api/hello",
        get(|| async { Json(Greeting { msg: "hello from rust".into() }) }),
    );
    axum::Server::bind(&"0.0.0.0:3000".parse().unwrap())
        .serve(app.into_make_service()).await.unwrap();
}`;

function FrontendPage() {
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    loadRustWasm()
      .then(() => setReady(true))
      .catch((e) => setErr(String(e)));
  }, []);

  const [n, setN] = useState(40);
  const [limit, setLimit] = useState("100000");
  const [text, setText] = useState("Ferris the crab 🦀");
  const [bench, setBench] = useState<string | null>(null);

  const fibOut = ready ? rust.fibonacci(n).toString() : "loading…";
  const primesOut = ready
    ? (() => {
        const v = parseInt(limit || "0", 10);
        if (!Number.isFinite(v) || v < 0 || v > 5_000_000) return "out of range";
        return rust.countPrimes(v).toString();
      })()
    : "loading…";
  const reversedOut = ready ? rust.reverseString(text) : "loading…";

  function runBench() {
    if (!ready) return;
    const N = 1_000_000;
    const t0 = performance.now();
    let acc = 0n;
    for (let i = 0; i < 200; i++) acc += rust.fibonacci(N % 90);
    const dt = performance.now() - t0;
    setBench(`200 × fibonacci ran in ${dt.toFixed(1)} ms  (acc=${acc.toString().slice(0, 10)}…)`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-16 w-full">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Chapter 04</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          How Rust meets <span className="text-gradient-rust">the frontend</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          Two main bridges: <strong>WebAssembly</strong> (Rust runs in the browser, JS calls it
          directly) and an <strong>HTTP API</strong> (Rust runs on a server, the browser calls it).
          The demo on this page is the first one — for real.
        </p>

        <div
          className={`mt-6 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${
            ready
              ? "border-heap/40 bg-heap/10 text-heap"
              : err
                ? "border-mut/40 bg-mut/10 text-mut"
                : "border-border text-muted-foreground"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {ready ? "rustflow_wasm.wasm loaded" : err ? `failed: ${err}` : "loading wasm module…"}
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">1. The source &amp; the glue</h2>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            <code className="text-primary">wasm-bindgen</code> generates the JS↔WASM glue. Your Rust
            functions become regular JS functions; values are marshalled across the boundary.
          </p>
          <div className="mt-6 grid lg:grid-cols-2 gap-6">
            <CodeBlock code={RUST_LIB} />
            <CodeBlock code={JS_SIDE} />
          </div>

          <div className="surface-panel p-6 mt-8">
            <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
              The pipeline
            </h3>
            <div className="grid md:grid-cols-5 gap-3 items-center">
              {[
                { t: "lib.rs", c: "rust" },
                { t: "cargo build\n--target wasm32", c: "owner" },
                { t: "wasm-bindgen\n→ pkg/", c: "stack" },
                { t: ".wasm + .js glue", c: "heap" },
                { t: "<script> in React", c: "borrow" },
              ].map((s, i) => (
                <div key={i} className="surface-panel p-3 text-center text-xs whitespace-pre-line">
                  <div
                    className="w-6 h-6 mx-auto mb-2 rounded-full text-[10px] flex items-center justify-center font-mono"
                    style={{ background: `var(--${s.c})`, color: "oklch(0.15 0.02 40)" }}
                  >
                    {i + 1}
                  </div>
                  {s.t}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">2. Live: call Rust from JS</h2>
          <p className="text-xs text-muted-foreground mt-2">
            These results come from{" "}
            <code className="text-primary">public/wasm/rustflow_wasm_bg.wasm</code> — actual
            compiled Rust running in your browser right now.
          </p>

          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <div className="surface-panel p-5">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                fibonacci(n) → u64
              </label>
              <input
                type="range"
                min={0}
                max={90}
                value={n}
                onChange={(e) => setN(parseInt(e.target.value))}
                className="w-full mt-3 accent-primary"
              />
              <div className="mt-1 font-mono text-sm">
                <span className="text-primary">n =</span> {n}
              </div>
              <div className="mt-3 p-3 rounded-md bg-card border border-border font-mono text-sm break-all">
                <span className="text-muted-foreground">→ </span>
                <span className="text-heap">{fibOut}</span>
              </div>
            </div>

            <div className="surface-panel p-5">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                count_primes(≤ limit)
              </label>
              <input
                type="text"
                value={limit}
                onChange={(e) => setLimit(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full mt-3 px-3 py-2 rounded-md bg-card border border-border font-mono text-sm focus:outline-none focus:border-primary"
              />
              <div className="mt-3 p-3 rounded-md bg-card border border-border font-mono text-sm">
                <span className="text-muted-foreground">→ </span>
                <span className="text-heap">{primesOut}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                sieve allocated &amp; freed inside WASM linear memory
              </p>
            </div>

            <div className="surface-panel p-5">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                reverse_string(&amp;str)
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full mt-3 px-3 py-2 rounded-md bg-card border border-border font-mono text-sm focus:outline-none focus:border-primary"
              />
              <div className="mt-3 p-3 rounded-md bg-card border border-border font-mono text-sm break-all">
                <span className="text-muted-foreground">→ </span>
                <span className="text-heap">{reversedOut}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                JS String copied in, Rust String copied out
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={runBench}
              disabled={!ready}
              className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground disabled:opacity-50"
            >
              ▶ run a benchmark
            </button>
            {bench && <code className="text-xs text-muted-foreground">{bench}</code>}
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-2xl font-semibold">3. Rust as the backend</h2>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            For server work, frameworks like <strong>Axum</strong>, <strong>Actix</strong>, and{" "}
            <strong>Rocket</strong> let you build HTTP and JSON APIs. The browser doesn't know — or
            care — that Rust is on the other end.
          </p>

          <div className="mt-6 grid lg:grid-cols-2 gap-6 items-start">
            <CodeBlock code={BACKEND} />
            <div className="surface-panel p-6">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                The exchange
              </div>
              <div className="font-mono text-sm space-y-2">
                <div className="text-borrow">› fetch("/api/hello")</div>
                <div className="text-muted-foreground pl-4">↓ over HTTP</div>
                <div className="text-primary">› axum routes to your handler</div>
                <div className="text-muted-foreground pl-4">↓ serde serializes</div>
                <div className="text-heap">{`‹ { "msg": "hello from rust" }`}</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
