import { factorialBigInt, factorialLn as lnFactorial } from './factorial'
import { MAX_SAFE_INTEGER } from './math'

export function lnBinomial(n: number, k: number): number {
  //console.log(factorialLn(n), factorialLn(k), factorialLn(n - k), n, k)
  return lnFactorial(n) - lnFactorial(k) - lnFactorial(n - k)
}

export function binomialBigInt(n: number, k: number): bigint {
  if (n < 0) {
    return -1n
  } // Invalid case: n cannot be negative

  if (n === 0) {
    return k === 0 ? 1n : 0n
  } // 0! = 1, so if k is also 0, return 1, else return 0

  if (k > n) {
    return 0n
  } // Invalid case: k cannot be greater than n

  // Calculate the binomial coefficient: C(n, k) = n! / (k! * (n - k)!)
  const numerator = factorialBigInt(n)
  const denominator = factorialBigInt(k) * factorialBigInt(n - k)

  // If the denominator is zero (which theoretically shouldn't happen due to the previous checks)
  if (denominator === 0n) return -1n // Return -1n as an invalid case

  return numerator / denominator
}

export function binomial(n: number, k: number): number {
  const result = binomialBigInt(n, k)

  return result >= 0 && result <= MAX_SAFE_INTEGER ? Number(result) : NaN

  //return Math.round(Math.exp(binomialLn(n, k)))
}
