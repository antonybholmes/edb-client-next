/**
 * Returns the indices of an array that pass a filtering criteria. Useful
 * for getting the indices in a dataframe that you want to keep etc.
 *
 * @param data  an array of data to filter
 * @param f     a function that maps a value in the array to true or false to
 *              determine if it should be kept
 * @returns     the indices where the applied function to the array is true.
 */
export function where<T>(
  data: T[],
  f: (x: T, idx: number) => boolean
): number[] {
  // return data
  //   .map((v, vi) => [v, vi] as [T, number])
  //   .filter(a => f(a[0]!))
  //   .map(a => a[1]!)

  const ret: number[] = []

  for (const [ci, c] of data.entries()) {
    if (f(c, ci)) {
      ret.push(ci)
    }
  }

  return ret
}

/**
 * A specific form of where for string matching
 * the start of strings.
 *
 * @param data                   A list of strings to search.
 * @param search                 A search prefix to look for.
 * @param caseInsensitive        Case insensitive matching.
 * @returns                      The indices of strings beginning with search.
 */
export function whereStartsWith(
  data: string[],
  search: string,
  caseInsensitive: boolean = true
): number[] {
  let s = search

  if (caseInsensitive) {
    s = s.toLowerCase()
  }

  return where(data, x =>
    caseInsensitive ? x.toLowerCase().startsWith(s) : x.startsWith(s)
  )
}
