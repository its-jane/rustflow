import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";

export const Route = createFileRoute("/errors")({
  head: () => ({
    meta: [
      { title: "rustc Errors — rust/flow" },
      {
        name: "description",
        content:
          "A tour of Rust's famously helpful compiler error messages, recreated with carets, notes, and help text.",
      },
      { property: "og:title", content: "rustc Errors — rust/flow" },
      {
        property: "og:description",
        content: "Read the kinds of compiler errors that make Rust feel like a pair programmer.",
      },
    ],
  }),
  component: ErrorsPage,
});

type Diag = {
  code: string;
  title: string;
  sourceLines: string[];
  caretLine: number; // 1-based index into sourceLines
  caretStart: number; // 0-based column
  caretLen: number;
  caretMessage: string;
  notes: { kind: "note" | "help"; text: string }[];
  why: string;
};

const DIAGS: Diag[] = [
  {
    code: "E0382",
    title: "borrow of moved value",
    sourceLines: [
      `fn main() {`,
      `    let s = String::from("hello");`,
      `    let t = s;`,
      `    println!("{s}");`,
      `}`,
    ],
    caretLine: 4,
    caretStart: 15,
    caretLen: 3,
    caretMessage: "value borrowed here after move",
    notes: [
      {
        kind: "note",
        text: "move occurs because `s` has type `String`, which does not implement the `Copy` trait",
      },
      { kind: "help", text: "consider cloning the value: `let t = s.clone();`" },
    ],
    why: "Ownership of `s` was transferred into `t` on line 3, so `s` no longer holds the String.",
  },
  {
    code: "E0502",
    title: "cannot borrow as mutable because also borrowed as immutable",
    sourceLines: [
      `fn main() {`,
      `    let mut v = vec![1, 2, 3];`,
      `    let first = &v[0];`,
      `    v.push(4);`,
      `    println!("{first}");`,
      `}`,
    ],
    caretLine: 4,
    caretStart: 4,
    caretLen: 1,
    caretMessage: "mutable borrow occurs here",
    notes: [
      { kind: "note", text: 'immutable borrow later used here: `println!("{first}")`' },
      {
        kind: "help",
        text: "make the read happen before the mutation, or finish using `first` first",
      },
    ],
    why: "If `push` reallocated the vector, `first` would dangle. The borrow checker doesn't let that happen.",
  },
  {
    code: "E0106",
    title: "missing lifetime specifier",
    sourceLines: [
      `fn longest(x: &str, y: &str) -> &str {`,
      `    if x.len() > y.len() { x } else { y }`,
      `}`,
    ],
    caretLine: 1,
    caretStart: 32,
    caretLen: 4,
    caretMessage: "expected named lifetime parameter",
    notes: [
      {
        kind: "help",
        text: "consider introducing a named lifetime parameter: `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str`",
      },
    ],
    why: "With two input references, rustc can't pick which one the return borrows from — you have to say.",
  },
  {
    code: "E0277",
    title: "trait bound not satisfied",
    sourceLines: [`fn print<T>(x: T) {`, `    println!("{x}");`, `}`],
    caretLine: 2,
    caretStart: 16,
    caretLen: 1,
    caretMessage: "`T` doesn't implement `std::fmt::Display`",
    notes: [
      {
        kind: "help",
        text: "consider restricting the generic: `fn print<T: std::fmt::Display>(x: T)`",
      },
    ],
    why: "Generics in Rust have no methods until you bound them — `{}` needs `Display`.",
  },
];

function ErrorsPage() {
  const [active, setActive] = useState(0);
  const d = DIAGS[active];
  const caret = " ".repeat(d.caretStart) + "^".repeat(Math.max(1, d.caretLen));

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-16 w-full">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Chapter 08</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          The <span className="text-gradient-rust">compiler</span> talks to you
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          Rust errors point at the exact span, explain why, and usually suggest a fix. Pick one to
          see a recreation of the real rustc output.
        </p>

        <div className="mt-10 flex flex-wrap gap-2">
          {DIAGS.map((x, i) => (
            <button
              key={x.code}
              onClick={() => setActive(i)}
              className={`px-3 py-2 text-sm rounded-md border transition ${
                i === active
                  ? "border-primary bg-primary/10"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="font-mono text-primary mr-2">{x.code}</span>
              {x.title}
            </button>
          ))}
        </div>

        <section className="mt-8 surface-panel p-0 overflow-hidden">
          <div className="px-4 py-2 border-b border-border bg-card text-xs text-muted-foreground font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-mut/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-owner/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-heap/70" />
            <span className="ml-3">$ cargo build</span>
          </div>
          <pre className="text-sm leading-relaxed p-5 overflow-x-auto font-mono">
            <div>
              <span className="text-mut font-semibold">error[{d.code}]</span>
              <span className="text-foreground">: {d.title}</span>
            </div>
            <div className="text-stack mt-1">
              {" "}
              --&gt; src/main.rs:{d.caretLine}:{d.caretStart + 1}
            </div>
            <div className="text-stack"> |</div>
            {d.sourceLines.map((line, i) => {
              const ln = i + 1;
              const isCaret = ln === d.caretLine;
              return (
                <div key={i}>
                  <span className="text-stack">{ln.toString().padStart(2)} | </span>
                  <span className={isCaret ? "text-foreground" : "text-muted-foreground"}>
                    {line}
                  </span>
                </div>
              );
            })}
            <div>
              <span className="text-stack"> | </span>
              <span className="text-mut">
                {caret} {d.caretMessage}
              </span>
            </div>
            <div className="text-stack"> |</div>
            {d.notes.map((n, i) => (
              <div key={i}>
                <span
                  className={
                    n.kind === "help" ? "text-heap font-semibold" : "text-borrow font-semibold"
                  }
                >
                  {"  = "}
                  {n.kind}
                </span>
                <span className="text-foreground">: {n.text}</span>
              </div>
            ))}
          </pre>
          <div className="px-5 py-4 border-t border-border text-sm text-muted-foreground">
            <span className="text-primary font-semibold">Why this happens — </span>
            {d.why}
          </div>
        </section>

        <p className="mt-10 text-sm text-muted-foreground max-w-2xl">
          Running <code className="text-primary">rustc --explain E0382</code> gives you an
          essay-length explanation of any error code, written for humans.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
