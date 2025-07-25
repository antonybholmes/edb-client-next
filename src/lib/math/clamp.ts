/**
 * Clamp a number between a lower and upper limit.
 *
 * @param v
 * @param lower
 * @param upper
 * @returns
 */
export function clamp(v: number, lower: number, upper: number) {
  return Math.max(lower, Math.min(upper, v))
}
