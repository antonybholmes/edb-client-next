/* eslint-disable @typescript-eslint/no-unused-vars */

import { range, rangeMap } from '@/lib/math/range'

import type { Index, IndexFromType, IndexId, SeriesData, Shape } from '.'

import { cellStr } from './cell'

import { makeUuid } from '../id'
import { whereStartsWith } from '../math/where'
import { BaseSeries, DataSeries, type SeriesFromType } from './series'

// The default name of a sheet and useful for checking if
// table has been properly initialized with real data
export const DEFAULT_SHEET_NAME = 'Sheet1'
//export const DEFAULT_TABLE_NAME = 'Table 1'

export const DEFAULT_COLUMN_INDEX_NAME = 'Column Names'

// For specifying a location in the dataframe
export type LocType = string | number | (number | string)[]

export type SheetId = string | number

export const NO_SHAPE: Shape = [-1, -1]

export type ApplySeriesFunc = (
  v: SeriesData,
  row: number,
  col: number
) => SeriesData
export type ApplyRowFunc = (v: SeriesData[], row: number) => SeriesData

export type AxisMapFunc<T> = (data: SeriesData[], index: number) => T

export abstract class BaseDataFrame {
  protected _name: string
  private _id: string

  constructor(name: string = '') {
    this._id = makeUuid()
    this._name = name
  }

  get id(): string {
    return this._id
  }

  get name(): string {
    return this._name
  }

  get type(): string {
    return 'dataframe'
  }

  setName(name: string, inplace: boolean = true): BaseDataFrame {
    const df = inplace ? this : this.copy()
    df._name = name
    return df
  }

  /**
   * Return a transpose of the matrix
   */
  abstract get t(): BaseDataFrame

  abstract copy(): BaseDataFrame

  /**
   * Return a copy of the matrix with the data portion replaced
   * so that we can keep indexes etc.
   *
   * @param data
   * @returns
   */
  abstract replace(
    data: SeriesData[] | SeriesData[][] | BaseSeries
  ): BaseDataFrame

  abstract col(col: IndexId): BaseSeries

  colValues(c: IndexId): SeriesData[] {
    return this.col(c).values
  }

  abstract setCol(
    col: IndexId,
    data: SeriesFromType,
    inplace: boolean
  ): BaseDataFrame

  abstract get(row: IndexId, col: IndexId): SeriesData

  str(row: IndexId, col: IndexId): string {
    return cellStr(this.get(row, col))
  }

  abstract get values(): SeriesData[][]

  abstract row(row: IndexId): BaseSeries

  rowValues(c: IndexId): SeriesData[] {
    return this.row(c).values
  }

  abstract setRow(
    row: IndexId,
    data: SeriesFromType,
    inplace: boolean
  ): BaseDataFrame

  /**
   * Update the dataframe at a specific location. This is different f
   * rom set in that it is for updating a single cell and not an
   * entire row or column.
   *
   * @param row     a row index or name to update
   * @param col     a column index or name to update
   * @param v       the value to update the cell with.
   * @param inplace whether to update the dataframe in place or return a new one
   *                with the update. This is true by default to reduce memory usage
   *                when doing multiple updates in a row.
   */
  abstract at(
    row: IndexId,
    col: IndexId,
    v: SeriesData,
    inplace: boolean
  ): BaseDataFrame

  abstract setIndex(index: IndexFromType, inplace: boolean): BaseDataFrame

  abstract setIndexName(name: string, inplace: boolean): BaseDataFrame

  // setCols(columns: IndexFromType): BaseDataFrame {
  //   return this
  // }

  abstract get index(): Index

  rowName(index: number): string {
    return cellStr(this.index.get(index))
  }

  get rowNames(): string[] {
    return rangeMap(c => this.rowName(c), 0, this.shape[0])
  }

  //abstract get columns(): Index

  abstract get cols(): BaseSeries[]

  colName(index: number): string {
    return this.columns[index] ?? ''
  }

  /**
   * Get the names of the columns
   */
  get columns(): string[] {
    return range(this.shape[1]).map(c => this.colName(c))
  }

  abstract setColNames(index: IndexFromType, inplace: boolean): BaseDataFrame

  abstract get shape(): Shape

  get size(): number {
    const s = this.shape
    return s[0] * s[1]
  }

  /**
   * Apply a function to all data values in the matrix
   *
   * @param f
   * @returns
   */
  abstract map<T>(f: (v: SeriesData, row: number, col: number) => T): T[][]

  apply(
    f: (v: SeriesData, row: number, col: number) => SeriesData
  ): BaseDataFrame {
    const data = this.map(f)

    return this.replace(data)
  }

  /**
   * Apply a function to each row to transform them.
   *
   * @param _f
   * @returns a list of T the size of the number of rows.
   */
  rowMap<T>(_f: AxisMapFunc<T>): T[] {
    return []
  }

  rowApply(f: ApplyRowFunc): BaseSeries {
    const data = this.rowMap(f)

    return new DataSeries(data, { index: this.index })
  }

  /**
   * Apply a function to each
   * @param f
   * @returns
   */

  // colApply(f: (row: SeriesType[], index: number) => SeriesType): BaseDataFrame {
  //   return this
  // }

  /**
   * Apply a function to each column to transform them.
   *
   * @param _f
   * @returns
   */
  colMap<T>(_f: AxisMapFunc<T>): T[] {
    return []
  }

  iloc({}: {
    rows?: LocType | undefined
    cols?: LocType | undefined
  } = {}): BaseDataFrame {
    return this
  }

  abstract max(): number

  abstract min(): number

  // isin(_rows: LocType = ':', _cols: LocType = ':'): BaseDataFrame {
  //   return this
  // }

  toString(): string {
    return this.toCsv()
  }

  toCsv(options: IDFToStrOpts = {}): string {
    return dfToStr(this, options)
  }
}

interface IDFToStrOpts {
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
function dfToStr(df: BaseDataFrame, options: IDFToStrOpts = {}): string {
  const { sep = '\t', index = true, header = true, dp = 4 } = { ...options }

  let ret: string[] = new Array(df.shape[0])

  //if (index) {
  for (let i = 0; i < df.shape[0]; i++) {
    ret[i] = [
      ...(index ? [df.rowName(i)] : []),
      ...df.row(i)!.values.map(v => cellStr(v, { dp })),
    ].join(sep)
  }
  // } else {
  //   ret = rangeMap(
  //     ri =>
  //       df
  //         .row(ri)!
  //         .values.map(v => cellStr(v))
  //         .join(sep),
  //     df.shape[0]
  //   )
  // }

  // add header if required
  if (header) {
    ret = [df.columns.join(sep)].concat(ret)
  }

  return ret.join('\n')
}

export function shape(
  data: SeriesData[] | SeriesData[][] | BaseDataFrame | BaseSeries
): Shape {
  if (data instanceof BaseDataFrame || data instanceof BaseSeries) {
    return data.shape
  } else {
    if (data.length > 0 && Array.isArray(data[0]!)) {
      return [data.length, data[0].length]
    } else {
      return [data.length, 1]
    }
  }
}

/**
 * Finds the index of a row by
 * @param df
 * @param row
 * @param lc
 * @returns
 */
export function findRows(
  df: BaseDataFrame,
  row: IndexId,
  caseInsensitive: boolean = true
): number[] {
  if (typeof row === 'number') {
    return row > -1 && row < df.shape[0] ? [row] : []
  }

  return df.index.find(row.toString(), caseInsensitive) //    whereStartsWith(df.index.strs, row.toString(), lc)

  // let s = row.toString()

  // if (lc) {
  //   s = s.toLowerCase()
  // }

  // return where(df.rowNames, x =>
  //   lc ? x.toString().toLowerCase().startsWith(s) : x.toString().startsWith(s)
  // )

  // const ret: number[] = []

  // let s = row.toString()

  // if (lc) {
  //   s = s.toLowerCase()

  //   for (const [ci, c] of df.rowNames.entries()) {
  //     if (c.toLowerCase().startsWith(s)) {
  //       ret.push(ci)
  //     }
  //   }
  // } else {
  //   for (const [ci, c] of df.rowNames.entries()) {
  //     if (c.startsWith(s)) {
  //       ret.push(ci)
  //     }
  //   }
  // }

  // return ret
}

export function findCols(
  df: BaseDataFrame,
  col: IndexId,
  lc: boolean = true
): number[] {
  if (typeof col === 'number') {
    return col > -1 && col < df.shape[1] ? [col] : []
  }

  return whereStartsWith(df.columns, col.toString(), lc)
}

/**
 * Search a series and find all indices matching
 * the search criteria
 *
 * @param series
 * @param row
 * @param caseInsensitive
 * @returns
 */
export function findInSeries(
  series: BaseSeries,
  row: IndexId,
  caseInsensitive: boolean = true
): number[] {
  if (typeof row === 'number') {
    return row > -1 && row < series.values.length ? [row] : []
  }

  return whereStartsWith(series.strs, row.toString(), caseInsensitive)

  // let s = row.toString()

  // if (lc) {
  //   s = s.toLowerCase()
  // }

  // return where(series.values, x =>
  //   lc ? x.toString().toLowerCase().startsWith(s) : x.toString().startsWith(s)
  // )

  // const ret: number[] = []

  // let s = row.toString()

  // if (lc) {
  //   s = s.toLowerCase()

  //   for (const [ci, c] of series.values.entries()) {
  //     if (c.toString().toLowerCase().startsWith(s)) {
  //       ret.push(ci)
  //     }
  //   }
  // } else {
  //   for (const [ci, c] of series.values.entries()) {
  //     if (c.toString().startsWith(s)) {
  //       ret.push(ci)
  //     }
  //   }
  // }

  // return ret
}

export function findRow(
  df: BaseDataFrame,
  row: IndexId,
  caseInsensitive: boolean = true
): number {
  const idx = findRows(df, row, caseInsensitive)

  return idx.length > 0 ? idx[0]! : -1
}

export function findCol(
  df: BaseDataFrame,
  col: IndexId,
  caseInsensitive: boolean = true
): number {
  const idx = findCols(df, col, caseInsensitive)

  return idx.length > 0 ? idx[0]! : -1
}
