export function fill<T>(v: T, size: number): T[] {
  return Array(size).fill(v)
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
