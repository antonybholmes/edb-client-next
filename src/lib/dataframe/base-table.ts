/* eslint-disable @typescript-eslint/no-unused-vars */

import { range } from '@/lib/math/range'

import { DataIndex, Index, type IndexFromType, type Shape } from '.'

import { cellStr } from './cell'

import { makeUuid } from '../id'
import { whereStrStartsWith } from '../math/where'
import {
  BaseSeries,
  DataSeries,
  ISeriesOptions,
  type SeriesFromType,
} from './series'
import type { IndexId, SeriesData } from './series-data'

// The default name of a sheet and useful for checking if
// table has been properly initialized with real data
export const DEFAULT_SHEET_NAME = 'Sheet 1'
//export const DEFAULT_TABLE_NAME = 'Table 1'

export const DEFAULT_COLUMN_INDEX_NAME = 'Column Names'

// For specifying a location in the dataframe
export type LocType = string | number | (number | string)[]

export type SheetId = string | number

export type DataFrameInput =
  | readonly Index<SeriesData>[]
  | readonly BaseSeries<SeriesData>[]
  | readonly SeriesData[]
  | readonly SeriesData[][]

export interface IDataFrameOptions extends ISeriesOptions {
  data?: DataFrameInput
  columns?: IndexFromType | undefined
  indexName?: string
}

export const NO_SHAPE: Shape = [-1, -1]

export type ApplySeriesFunc = (
  v: SeriesData,
  row: number,
  col: number
) => SeriesData
export type ApplyRowFunc = (v: SeriesData[], row: number) => SeriesData

export type AxisMapFunc<T> = (data: SeriesData[], index: number) => T

export abstract class BaseTable {
  protected _name: string
  private _id: string

  constructor(opts: { name?: string } = {}) {
    const { name } = opts
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
    return 'table'
  }

  setName(name: string, inplace: boolean = true): BaseTable {
    const df = inplace ? this : this.copy()
    df._name = name
    return df
  }

  /**
   * Return a transpose of the matrix
   */
  abstract get t(): BaseTable

  abstract copy(): BaseTable

  /**
   * Return a copy of the matrix with the data portion replaced
   * so that we can keep indexes etc.
   *
   * @param data
   * @returns
   */
  abstract replace(data: DataFrameInput): BaseTable

  abstract col(col: IndexId): BaseSeries<SeriesData>

  colValues(c: IndexId): SeriesData[] {
    return this.col(c).values
  }

  abstract setCol(
    col: IndexId,
    data: SeriesFromType,
    inplace: boolean
  ): BaseTable

  abstract get(row: IndexId, col: IndexId): SeriesData

  str(row: IndexId, col: IndexId): string {
    return cellStr(this.get(row, col))
  }

  abstract get values(): SeriesData[][]

  abstract row(row: IndexId): BaseSeries<SeriesData>

  rowValues(c: IndexId): SeriesData[] {
    return this.row(c).values
  }

  abstract setRow(
    row: IndexId,
    data: SeriesFromType,
    inplace: boolean
  ): BaseTable

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
  ): BaseTable

  abstract get cols(): readonly BaseSeries<SeriesData>[]

  colName(index: number): string {
    return this.cols[index].name
  }

  /**
   * Get the names of the columns as an index.
   */
  get columns(): Index<SeriesData> {
    return new DataIndex(range(this.shape[1]).map((c) => this.colName(c)))
  }

  /**
   * Get the names of the columns as an array of strings.
   */
  get colNames(): readonly string[] {
    return this.columns.strs
  }

  abstract setColNames(index: IndexFromType, inplace: boolean): BaseTable

  abstract get shape(): Shape

  get length(): number {
    const s = this.shape
    return s[0] * s[1]
  }

  /**
   * Synonym for length
   */
  get size(): number {
    return this.length
  }

  /**
   * Apply a function to all data values in the matrix
   *
   * @param f
   * @returns
   */
  abstract map<T>(f: (v: SeriesData, row: number, col: number) => T): T[][]

  /**
   *  Apply a function to all data values in the matrix and return a new dataframe.
   * @param f
   * @returns
   */
  apply(f: (v: SeriesData, row: number, col: number) => SeriesData): BaseTable {
    const data = this.map(f)

    return this.replace(data)
  }

  /**
   * Apply a function to each row to transform them.
   *
   * @param _f
   * @returns a list of T the size of the number of rows.
   */
  rowMap<T>(f: AxisMapFunc<T>): T[] {
    return this.values.map((row, ri) => f(row, ri))
  }

  rowApply(f: ApplyRowFunc): BaseSeries<SeriesData> {
    const data = this.rowMap(f)

    return new DataSeries(data)
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
  colMap<T>(f: AxisMapFunc<T>): T[] {
    return this.t.rowMap(f)
  }

  iloc({}: {
    rows?: LocType | undefined
    cols?: LocType | undefined
  } = {}): BaseTable {
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

export interface IDFToStrOpts {
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
function dfToStr(df: BaseTable, options: IDFToStrOpts = {}): string {
  const { sep = '\t', header = true, dp = 4 } = { ...options }

  let ret: string[] = new Array(df.shape[0])

  //if (index) {
  for (let i = 0; i < df.shape[0]; i++) {
    ret[i] = df
      .row(i)!
      .values.map((v) => cellStr(v, { dp }))
      .join(sep)
  }

  // add header if required
  if (header) {
    ret = [df.colNames.join(sep)].concat(ret)
  }

  return ret.join('\n')
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
  series: BaseSeries<SeriesData>,
  row: IndexId,
  opts: { caseInsensitive?: boolean } = {}
): number[] {
  if (typeof row === 'number') {
    return row > -1 && row < series.values.length ? [row] : []
  }

  return whereStrStartsWith(series.strs, row.toString(), opts)
}

/**
 * Given a DataFrame input, return its shape.
 *
 * @param data
 * @returns
 */
export function shape(data: DataFrameInput): Shape {
  const isSeries = data[0] instanceof BaseSeries

  if (isSeries) {
    if (!data.every((d) => d instanceof BaseSeries)) {
      throw new Error(
        'All columns must be a series if the first column is a series'
      )
    }

    return [(data[0] as BaseSeries<SeriesData>).length, data.length]
  }

  // single seriesdata
  if (!Array.isArray(data[0])) {
    return [data.length, 1]
  }

  // normal 2d data
  return [data.length, (data[0] as SeriesData[]).length]
}
