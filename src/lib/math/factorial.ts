import { MAX_SAFE_INTEGER } from './math'

/**
 * Computes the factorial in log space as a sum of logs.
 *
 * @param n an integer
 * @returns
 */
export function factorialLn(n: number): number {
  // for property 0! = 1 since exp(0) == 1
  if (n < 0) {
    return NaN
  }

  if (n === 0 || n === 1) {
    return 0
  }

  let result = 0

  for (let i = 2; i <= n; i++) {
    result += Math.log(i)
  }

  return result
}

export function factorialBigInt(n: number): bigint {
  if (n < 0) {
    return -1n
  }

  if (n === 0) {
    return 1n
  }

  let result = BigInt(1)
  for (let i = 1; i <= n; i++) {
    result *= BigInt(i)
  }
  return result
}

export function factorial(n: number): number {
  const result = factorialBigInt(n)

  return result > 0 && result <= MAX_SAFE_INTEGER ? Number(result) : NaN
}
