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
  const len = data.length
  const out = new Array<number>(len)
  let k = 0

  for (let i = 0; i < len; i++) {
    const v = data[i]!
    if (f(v, i)) {
      out[k++] = i
    }
  }

  // trim the output array to the correct length
  out.length = k
  return out
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
export function whereStr(
  data: string[],
  search: string,
  caseInsensitive: boolean = true
): number[] {
  const s = caseInsensitive ? search.toLowerCase() : search

  return where(data, x =>
    caseInsensitive ? x.toLowerCase().includes(s) : x.includes(s)
  )
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
  const s = caseInsensitive ? search.toLowerCase() : search

  return where(data, x =>
    caseInsensitive ? x.toLowerCase().startsWith(s) : x.startsWith(s)
  )
}
