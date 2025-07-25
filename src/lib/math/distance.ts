import { pearson } from './stats'
import { sum } from './sum'

export type Point = number[]

export type DistFunc = (a: Point, b: Point) => number

export function euclidean(a: Point, b: Point): number {
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

export function manhattan(a: Point, b: Point): number {
  return sum(a.map((x, xi) => Math.abs(x - b[xi]!)))
}

export function pearsond(a: Point, b: Point): number {
  return 1 - pearson(a, b)
}
