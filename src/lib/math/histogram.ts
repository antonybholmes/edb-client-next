import { numSort } from './math'
import { rangeMap } from './range'

interface IHistBin {
  index: number
  range: [number, number]
  values: number[]
}

export function histogram(data: number[], k?: number): IHistBin[] {
  if (!k) {
    k = Math.ceil(Math.sqrt(data.length))
  }

  data = numSort(data)
  const r = data[data.length - 1]! - data[0]!

  const dx = r / (k - 1)

  const bins: IHistBin[] = rangeMap(bi => {
    const s = data[0]! + bi * dx
    return {
      index: bi,
      range: [s, s + dx],
      values: [],
    }
  }, k)

  // add the values to the bins
  let bi = 0

  for (const v of data) {
    // once a value exceeds the bin range goto the next bin
    if (v >= bins[bi]!.range[1]) {
      ++bi
    }

    bins[bi]!.values.push(v)
  }

  return bins
}
