/**
 * Return the sum of all elements in an array
 * @param values
 * @returns
 */
export function sum(values: number[]): number {
  let s = 0

  for (const v of values) {
    s += v
  }

  return s
}
