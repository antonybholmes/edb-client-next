import { range } from './range'

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
export function fisherYatesShuffle<T>(arr: T[]): T[] {
  const ret = [...arr] // create a copy to avoid mutating the original array
  for (let i = ret.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1))

    // Swap the elements
    ;[ret[i], ret[j]] = [ret[j]!, ret[i]!] // non-null assertion since we know j is a valid index
  }
  return ret
}

/**
 * For a given length x, return a random permutation of
 * the numbers between [0, x) exclusive i.e. 0...(x-1).
 *
 * @param x
 * @returns
 */
export function permutation(x: number): number[] {
  const ret = range(x)
  fisherYatesShuffle(ret)
  return ret
}
