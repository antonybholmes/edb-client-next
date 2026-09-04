import { vfill } from '@/lib/fill'
import { numSort } from '@/lib/math/math'

export interface ICellGaps {
  size: number
  indexes: number[]
}

export interface ICellSpan {
  p1: number
  p2: number
  i1: number
  i2: number
  w: number
  size: number
}

export interface IOffsetSpan {
  p1: number
  p2: number
  offset: number
}

export class CellGaps {
  private _gaps: ICellGaps
  private _width: number
  private _n: number
  private _positions: number[]
  private _spans: ICellSpan[]
  private _offsetSpans: IOffsetSpan[]

  constructor(gaps: ICellGaps, width: number, n: number) {
    this._gaps = gaps
    this._width = width
    this._n = n

    // Create a set of spans for quick lookup

    const indexSet = new Set(gaps.indexes)

    const indexes = numSort([...indexSet])

    const spanIndexes = [...indexes, n]

    let i1 = 0
    let i2 = 0
    let x1 = 0
    let x2 = 0

    const spans: ICellSpan[] = []

    for (const idx of spanIndexes) {
      i2 = idx - 1
      x2 = x1 + (idx - i1) * width

      spans.push({ p1: x1, p2: x2, i1, i2, w: x2 - x1, size: i2 - i1 + 1 })

      i1 = idx
      x1 = x2 + this._gaps.size
    }

    this._spans = spans

    i1 = 0
    i2 = 0
    x1 = 0
    x2 = 0
    let offset = 0

    const offsetSpans: IOffsetSpan[] = []

    for (const idx of spanIndexes) {
      i2 = idx - 1
      x2 = x1 + (idx - i1) * width

      offsetSpans.push({ p1: x1, p2: x2, offset })

      i1 = idx
      x1 = x2
      offset += this._gaps.size
    }

    this._offsetSpans = offsetSpans

    // map cell indexes to positions

    x1 = 0

    const positions = vfill(0, n)

    for (let i = 0; i < n; i++) {
      if (indexSet.has(i)) {
        x1 += this._gaps.size
      }
      positions[i] = x1

      x1 += this._width
    }

    this._positions = positions
  }

  get positions(): number[] {
    return this._positions
  }

  get width(): number {
    return this._width
  }

  get gaps(): ICellGaps {
    return this._gaps
  }

  get n(): number {
    return this._n
  }

  get spans(): ICellSpan[] {
    return this._spans
  }

  get offsetSpans(): IOffsetSpan[] {
    return this._offsetSpans
  }

  offset(p: number): number {
    for (const span of this._offsetSpans) {
      if (p >= span.p1 && p < span.p2) {
        return span.offset
      }
    }
    return 0
  }

  /**
   * Returns the adjusted position of the cell
   * at the given index, accounting for gaps.
   *
   * @param index
   * @returns
   */
  position(index: number): number {
    return this._positions[index]
  }
}
