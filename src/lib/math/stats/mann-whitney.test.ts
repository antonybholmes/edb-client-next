import { describe, expect, it } from 'vitest'
import { mannWhitneyU } from './mann-whitney'

// Reference values from scipy.stats.mannwhitneyu(..., method='asymptotic')
const SEPARATED = {
  x: [1, 2, 3, 4, 5],
  y: [6, 7, 8, 9, 10],
}

const OVERLAPPING = {
  x: [1.1, 2.4, 3.3, 5.8, 7.7, 9.1],
  y: [2.2, 4.5, 6.1, 8.8, 10.3, 11.7, 12.2],
}

const TIED = {
  x: [1, 2, 2, 3, 4],
  y: [2, 3, 3, 5, 6, 7],
}

describe('mannWhitneyU', () => {
  it('computes U and a two-sided p-value for fully separated groups', () => {
    const { u, p } = mannWhitneyU(SEPARATED.x, SEPARATED.y)

    expect(u).toBe(0)
    expect(p).toBeCloseTo(0.012185780355344813, 5)
  })

  it('computes U and a two-sided p-value for overlapping groups', () => {
    const { u, p } = mannWhitneyU(OVERLAPPING.x, OVERLAPPING.y)

    expect(u).toBe(11)
    expect(p).toBeCloseTo(0.17473582321524717, 5)
  })

  it('handles tied values', () => {
    const { u, p } = mannWhitneyU(TIED.x, TIED.y)

    expect(u).toBe(6)
    expect(p).toBeCloseTo(0.11390314458853068, 5)
  })

  it('applies the continuity correction by default and can disable it', () => {
    const corrected = mannWhitneyU(OVERLAPPING.x, OVERLAPPING.y)
    const uncorrected = mannWhitneyU(
      OVERLAPPING.x,
      OVERLAPPING.y,
      'two-sided',
      false
    )

    expect(uncorrected.p).toBeCloseTo(0.1531274510196695, 5)
    expect(uncorrected.p).toBeLessThan(corrected.p)
  })

  it('halves the p-value for the "less" alternative when x is smaller', () => {
    const { p } = mannWhitneyU(SEPARATED.x, SEPARATED.y, 'less')

    expect(p).toBeCloseTo(0.006092890177672406, 5)
  })

  it('gives the same two-sided p-value when the groups are swapped', () => {
    const a = mannWhitneyU(OVERLAPPING.x, OVERLAPPING.y)
    const b = mannWhitneyU(OVERLAPPING.y, OVERLAPPING.x)

    expect(b.p).toBeCloseTo(a.p, 12)
  })

  it('U values of swapped groups sum to n1 * n2', () => {
    const a = mannWhitneyU(OVERLAPPING.x, OVERLAPPING.y)
    const b = mannWhitneyU(OVERLAPPING.y, OVERLAPPING.x)

    expect(a.u + b.u).toBe(OVERLAPPING.x.length * OVERLAPPING.y.length)
  })

  it('returns a p-value within [0, 1]', () => {
    for (const alt of ['two-sided', 'less', 'greater'] as const) {
      const { p } = mannWhitneyU([1, 2, 3], [1, 2, 3], alt)

      expect(p).toBeGreaterThanOrEqual(0)
      expect(p).toBeLessThanOrEqual(1)
    }
  })

  it('does not mutate its inputs', () => {
    const xs = [3, 1, 2]
    const ys = [6, 5, 4]

    mannWhitneyU(xs, ys)

    expect(xs).toEqual([3, 1, 2])
    expect(ys).toEqual([6, 5, 4])
  })
})
