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
  const result: T[][] = [[]]

  for (const item of items) {
    for (const combo of [...result]) {
      result.push([...combo, item])
    }
  }

  // remove the empty set
  return result
    .slice(1)
    .sort((a, b) =>
      a.length !== b.length
        ? a.length - b.length
        : a.join(',').localeCompare(b.join(','))
    )
}

export function end<T>(data: T[]): T {
  return data[data.length - 1]!
}

export function minMax(x: number, min: number, max: number) {
  return Math.max(min, Math.min(max, x))
}
