/**
 * Multiply all elements in an array by a given number or array of numbers.
 *
 * @param x The array of numbers to be multiplied.
 * @param ys The numbers or arrays of numbers to multiply with. If multiple
 * arrays are specified then each value is multiplied in sequence. If
 * array is shorter than x, the position in the array will be chosen by modulo arithmetic.
 * Therefore you must ensure arrays are of the same length to get correct multiplication.
 * @returns A new array containing the results of the multiplication.
 */
export function mult(x: number[], ...ys: (number | number[])[]): number[] {
  const _ys = ys.map((v) => (Array.isArray(v) ? v : [v]))

  const ret = [...x]

  for (let i = 0; i < x.length; i++) {
    for (const y of _ys) {
      ret[i] *= y[i % y.length]!
    }
  }

  return ret
}

/**
 * Divide all elements in array by y. If y is a number, divide
 * all elements by the same value. If y is an array, divide each
 * element of x by its corresponding element in y. If y is an
 * array and is shorter than x, the position in y will be chosen
 * by modulo arithmetic.
 *
 * @param x The array of numbers to be divided.
 * @param y The number or array of numbers to divide by.
 * @returns A new array containing the results of the division.
 */
export function div(x: number[], ...ys: (number | number[])[]): number[] {
  const _ys = ys.map((v) => (Array.isArray(v) ? v : [v]))

  const ret = [...x]

  for (let i = 0; i < x.length; i++) {
    for (const y of _ys) {
      ret[i] /= y[i % y.length]!
    }
  }

  return ret
}
