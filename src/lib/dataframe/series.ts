import { Index, type IIndexOptions, type IndexFromType } from '.'
import { BaseIndex } from './base-index'
import type { Cell } from './cell'

export type SeriesFromType = Series<Cell, Cell> | IndexFromType

export const DEFAULT_INDEX_NAME = 'Index'

export abstract class Series<
  I extends Cell,
  T extends Cell,
> extends BaseIndex<T> {
  constructor(opts: IIndexOptions = {}) {
    super(opts)
  }

  /**
   * Returns the index associated with this series
   */
  abstract get index(): Index<I>

  abstract setIndex(
    index: IndexFromType,
    opts?: { inplace?: boolean }
  ): Series<Cell, T>

  get uniq(): T[] {
    return [...new Set(this.values)].sort()
  }

  abstract set(index: number, v: T): Series<I, T>

  abstract filter(idx: number[]): Series<I, T>

  abstract copy(): Series<I, T>
}

export interface ISeriesOptions extends IIndexOptions {
  index?: IndexFromType
}
