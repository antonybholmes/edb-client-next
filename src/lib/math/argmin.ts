/**
 * Given a list of values, return the index of the smallest value.
 *
 * @param values
 * @returns
 */
export function argMin(values: number[]): number {
  let minDistance = Infinity
  let closest = -1

  for (const [i, v] of values.entries()) {
    if (v < minDistance) {
      minDistance = v
      closest = i
    }
  }

  return closest
}
