export function add(x: number[], y: number | number[]): number[] {
  if (!Array.isArray(y)) {
    y = [y]
  }

  return x.map((v, vi) => v + y[vi % y.length]!)
}

export function sub(x: number[], y: number | number[]): number[] {
  if (!Array.isArray(y)) {
    y = [y]
  }

  return x.map((v, vi) => v - y[vi % y.length]!)
}
