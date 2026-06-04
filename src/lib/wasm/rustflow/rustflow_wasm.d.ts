/* tslint:disable */
/* eslint-disable */

/**
 * Count primes up to (and including) `limit` using a sieve of Eratosthenes.
 */
export function count_primes(limit: number): number;

/**
 * Iterative fibonacci — returns u64 (mapped to BigInt in JS).
 */
export function fibonacci(n: number): bigint;

/**
 * Reverse a UTF-8 string by grapheme-naive char iteration (demonstrates
 * String ownership crossing the JS↔WASM boundary).
 */
export function reverse_string(input: string): string;

/**
 * Sum the first `n` squares — shows tight loop perf.
 */
export function sum_of_squares(n: number): bigint;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly count_primes: (a: number) => number;
  readonly fibonacci: (a: number) => bigint;
  readonly reverse_string: (a: number, b: number) => [number, number];
  readonly sum_of_squares: (a: number) => bigint;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init(
  module_or_path?:
    | { module_or_path: InitInput | Promise<InitInput> }
    | InitInput
    | Promise<InitInput>,
): Promise<InitOutput>;
