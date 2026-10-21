/* eslint-disable @typescript-eslint/no-unused-vars */

import { Index, type IndexFromType, type Shape } from '.'

import { makeUuid } from '../id'
import { whereStrStartsWith } from '../math/where'
import { Cell, cellStr, IndexId } from './cell'
import { DataSeries } from './data-series'
import { ISeriesOptions, Series, type SeriesFromType } from './series'

// The default name of a sheet and useful for checking if
// table has been properly initialized with real data
export const DEFAULT_SHEET_NAME = 'Sheet 1'
//export const DEFAULT_TABLE_NAME = 'Table 1'

export const DEFAULT_COLUMN_NAMES = 'Column Names'

// For specifying a location in the dataframe
export type LocType = string | number | (number | string)[]

export type SheetId = string | number

export type TableInput =
  | BaseTable
  | readonly Index<Cell>[]
  | readonly Series<Cell, Cell>[]
  | readonly Cell[]
  | readonly Cell[][]

export interface IDataFrameOptions extends ISeriesOptions {
  data?: TableInput
  columns?: IndexFromType | undefined
  //indexName?: string
}

export const NO_SHAPE: Shape = [-1, -1]

export type ApplySeriesFunc = (v: Cell, row: number, col: number) => Cell
export type ApplyRowFunc = (v: Cell[], row: number) => Cell

export type AxisMapFunc<T> = (data: Cell[], index: number) => T

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

  /**
   * Set the name of the table.
   *
   * @param name  the new name of the table
   * @param opts  options for setting the name:
   *              { inplace?: boolean }, where `inplace` determines if the change
   *              should be applied to the current table or a copy.
   * @returns     the table with the updated name
   */
  setName(name: string, opts: { inplace?: boolean } = {}): BaseTable {
    const { inplace = true } = opts
    const df = inplace ? this : this.copy()
    df._name = name
    return df
  }

  /**
   * Return a transpose of the matrix
   */
  abstract get t(): BaseTable

  /**
   * Return a copy of the table. Tables are designed to be immutable,
   * so this allows for safe modifications without affecting
   * the original instance. Note that some methods do allow inplace
   * modifications to reduce memory usage.
   */
  abstract copy(): BaseTable

  /**
   * Return a copy of the matrix with the data portion replaced
   * so that we can keep indexes etc.
   *
   * @param data
   * @returns
   */
  abstract copyReplaceData(data: TableInput): BaseTable

  colName(index: number): string {
    return this.cols[index].name
  }

  /**
   * Get the names of the columns as an index.
   */
  abstract get columns(): Index<Cell>

  /**
   * Get the names of the columns as an array of strings.
   */
  get colNames(): readonly string[] {
    return this.columns.strs
  }

  abstract setColNames(
    index: IndexFromType,
    opts?: { inplace?: boolean }
  ): BaseTable

  abstract col(col: IndexId): Series<Cell, Cell>

  colValues(c: IndexId): readonly Cell[] {
    return this.col(c).values
  }

  abstract setCol(
    col: IndexId,
    data: SeriesFromType,
    opts?: { inplace?: boolean }
  ): BaseTable

  abstract get(row: IndexId, col: IndexId): Cell

  str(row: IndexId, col: IndexId): string {
    return cellStr(this.get(row, col))
  }

  abstract get values(): readonly Cell[][]

  abstract row(row: IndexId): Series<Cell, Cell>

  rowValues(c: IndexId): readonly Cell[] {
    return this.row(c).values
  }

  abstract setRow(
    row: IndexId,
    data: SeriesFromType,
    opts?: { inplace?: boolean }
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
  abstract set(
    row: IndexId,
    col: IndexId,
    v: Cell,
    opts?: { inplace?: boolean }
  ): BaseTable

  abstract get cols(): readonly Series<Cell, Cell>[]

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
  abstract map<T>(f: (v: Cell, row: number, col: number) => T): T[][]

  /**
   *  Apply a function to all data values in the matrix and return a new dataframe.
   *
   * @param f
   * @returns
   */
  apply(f: (v: Cell, row: number, col: number) => Cell): BaseTable {
    const data = this.map(f)

    return this.copyReplaceData(data)
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

  rowApply(f: ApplyRowFunc): Series<Cell, Cell> {
    const data = this.rowMap(f)

    return new DataSeries(data)
  }

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
    rows?: LocType
    cols?: LocType
  } = {}): BaseTable {
    return this
  }

  abstract max(): number

  abstract min(): number

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
  series: Series<Cell, Cell>,
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
export function shape(data: TableInput): Shape {
  const isSeries = data[0] instanceof Series

  if (isSeries) {
    if (!(data as unknown[]).every((d) => d instanceof Series)) {
      throw new Error(
        'All columns must be a series if the first column is a series'
      )
    }

    return [(data[0] as Series<Cell, Cell>).length, data.length]
  }

  // single seriesdata
  if (!Array.isArray(data[0])) {
    return [data.length, 1]
  }

  // normal 2d data
  return [data.length, (data[0] as Cell[]).length]
}
