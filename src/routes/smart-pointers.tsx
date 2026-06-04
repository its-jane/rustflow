import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/smart-pointers")({
  head: () => ({
    meta: [
      { title: "Smart Pointers — rust/flow" },
      {
        name: "description",
        content:
          "Box, Rc, Arc, and RefCell: heap allocation, reference counting, and interior mutability — animated.",
      },
      { property: "og:title", content: "Smart Pointers — rust/flow" },
      {
        property: "og:description",
        content: "Watch Rc's reference count rise and fall as clones come and go.",
      },
    ],
  }),
  component: SmartPointersPage,
});

const CODE_BOX = `let b: Box<i32> = Box::new(7);   // heap-allocate one i32
println!("{b}");                  // deref through Box
// dropped at end of scope → memory freed`;

const CODE_RC = `use std::rc::Rc;

fn main() {
    let a = Rc::new(String::from("shared"));    // count = 1
    let b = Rc::clone(&a);                       // count = 2
    {
        let c = Rc::clone(&a);                   // count = 3
        println!("{}", c);
    }                                            // c dropped → count = 2
}                                                // b, a dropped → count = 0 → freed`;

const CODE_REFCELL = `use std::cell::RefCell;

let cell = RefCell::new(vec![1, 2, 3]);
cell.borrow_mut().push(4);          // checked at RUNTIME
let snapshot = cell.borrow();        // panics if a mut borrow is live
println!("{:?}", snapshot);`;

type Owner = { id: string; alive: boolean };

function SmartPointersPage() {
  const [owners, setOwners] = useState<Owner[]>([{ id: "a", alive: true }]);
  const count = owners.filter((o) => o.alive).length;
  const nextId = () => String.fromCharCode(97 + owners.length);

  function clone() {
    setOwners((o) => [...o, { id: nextId(), alive: true }]);
  }
  function drop() {
    setOwners((o) => {
      const lastAlive = [...o].reverse().findIndex((x) => x.alive);
      if (lastAlive === -1) return o;
      const realIdx = o.length - 1 - lastAlive;
      return o.map((x, i) => (i === realIdx ? { ...x, alive: false } : x));
    });
  }
  function reset() {
    setOwners([{ id: "a", alive: true }]);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-16 w-full">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Chapter 11</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Smart <span className="text-gradient-rust">pointers</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          A smart pointer wraps a raw pointer with extra logic — heap placement, reference counting,
          runtime borrow checks. They give you escape hatches while keeping ownership rules honest.
        </p>

        <section className="mt-12 grid lg:grid-cols-2 gap-6 items-start">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              <code className="text-primary">Box&lt;T&gt;</code> — single owner, on the heap
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Like a unique_ptr: one owner, heap-allocated, freed automatically at scope end. Useful
              for recursive types like{" "}
              <code>enum Tree &#123; Leaf, Node(Box&lt;Tree&gt;) &#125;</code> and trait objects.
            </p>
            <CodeBlock code={CODE_BOX} />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              <code className="text-primary">Rc&lt;T&gt;</code> — multiple owners, single thread
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              A reference-counted pointer. Every <code>clone()</code> bumps the count; every drop
              decrements it. When it hits zero, the value is freed.
            </p>
            <CodeBlock code={CODE_RC} />
          </div>
        </section>

        <section className="mt-12 surface-panel p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold">Live Rc demo</h2>
            <span className="text-sm font-mono">
              strong_count = <span className="text-primary text-lg">{count}</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-5">
            Press <em>clone</em> to add another <code>Rc</code>, <em>drop</em> to let the most
            recent one go out of scope.
          </p>

          <div className="flex gap-2 mb-6">
            <button
              onClick={clone}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm"
              aria-label="Clone Rc"
            >
              Rc::clone(&a)
            </button>
            <button
              onClick={drop}
              disabled={count === 0}
              className="px-4 py-2 rounded-md border border-border text-sm disabled:opacity-50"
              aria-label="Drop most recent owner"
            >
              drop last owner
            </button>
            <button
              onClick={reset}
              className="ml-auto px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent"
            >
              reset
            </button>
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-6 items-center">
            <div
              className={`w-28 h-28 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                count === 0 ? "border-mut/50 bg-mut/10" : "border-heap/50 bg-heap/10"
              }`}
              aria-label="Heap allocation"
            >
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">heap</div>
              <div className="font-mono text-sm mt-1">"shared"</div>
              <div
                className="text-[10px] mt-2"
                style={{ color: count === 0 ? "var(--mut)" : "var(--heap)" }}
              >
                {count === 0 ? "freed" : `count: ${count}`}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {owners.map((o) => (
                <div
                  key={o.id}
                  className={`px-3 py-2 rounded-md border text-sm font-mono transition-all ${
                    o.alive
                      ? "border-borrow bg-borrow/10 text-foreground"
                      : "border-border bg-muted/30 text-muted-foreground line-through"
                  }`}
                >
                  {o.id}: Rc&lt;String&gt; {o.alive ? "→" : "✗"}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12 grid lg:grid-cols-2 gap-6 items-start">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              <code className="text-primary">Arc&lt;T&gt;</code> — Rc for multiple threads
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Atomic reference counting. Same API as <code>Rc</code> but the count uses atomic
              operations so it's safe to share across threads. Slightly more expensive — use only
              when you need it.
            </p>
            <div className="surface-panel p-4 text-sm font-mono">
              <div className="text-muted-foreground">// single thread →</div>
              <div className="text-primary">Rc&lt;T&gt;</div>
              <div className="text-muted-foreground mt-2">// across threads →</div>
              <div className="text-primary">Arc&lt;T&gt;</div>
              <div className="text-muted-foreground mt-2">// also mutate from many threads →</div>
              <div className="text-primary">Arc&lt;Mutex&lt;T&gt;&gt;</div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              <code className="text-primary">RefCell&lt;T&gt;</code> — interior mutability
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Moves borrow checking from compile time to runtime. Lets you mutate through an
              immutable reference — but breaks the rules at runtime if you do something unsafe. Most
              commonly paired with <code>Rc</code>: <code>Rc&lt;RefCell&lt;T&gt;&gt;</code>.
            </p>
            <CodeBlock code={CODE_REFCELL} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
