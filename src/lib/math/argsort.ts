/**
 * Returns the indices of the data if the values were in order.
 *
 * @param data
 * @returns
 */
export function argsort(data: number[]): number[] {
  return data
    .map((v, vi) => [v, vi])
    .sort((a, b) => a[0]! - b[0]!)
    .map(a => a[1]!)
}

export function argsortStr(data: string[]): number[] {
  return data
    .map((v, vi) => [v, vi] as [string, number])
    .sort((a, b) => a[0]!.toLowerCase().localeCompare(b[0]!.toLowerCase()))
    .map(a => a[1]!)
}
