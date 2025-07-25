import type { ILim } from './math'

export function findCenter(xdata: number[], ydata: number[]): ILim {
  if (!xdata.length) return [0, 0]

  const sum = xdata.reduce(
    (acc, x, xi) => {
      acc.x += x
      acc.y += ydata[xi]!
      return acc
    },
    { x: 0, y: 0 }
  )

  return [sum.x / xdata.length, sum.y / xdata.length]
}
