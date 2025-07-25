import type { ILim } from './math'

/**
 * Normalize  either a number or list of numbers between 0 and 1.
 *
 * @param values    A number or list of numbers to normalize.
 * @param lim       The min and max that numbers should be
 *                  scaled between. If not supplied and values
 *                  is an array, the min/max of the array will be
 *                  used. If not supplied and value is a single number
 *                  value an error will be throw.
 * @returns
 */
export function normalize<T extends number | number[]>(
  values: T,
  lim: ILim | null = null
): T {
  if (!lim) {
    if (Array.isArray(values)) {
      lim = [Math.min(...values), Math.max(...values)]
    } else {
      throw new Error('lim parameter must be provided')
    }
  }

  const r = lim[1] - lim[0]

  if (Array.isArray(values)) {
    return values.map(
      x => (Math.max(lim[0], Math.min(lim[1], x)) - lim[0]) / r
    ) as T
  } else {
    return ((Math.max(lim[0], Math.min(lim[1], values)) - lim[0]) / r) as T
  }
}
