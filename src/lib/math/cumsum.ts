import { zeros } from './zeros'

/**
 * Returns the cumulative sum of an array where each element
 * is the sum of the elements before it plus itself.
 *
 * @param values
 * @returns
 */
export function cumsum(values: number[]): number[] {
  const ret = zeros(values.length)

  ret[0] = values[0]!

  for (let i = 1; i < values.length; ++i) {
    ret[i] = ret[i - 1]! + values[i]!
  }

  return ret
}
