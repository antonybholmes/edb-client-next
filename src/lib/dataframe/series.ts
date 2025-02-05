import { Index, NUM_INDEX, type IIndexOptions, type IndexFromType } from '.'
import { BaseSeries } from './base-series'

import { DataIndex } from './data-index'
import type { SeriesData } from './dataframe-types'

export interface ISeriesOptions extends IIndexOptions {
  index?: IndexFromType
}

export class Series extends BaseSeries {
  protected _data: SeriesData[]
  protected _name: string
  protected _index: Index = NUM_INDEX

  constructor(data: SeriesData[], options: ISeriesOptions = {}) {
    super()

    const { index, name } = { name: '', index: NUM_INDEX, ...options }

    this._data = data
    this._name = name
    this.setIndex(index, true)
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

    if (index instanceof Index) {
      series._index = new DataIndex(index.values)
    } else if (Array.isArray(index)) {
      series._index = new DataIndex(index)
    } else {
      series._index = NUM_INDEX
    }

    return this
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

  override get size() {
    return this._data.length
  }

  override filter(idx: number[]): BaseSeries {
    return new Series(
      idx.map(i => this._data[i]!),
      { name: this._name, index: this._index.filter(idx) }
    )
  }

  override copy(): BaseSeries {
    return new Series(this._data, { name: this._name, index: this._index })
  }
}
