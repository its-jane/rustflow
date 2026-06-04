import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "Stack & Heap — rust/flow" },
      {
        name: "description",
        content:
          "Visualize where Rust puts your data: the stack for fixed-size values, the heap for dynamic ones, and how Box, Vec and String bridge the two.",
      },
    ],
  }),
  component: MemoryPage,
});

const CODE = `fn main() {
    let n: i32 = 42;                 // stack
    let arr: [u8; 3] = [1, 2, 3];    // stack
    let v: Vec<u8> = vec![10, 20];   // heap (pointer on stack)
    let s: String = String::from("rust"); // heap
    let b: Box<i32> = Box::new(7);   // heap
}`;

type Frame = {
  line: number;
  stack: { name: string; val: string; ptr?: string }[];
  heap: { id: string; val: string }[];
};

const FRAMES: Frame[] = [
  { line: 2, stack: [{ name: "n", val: "42" }], heap: [] },
  {
    line: 3,
    stack: [
      { name: "n", val: "42" },
      { name: "arr", val: "[1,2,3]" },
    ],
    heap: [],
  },
  {
    line: 4,
    stack: [
      { name: "n", val: "42" },
      { name: "arr", val: "[1,2,3]" },
      { name: "v", val: "ptr,len=2,cap=2", ptr: "h1" },
    ],
    heap: [{ id: "h1", val: "[10, 20]" }],
  },
  {
    line: 5,
    stack: [
      { name: "n", val: "42" },
      { name: "arr", val: "[1,2,3]" },
      { name: "v", val: "ptr,len=2,cap=2", ptr: "h1" },
      { name: "s", val: "ptr,len=4,cap=4", ptr: "h2" },
    ],
    heap: [
      { id: "h1", val: "[10, 20]" },
      { id: "h2", val: '"rust"' },
    ],
  },
  {
    line: 6,
    stack: [
      { name: "n", val: "42" },
      { name: "arr", val: "[1,2,3]" },
      { name: "v", val: "ptr,len=2,cap=2", ptr: "h1" },
      { name: "s", val: "ptr,len=4,cap=4", ptr: "h2" },
      { name: "b", val: "ptr", ptr: "h3" },
    ],
    heap: [
      { id: "h1", val: "[10, 20]" },
      { id: "h2", val: '"rust"' },
      { id: "h3", val: "7" },
    ],
  },
];

function MemoryPage() {
  const [step, setStep] = useState(0);
  const frame = FRAMES[step];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-16 w-full">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Chapter 02</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Stack vs Heap, <span className="text-gradient-rust">decided by you</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          Rust doesn't hide where memory lives. Fixed-size things go on the stack. Dynamic things go
          on the heap behind a smart pointer. The compiler frees both for you when the owner ends —
          no GC pause, no manual free.
        </p>

        <section className="mt-12 grid lg:grid-cols-2 gap-6">
          <div>
            <CodeBlock code={CODE} highlightLines={[frame.line]} />
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="px-4 py-2 rounded-md border border-border hover:bg-accent disabled:opacity-40"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep((s) => Math.min(FRAMES.length - 1, s + 1))}
                disabled={step === FRAMES.length - 1}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40"
              >
                Allocate next →
              </button>
              <button
                onClick={() => setStep(0)}
                className="ml-auto px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Stack */}
            <div className="surface-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Stack</h3>
                <span className="text-xs text-stack font-mono">fast · LIFO</span>
              </div>
              <div className="space-y-2 flex flex-col-reverse">
                {frame.stack.map((s, i) => (
                  <div
                    key={i}
                    className="p-2 rounded border border-stack/30 bg-stack/10 animate-float-up"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div className="text-xs text-stack font-mono">{s.name}</div>
                    <div className="text-sm font-mono truncate">{s.val}</div>
                    {s.ptr && (
                      <div className="text-[10px] text-muted-foreground mt-1">→ heap[{s.ptr}]</div>
                    )}
                  </div>
                ))}
                {frame.stack.length === 0 && (
                  <div className="text-xs text-muted-foreground italic">empty</div>
                )}
              </div>
            </div>

            {/* Heap */}
            <div className="surface-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Heap</h3>
                <span className="text-xs text-heap font-mono">dynamic</span>
              </div>
              <div className="space-y-2">
                {frame.heap.map((h) => (
                  <div
                    key={h.id}
                    className="p-2 rounded border border-heap/30 bg-heap/10 animate-float-up"
                  >
                    <div className="text-xs text-heap font-mono">{h.id}</div>
                    <div className="text-sm font-mono">{h.val}</div>
                  </div>
                ))}
                {frame.heap.length === 0 && (
                  <div className="text-xs text-muted-foreground italic">empty</div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 grid md:grid-cols-2 gap-6">
          <div className="surface-panel p-6">
            <h3 className="font-semibold text-lg">When the scope ends…</h3>
            <p className="text-muted-foreground mt-2">
              Rust inserts a call to <code className="text-primary">Drop::drop</code> for each
              owner. Heap allocations behind <code>Vec</code>, <code>String</code>, and{" "}
              <code>Box</code> are released right then. No reference counting, no GC pause.
            </p>
          </div>
          <div className="surface-panel p-6">
            <h3 className="font-semibold text-lg">Why you should care</h3>
            <p className="text-muted-foreground mt-2">
              Deterministic destruction makes Rust predictable for embedded systems, kernels,
              browsers, and game engines — anywhere a GC pause is unacceptable.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
