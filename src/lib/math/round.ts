export function round(value: number, dp: number = 0): number {
  const p = Math.pow(10, dp)
  const n = (value + Number.EPSILON) * p
  return Math.round(n) / p
}
