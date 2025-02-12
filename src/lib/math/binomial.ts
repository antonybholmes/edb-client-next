import { factorialLn } from './factorial'

export function binomialLn(n: number, k: number): number {
  return factorialLn(n) - factorialLn(k) - factorialLn(n - k)
}

export function binomial(n: number, k: number): number {
  return Math.round(Math.exp(binomialLn(n, k)))
}
