export function clamp(v: number, lower: number, upper: number) {
  return Math.max(lower, Math.min(upper, v))
}
