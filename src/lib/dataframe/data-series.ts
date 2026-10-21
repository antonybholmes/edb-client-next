import { Index, IndexFromType } from '.'
import { BaseIndex } from './base-index'
import { Cell } from './cell'
import { DataIndex, makeIndex } from './data-index'
import { ISeriesOptions, Series, SeriesFromType } from './series'

export class DataSeries<T extends Cell> extends Series<Cell, T> {
  _data: T[]

  _index: Index<Cell>

  constructor(data: SeriesFromType, options: ISeriesOptions = {}) {
    const { index } = options
    super(options)

    this._data = [...data] as T[]
    this._index = makeIndex(index, data.length)
  }

  override get index(): Index<Cell> {
    return this._index
  }

  override setIndex(
    index: IndexFromType,
    opts: { inplace?: boolean } = {}
  ): DataSeries<T> {
    const { inplace = false } = opts

    const series = inplace ? this : this.copy()

    series._index = makeIndex(index, series.length)

    return series
  }

  override get values(): T[] {
    return [...this._data]
  }

  override at(index: number): T {
    return this._data[index]!
  }

  override set(index: number, v: T): DataSeries<T> {
    this._data[index] = v
    return this
  }

  override get length() {
    return this._data.length
  }

  override filter(idx: number[]): DataSeries<T> {
    return new DataSeries(
      idx.map((i) => this._data[i]!),
      { name: this.name, index: this._index.filter(idx) }
    )
  }

  override copy(): DataSeries<T> {
    return new DataSeries([...this._data], {
      name: this.name,
      index: this._index.copy(),
    })
  }

  override [Symbol.iterator](): IterableIterator<T> {
    return this._data[Symbol.iterator]()
  }

  override entries(): IterableIterator<[number, T]> {
    return this._data.entries()
  }
}

export const EMPTY_SERIES = new DataSeries([])

export function indexToSeries(index: BaseIndex<Cell>): DataSeries<Cell> {
  return new DataSeries(index.values, { name: index.name })
}

export function seriesToIndex(series: Series<Cell, Cell>): Index<Cell> {
  return new DataIndex(series.values, { name: series.name })
}
