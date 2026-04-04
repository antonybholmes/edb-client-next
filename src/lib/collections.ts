import { numSort } from './math/math'

export const EMPTY_SET = new Set()

export function intersect1d<T>(s1: Set<T>, s2: Set<T>): Set<T> {
  return new Set([...s1].filter((i) => s2.has(i)))
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

/**
 * Extended version of findIndex that allows specifying a starting index for the search.
 * This is useful for finding subsequent occurrences of an element in an array.
 *
 * @param arr
 * @param predicate
 * @param start
 * @returns
 */
export function findIndexEx<T>(
  arr: T[],
  predicate: (value: T, index: number, array: T[]) => boolean,
  start: number = 0
): number {
  for (let i = start; i < arr.length; i++) {
    if (predicate(arr[i]!, i, arr)) {
      return i
    }
  }
  return -1
}
