// Browser-only loader for the rustflow_wasm crate.
// The .wasm binary lives in public/wasm/ and is fetched at runtime.
import init, {
  fibonacci,
  count_primes,
  reverse_string,
  sum_of_squares,
} from "@/lib/wasm/rustflow/rustflow_wasm.js";

let ready: Promise<void> | undefined;

export function loadRustWasm(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("WASM can only load in the browser"));
  }
  if (!ready) {
    ready = init().then(() => undefined);
  }
  return ready;
}

export const rust = {
  fibonacci,
  countPrimes: count_primes,
  reverseString: reverse_string,
  sumOfSquares: sum_of_squares,
};
