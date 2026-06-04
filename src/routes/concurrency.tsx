import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/concurrency")({
  head: () => ({
    meta: [
      { title: "Fearless Concurrency — rust/flow" },
      {
        name: "description",
        content:
          "Watch Rust threads run side-by-side, share data through channels, and see how the borrow checker eliminates data races at compile time.",
      },
    ],
  }),
  component: ConcurrencyPage,
});

const THREAD_CODE = `use std::thread;
use std::sync::mpsc;

fn main() {
    let (tx, rx) = mpsc::channel();

    for id in 0..4 {
        let tx = tx.clone();
        thread::spawn(move || {
            let msg = format!("worker {id} done");
            tx.send(msg).unwrap();
        });
    }
    drop(tx);

    for received in rx {
        println!("{received}");
    }
}`;

interface Worker {
  id: number;
  progress: number;
  done: boolean;
}

function ConcurrencyPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const raf = useRef<number | null>(null);

  function start() {
    setMessages([]);
    setRunning(true);
    const seeded: Worker[] = Array.from({ length: 4 }, (_, i) => ({
      id: i,
      progress: 0,
      done: false,
    }));
    // Random per-thread speeds
    const speeds = seeded.map(() => 0.4 + Math.random() * 1.2);
    setWorkers(seeded);

    const tick = () => {
      setWorkers((prev) => {
        const next = prev.map((w, i) =>
          w.done ? w : { ...w, progress: Math.min(100, w.progress + speeds[i] * 1.6) },
        );
        next.forEach((w) => {
          if (!w.done && w.progress >= 100) {
            w.done = true;
            setMessages((m) => [...m, `worker ${w.id} done`]);
          }
        });
        if (next.every((w) => w.done)) {
          setRunning(false);
          return next;
        }
        raf.current = requestAnimationFrame(tick);
        return next;
      });
    };
    raf.current = requestAnimationFrame(tick);
  }

  useEffect(
    () => () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    },
    [],
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-16 w-full">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Chapter 03</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Fearless <span className="text-gradient-rust">concurrency</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          Threads in Rust share data through ownership. The same borrow rules that prevent
          use-after-free also prevent data races — at compile time. If your code compiles, two
          threads cannot mutate the same memory simultaneously.
        </p>

        <section className="mt-12 grid lg:grid-cols-2 gap-6 items-start">
          <CodeBlock code={THREAD_CODE} />

          <div className="surface-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Live thread runner</h3>
              <button
                onClick={start}
                disabled={running}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50"
              >
                {running ? "Running…" : workers.length === 0 ? "Spawn 4 threads" : "Run again"}
              </button>
            </div>

            <div className="space-y-3">
              {workers.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  Press the button — each bar is a separate OS thread.
                </p>
              )}
              {workers.map((w) => (
                <div key={w.id}>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-borrow">thread #{w.id}</span>
                    <span className={w.done ? "text-heap" : "text-muted-foreground"}>
                      {w.done ? "sent ✓" : `${Math.floor(w.progress)}%`}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${w.progress}%`,
                        background: w.done ? "var(--heap)" : "var(--borrow)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Channel receiver (main thread)
              </h4>
              <div className="rounded-md border border-border bg-card p-3 min-h-[100px] font-mono text-sm space-y-1">
                {messages.length === 0 && (
                  <span className="text-muted-foreground italic">waiting on rx…</span>
                )}
                {messages.map((m, i) => (
                  <div key={i} className="animate-float-up text-heap">
                    › {m}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 grid md:grid-cols-2 gap-6">
          <div className="surface-panel p-6">
            <h3 className="font-semibold text-lg">Send & Sync</h3>
            <p className="text-muted-foreground mt-2">
              Two compiler-checked marker traits decide what can cross thread boundaries.
              <code className="text-primary"> Send</code> means a value can be transferred to
              another thread. <code className="text-primary"> Sync</code> means it can be referenced
              from many threads at once. If a type isn't safe, the compiler simply won't let it.
            </p>
          </div>
          <div className="surface-panel p-6">
            <h3 className="font-semibold text-lg">async/await is the same idea</h3>
            <p className="text-muted-foreground mt-2">
              <code className="text-primary">async fn</code> returns a future — a tiny state machine
              the compiler builds for you. A runtime like Tokio polls thousands of them on a few OS
              threads, with the same ownership guarantees.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
