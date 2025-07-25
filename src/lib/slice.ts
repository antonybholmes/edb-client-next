/**
 * Extract elements of an array and reorder
 * @param array
 * @param indices
 * @returns
 */
export function sliceWithOrder<T>(array: T[], indices: number[]): T[] {
  const result: T[] = []
  for (const index of indices) {
    if (index >= 0 && index < array.length) {
      result.push(array[index]!)
    }
  }
  return result
}
