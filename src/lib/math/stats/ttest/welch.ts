import { mean } from '../../mean'
import { sampleVariance } from '../../stats'
import { tSF } from './t-distribution'

export type TTestAlternative = 'less' | 'greater' | 'two-sided'

export interface IWelchTTestResult {
  /** t statistic for mean(xs) - mean(ys) */
  t: number
  /** Welch-Satterthwaite degrees of freedom */
  df: number
  p: number
}

/**
 * Welch's unequal variances t-test. Matches
 * scipy.stats.ttest_ind(xs, ys, equal_var=False).
 *
 * @param xs          a list of at least 2 numbers
 * @param ys          a list of at least 2 numbers
 * @param alternative [alternative="two-sided"] the hypothesis test for generating a p-value
 */
export function welchTTest(
  xs: number[],
  ys: number[],
  alternative: TTestAlternative = 'two-sided'
): IWelchTTestResult {
  const n1 = xs.length
  const n2 = ys.length

  if (n1 < 2 || n2 < 2) {
    throw new Error('each group must contain at least 2 values')
  }

  const m1 = mean(xs)
  const m2 = mean(ys)

  // variance of each sample mean
  const v1 = sampleVariance(xs, m1) / n1
  const v2 = sampleVariance(ys, m2) / n2

  const se2 = v1 + v2

  if (se2 === 0) {
    // both groups are constant so there is no variation to test against
    if (m1 === m2) {
      return { t: NaN, df: NaN, p: NaN }
    }

    const t = m1 > m2 ? Infinity : -Infinity
    const p =
      alternative === 'two-sided'
        ? 0
        : t > 0 === (alternative === 'greater')
          ? 0
          : 1

    return { t, df: NaN, p }
  }

  const t = (m1 - m2) / Math.sqrt(se2)

  const df = (se2 * se2) / ((v1 * v1) / (n1 - 1) + (v2 * v2) / (n2 - 1))

  let p: number

  switch (alternative) {
    case 'greater':
      p = tSF(t, df)
      break
    case 'less':
      p = tSF(-t, df)
      break
    default:
      p = Math.min(1, 2 * tSF(Math.abs(t), df))
  }

  return { t, df, p }
}
