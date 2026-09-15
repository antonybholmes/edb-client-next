export function add(x: number[], y: number | number[]): number[] {
  if (!Array.isArray(y)) {
    y = [y]
  }

  return x.map((v, vi) => v + y[vi % y.length]!)
}

/**
 * Subtracts the elements of y from the elements of x element-wise.
 *
 * @param x The first array of numbers.
 * @param y The second array of numbers or a single number.
 * @returns A new array containing the element-wise difference of x and y.
 */
export function sub(x: number[], y: number | number[]): number[] {
  if (!Array.isArray(y)) {
    y = [y]
  }

  return x.map((v, vi) => v - y[vi % y.length]!)
}
