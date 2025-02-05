// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function argsort(data: any[]): number[] {
  return data
    .map((v, vi) => [v, vi])
    .sort((a, b) => a[0] - b[0])
    .map(a => a[1])
}
