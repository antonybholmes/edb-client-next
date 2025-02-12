import { numSort } from './math'

/**
 *
 * @param values A list of numbers
 * @returns The median value and the index of the midpoint
 */
export function median(values: number[]): [number, number] {
  if (values.length === 0) {
    return [0, -1]
  }

  if (values.length === 1) {
    return [values[0]!, 0]
  }

  values = numSort(values)

  const i1 = Math.floor(0.5 * values.length)

  if (values.length % 2 === 0) {
    return [values[i1]!, i1]
  } else {
    // return the midpoint value
    return [0.5 * (values[i1]! + values[i1 + 1]!), i1]
  }
}
