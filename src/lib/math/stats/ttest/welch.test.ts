import { describe, expect, it } from 'vitest'
import { welchTTest } from './welch'

// Reference values from scipy.stats.ttest_ind(..., equal_var=False)
const A = { x: [1, 2, 3, 4, 5], y: [6, 7, 8, 9, 10] }

const B = {
  x: [1.1, 2.4, 3.3, 5.8, 7.7, 9.1],
  y: [2.2, 4.5, 6.1, 8.8, 10.3, 11.7, 12.2],
}

const C = { x: [1, 2, 2, 3, 4], y: [2, 3, 3, 5, 6, 7, 30, 1.5] }

describe('welchTTest', () => {
  it('matches scipy for equal-sized groups', () => {
    const { t, df, p } = welchTTest(A.x, A.y)

    expect(t).toBeCloseTo(-5, 10)
    expect(df).toBeCloseTo(8, 10)
    expect(p).toBeCloseTo(0.0010528257933665399, 10)
  })

  it('matches scipy for unequal sizes', () => {
    const { t, df, p } = welchTTest(B.x, B.y)

    expect(t).toBeCloseTo(-1.5931229934326787, 10)
    expect(df).toBeCloseTo(10.995322694636002, 8)
    expect(p).toBeCloseTo(0.13945144889701458, 8)
  })

  it('matches scipy for unequal variances and sizes', () => {
    const { t, df, p } = welchTTest(C.x, C.y)

    expect(t).toBeCloseTo(-1.4211345551363603, 10)
    expect(df).toBeCloseTo(7.325062234856024, 8)
    expect(p).toBeCloseTo(0.19641996665925845, 8)
  })

  it('supports one-sided alternatives', () => {
    expect(welchTTest(A.x, A.y, 'less').p).toBeCloseTo(0.0005264128966832699, 10)
    expect(welchTTest(A.x, A.y, 'greater').p).toBeCloseTo(0.9994735871033167, 10)
    expect(welchTTest(B.x, B.y, 'less').p).toBeCloseTo(0.06972572444850729, 8)
    expect(welchTTest(B.x, B.y, 'greater').p).toBeCloseTo(0.9302742755514927, 8)
  })

  it('is symmetric when the groups are swapped', () => {
    const a = welchTTest(B.x, B.y)
    const b = welchTTest(B.y, B.x)

    expect(b.t).toBeCloseTo(-a.t, 12)
    expect(b.df).toBeCloseTo(a.df, 12)
    expect(b.p).toBeCloseTo(a.p, 12)
  })

  it('returns p = 1 for identical groups', () => {
    const { t, p } = welchTTest([1, 2, 3, 4], [1, 2, 3, 4])

    expect(t).toBe(0)
    expect(p).toBeCloseTo(1, 12)
  })

  it('handles constant groups', () => {
    expect(welchTTest([2, 2, 2], [2, 2, 2]).p).toBeNaN()
    expect(welchTTest([1, 1, 1], [2, 2, 2]).p).toBe(0)
    expect(welchTTest([1, 1, 1], [2, 2, 2], 'greater').p).toBe(1)
    expect(welchTTest([1, 1, 1], [2, 2, 2], 'less').p).toBe(0)
  })

  it('throws when a group has fewer than 2 values', () => {
    expect(() => welchTTest([1], [1, 2, 3])).toThrow()
    expect(() => welchTTest([1, 2, 3], [])).toThrow()
  })

  it('does not mutate its inputs', () => {
    const xs = [3, 1, 2]
    const ys = [6, 5, 4]

    welchTTest(xs, ys)

    expect(xs).toEqual([3, 1, 2])
    expect(ys).toEqual([6, 5, 4])
  })
})
