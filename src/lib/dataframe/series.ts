import { Index, makeIndex, type IIndexOptions } from '.'
import { BaseIndex } from './base-index'
import type { IndexFromType, SeriesData } from './dataframe-types'

export const DEFAULT_INDEX_NAME = 'Index'

export abstract class BaseSeries extends BaseIndex {
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
  index?: IndexFromType | undefined
}

export class Series extends BaseSeries {
  protected _data: SeriesData[]
  protected _name: string
  protected _index: Index

  constructor(data: SeriesData[], options: ISeriesOptions = {}) {
    super()

    const { index, name = '' } = options

    this._data = data
    this._name = name
    this._index = makeIndex(index, data.length)
  }

  setName(name: string): BaseSeries {
    this._name = name
    return this
  }

  override get name(): string {
    return this._name
  }

  override get index(): Index {
    return this._index
  }

  override setIndex(
    index: IndexFromType,
    inplace: boolean = false
  ): BaseSeries {
    const series: Series = inplace ? this : (this.copy() as Series)

    series._index = makeIndex(index, series.length)

    return series
  }

  override get values(): SeriesData[] {
    return [...this._data]
  }

  override get(index: number): SeriesData {
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
    return new Series(
      idx.map(i => this._data[i]!),
      { name: this._name, index: this._index.filter(idx) }
    )
  }

  override copy(): BaseSeries {
    return new Series(this._data, {
      name: this._name,
      index: this._index.copy(),
    })
  }
}

export const EMPTY_SERIES = new Series([])

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
