import { useEffect, useState } from "react";

type Theme = "dark" | "light";
const KEY = "rustflow-theme";

function applyTheme(t: Theme) {
  const root = document.documentElement;
  if (t === "light") root.classList.add("light");
  else root.classList.remove("light");
}

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved =
      (typeof window !== "undefined" && (localStorage.getItem(KEY) as Theme | null)) || null;
    const initial: Theme = saved ?? "dark";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return [theme, toggle];
}

export function ThemeToggle() {
  const [theme, toggle] = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="w-9 h-9 rounded-md border border-border hover:bg-accent text-sm flex items-center justify-center transition-colors"
    >
      {theme === "dark" ? "\u2600" : "\u263E"}
    </button>
  );
}
