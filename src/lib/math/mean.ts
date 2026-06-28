import { sum } from './sum'

export function mean(values: number[]): number {
  if (values.length === 0) {
    return 0
  }

  if (values.length === 1) {
    return values[0]!
  }

  return sum(values) / values.length
}
