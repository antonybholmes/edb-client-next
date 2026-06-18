export function fill<T>(v: () => T, size: number): T[] {
  return Array.from({ length: size }, v) //[...Array(size)].map(v) //Array(size).fill(v)
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

export function fill2d<T>(v: T, m: number, n: number): T[][] {
  const result: T[][] = new Array(m)
  for (let i = 0; i < m; i++) {
    const row: T[] = new Array(n)
    for (let j = 0; j < n; j++) {
      row[j] = v
    }
    result[i] = row
  }
  return result
}
