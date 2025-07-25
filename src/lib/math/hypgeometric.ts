import { lnBinomial } from './binomial'

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
  return lnBinomial(K, k) + lnBinomial(N - K, n - k) - lnBinomial(N, n)
}

// function factorialDecimal(n: Decimal) {
//   let result = new Decimal(1)
//   for (let i = new Decimal(2); i.lte(n); i = i.plus(1)) {
//     result = result.mul(i)
//   }
//   return result
// }

// function chooseDecimal(n: Decimal, k: Decimal) {
//   return factorialDecimal(n).div(
//     factorialDecimal(k).mul(factorialDecimal(n.sub(k)))
//   )
// }

// function binomialPMFDecimal(n: number, k: number, p: number) {
//   const C = chooseDecimal(new Decimal(n), new Decimal(k))
//   const prob = Decimal.pow(p, k).mul(Decimal.pow(1 - p, n - k))
//   return C.mul(prob).toNumber()
// }

/**
 * Calculates the probabilty mass function.
 *
 * @param k number of observed successes in n
 * @param N population size (total number of items)
 * @param K number of successes in population
 * @param n number of draws, i.e. how many items we select each time
 * @returns probability of arrangement occuring by chance
 */
export function pmf(k: number, N: number, K: number, n: number): number {
  if (k < 0) {
    return 0
  }

  return Math.exp(lnHypgeomPMF(k, N, K, n))

  // return (
  //   Number(binomialBigInt(K, k) * binomialBigInt(N - K, n - k)) /
  //   Number(binomialBigInt(N, n))
  // )
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
export function cdf(k: number, N: number, K: number, n: number): number {
  if (k < 0) {
    return 0
  }

  //const lower = Math.max(0, n - (N - K))
  //const upper = Math.min(k, K, n)

  let cdf = 0
  for (let i = 0; i <= k; i++) {
    //console.log(i, hypGeomPMF(i, N, K, n))
    cdf += pmf(i, N, K, n)
  }
  return Math.min(cdf, 1)
}

export class Hypergeometric {
  //private _N: number
  private _K: number
  private _n: number
  private _denominator: number
  private _N_minus_K: number
  constructor(N: number, K: number, n: number) {
    //this._N = N // Total population
    this._K = K // Number of successes in population
    this._n = n // Number of draws
    this._denominator = lnBinomial(N, n) // Precompute denominator
    this._N_minus_K = N - K // Number of failures in population
  }

  /**
   *  PMF: Probability of exactly k successes
   *
   * @param k number of observed successes in n
   * @returns
   */
  pmf(k: number) {
    return Math.exp(
      lnBinomial(this._K, k) +
        lnBinomial(this._N_minus_K, this._n - k) -
        this._denominator
    )
  }

  /**
   * CDF: Probability of k or fewer successes
   *
   * @param k number of observed successes in n
   * @returns
   */
  cdf(k: number) {
    let cdf = 0

    for (let i = 0; i <= k; i++) {
      //console.log(i, hypGeomPMF(i, N, K, n))
      cdf += this.pmf(i)
    }

    return Math.min(cdf, 1)
  }
}
