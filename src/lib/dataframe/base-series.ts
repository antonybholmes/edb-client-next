import { BaseIndex } from './base-index'
import { cellNum, cellStr } from './cell'
import type { SeriesData } from './dataframe-types'
import { NUM_INDEX, type IndexFromType } from './index'

export const DEFAULT_INDEX_NAME = 'id'

export class BaseSeries extends BaseIndex {
  get index(): BaseIndex {
    return NUM_INDEX
  }

  setIndex(_index: IndexFromType, _inplace: boolean = false): BaseSeries {
    return this
  }

  get values(): SeriesData[] {
    return []
  }

  /**
   * Return the values as strings
   */
  get strs(): string[] {
    return this.values.map((v) => cellStr(v))
  }

  get nums(): number[] {
    return this.values.map((v) => cellNum(v))
  }

  get numsNoNA(): number[] {
    return this.nums.filter((v) => !isNaN(v))
  }

  get uniq(): SeriesData[] {
    return [...new Set(this.values)].sort()
  }

  set(_index: number, _v: SeriesData): BaseSeries {
    return this
  }

  get(_index: number): SeriesData {
    return NaN
  }

  map<T>(callback: (v: SeriesData, i: number) => T): T[] {
    return this.values.map((x, i) => callback(x, i))
  }

  filter(_idx: number[]): BaseSeries {
    return this
  }

  copy(): BaseSeries {
    return this
  }
}

export const EMPTY_SERIES = new BaseSeries()
