import { numSort } from './math'
import { median } from './median'

/**
 *
 * See https://jse.amstat.org/v14n3/langford.html
 *
 * @param p
 * @param values
 * @returns
 */
export function HLQuartile(p: number, values: number[]): [number, number] {
  if (values.length === 0) {
    return [0, -1]
  }

  if (values.length === 1) {
    return [values[0]!, 0]
  }

  if (p === 0.5) {
    return median(values)
  }

  values = numSort(values)

  // clamp
  p = Math.max(0, Math.min(1, p))

  const n = values.length - 1
  const q = n * p + 0.5
  const qi = Math.floor(q)

  // console.log(
  //   'q',
  //   p,
  //   q,
  //   qi,
  //   0.5 * (values[qi]! + values[Math.min(n, qi + 1)]!),
  //   values[qi]!,
  //   values[Math.min(n, qi + 1)]!
  // )

  if (Number.isInteger(q)) {
    return [values[qi]!, qi]
  } else {
    return [0.5 * (values[qi]! + values[Math.min(n, qi + 1)]!), qi]
  }
}

export function q25(values: number[]): [number, number] {
  return HLQuartile(0.25, values)
}

export function q50(values: number[]): [number, number] {
  return HLQuartile(0.5, values)
}

export function q75(values: number[]): [number, number] {
  return HLQuartile(0.75, values)
}

export function iqr(values: number[]): number {
  const q1 = q25(values)
  const q3 = q75(values)

  return q3[0] - q1[0]
}
