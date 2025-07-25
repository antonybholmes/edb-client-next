export const PI = Math.PI
export const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER)

export type ILim = [number, number]

/**
 * Returns a numerically sorted array because JS default sort does not
 * work intuitively.
 *
 * @param a an array of numbers
 * @returns the array numerically sorted
 */
export function numSort(a: number[]) {
  return a.sort((a, b) => a - b)
}

export function makeCombinations<T>(items: T[]): T[][] {
  const combinations: T[][] = [[]]

  items.forEach((item: T) => {
    combinations.slice().forEach((comb: T[]) => {
      combinations.push(comb.concat([item]))
    })
  })

  return combinations
}

export function end<T>(data: T[]): T {
  return data[data.length - 1]!
}

export function minMax(x: number, min: number, max: number) {
  return Math.max(min, Math.min(max, x))
}
