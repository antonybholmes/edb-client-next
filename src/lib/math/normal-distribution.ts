import { erf } from './erf'

const SQRT2 = 1.414213562370951
//const TWO_PI = 6.283185307179586
const SQRT_TWO_PI = 2.5066282746310002

// https://en.wikipedia.org/wiki/Normal_distribution
export function normalDistributionPDF(
  x: number,
  mu: number = 0,
  sigma: number = 1
): number {
  sigma = Math.abs(sigma)

  const u = (x - mu) / sigma
  const y = (1 / (SQRT_TWO_PI * sigma)) * Math.exp(0.5 * (-u * u))

  return y
}

/**
 * Approximation of normal CDF.
 *
 * We use the approximation here: https://en.wikipedia.org/wiki/Normal_distribution.
 *
 * @param x
 * @param mu
 * @param variance
 * @returns
 */
export function normalDistributionCDF(
  x: number,
  mu: number = 0,
  sigma: number = 1
): number {
  // if (variance !== 1) {
  //   variance = Math.sqrt(variance)
  // }

  sigma = Math.abs(sigma)

  const y = Math.min(1, 0.5 * (1 + erf((x - mu) / (sigma * SQRT2))))

  return y
}

export function normSF(x: number, mu: number = 0, sigma: number = 1): number {
  // if (variance !== 1) {
  //   variance = Math.sqrt(variance)
  // }

  sigma = Math.abs(sigma)

  const y = Math.min(1, 0.5 * (1 - erf((x - mu) / (sigma * SQRT2))))

  return y
}
