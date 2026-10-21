import { describe, expect, it } from 'vitest'
import { cdf, Hypergeometric, lnHypgeomPMF, pmf } from './hypgeometric'

describe('hypergeometric distribution', () => {
  describe('lnHypgeomPMF()', () => {
    it('returns the log probability for an outcome', () => {
      expect(lnHypgeomPMF(1, 10, 4, 3)).toBeCloseTo(Math.log(0.5))
    })
  })

  describe('pmf()', () => {
    it('returns probabilities for each possible success count', () => {
      expect([0, 1, 2, 3].map((k) => pmf(k, 10, 4, 3))).toEqual([
        expect.closeTo(1 / 6),
        expect.closeTo(1 / 2),
        expect.closeTo(3 / 10),
        expect.closeTo(1 / 30),
      ])
    })

    it('returns zero for impossible success counts', () => {
      expect(pmf(-1, 10, 4, 3)).toBe(0)
      expect(pmf(4, 10, 4, 3)).toBe(0)
    })

    it('sums to one across the support', () => {
      const total = [0, 1, 2, 3].reduce((sum, k) => sum + pmf(k, 10, 4, 3), 0)

      expect(total).toBeCloseTo(1)
    })
  })

  describe('cdf()', () => {
    it('returns the probability of k or fewer successes', () => {
      expect(cdf(-1, 10, 4, 3)).toBe(0)
      expect(cdf(0, 10, 4, 3)).toBeCloseTo(1 / 6)
      expect(cdf(1, 10, 4, 3)).toBeCloseTo(2 / 3)
      expect(cdf(2, 10, 4, 3)).toBeCloseTo(29 / 30)
      expect(cdf(3, 10, 4, 3)).toBeCloseTo(1)
      expect(cdf(4, 10, 4, 3)).toBeCloseTo(1)
    })
  })

  describe('Hypergeometric', () => {
    const distribution = new Hypergeometric(10, 4, 3)

    it('matches the standalone PMF', () => {
      for (const k of [-1, 0, 1, 2, 3, 4]) {
        expect(distribution.pmf(k)).toBeCloseTo(pmf(k, 10, 4, 3))
      }
    })

    it('matches the standalone CDF', () => {
      for (const k of [-1, 0, 1, 2, 3, 4]) {
        expect(distribution.cdf(k)).toBeCloseTo(cdf(k, 10, 4, 3))
      }
    })
  })
})
