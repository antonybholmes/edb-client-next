/**
 * Returns the indices of the data if the values were in order.
 *
 * @param data
 * @returns
 */
export function argsort(data: number[], reverse = false): number[] {
  return data
    .map((value, index) => ({ value, index }))
    .sort((a, b) => (reverse ? b.value - a.value : a.value - b.value))
    .map(({ index }) => index)
}

export function argsortStr(data: string[]): number[] {
  return data
    .map((v, vi) => [v, vi] as [string, number])
    .sort((a, b) => a[0]!.toLowerCase().localeCompare(b[0]!.toLowerCase()))
    .map((a) => a[1]!)
}
