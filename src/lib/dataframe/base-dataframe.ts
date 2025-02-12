/* eslint-disable @typescript-eslint/no-unused-vars */

import { range, rangeMap } from '@lib/math/range'

import { nanoid } from '../utils'
import { EMPTY_SERIES, type BaseSeries } from './base-series'
import { cellStr } from './cell'
import type { IndexData, SeriesData, Shape } from './dataframe-types'
import { EXCEL_INDEX, Index, NUM_INDEX, type IndexFromType } from './index'

export const DEFAULT_INDEX_NAME = 'id'
// The default name of a sheet and useful for checking if
// table has been properly initialized with real data
export const DEFAULT_SHEET_NAME = 'Sheet 1'

// For specifying a location in the dataframe
export type LocType = string | number | (number | string)[]

export type SheetId = string | number

export const NO_SHAPE: Shape = [-1, -1]

export class BaseDataFrame {
  protected _name: string
  private _id: string

  constructor(name: string = '') {
    this._id = nanoid()
    this._name = name
  }

  get id(): string {
    return this._id
  }

  get name(): string {
    return this._name
  }

  setName(_name: string, _inplace: boolean = true): BaseDataFrame {
    return this
  }

  /**
   * Return a transpose of the matrix
   */
  t(): BaseDataFrame {
    return this
  }

  copy(): BaseDataFrame {
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // addRow(col: BaseSeries): BaseDataFrame {
  //   return this
  // }

  // addCol(data: BaseSeries): BaseDataFrame {
  //   return this.setCol(-1, data)
  // }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  col(_col: IndexData): BaseSeries {
    return EMPTY_SERIES
  }

  setCol(
    _col: IndexData = -1,
    _data: BaseSeries | SeriesData[]
  ): BaseDataFrame {
    return this
  }

  get(_row: number, _col: number): SeriesData {
    return NaN
  }

  get values(): SeriesData[][] {
    return []
  }

  row(
    // @ts-ignore
    row: IndexData
  ): BaseSeries {
    return EMPTY_SERIES
  }

  setRow(
    row: IndexData = -1,

    data: BaseSeries | SeriesData[],

    inplace = true
  ): BaseDataFrame {
    return this
  }

  set(row: number, col: number, v: SeriesData): BaseDataFrame {
    return this
  }

  setIndex(index: IndexFromType, inplace: boolean = false): BaseDataFrame {
    return this
  }

  // setCols(columns: IndexFromType): BaseDataFrame {
  //   return this
  // }

  get index(): Index {
    return NUM_INDEX
  }

  getRowName(index: number): string {
    return cellStr(this.index.get(index))
  }

  get rowNames(): string[] {
    return rangeMap((c) => this.getRowName(c), 0, this.shape[0])
  }

  get cols(): BaseSeries[] {
    return []
  }

  get columns(): Index {
    return EXCEL_INDEX
  }

  colName(index: number): string {
    return this.columns.get(index).toString()

    // const idx = _findCol(this, col)

    // if (idx.length === 0) {
    //   throw new Error('invalid column')
    // }

    // return this.columns.getName(idx[0]!)
  }

  /**
   * Get the names of the columns
   */
  get colNames(): string[] {
    return range(this.shape[1]).map((c) => this.colName(c))
  }

  setColNames(_index: IndexFromType, _inplace: boolean = false): BaseDataFrame {
    return this
  }

  get shape(): Shape {
    return NO_SHAPE
  }

  get size(): number {
    const s = this.shape
    return s[0] * s[1]
  }

  apply(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _f: (v: SeriesData, row: number, col: number) => SeriesData
  ): BaseDataFrame {
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  map<T>(_f: (v: SeriesData, row: number, col: number) => T): T[][] {
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  rowApply(
    _f: (row: SeriesData[], index: number) => SeriesData
  ): BaseDataFrame {
    return this
  }

  /**
   * Apply a function to each row to transform them.
   *
   * @param _f
   * @returns a list of T the size of the number of rows.
   */
  rowMap<T>(_f: (row: SeriesData[], index: number) => T): T[] {
    return []
  }

  /**
   * Apply a function to each
   * @param f
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // colApply(f: (row: SeriesType[], index: number) => SeriesType): BaseDataFrame {
  //   return this
  // }

  /**
   * Apply a function to each column to transform them.
   *
   * @param _f
   * @returns
   */
  colMap<T>(_f: (col: SeriesData[], index: number) => T): T[] {
    return []
  }

  iloc(_rows: LocType = ':', _cols: LocType = ':'): BaseDataFrame {
    return this
  }

  isin(rows: LocType = ':', cols: LocType = ':'): BaseDataFrame {
    return this
  }

  toString(): string {
    return this.toCsv()
  }

  toCsv(options: IDataFrameToStringOpts = {}): string {
    return toString(this, options)
  }
}

export function _findRow(
  df: BaseDataFrame,
  row: IndexData,
  lc: boolean = true
): number[] {
  if (typeof row === 'number') {
    return [row]
  }

  const ret: number[] = []

  let s = row.toString()

  if (lc) {
    s = s.toLowerCase()

    for (const c of range(df.shape[0])) {
      if (df.getRowName(c).toLowerCase().startsWith(s)) {
        ret.push(c)
      }
    }
  } else {
    for (const c of range(df.shape[1])) {
      if (df.getRowName(c).startsWith(s)) {
        ret.push(c)
      }
    }
  }

  return ret
}

export function _findCol(
  df: BaseDataFrame,
  col: IndexData,
  lc: boolean = true
): number[] {
  if (typeof col === 'number') {
    return [col]
  }

  const ret: number[] = []

  let s = col.toString()

  if (lc) {
    s = s.toLowerCase()

    for (const c of range(df.shape[1])) {
      if (df.colName(c).toLowerCase().startsWith(s)) {
        ret.push(c)
      }
    }
  } else {
    for (const c of range(df.shape[1])) {
      if (df.colName(c).startsWith(s)) {
        ret.push(c)
      }
    }
  }

  return ret
}

interface IDataFrameToStringOpts {
  sep?: string
  dp?: number
  index?: boolean
  header?: boolean
}

/**
 * Returns a string representation of a table for downloading
 *
 * @param df table
 * @param dp precision of numbers
 * @returns
 */
function toString(
  df: BaseDataFrame,
  options: IDataFrameToStringOpts = {}
): string {
  const { sep = '\t', index = true, header = true } = { ...options }

  let ret: string[] = []

  if (index) {
    ret = rangeMap(
      (ri) =>
        [df.getRowName(ri)]
          .concat(df.row(ri)!.values.map((v) => cellStr(v)))
          .join(sep),
      df.shape[0]
    )
  } else {
    ret = rangeMap(
      (ri) =>
        df
          .row(ri)!
          .values.map((v) => cellStr(v))
          .join(sep),
      df.shape[0]
    )
  }

  // add header if required
  if (header) {
    ret = [df.colNames.join(sep)].concat(ret)
  }

  return ret.join('\n')
}
