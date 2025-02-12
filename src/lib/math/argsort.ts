export function argsort(data: number[]): number[] {
  return data
    .map((v, vi) => [v, vi])
    .sort((a, b) => a[0] - b[0])
    .map((a) => a[1])
}
