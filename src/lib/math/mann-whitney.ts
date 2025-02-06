import { numSort } from './math'
import { mean } from './mean'
import { normalDistributionCDF } from './normal-distribution'
import { range } from './range'

import { sum } from './sum'

export interface IMannWhitneyUResult {
  u: number
  p: number
}

/**
 * Implementation of mann whitney u test. We make use of approximations
 * to calculate some values as described in the Wiki page and the
 * scipy implementation.
 *
 * https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test
 * https://github.com/scipy/scipy/blob/main/scipy/stats/_mannwhitneyu.py#L468
 *
 * @param xs          a list of numbers
 * @param ys          a list of numbers
 * @param alternative [alternative="two-sided"] the hypothesis test for generating a p-value
 */
export function mannWhitneyU(
  xs: number[],
  ys: number[],
  alternative: 'less' | 'greater' | 'two-sided' = 'two-sided',
  continuity = true
): IMannWhitneyUResult {
  const n1 = xs.length
  const n2 = ys.length

  // pool and rank
  const obs = numSort([...xs, ...ys])
  const ranks = range(1, obs.length + 1)
  const n = obs.length

  let tied: number[] = [ranks[0]!]
  let currentValue: number = obs[0]!
  const ties: number[][] = []

  const rankMap: Map<number, number> = new Map<number, number>()

  for (let i = 1; i < n; ++i) {
    if (obs[i] !== currentValue) {
      // since all current values are the same, calc mean
      // mean of all values that are the same in a block
      // and store it.
      rankMap.set(currentValue, mean(tied))

      ties.push(tied)

      tied = []
      currentValue = obs[i]!
    }

    tied.push(ranks[i]!)
  }

  // end case
  rankMap.set(currentValue, mean(tied))

  const r1 = sum(xs.map((x) => rankMap.get(x)!))
  //const r2 = sum(ys.map(y => rankMap.get(y)!))

  //const n1n2 = n1 * n2
  const u1 = r1 - 0.5 * (n1 * (n1 + 1))
  const u2 = n1 * n2 - u1

  // since u1 + u2 = n1n2, we take the largest value in case either u1 or u2 are 0
  const u = Math.max(u1, u2)

  const mu = 0.5 * (n1 * n2)

  // all ties > 1 i.e. actual tied ranks
  const tie_term = sum(
    ties.filter((t) => t.length > 1).map((t) => t.length ** 3 - t.length)
  )

  const sigmaTies = Math.sqrt(
    ((n1 * n2) / 12) * (n + 1 - tie_term / (n * (n - 1)))
  )

  //console.log(n1, n2)

  let numerator = u - mu

  // Continuity correction as per scikit learn implementation
  if (continuity) {
    numerator -= 0.5
  }

  const z = numerator / sigmaTies

  let p = 1 - normalDistributionCDF(z)

  // test is symmetric so sided doesn't matter, but if
  // two-sided then multiply by 2 since we could see
  // extremes in either direction
  if (alternative === 'two-sided') {
    p *= 2
  }

  return { u, p }
}
