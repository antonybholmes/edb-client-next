import { describe, expect, it } from 'vitest'
import { range, rangeg, rangeMap } from './range'

describe('range utilities', () => {
  describe('range()', () => {
    it('returns [0, 1, 2, 3, 4] for range(5)', () => {
      expect(range(5)).toEqual([0, 1, 2, 3, 4])
    })

    it('returns [2, 3, 4] for range(2, 5)', () => {
      expect(range(2, 5)).toEqual([2, 3, 4])
    })

    it('supports a custom step', () => {
      expect(range(2, 8, 2)).toEqual([2, 4, 6])
    })

    it('returns an empty array when stop is less than start for positive step', () => {
      expect(range(5, 2)).toEqual([])
    })

    it('throws when step is zero', () => {
      expect(() => range(0, 5, 0)).toThrow('step cannot be 0')
    })
  })

  describe('rangeg()', () => {
    it('yields 0 through 4 for rangeg(5)', () => {
      expect([...rangeg(5)]).toEqual([0, 1, 2, 3, 4])
    })

    it('yields 2 through 4 for rangeg(2, 5)', () => {
      expect([...rangeg(2, 5)]).toEqual([2, 3, 4])
    })

    it('supports a negative step', () => {
      expect([...rangeg(5, 1, -2)]).toEqual([5, 3])
    })

    it('throws when step is zero', () => {
      expect(() => [...rangeg(0, 5, 0)]).toThrow('step cannot be 0')
    })
  })

  describe('rangeMap()', () => {
    it('maps indices with default start', () => {
      expect(rangeMap((i) => i * 2, 5)).toEqual([0, 2, 4, 6, 8])
    })

    it('maps indices with explicit start and stop', () => {
      expect(rangeMap((i) => i + 1, 2, 5)).toEqual([3, 4, 5])
    })

    it('supports a custom step', () => {
      expect(rangeMap((i) => i * i, 1, 6, 2)).toEqual([1, 9, 25])
    })

    it('returns an empty array when stop is less than start for positive step', () => {
      expect(rangeMap((i) => i, 5, 2)).toEqual([])
    })

    it('throws when step is zero', () => {
      expect(() => rangeMap((i) => i, 0, 5, 0)).toThrow('step cannot be 0')
    })
  })
})
