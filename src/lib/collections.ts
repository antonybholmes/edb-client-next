import { numSort } from './math/math'

export const EMPTY_SET = new Set()

export function intersect1d(s1: Set<any>, s2: Set<any>): Set<any> {
  return new Set([...s1].filter(i => s2.has(i)))
}

export function listrm<T>(values: T[], indices: number | number[]): T[] {
  if (!Array.isArray(indices)) {
    indices = [indices]
  }

  // work backwards and get rid of elements
  indices = numSort(indices).toReversed()

  let ret = [...values]

  for (const i of indices) {
    ret = [...ret.slice(0, i), ...ret.slice(i + 1)]
  }

  return ret
}
