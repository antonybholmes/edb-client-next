export function linspace(start: number, stop: number, n: number = 50) {
  const f = (stop - start) / (n - 1)

  return Array.from({ length: n }, (_, i) => start + i * f)
}
