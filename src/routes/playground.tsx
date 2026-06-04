import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/playground")({
  head: () => ({
    meta: [
      { title: "Code Tour — rust/flow" },
      {
        name: "description",
        content:
          "An annotated walkthrough of a small but real Rust program: structs, enums, traits, Result, iterators, and pattern matching.",
      },
    ],
  }),
  component: PlaygroundPage,
});

type Tour = {
  title: string;
  blurb: string;
  code: string;
  notes: { line: number; text: string }[];
};

const TOURS: Tour[] = [
  {
    title: "Structs & impl blocks",
    blurb:
      "Structs hold data. impl blocks attach behavior. Together they're how Rust does objects — without inheritance.",
    code: `struct User {
    name: String,
    score: u32,
}

impl User {
    fn new(name: &str) -> Self {
        Self { name: name.into(), score: 0 }
    }
    fn bump(&mut self, by: u32) {
        self.score += by;
    }
}

fn main() {
    let mut u = User::new("Ada");
    u.bump(10);
    println!("{} → {}", u.name, u.score);
}`,
    notes: [
      { line: 1, text: "A struct declares the shape of a value. Fields are private by default." },
      { line: 6, text: "impl adds methods. `Self` is shorthand for the type being implemented." },
      {
        line: 10,
        text: "`&mut self` means this method needs exclusive, mutable access to the instance.",
      },
      {
        line: 16,
        text: "Method calls on `u` automatically borrow it as `&mut` thanks to method dispatch.",
      },
    ],
  },
  {
    title: "Enums + match — the pattern Rust is famous for",
    blurb:
      "Enums in Rust can carry data per variant. `match` forces you to handle every case, so impossible states stay impossible.",
    code: `enum Shape {
    Circle(f64),
    Rect { w: f64, h: f64 },
}

fn area(s: &Shape) -> f64 {
    match s {
        Shape::Circle(r) => std::f64::consts::PI * r * r,
        Shape::Rect { w, h } => w * h,
    }
}

fn main() {
    let shapes = [Shape::Circle(2.0), Shape::Rect { w: 3.0, h: 4.0 }];
    for s in &shapes {
        println!("{}", area(s));
    }
}`,
    notes: [
      { line: 1, text: "Each variant can hold different data — tuple-style or struct-style." },
      { line: 7, text: "match destructures the variant and binds inner values to names." },
      { line: 9, text: "If you forget a variant, the compiler errors. No silent fall-through." },
    ],
  },
  {
    title: "Result & the ? operator — errors as values",
    blurb:
      "Rust has no exceptions. Fallible functions return Result<T, E>; the ? operator propagates the error one line at a time.",
    code: `use std::num::ParseIntError;

fn double(input: &str) -> Result<i32, ParseIntError> {
    let n = input.trim().parse::<i32>()?;
    Ok(n * 2)
}

fn main() {
    match double("  21  ") {
        Ok(v)  => println!("ok = {v}"),
        Err(e) => println!("err = {e}"),
    }
}`,
    notes: [
      {
        line: 3,
        text: "The function may succeed (Ok) or fail (Err). The signature says so explicitly.",
      },
      { line: 4, text: "The `?` unwraps Ok, or returns Err early — like a typed `try/throw`." },
      { line: 9, text: "Callers can't ignore errors by accident: they have to handle both arms." },
    ],
  },
  {
    title: "Traits — shared behavior without inheritance",
    blurb:
      "Traits define a set of methods a type must provide. Generics + traits give Rust polymorphism with zero runtime cost.",
    code: `trait Greet {
    fn hello(&self) -> String;
}

struct En; struct Fr;

impl Greet for En { fn hello(&self) -> String { "Hello!".into() } }
impl Greet for Fr { fn hello(&self) -> String { "Bonjour !".into() } }

fn say<T: Greet>(who: &T) {
    println!("{}", who.hello());
}

fn main() {
    say(&En);
    say(&Fr);
}`,
    notes: [
      { line: 1, text: "trait = interface. Any type can implement it." },
      {
        line: 7,
        text: "Implementations are written outside the type — even for types you don't own.",
      },
      {
        line: 10,
        text: "`<T: Greet>` is monomorphized: the compiler emits a specialized version per T.",
      },
    ],
  },
  {
    title: "Iterators — lazy, fused, and fast",
    blurb:
      "Iterator chains read like high-level pipelines but compile down to tight loops. Zero-cost abstraction in action.",
    code: `fn main() {
    let nums = [1, 2, 3, 4, 5, 6, 7, 8];

    let sum_of_squares_of_evens: i32 = nums
        .iter()
        .filter(|n| *n % 2 == 0)
        .map(|n| n * n)
        .sum();

    println!("{sum_of_squares_of_evens}"); // 120
}`,
    notes: [
      { line: 5, text: "Iterators are lazy — nothing happens until a consumer like .sum() runs." },
      { line: 6, text: "filter takes a closure; |n| is the argument list." },
      {
        line: 8,
        text: ".sum() drives the whole chain, fusing it into a single loop at compile time.",
      },
    ],
  },
];

function PlaygroundPage() {
  const [active, setActive] = useState(0);
  const tour = TOURS[active];
  const [hoverLine, setHoverLine] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-16 w-full">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Chapter 05</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          A guided <span className="text-gradient-rust">code tour</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          Hover any note to highlight the line it refers to. Switch tours with the tabs.
        </p>

        <div className="mt-10 flex flex-wrap gap-2">
          {TOURS.map((t, i) => (
            <button
              key={i}
              onClick={() => {
                setActive(i);
                setHoverLine(null);
              }}
              className={`px-3 py-2 text-sm rounded-md border transition ${
                i === active
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {i + 1}. {t.title}
            </button>
          ))}
        </div>

        <section className="mt-8 grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <CodeBlock code={tour.code} highlightLines={hoverLine ? [hoverLine] : []} />
          </div>
          <div className="lg:col-span-2">
            <div className="surface-panel p-6">
              <p className="text-sm text-muted-foreground leading-relaxed">{tour.blurb}</p>
              <div className="mt-5 space-y-2">
                {tour.notes.map((n) => (
                  <div
                    key={n.line}
                    onMouseEnter={() => setHoverLine(n.line)}
                    onMouseLeave={() => setHoverLine(null)}
                    className={`p-3 rounded-md border cursor-default transition ${
                      hoverLine === n.line
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <div className="text-xs font-mono text-primary">line {n.line}</div>
                    <div className="text-sm mt-1">{n.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 surface-panel p-8">
          <h2 className="text-xl font-semibold">Where to go from here</h2>
          <ul className="mt-4 grid md:grid-cols-2 gap-3 text-sm">
            <li className="flex gap-3">
              <span className="text-primary">→</span>
              <span>
                <strong>The Rust Book</strong> — the official, free, deep tutorial.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary">→</span>
              <span>
                <strong>Rust by Example</strong> — runnable snippets for every concept.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary">→</span>
              <span>
                <strong>Rustlings</strong> — small fix-the-compile-error exercises.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary">→</span>
              <span>
                <strong>crates.io</strong> — the package ecosystem (think npm for Rust).
              </span>
            </li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
