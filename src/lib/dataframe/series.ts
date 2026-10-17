import { Index, makeIndex, type IIndexOptions, type IndexFromType } from '.'
import { BaseIndex } from './base-index'
import type { SeriesData } from './series-data'

export type SeriesFromType = BaseSeries<SeriesData> | IndexFromType

export const DEFAULT_INDEX_NAME = 'Index'

export abstract class BaseSeries<T extends SeriesData> extends BaseIndex<T> {
  constructor(opts: IIndexOptions = {}) {
    super(opts)
  }

  /**
   * Returns the index associated with this series
   */
  abstract get index(): Index<T>

  abstract setIndex(index: IndexFromType, inplace: boolean): DataSeries<T>

  get uniq(): T[] {
    return [...new Set(this.values)].sort()
  }

  abstract set(index: number, v: T): DataSeries<T>

  abstract filter(idx: number[]): BaseSeries<T>

  abstract copy(): BaseSeries<T>
}

export interface ISeriesOptions extends IIndexOptions {
  index?: IndexFromType
}

export class DataSeries<T extends SeriesData> extends BaseSeries<T> {
  _data: T[]

  _index: Index<T>

  constructor(data: SeriesFromType, options: ISeriesOptions = {}) {
    const { index } = options
    super(options)

    this._data = [...data] as T[]
    this._index = makeIndex(index, data.length) as Index<T>
  }

  override get index(): Index<T> {
    return this._index
  }

  override setIndex(
    index: IndexFromType,
    inplace: boolean = false
  ): DataSeries<T> {
    const series: DataSeries<T> = inplace
      ? this
      : (this.copy() as DataSeries<T>)

    series._index = makeIndex(index, series.length) as Index<T>

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

  override filter(idx: number[]): BaseSeries<T> {
    return new DataSeries(
      idx.map((i) => this._data[i]!),
      { name: this.name, index: this._index.filter(idx) }
    )
  }

  override copy(): BaseSeries<T> {
    return new DataSeries([...this._data], {
      name: this.name,
      index: this._index.copy(),
    })
  }

  override [Symbol.iterator](): Iterator<T> {
    return this._data[Symbol.iterator]()
  }
}

export const EMPTY_SERIES = new DataSeries([])

// export class InfSeries extends BaseSeries {

//   protected _defaultValue: SeriesData
//   protected _length: number

//   constructor(length: number = 1000000, defaultValue: SeriesData = NaN) {
//     super()
//     this._defaultValue = defaultValue
//     this._length = length
//     this
//   }

//   get defaultValue() {
//     return this._defaultValue
//   }

//   setDefaultValue(v: SeriesData): BaseSeries {
//     this._defaultValue = v

//     return this
//   }

//   override get length(): number {
//     return this._length
//   }
// }
