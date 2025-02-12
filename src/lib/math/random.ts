import { range } from './range'

export function shuffleArray(array: number[]) {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = array[i]!
    array[i] = array[j]!
    array[j] = temp
  }
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
  shuffleArray(ret)
  return ret
}
