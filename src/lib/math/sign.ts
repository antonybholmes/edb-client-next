/**
 *  A function that has the value −1, +1 or 0 depending on value. Booleans
 * are treated as true +1 or false -1.
 *
 * @param v
 * @returns
 */
export function sign(v: number | boolean): number {
  if (typeof v === 'boolean') {
    return v ? 1 : -1
  } else {
    if (v === 0) {
      return 0
    } else {
      return v > 0 ? 1 : -1
    }
  }
}
