export function fill<T>(v: T, size: number): T[] {
  return Array(size).fill(v)
}

export function fill2d<T>(v: T, m: number, n: number): T[][] {
  return new Array(m).fill(null).map(() => fill(v, n))
}
