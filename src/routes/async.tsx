import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { CodeBlock } from "@/components/CodeBlock";
import { loadRustWasm, rust } from "@/lib/wasm";

export const Route = createFileRoute("/async")({
  head: () => ({
    meta: [
      { title: "Async & Futures — rust/flow" },
      {
        name: "description",
        content:
          "How Rust's futures, .await, and the async executor work — visualized step by step.",
      },
      { property: "og:title", content: "Async & Futures — rust/flow" },
      {
        property: "og:description",
        content:
          "Watch the async executor poll futures, suspend tasks at .await points, and resume them.",
      },
    ],
  }),
  component: AsyncPage,
});

const ASYNC_CODE = `async fn fetch_user(id: u32) -> User {
    let raw = http_get(format!("/api/users/{id}")).await;  // suspends
    let user: User = serde_json::from_str(&raw).unwrap();
    user                                                    // returns Ready
}

#[tokio::main]
async fn main() {
    let a = tokio::spawn(fetch_user(1));
    let b = tokio::spawn(fetch_user(2));
    let (u1, u2) = (a.await.unwrap(), b.await.unwrap());
    println!("{} and {}", u1.name, u2.name);
}`;

type TaskState = "idle" | "polling" | "pending" | "ready";
type Task = { id: number; label: string; state: TaskState; progress: number };

function AsyncPage() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, label: "fetch_user(1)", state: "idle", progress: 0 },
    { id: 2, label: "fetch_user(2)", state: "idle", progress: 0 },
    { id: 3, label: "fetch_user(3)", state: "idle", progress: 0 },
  ]);
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((t) => t + 1), 350);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    setTasks((prev) => {
      const next = prev.map((t) => {
        if (t.state === "ready") return t;
        const bump = 8 + Math.floor(Math.random() * 18);
        const progress = Math.min(100, t.progress + bump);
        const state: TaskState = progress >= 100 ? "ready" : tick % 2 === 0 ? "polling" : "pending";
        return { ...t, progress, state };
      });
      if (next.every((t) => t.state === "ready")) {
        setRunning(false);
        setLog((l) => [...l, "all tasks Ready → main resumes"]);
      } else {
        const polled = next.filter((t) => t.state === "polling").map((t) => t.label);
        if (polled.length) setLog((l) => [...l.slice(-6), `executor polls: ${polled.join(", ")}`]);
      }
      return next;
    });
  }, [tick, running]);

  function start() {
    setTasks((t) => t.map((x) => ({ ...x, state: "polling", progress: 0 })));
    setLog(["spawned 3 tasks onto tokio runtime"]);
    setRunning(true);
  }
  function reset() {
    setRunning(false);
    setTasks((t) => t.map((x) => ({ ...x, state: "idle", progress: 0 })));
    setLog([]);
  }

  // Live WASM demo: a "fake async" wrapper around a sync Rust call
  const [wasmReady, setWasmReady] = useState(false);
  const [wasmOut, setWasmOut] = useState<string>("");
  useEffect(() => {
    loadRustWasm()
      .then(() => setWasmReady(true))
      .catch(() => setWasmReady(false));
  }, []);
  async function runConcurrent() {
    if (!wasmReady) return;
    setWasmOut("…awaiting…");
    const start = performance.now();
    const results = await Promise.all([
      new Promise<bigint>((r) => setTimeout(() => r(rust.fibonacci(40)), 80)),
      new Promise<number>((r) => setTimeout(() => r(rust.countPrimes(50_000)), 80)),
      new Promise<bigint>((r) => setTimeout(() => r(rust.sumOfSquares(10_000)), 80)),
    ]);
    const dur = (performance.now() - start).toFixed(1);
    setWasmOut(
      `fib(40)=${results[0]}  ·  π(50k)=${results[1]}  ·  Σn²(10k)=${results[2]}  · ${dur}ms`,
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-16 w-full">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Chapter 06</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Async & <span className="text-gradient-rust">Futures</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          A Rust <code className="text-primary">async fn</code> doesn't run anything — it returns a
          <code className="text-primary"> Future</code>. An executor (like{" "}
          <code className="text-primary">tokio</code>) polls futures, and each{" "}
          <code className="text-primary">.await</code> is a place where the task can pause and let
          another one make progress.
        </p>

        <section className="mt-10 grid lg:grid-cols-2 gap-6">
          <CodeBlock code={ASYNC_CODE} />
          <div className="surface-panel p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Executor</h2>
              <div className="flex gap-2">
                <button
                  onClick={start}
                  disabled={running}
                  className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground disabled:opacity-50"
                >
                  ▶ poll tasks
                </button>
                <button
                  onClick={reset}
                  className="px-3 py-1.5 text-sm rounded-md border border-border"
                >
                  reset
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {tasks.map((t) => (
                <div key={t.id} className="border border-border rounded-md p-3 bg-card">
                  <div className="flex justify-between text-sm">
                    <span className="font-mono">{t.label}</span>
                    <span
                      className={
                        t.state === "ready"
                          ? "text-heap"
                          : t.state === "polling"
                            ? "text-primary"
                            : t.state === "pending"
                              ? "text-muted-foreground"
                              : "text-muted-foreground/60"
                      }
                    >
                      {t.state === "ready"
                        ? "Ready"
                        : t.state === "polling"
                          ? "Poll → Pending"
                          : t.state === "pending"
                            ? "Pending"
                            : "idle"}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded bg-muted overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${t.progress}%`,
                        background: t.state === "ready" ? "var(--heap)" : "var(--primary)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 text-xs font-mono bg-background/60 border border-border rounded-md p-3 min-h-[80px]">
              {log.length === 0 ? (
                <span className="text-muted-foreground">// executor log will appear here</span>
              ) : (
                log.map((l, i) => (
                  <div key={i} className="text-muted-foreground">
                    <span className="text-primary">›</span> {l}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="mt-10 surface-panel p-6">
          <h2 className="font-semibold">Live: concurrent calls into real Rust WASM</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Three workloads kicked off together via{" "}
            <code className="text-primary">Promise.all</code> — the body of each runs inside the
            same WASM module compiled from{" "}
            <code className="text-primary">wasm-crate/src/lib.rs</code>.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={runConcurrent}
              disabled={!wasmReady}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-50"
            >
              {wasmReady ? "▶ run all three" : "loading wasm…"}
            </button>
            <code className="text-sm text-muted-foreground">{wasmOut}</code>
          </div>
        </section>

        <section className="mt-10 grid md:grid-cols-3 gap-4 text-sm">
          {[
            {
              title: "Future",
              body: "A value that will be ready later. async fn returns one. Doing nothing with it does nothing.",
            },
            {
              title: "Executor",
              body: "Drives futures forward by calling .poll(). tokio, async-std, smol are popular ones.",
            },
            {
              title: ".await",
              body: "A suspension point. If the future is Pending, the task yields and the executor runs others.",
            },
          ].map((c) => (
            <div key={c.title} className="surface-panel p-5">
              <h3 className="font-semibold text-primary">{c.title}</h3>
              <p className="text-muted-foreground mt-1">{c.body}</p>
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
