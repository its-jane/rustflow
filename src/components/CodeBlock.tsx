import { useMemo } from "react";

// Tiny Rust syntax highlighter — no external deps.
const KEYWORDS = new Set([
  "fn",
  "let",
  "mut",
  "pub",
  "use",
  "mod",
  "struct",
  "enum",
  "impl",
  "trait",
  "for",
  "in",
  "if",
  "else",
  "while",
  "loop",
  "match",
  "return",
  "as",
  "ref",
  "move",
  "async",
  "await",
  "where",
  "self",
  "Self",
  "type",
  "const",
  "static",
  "break",
  "continue",
  "dyn",
  "crate",
  "super",
  "extern",
  "unsafe",
]);
const TYPES = new Set([
  "i8",
  "i16",
  "i32",
  "i64",
  "i128",
  "u8",
  "u16",
  "u32",
  "u64",
  "u128",
  "usize",
  "isize",
  "f32",
  "f64",
  "bool",
  "char",
  "str",
  "String",
  "Vec",
  "Option",
  "Result",
  "Box",
  "Rc",
  "Arc",
  "RefCell",
  "Mutex",
  "HashMap",
  "Some",
  "None",
  "Ok",
  "Err",
]);

type Tok = { t: string; c?: string };

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    // line comment
    if (ch === "/" && src[i + 1] === "/") {
      const end = src.indexOf("\n", i);
      const stop = end === -1 ? src.length : end;
      out.push({ t: src.slice(i, stop), c: "text-muted-foreground italic" });
      i = stop;
      continue;
    }
    // strings
    if (ch === '"') {
      let j = i + 1;
      while (j < src.length && src[j] !== '"') {
        if (src[j] === "\\") j++;
        j++;
      }
      j = Math.min(j + 1, src.length);
      out.push({ t: src.slice(i, j), c: "text-heap" });
      i = j;
      continue;
    }
    // char
    if (ch === "'" && /[a-zA-Z_]/.test(src[i + 1] ?? "") && src[i + 2] === "'") {
      out.push({ t: src.slice(i, i + 3), c: "text-heap" });
      i += 3;
      continue;
    }
    // lifetime 'a
    if (ch === "'" && /[a-zA-Z_]/.test(src[i + 1] ?? "")) {
      let j = i + 1;
      while (j < src.length && /[a-zA-Z0-9_]/.test(src[j])) j++;
      out.push({ t: src.slice(i, j), c: "text-mut" });
      i = j;
      continue;
    }
    // number
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < src.length && /[0-9_.a-zA-Z]/.test(src[j])) j++;
      out.push({ t: src.slice(i, j), c: "text-stack" });
      i = j;
      continue;
    }
    // identifier
    if (/[a-zA-Z_]/.test(ch)) {
      let j = i;
      while (j < src.length && /[a-zA-Z0-9_]/.test(src[j])) j++;
      const word = src.slice(i, j);
      let cls: string | undefined;
      if (KEYWORDS.has(word)) cls = "text-primary font-semibold";
      else if (TYPES.has(word)) cls = "text-rust-glow";
      else if (src[j] === "!") cls = "text-ember";
      else if (src[j] === "(") cls = "text-owner";
      out.push({ t: word, c: cls });
      i = j;
      continue;
    }
    // macro ! after ident handled above; treat ! separately
    if (ch === "!") {
      out.push({ t: "!", c: "text-ember" });
      i++;
      continue;
    }
    // operators / punctuation
    if ("&*+-=<>|".includes(ch)) {
      out.push({ t: ch, c: "text-mut" });
      i++;
      continue;
    }
    out.push({ t: ch });
    i++;
  }
  return out;
}

interface Props {
  code: string;
  highlightLines?: number[];
  className?: string;
}

export function CodeBlock({ code, highlightLines = [], className = "" }: Props) {
  const lines = useMemo(() => code.replace(/\n$/, "").split("\n"), [code]);
  const highlights = new Set(highlightLines);

  return (
    <pre className={`surface-panel text-sm leading-relaxed overflow-x-auto p-0 ${className}`}>
      <code className="block">
        {lines.map((line, idx) => {
          const lineNo = idx + 1;
          const tokens = tokenize(line);
          const isHi = highlights.has(lineNo);
          return (
            <div
              key={idx}
              className={`flex gap-4 px-4 py-0.5 transition-colors ${
                isHi ? "bg-primary/10 border-l-2 border-primary" : "border-l-2 border-transparent"
              }`}
            >
              <span className="select-none text-muted-foreground/60 w-6 text-right tabular-nums">
                {lineNo}
              </span>
              <span className="whitespace-pre">
                {tokens.length === 0 ? (
                  <span>&nbsp;</span>
                ) : (
                  tokens.map((tk, ti) => (
                    <span key={ti} className={tk.c}>
                      {tk.t}
                    </span>
                  ))
                )}
              </span>
            </div>
          );
        })}
      </code>
    </pre>
  );
}
