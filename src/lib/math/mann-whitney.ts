import { mean } from './mean'
import { normSF } from './normal-distribution'

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
  // const n1 = xs.length
  // const n2 = ys.length

  // // pool and rank
  // const obs = numSort([...xs, ...ys])
  // const ranks = range(1, obs.length + 1)
  // const n = obs.length

  // let tied: number[] = [ranks[0]!]
  // let currentValue: number = obs[0]!
  // const ties: number[][] = []

  // const rankMap: Map<number, number> = new Map<number, number>()

  // for (let i = 1; i < n; ++i) {
  //   if (obs[i] !== currentValue) {
  //     // since all current values are the same, calc mean
  //     // mean of all values that are the same in a block
  //     // and store it.
  //     rankMap.set(currentValue, mean(tied))

  //     ties.push(tied)

  //     tied = []
  //     currentValue = obs[i]!
  //   }

  //   tied.push(ranks[i]!)
  // }

  // // end case
  // rankMap.set(currentValue, mean(tied))

  // const r1 = sum(xs.map(x => rankMap.get(x)!))
  // //const r2 = sum(ys.map(y => rankMap.get(y)!))
  const n1 = xs.length
  const n2 = ys.length
  const n = n1 + n2
  const n1n2 = n1 * n2
  const mu = 0.5 * n1n2

  // const u1 = r1 - 0.5 * (n1 * (n1 + 1))
  // const u2 = n1 * n2 - u1

  // Combine the two groups and create a list of all values with their group labels
  let combined = [
    ...xs.map(val => ({ value: val, group: 1 })),
    ...ys.map(val => ({ value: val, group: 2 })),
  ]

  // Sort the combined values by their actual values
  combined.sort((a, b) => a.value - b.value)

  // Assign ranks to the sorted combined values
  let ranks = []
  let currentRank = 1
  for (let i = 0; i < combined.length; i++) {
    if (i > 0 && combined[i]!.value !== combined[i - 1]!.value) {
      currentRank = i + 1
    }
    ranks.push({ group: combined[i]!.group, rank: currentRank })
  }

  const rankMap: Map<number, number[]> = new Map<number, number[]>()

  for (const [index, r] of ranks.entries()) {
    const rank = r.rank

    if (!rankMap.has(rank)) {
      rankMap.set(rank, [])
    }

    rankMap.get(rank)!.push(index + 1)
  }

  const adjustedRanks = new Map<number, number>()

  for (const ranks of rankMap.values()) {
    const m = mean(ranks)

    for (const rank of ranks) {
      adjustedRanks.set(rank, m!)
    }
  }

  //console.log('rankMap:', adjustedRanks)

  // Calculate the sum of ranks for each group
  const rankSum1 = ranks
    .filter(r => r.group === 1)
    .reduce((sum, r) => sum + adjustedRanks.get(r.rank)!, 0)

  let tie_term = 0

  for (const [_, ranks] of rankMap.entries()) {
    const n = ranks.length
    if (n > 1) {
      // if there are ties, we need to calculate the tie term
      // as per the formula
      tie_term += n ** 3 - n
      // tie_term += (count ** 3 - count) / (n * (n - 1))
    }
  }

  // let rankSum2 = ranks
  //   .filter(r => r.group === 2)
  //   .reduce((sum, r) => sum + r.rank, 0)

  // Calculate the U statistic for both groups

  const U1 = rankSum1 - (n1 * (n1 + 1)) / 2
  const U2 = n1n2 - U1 // rankSum2 - (n2 * (n2 + 1)) / 2

  console.log('U1:', U1)
  console.log('U2:', U2)

  // since u1 + u2 = n1n2, we take the largest value in case either u1 or u2 are 0
  const U = Math.max(U1, U2)

  // // all ties > 1 i.e. actual tied ranks
  // const tie_term = sum(
  //   ties.filter(t => t.length > 1).map(t => t.length ** 3 - t.length)
  // )

  const sigmaTies = Math.sqrt((n1n2 / 12) * (n + 1 - tie_term / (n * (n - 1))))

  let UCorrected = U - mu

  // Continuity correction as per scikit learn implementation
  if (continuity) {
    UCorrected -= 0.5
  }

  const z = UCorrected / sigmaTies

  let p = normSF(z) //tie_term > 0 ? normSF(z) : normSF(Math.floor(U)) // 1 - normalDistributionCDF(z)

  // test is symmetric so sided doesn't matter, but if
  // two-sided then multiply by 2 since we could see
  // extremes in either direction
  if (alternative === 'two-sided') {
    p *= 2
  }

  p = Math.max(0, Math.min(1, p))

  return { u: U1, p }
}
