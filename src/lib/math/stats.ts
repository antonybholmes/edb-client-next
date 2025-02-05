import { mean } from './mean'

export function covariance(
  a: number[],
  b: number[],
  meanA: number | null = null,
  meanB: number | null = null
) {
  const _ma = meanA ?? mean(a)
  const _mb = meanB ?? mean(b)

  let s = 0

  for (const [xi, x] of a.entries()) {
    s += (x - _ma) * (b[xi]! - _mb)
  }

  s /= a.length - 1

  return s

  // return (
  //   sum(
  //     a.map((x, xi) => {
  //       return (x - _ma) * (b[xi]! - _mb)
  //     })
  //   ) /
  //   (a.length - 1)
  // )
}

export function populationVariance(a: number[], meanA: number | null = null) {
  const _ma = meanA ?? mean(a)

  let s = 0

  for (const x of a) {
    const d = x - _ma
    s += d * d
  }

  s /= a.length

  return s

  // return (
  //   sum(
  //     a.map(x => {
  //       const d = x - _ma
  //       return d * d
  //     })
  //   ) / a.length
  // )
}

export function sampleVariance(a: number[], meanA: number | null = null) {
  const _ma = meanA ?? mean(a)

  let s = 0

  for (const x of a) {
    const d = x - _ma
    s += d * d
  }

  s /= a.length - 1

  return s

  // return (
  //   sum(
  //     a.map(x => {
  //       const d = x - _ma
  //       return d * d
  //     })
  //   ) /
  //   (a.length - 1)
  // )
}

export function populationStd(a: number[], meanA: number | null = null) {
  return Math.sqrt(populationVariance(a, meanA))
}

export function sampleStd(a: number[], meanA: number | null = null) {
  return Math.sqrt(sampleVariance(a, meanA))
}

export function std(a: number[], meanA: number | null = null) {
  return sampleStd(a, meanA)
}

export function pearson(a: number[], b: number[]) {
  const ma = mean(a)
  const mb = mean(b)

  return covariance(a, b, ma, mb) / (std(a, ma) * std(b, mb))
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
