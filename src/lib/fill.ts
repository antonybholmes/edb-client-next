import { IMatrixDim } from '@/interfaces/matrix-dim'

export function fill<T>(v: (i: number) => T, size: number): T[] {
  return Array.from({ length: size }, (_, index) => v(index)) //[...Array(size)].map(v) //Array(size).fill(v)
}

/**
 * Creates an array of specified size filled with the provided value. The value is not
 * copied, so if it's an object or array, all elements will reference the same instance.
 * Use with primitive values for expected behavior. Use fill for more complex
 * filling logic or when you need to fill with non-primitive values.
 */
export function vfill<T>(v: T, size: number): T[] {
  return fill(() => v, size) //Array(size).fill(v)
}

export function fill2d<T>(
  v: (i: number, j: number) => T,
  dim: IMatrixDim
): T[][] {
  const { rows, cols } = dim
  const result: T[][] = new Array(rows)
  for (let i = 0; i < rows; i++) {
    const row: T[] = new Array(cols)
    for (let j = 0; j < cols; j++) {
      row[j] = v(i, j)
    }
    result[i] = row
  }
  return result
}

export function vfill2d<T>(v: T, dim: IMatrixDim): T[][] {
  return fill2d(() => v, dim)
}
