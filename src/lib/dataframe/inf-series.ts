import { BaseSeries } from './base-series'
import type { SeriesData } from './dataframe-types'

export class InfSeries extends BaseSeries {
  protected _defaultValue: SeriesData
  protected _size: number

  constructor(size: number = 1000000, defaultValue: SeriesData = NaN) {
    super()
    this._defaultValue = defaultValue
    this._size = size
  }

  get defaultValue() {
    return this._defaultValue
  }

  setDefaultValue(v: SeriesData): BaseSeries {
    this._defaultValue = v

    return this
  }

  override get size(): number {
    return this._size
  }
}
