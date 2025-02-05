export const PI = Math.PI

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

/**
 * Returns the indices of an array that pass a filtering criteria. Useful
 * for getting the indices in a dataframe that you want to keep etc.
 *
 * @param data  an array of data to filter
 * @param f     a function that maps a value in the array to true or false to
 *              determine if it should be kept
 * @returns     the indices where the applied function to the array is true.
 */
export function where<T>(data: T[], f: (x: T) => boolean): number[] {
  return data
    .map((v, vi) => [v, vi] as [T, number])
    .filter(a => f(a[0]!))
    .map(a => a[1]!)
}

export function end<T>(data: T[]): T {
  return data[data.length - 1]!
}

export function minMax(x: number, min: number, max: number) {
  return Math.max(min, Math.min(max, x))
}
