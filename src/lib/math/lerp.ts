/**
 * Linear interpolation between two values.
 *
 * @param v0 The starting value.
 * @param v1 The ending value.
 * @param t The interpolation factor, typically between 0 and 1.
 * @returns The interpolated value.
 */
export function lerp(v0: number, v1: number, t: number) {
  return v0 * (1 - t) + v1 * t
}
