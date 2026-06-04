import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Will it compile? — rust/flow" },
      {
        name: "description",
        content:
          "Test your understanding of Rust's borrow checker, ownership, and lifetimes with quick quiz questions.",
      },
      { property: "og:title", content: "Will it compile? — rust/flow" },
      {
        property: "og:description",
        content: "Interactive Rust quiz: predict whether each snippet compiles, and learn why.",
      },
    ],
  }),
  component: QuizPage,
});

type Q = {
  code: string;
  options: { label: string; correct: boolean }[];
  explain: string;
};

const QUESTIONS: Q[] = [
  {
    code: `fn main() {
    let s = String::from("hi");
    let t = s;
    println!("{s}");
}`,
    options: [
      { label: 'Compiles, prints "hi"', correct: false },
      { label: "Compile error: value borrowed after move", correct: true },
      { label: "Runtime panic", correct: false },
    ],
    explain: "`String` is not Copy. `let t = s` moves ownership; `s` is no longer usable.",
  },
  {
    code: `fn main() {
    let x = 5;
    let y = x;
    println!("{x} {y}");
}`,
    options: [
      { label: "Compile error: x moved into y", correct: false },
      { label: 'Compiles, prints "5 5"', correct: true },
      { label: 'Compiles but prints "0 5"', correct: false },
    ],
    explain: "Integers implement Copy — assignment duplicates the bits instead of moving.",
  },
  {
    code: `fn main() {
    let mut v = vec![1, 2, 3];
    let first = &v[0];
    v.push(4);
    println!("{first}");
}`,
    options: [
      { label: "Compiles, prints 1", correct: false },
      {
        label: "Compile error: cannot borrow v as mutable while immutably borrowed",
        correct: true,
      },
      { label: "Runtime panic", correct: false },
    ],
    explain:
      "`first` is an immutable borrow that's still in use; `v.push` needs &mut v. Rust forbids the overlap.",
  },
  {
    code: `fn first_word(s: &String) -> &str {
    &s[..s.find(' ').unwrap_or(s.len())]
}`,
    options: [
      { label: "Compiles — lifetime elided from input", correct: true },
      { label: "Compile error: needs explicit 'a", correct: false },
      { label: "Compile error: cannot return reference", correct: false },
    ],
    explain:
      "Lifetime elision rule: one input reference → output borrows from that input automatically.",
  },
  {
    code: `enum Msg { Quit, Move { x: i32, y: i32 } }
fn handle(m: Msg) {
    match m {
        Msg::Quit => println!("bye"),
    }
}`,
    options: [
      { label: "Compiles — only Quit handled", correct: false },
      { label: "Compile error: non-exhaustive patterns, Move not covered", correct: true },
      { label: "Compiles but warns at runtime", correct: false },
    ],
    explain: "`match` must be exhaustive. Either handle every variant or use `_ => …`.",
  },
];

function QuizPage() {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const q = QUESTIONS[idx];

  function pick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    setScore((s) => ({ right: s.right + (q.options[i].correct ? 1 : 0), total: s.total + 1 }));
  }
  function next() {
    setPicked(null);
    setIdx((i) => (i + 1) % QUESTIONS.length);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-16 w-full">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Chapter 09</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Will it <span className="text-gradient-rust">compile?</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          Read the snippet, pick the outcome. The explanation appears after you answer.
        </p>

        <div className="mt-10 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Question {idx + 1} / {QUESTIONS.length}
          </span>
          <span className="text-sm font-mono">
            score: <span className="text-primary">{score.right}</span> / {score.total}
          </span>
        </div>

        <section className="mt-4 grid lg:grid-cols-2 gap-6">
          <CodeBlock code={q.code} />

          <div className="surface-panel p-6">
            <h2 className="font-semibold mb-4">What happens?</h2>
            <div className="space-y-2">
              {q.options.map((o, i) => {
                const isPicked = picked === i;
                const reveal = picked !== null;
                const cls = reveal
                  ? o.correct
                    ? "border-heap bg-heap/15"
                    : isPicked
                      ? "border-mut bg-mut/15"
                      : "border-border"
                  : "border-border hover:border-primary/60 hover:bg-accent";
                return (
                  <button
                    key={i}
                    onClick={() => pick(i)}
                    disabled={reveal}
                    className={`w-full text-left px-4 py-3 rounded-md border transition text-sm ${cls}`}
                  >
                    <span className="font-mono text-xs text-muted-foreground mr-2">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {o.label}
                    {reveal && o.correct && <span className="float-right text-heap">✓</span>}
                    {reveal && isPicked && !o.correct && (
                      <span className="float-right text-mut">✗</span>
                    )}
                  </button>
                );
              })}
            </div>

            {picked !== null && (
              <div className="mt-5 p-4 rounded-md border border-border bg-background/60 text-sm">
                <div className="text-xs uppercase tracking-wider text-primary mb-1">Why</div>
                {q.explain}
              </div>
            )}

            <button
              onClick={next}
              disabled={picked === null}
              className="mt-5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-50"
            >
              Next question →
            </button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
