import { binomialLn } from './binomial'
import { rangeMap } from './range'
import { sum } from './sum'

/**
 * Calculates the probabilty mass function in log space.
 *
 * @param k number of observed successes in n
 * @param N population size (total number of items)
 * @param K number of successes in population
 * @param n number of draws, i.e. how many items we select each time
 * @returns probability of arrangement occuring by chance
 */
export function lnHypgeomPMF(
  k: number,
  N: number,
  K: number,
  n: number
): number {
  return binomialLn(K, k) + binomialLn(N - K, n - k) - binomialLn(N, n)
}

/**
 * Calculates the probabilty mass function.
 *
 * @param k number of observed successes in n
 * @param N population size (total number of items)
 * @param K number of successes in population
 * @param n number of draws, i.e. how many items we select each time
 * @returns probability of arrangement occuring by chance
 */
export function hypGeomPMF(k: number, N: number, K: number, n: number): number {
  return Math.exp(lnHypgeomPMF(k, N, K, n))
}

/**
 * Calculates the hypergeometric cumulative distribution function.
 *
 * @param k number of observed successes in n
 * @param N population size (total number of items)
 * @param K number of successes in population
 * @param n number of draws, i.e. how many items we select each time
 * @returns probability of arrangement occuring by chance
 */
export function hypGeomCDF(k: number, N: number, K: number, n: number): number {
  //console.log(k, N, K, n)

  return sum(rangeMap(k1 => hypGeomPMF(k1, N, K, n), k + 1))
}
