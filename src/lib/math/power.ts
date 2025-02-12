import { zeros } from './zeros'

/**
 * Returns an array with each element to the power of y.
 *
 * @param values
 * @param y
 * @returns
 */
export function pow(values: number[], y: number | number[]): number[] {
  if (y === 0) {
    return zeros(values.length)
  }

  // no need to waste cpu time on this
  if (y === 1) {
    return values
  }

  if (!Array.isArray(y)) {
    y = [y]
  }

  return values.map((v, vi) => Math.pow(v, y[vi % y.length]!))
}
