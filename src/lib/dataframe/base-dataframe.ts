/* eslint-disable @typescript-eslint/no-unused-vars */

import { rangeMap } from '@/lib/math/range'

import { Index, type IndexFromType } from '.'

import { cellStr } from './cell'

import {
  whereStrExact,
  whereStrMatches,
  whereStrStartsWith,
} from '../math/where'
import { BaseTable, IDFToStrOpts, LocType } from './base-table'
import type { Cell, IndexId } from './cell'
import { Series } from './series'

export abstract class BaseDataFrame extends BaseTable {
  constructor(opts: { name?: string } = {}) {
    super(opts)
  }

  override get type(): string {
    return 'dataframe'
  }

  /**
   * Return a copy of the dataframe. This redefines
   * the copy method from BaseTable to return a BaseDataFrame.
   */
  abstract copy(): BaseDataFrame

  override iloc({
    rows,
    cols,
  }: { rows?: LocType; cols?: LocType } = {}): BaseDataFrame {
    return this
  }

  abstract setIndex(
    index: IndexFromType,
    opts?: { inplace?: boolean }
  ): BaseDataFrame

  abstract setIndexName(
    name: string,
    opts?: { inplace?: boolean }
  ): BaseDataFrame

  abstract get index(): Index<Cell>

  rowName(index: number): string {
    return cellStr(this.index.at(index))
  }

  get rowNames(): readonly string[] {
    return rangeMap((c) => this.rowName(c), 0, this.shape[0])
  }

  toCsv(options: IDFToStrOpts = {}): string {
    return dfToStr(this, options)
  }
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
      ...df.row(i)!.values.map((v) => cellStr(v, { dp })),
    ].join(sep)
  }

  // add header if required
  if (header) {
    ret = [df.colNames.join(sep)].concat(ret)
  }

  return ret.join('\n')
}

/**
 * Finds the index of a row by.
 *
 * @param df
 * @param row
 * @param lc
 * @returns
 */
export function findRows(
  df: BaseDataFrame,
  row: IndexId,
  opts: { caseInsensitive?: boolean } = {}
): number[] {
  if (typeof row === 'number') {
    return row > -1 && row < df.shape[0] ? [row] : []
  }

  return df.index.indexOf(row.toString(), opts)
}

export function findCols(
  df: BaseDataFrame,
  col: IndexId | RegExp,
  opts: { caseInsensitive?: boolean; exact?: boolean } = {}
): number[] {
  const { caseInsensitive = true, exact = false } = opts

  if (typeof col === 'number') {
    return col > -1 && col < df.shape[1] ? [col] : []
  }

  if (col instanceof RegExp) {
    return whereStrMatches(df.colNames, col, caseInsensitive)
  }

  return exact
    ? whereStrExact(df.colNames, col.toString(), opts)
    : whereStrStartsWith(df.colNames, col.toString(), opts)
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

export function findRow(
  df: BaseDataFrame,
  row: IndexId,
  opts: { caseInsensitive?: boolean } = {}
): number {
  const idx = findRows(df, row, opts)

  return idx.length > 0 ? idx[0]! : -1
}

/**
 * Find the index of a column in a DataFrame by its name or index.
 * Returns the first matching index or -1 if not found.
 * @param df
 * @param col
 * @param caseInsensitive
 * @returns
 */
export function findCol(
  df: BaseDataFrame,
  col: IndexId | RegExp,
  options: { caseInsensitive?: boolean; exact?: boolean } = {}
): number {
  const idx = findCols(df, col, options)

  return idx.length > 0 ? idx[0]! : -1
}
