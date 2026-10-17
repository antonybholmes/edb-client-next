/* eslint-disable @typescript-eslint/no-unused-vars */

import { rangeMap } from '@/lib/math/range'

import { Index, type IndexFromType, type Shape } from '.'

import { cellStr } from './cell'

import {
  whereStrExact,
  whereStrMatches,
  whereStrStartsWith,
} from '../math/where'
import { Annotations, ColAnnotations, DEFAULT_NAME } from './annotations'
import { BaseTable, IDFToStrOpts } from './base-table'
import { BaseSeries } from './series'
import type { IndexId, SeriesData } from './series-data'

export abstract class BaseDataFrame extends BaseTable {
  private _shape: Shape
  private _rowIndex: Annotations
  private _colIndex: Annotations

  constructor(
    shape: Shape,
    index: IndexFromType,
    columns: IndexFromType,
    opts: { name?: string } = {}
  ) {
    super(opts)

    this._shape = shape
    this._rowIndex = new Annotations(shape[0])
    this._colIndex = new ColAnnotations(shape[1])
    this._rowIndex.set(DEFAULT_NAME, index)
    this._colIndex.set(DEFAULT_NAME, columns)
  }

  override get type(): string {
    return 'dataframe'
  }

  override get shape(): Shape {
    return this._shape
  }

  abstract setIndex(index: IndexFromType, inplace: boolean): BaseDataFrame

  abstract setIndexName(name: string, inplace: boolean): BaseDataFrame

  get index(): Index<SeriesData> {
    return this._rowIndex.get('index')
  }

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
    ret = [df.columns.strs.join(sep)].concat(ret)
  }

  return ret.join('\n')
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
  opts: { caseInsensitive?: boolean } = {}
): number[] {
  //console.log('find row', row, df.shape, caseInsensitive)
  if (typeof row === 'number') {
    return row > -1 && row < df.shape[0] ? [row] : []
  }

  return df.index.indexOf(row.toString(), opts) //    whereStartsWith(df.index.strs, row.toString(), lc)

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
  col: IndexId | RegExp,
  opts: { caseInsensitive?: boolean; exact?: boolean } = {}
): number[] {
  const { caseInsensitive = true, exact = false } = opts

  if (typeof col === 'number') {
    return col > -1 && col < df.shape[1] ? [col] : []
  }

  if (col instanceof RegExp) {
    return whereStrMatches(df.columns.strs, col, caseInsensitive)
  }

  return exact
    ? whereStrExact(df.columns.strs, col.toString(), opts)
    : whereStrStartsWith(df.columns.strs, col.toString(), opts)
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
