export const PI = Math.PI
export const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER)

export const DEG_TO_RAD = PI / 180
export const RAD_TO_DEG = 180 / PI

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

export function numericalSort(l: string[]) {
  return l.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
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

/**
 * Return the last element of an array. Useful for chaining.
 * @param data
 * @returns
 */
export function end<T>(data: T[]): T {
  return data[data.length - 1]!
}

export function minMax(x: number, min: number, max: number) {
  return Math.max(min, Math.min(max, x))
}

export function transpose<T>(matrix: T[][]): T[][] {
  if (matrix.length === 0) return []

  const rows = matrix.length
  const cols = matrix[0]!.length
  const result: T[][] = Array.from({ length: cols }, () => Array(rows))

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j]![i] = matrix[i]![j]
    }
  }

  return result
}
