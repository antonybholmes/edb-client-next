import { mean } from './mean'

export function covariance(
  a: number[],
  b: number[],
  meanA: number | null = null,
  meanB: number | null = null,
  ddof: number = 0
): number {
  if (a.length !== b.length) {
    return 0
  }

  const n = a.length - ddof

  if (n < 1) {
    return 0
  }

  const _ma = meanA ?? mean(a)
  const _mb = meanB ?? mean(b)

  let s = 0

  for (const [xi, x] of a.entries()) {
    s += (x - _ma) * (b[xi]! - _mb)
  }

  s /= n

  return s
}

export function populationCovariance(
  a: number[],
  b: number[],
  meanA: number | null = null,
  meanB: number | null = null
) {
  return covariance(a, b, meanA, meanB, 0)
}

/**
 *
 * @param values
 * @param meanA
 * @param ddof Delta Degrees of Freedom (0, population, 1 sample)
 * @returns
 */
export function variance(
  values: number[],
  meanA: number | null,
  ddof: number = 0
) {
  const n = values.length - ddof

  if (n < 1) {
    return 0
  }

  const _ma = meanA ?? mean(values)

  let s = 0

  for (const x of values) {
    const d = x - _ma
    s += d * d
  }

  s /= n

  return s
}

export function populationVariance(a: number[], meanA: number | null = null) {
  return variance(a, meanA, 0)
}

export function sampleVariance(a: number[], meanA: number | null = null) {
  return variance(a, meanA, 1)
}

export function populationStd(a: number[], meanA: number | null = null) {
  return Math.sqrt(populationVariance(a, meanA))
}

export function sampleStd(a: number[], meanA: number | null = null) {
  return Math.sqrt(sampleVariance(a, meanA))
}

// export function std(a: number[], meanA: number | null = null) {
//   return sampleStd(a, meanA)
// }

export function pearson(a: number[], b: number[]) {
  const ma = mean(a)
  const mb = mean(b)

  const denominator = populationStd(a, ma) * populationStd(b, mb)

  if (denominator === 0) {
    return 0
  }

  return populationCovariance(a, b, ma, mb) / denominator
}

// // https://en.wikipedia.org/wiki/Normal_distribution
// export function pdf(x: number, mu: number = 0, sigma: number = 1) {
//   if (sigma === 0) {
//     return x === mu ? Number.POSITIVE_INFINITY : 0
//   }

//   let s2 = Math.pow(sigma, 2)
//   let A = 1 / Math.sqrt(2 * s2 * PI)
//   let B = -1 / (2 * s2)

//   return A * Math.exp(B * Math.pow(x - mu, 2))
// }

export function formatPValue(p: number): string {
  if (p < 0.001) {
    return '***'
  } else if (p < 0.01) {
    return '**'
  } else if (p < 0.05) {
    return '*'
  } else {
    return 'ns'
  }
}
