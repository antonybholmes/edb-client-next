import { describe, expect, it } from 'vitest'
import { mult } from './multiply'

describe('mult', () => {
  it('multiplies each element by a scalar', () => {
    expect(mult([1, 2, 3], 2)).toEqual([2, 4, 6])
  })

  it('multiplies by multiple scalar factors in sequence', () => {
    expect(mult([1, 2, 3], 2, 3)).toEqual([6, 12, 18])
  })

  it('supports array factors and wraps by modulo indexing', () => {
    expect(mult([1, 2, 3, 4], [10, 20])).toEqual([10, 40, 30, 80])
    expect(mult([1, 2, 3, 4], [10, 20], 3)).toEqual([30, 120, 90, 240])
  })

  it('does not mutate the source array', () => {
    const input = [1, 2, 3]

    const result = mult(input, 2, 4)

    expect(input).toEqual([1, 2, 3])
    expect(result).toEqual([8, 16, 24])
  })
})
