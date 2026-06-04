use wasm_bindgen::prelude::*;

/// Iterative fibonacci — returns u64 (mapped to BigInt in JS).
#[wasm_bindgen]
pub fn fibonacci(n: u32) -> u64 {
    let (mut a, mut b): (u64, u64) = (0, 1);
    for _ in 0..n {
        let next = a.wrapping_add(b);
        a = b;
        b = next;
    }
    a
}

/// Count primes up to (and including) `limit` using a sieve of Eratosthenes.
#[wasm_bindgen]
pub fn count_primes(limit: u32) -> u32 {
    if limit < 2 {
        return 0;
    }
    let n = limit as usize + 1;
    let mut is_prime = vec![true; n];
    is_prime[0] = false;
    is_prime[1] = false;
    let mut i = 2usize;
    while i * i < n {
        if is_prime[i] {
            let mut j = i * i;
            while j < n {
                is_prime[j] = false;
                j += i;
            }
        }
        i += 1;
    }
    is_prime.iter().filter(|p| **p).count() as u32
}

/// Reverse a UTF-8 string by grapheme-naive char iteration (demonstrates
/// String ownership crossing the JS↔WASM boundary).
#[wasm_bindgen]
pub fn reverse_string(input: &str) -> String {
    input.chars().rev().collect()
}

/// Sum the first `n` squares — shows tight loop perf.
#[wasm_bindgen]
pub fn sum_of_squares(n: u32) -> u64 {
    (1u64..=n as u64).map(|x| x * x).sum()
}
