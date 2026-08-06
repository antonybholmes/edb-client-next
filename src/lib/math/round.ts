/**
 * Rounds a number to the specified number of decimal places.
 *
 * @param value
 * @param dp
 * @returns
 */
export function round(value: number, dp: number = 0): number {
  ///const p = Math.pow(10, dp)
  //const n = (value + Number.EPSILON) * p
  //return Math.round(n) / p

  const factor = 10 ** dp
  return Math.round(value * factor) / factor
}
