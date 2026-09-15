import { ILimit } from './limit'

/**
 * Clamp a number between a lower and upper limit.
 *
 * @param v
 * @param lower
 * @param upper
 * @returns
 */
export function clamp(v: number, limit: ILimit) {
  return Math.max(limit.min, Math.min(limit.max, v))
}
