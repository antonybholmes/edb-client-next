/**
 * Returns the absolute values of an array of numbers.
 *
 * @param values
 * @returns
 */
export function abs(values: number[]): number[] {
  return values.map(v => Math.abs(v))
}
