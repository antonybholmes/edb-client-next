import { pearson } from './stats'
import { sum } from './sum'

export function euclidean(a: number[], b: number[]): number {
  const size = Math.min(a.length, b.length)

  let sum = 0

  for (let index = 0; index < size; index++) {
    const d = a[index]! - b[index]!
    sum += d * d
  }

  return Math.sqrt(sum)

  // return Math.sqrt(
  //   a
  //     .map((x, xi) => {
  //       const d = x - b[xi]!
  //       return d * d
  //     })
  //     .reduce((x, y) => x + y)
  // )
}

export function manhattan(a: number[], b: number[]): number {
  return sum(a.map((x, xi) => Math.abs(x - b[xi]!)))
}

export function pearsond(a: number[], b: number[]): number {
  return 1 - pearson(a, b)
}
