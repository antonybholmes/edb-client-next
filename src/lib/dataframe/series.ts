import { Index, makeIndex, type IIndexOptions, type IndexFromType } from '.'
import { BaseIndex } from './base-index'
import type { SeriesData } from './series-data'

export type SeriesFromType = BaseSeries | IndexFromType

export const DEFAULT_INDEX_NAME = 'Index'

export abstract class BaseSeries extends BaseIndex {
  constructor(name: string = '') {
    super(name)
  }

  /**
   * Returns the index associated with this series
   */
  abstract get index(): Index

  abstract setIndex(index: IndexFromType, inplace: boolean): BaseSeries

  get uniq(): SeriesData[] {
    return [...new Set(this.values)].sort()
  }

  abstract set(index: number, v: SeriesData): void

  abstract filter(idx: number[]): BaseSeries

  abstract copy(): BaseSeries
}

export interface ISeriesOptions extends IIndexOptions {
  index?: IndexFromType
}

export class DataSeries extends BaseSeries {
  _data: SeriesData[]

  _index: Index

  constructor(data: SeriesFromType, options: ISeriesOptions = {}) {
    const { index, name = '' } = options
    super(name)

    this._data = [...data]
    this._index = makeIndex(index, data.length)
  }

  override get index(): Index {
    return this._index
  }

  override setIndex(
    index: IndexFromType,
    inplace: boolean = false
  ): BaseSeries {
    const series: DataSeries = inplace ? this : (this.copy() as DataSeries)

    series._index = makeIndex(index, series.length)

    return series
  }

  override get values(): SeriesData[] {
    return [...this._data]
  }

  override at(index: number): SeriesData {
    return this._data[index]!
  }

  override set(index: number, v: SeriesData): BaseSeries {
    this._data[index] = v
    return this
  }

  override get length() {
    return this._data.length
  }

  override filter(idx: number[]): BaseSeries {
    return new DataSeries(
      idx.map((i) => this._data[i]!),
      { name: this.name, index: this._index.filter(idx) }
    )
  }

  override copy(): BaseSeries {
    return new DataSeries([...this._data], {
      name: this.name,
      index: this._index.copy(),
    })
  }

  override [Symbol.iterator](): Iterator<SeriesData> {
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
