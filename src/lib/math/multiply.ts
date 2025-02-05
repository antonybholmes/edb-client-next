export function mult(x: number[], y: number | number[]): number[] {
  if (y === 1) {
    return x
  }

  if (!Array.isArray(y)) {
    y = [y]
  }

  return x.map((v, vi) => v * y[vi % y.length]!)
}

/**
 * Divide all elements in array by y. If y is a number, divide
 * all elements by the same value. If y is an array, divide each
 * element of x by its corresponding element in y. If y is an
 * array and is shorter than x, the position in y will be chosen
 * by modulo arithmetic.
 *
 * @param x
 * @param y
 * @returns
 */
export function div(x: number[], y: number | number[]): number[] {
  if (y === 1) {
    return x
  }

  if (!Array.isArray(y)) {
    y = [y]
  }

  return x.map((v, vi) => v / y[vi % y.length]!)
}
