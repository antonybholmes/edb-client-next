import { BaseDataFrame } from './base-dataframe'

import { LocType } from './base-table'
import type { Cell } from './cell'
import { EmptySeries } from './empty-series'
import { EmptyNumIndex, ExcelIndex, Index, type Shape } from './index'
import { Series } from './series'

export class EmptyDataFrame extends BaseDataFrame {
  _index: Index<number>

  _columns: Index<Cell>
  _shape: Shape

  constructor(shape: Shape) {
    super()

    this._shape = shape
    this._index = new EmptyNumIndex(shape[0])
    this._columns = new ExcelIndex(shape[1])
  }

  override setName(): EmptyDataFrame {
    return this
  }

  override setCol(): EmptyDataFrame {
    return this
  }

  override col(): Series<number, Cell> {
    return new EmptySeries(this.shape[0])
  }

  override get(): Cell {
    return null
  }

  /**
   * Return the data of a particular row.
   *
   * @param row
   * @returns
   */
  override row(): Series<number, Cell> {
    return new EmptySeries(this.shape[1])
  }

  override setRow(): EmptyDataFrame {
    return this
  }

  override set(): EmptyDataFrame {
    return this
  }

  override setIndex(): EmptyDataFrame {
    return this
  }

  override setIndexName(): EmptyDataFrame {
    return this
  }

  override get index(): Index<Cell> {
    return this._index
  }

  override get columns(): Index<Cell> {
    return this._columns
  }

  override setColNames(): EmptyDataFrame {
    return this
  }

  override get cols(): Series<number, Cell>[] {
    return []
  }

  override get shape(): Shape {
    return [this._index.length, this._columns.length]
  }

  override get values(): Cell[][] {
    return []
  }

  override apply(
    f: (v: Cell, row: number, col: number) => Cell
  ): EmptyDataFrame {
    return this
  }

  override map<T>(f: (v: Cell, row: number, col: number) => T): T[][] {
    return []
  }

  override rowMap<T>(f: (row: Cell[], index: number) => T): T[] {
    return []
  }

  override colMap<T>(f: (col: Cell[], index: number) => T): T[] {
    return []
  }

  override iloc({}: { rows?: LocType; cols?: LocType } = {}): EmptyDataFrame {
    return this
  }

  override min(): number {
    return Number.MAX_VALUE
  }

  override max(): number {
    return Number.MIN_VALUE
  }

  // override isin(rows: LocType = ':', cols: LocType = ':'): BaseDataFrame {
  //   return _isin(this, rows, cols)
  // }

  override get t(): EmptyDataFrame {
    const ret = new EmptyDataFrame([this.shape[1], this.shape[0]])

    return ret
  }

  override copy(): EmptyDataFrame {
    return this
  }

  override copyReplaceData(): EmptyDataFrame {
    return this
  }
}
