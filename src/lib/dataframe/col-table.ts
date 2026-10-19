import { range } from '@/lib/math/range'

import { cellStr, makeCell } from './cell'

import {
  whereStrExact,
  whereStrMatches,
  whereStrStartsWith,
} from '../math/where'
import {
  BaseTable,
  DataFrameInput,
  IDataFrameOptions,
  LocType,
  shape,
} from './base-table'
import type { Cell, IndexId } from './cell'
import {
  DataIndex,
  Index,
  IndexFromType,
  NumInfIndex,
  Shape,
  shapesEqual,
  StringIndex,
} from './index'
import { DataSeries, Series, type SeriesFromType } from './series'

// export interface IColTableOptions extends ISeriesOptions {
//   index?: Index<SeriesData>
//   data?:
//     | SeriesData[]
//     | SeriesData[][]
//     | Index<SeriesData>[]
//     | BaseSeries<SeriesData>[]
//   columns?: IndexFromType
//   indexName?: string
// }

/**
 * A column oriented dataframe where the data is stored as a map of column name to series.
 * This is more efficient for column operations but less efficient for row operations
 * compared to a row oriented dataframe.
 */
export class ColTable extends BaseTable {
  _data: Index<Cell>[]

  constructor(options: IDataFrameOptions = {}) {
    let { name = '', data = [], columns } = options

    super({ name })

    if (data.length === 0) {
      throw new Error('data must be a non empty array or array of series')
    }

    //let cols: Index | null = null

    // if we supply columns as index clone as is

    // if (columns) {
    //   if (columns instanceof Index) {
    //     cols = columns.copy()
    //   } else {
    //     // create index
    //     cols = new DataIndex(columns)
    //   }
    // }

    // if an element is a series, then all elements must be series and we will create the dataframe column wise
    const isSeries = data.some((d: unknown) => d instanceof Series)

    if (isSeries && !data.every((d) => d instanceof Series)) {
      throw new Error(
        'All columns must be a series if the first column is a series'
      )
    }

    const isIndex = data.some((d: unknown) => d instanceof Index)

    if (isIndex && !data.every((d) => d instanceof Index)) {
      throw new Error(
        'All columns must be an index if the first column is an index'
      )
    }

    if (isSeries) {
      // array of series to be made column wise

      if (!columns) {
        columns = new StringIndex(
          data.map((c: unknown) => (c as Series<Cell>).name)
        )
      }

      this._data = (data as Series<Cell>[]).map((c: Series<Cell>) => c.index)
    } else if (isIndex) {
      // array of series to be made column wise

      this._data = data as Index<Cell>[]
    } else {
      // regular 2d array that is assumed row wise but will be stored column wise

      const row1 = data[0]! as Cell[]
      const colN = row1.length

      if (row1.length === 0) {
        throw new Error('data must be a non empty array')
      }

      this._data = new Array(row1.length) as Index<Cell>[]

      for (let col = 0; col < colN; col++) {
        const d = new Array(data.length) as Cell[]

        for (let row = 0; row < data.length; row++) {
          d[row] = (data as Cell[][])[row]![col]!
        }

        this._data[col] = new DataIndex(d)
      }
    }
  }

  override get cols(): Series<Cell>[] {
    return this._data.map((c) => new DataSeries(c))
  }

  override setCol(
    col: IndexId,
    data: SeriesFromType,
    inplace = true
  ): BaseTable {
    const d =
      data instanceof Series || data instanceof Index ? data.values : [...data]

    if (d.length !== this.shape[0]) {
      throw new Error('length of column data must equal the number of rows')
    }

    const df: ColTable = inplace ? this : (this.copy() as ColTable)

    const colIdx: number = findCol(df, col)

    if (colIdx !== -1) {
      df._data[colIdx] = new DataIndex(d)
    } else {
      // not in columns, add to end of columns and column map
      const colName = col.toString()

      df._data.push(new DataIndex(d, { name: colName }))
    }

    return df
  }

  override col(c: IndexId): Series<Cell> {
    const idx = findCol(this, c)

    if (idx === -1) {
      throw new Error(`${c} is an invalid column`)
    }

    const col = this._data[idx]!

    return new DataSeries(col, {
      name: col.name,
    })
  }

  override get colNames(): readonly string[] {
    return this._data.map((col) => col.name)
  }

  override get columns(): Index<Cell> {
    return new DataIndex(this.colNames)
  }

  override setColNames(
    index: IndexFromType,
    inplace: boolean = true
  ): BaseTable {
    if (index.length !== this._data.length) {
      throw new Error('columns length must match the number of columns in data')
    }

    const df: ColTable = inplace ? this : (this.copy() as ColTable)

    const names = [...index]

    for (let [ci, c] of df._data.entries()) {
      c.name = cellStr(names[ci])
    }

    return df
  }

  override get(row: IndexId, col: IndexId): Cell {
    const colIdx = findCol(this, col)

    if (colIdx === -1) {
      throw new Error(`${col} is an invalid column`)
    }

    if (typeof row === 'string') {
      throw new Error(`${row} is an invalid row`)
    }

    return this._data[colIdx]![row]!
  }

  /**
   * Return the data of a particular row.
   *
   * @param row
   * @returns
   */
  override row(row: IndexId): Series<Cell> {
    if (typeof row === 'string') {
      throw new Error('invalid row')
    }

    const data = new Array(this.shape[1]) as Cell[]

    for (let col = 0; col < this.shape[1]; col++) {
      data[col] = this._data[col]![row]!
    }

    return new DataSeries(data)
  }

  override setRow(
    row: IndexId,
    data: Cell[] | Series<Cell>,
    inplace = true
  ): ColTable {
    if (typeof row === 'string') {
      throw new Error('invalid row')
    }

    const d = data instanceof Series ? data.values : data

    if (d.length !== this.shape[1]) {
      throw new Error('length of row data must equal the number of columns')
    }

    const df: ColTable = inplace ? this : (this.copy() as ColTable)

    if (row < this.shape[0]) {
      for (let col = 0; col < this.shape[1]; col++) {
        df._data[col]![row] = d[col]!
      }
    } else {
      for (let col = 0; col < this.shape[1]; col++) {
        df._data[col] = new DataIndex([...df._data[col]!.values, d[col]!])
      }
    }

    return df
  }

  override at(
    row: IndexId,
    col: IndexId,
    v: Cell,
    inplace: boolean = true
  ): BaseTable {
    if (typeof row === 'string' || row < 0 || row >= this.shape[0]) {
      throw new Error(`${row} is an invalid row`)
    }

    if (row < 0 || row >= this.shape[0]) {
      throw new Error(`${row} is an invalid row`)
    }

    const df: ColTable = inplace ? this : (this.copy() as ColTable)

    const colIdx: number = findCol(df, col)

    if (colIdx === -1) {
      throw new Error(`${col} is an invalid column`)
    }

    df._data[colIdx]!.set(row, makeCell(v))

    return df
  }

  override get shape(): Shape {
    return [
      this._data[0]!.length,
      this._data.length, // ._data.length > 0 ? this._data[0]!.length : 0,
    ]
  }

  override get values(): Cell[][] {
    // return copy as we want dataframe to be immutable

    const data = new Array(this.shape[0]!) as Cell[][]

    for (let row = 0; row < this.shape[0]; row++) {
      const d = new Array(this._data.length) as Cell[]

      for (let col = 0; col < this._data.length; col++) {
        d[col] = this._data[col]!.at(row)
      }

      data[row] = d
    }

    return data
  }

  override apply(f: (v: Cell, row: number, col: number) => Cell): BaseTable {
    const data = this.map(f)

    const ret = new ColTable({
      name: this.name,
      data,
    })

    return ret
  }

  override map<T>(f: (v: Cell, row: number, col: number) => T): T[][] {
    const ret = new Array(this.shape[0]) as T[][]

    for (let row = 0; row < this.shape[0]; row++) {
      const d = new Array(this.shape[1]) as T[]

      for (let col = 0; col < this.shape[1]; col++) {
        d[col] = f(this._data[col]![row]!, row, col)
      }

      ret[row] = d
    }

    return ret
  }

  override iloc({
    rows,
    cols,
  }: { rows?: LocType; cols?: LocType } = {}): BaseTable {
    let rowIdx = _ilocDim(new NumInfIndex(this.shape[0]), rows)
    let colIdx = _ilocDim(new NumInfIndex(this.shape[1]), cols)

    const data = new Array(rowIdx.length) as Cell[][]

    for (let i = 0; i < rowIdx.length; i++) {
      const r = rowIdx[i]!

      const d = new Array(colIdx.length) as Cell[]

      for (let j = 0; j < colIdx.length; j++) {
        const c = colIdx[j]!

        d[j] = this._data[c]![r]!
      }

      data[i] = d
    }

    const ret = new ColTable({
      data,
      name: this.name,
    })

    return ret
  }

  override min(): number {
    let min = Number.MAX_VALUE

    for (const col of this._data) {
      for (const c of col) {
        if (typeof c === 'number') {
          min = Math.min(min, c)
        }
      }
    }

    return min
  }

  override max(): number {
    let max = Number.MIN_VALUE

    for (const col of this._data) {
      for (const c of col) {
        if (typeof c === 'number') {
          max = Math.max(max, c)
        }
      }
    }
    return max
  }

  // override isin(rows: LocType = ':', cols: LocType = ':'): BaseDataFrame {
  //   return _isin(this, rows, cols)
  // }

  override get t(): BaseTable {
    const rows = this.shape[0]
    const cols = this.shape[1]

    const data = new Array(cols) as Cell[][]

    for (let col = 0; col < cols; col++) {
      const d = new Array(rows) as Cell[]

      for (let row = 0; row < rows; row++) {
        d[row] = this._data[col]!.at(row)
      }

      data[col] = d
    }

    const ret = new ColTable({
      name: this.name,
      data,
    })

    return ret
  }

  override copy(): BaseTable {
    return new ColTable({
      name: this.name,
      data: this.cols.map((c) => c.copy()),
    })
  }

  override replaceData(data: DataFrameInput): BaseTable {
    if (!shapesEqual(shape(data), this.shape)) {
      throw new Error('replacement data must be same shape as matrix')
    }

    return new ColTable({
      name: this.name,
      data,
    })
  }
}

function _ilocDim(index: Index<Cell>, rows: LocType = ':'): number[] {
  let s: string
  let si: number
  let ei: number
  let t: string

  if (!Array.isArray(rows)) {
    rows = [rows]
  }

  let rowIdx: number[] = []

  for (const r of rows) {
    t = typeof r

    switch (t) {
      case 'number':
        rowIdx = [...rowIdx, r as number]
        break
      case 'string':
        s = r as string

        if (s === ':') {
          rowIdx = range(index.length)
        } else if (s.includes(':')) {
          // of the form ":<indices>"
          if (s.startsWith(':')) {
            si = 0
            s = s.slice(1)

            if (Number.isInteger(s)) {
              ei = Number.parseInt(s)

              rowIdx = [...rowIdx, ...range(ei)]
            }
          } else {
            // of the form "<indices>:"
            s = s.split(':')[0]!

            if (Number.isInteger(s)) {
              si = Number.parseInt(s)
              ei = index.length

              rowIdx = [...rowIdx, ...range(si, ei)]
            }
          }
        } else {
          rowIdx = [...rowIdx, ...index.indexOf(s)]
        }

        break
      default:
        break
    }
  }

  return rowIdx
}

export function findCol(
  df: ColTable,
  col: IndexId | RegExp,
  options: { caseInsensitive?: boolean; exact?: boolean } = {}
): number {
  const idx = findCols(df, col, options)

  return idx.length > 0 ? idx[0]! : -1
}

export function findCols(
  df: ColTable,
  col: IndexId | RegExp,
  opts: { caseInsensitive?: boolean; exact?: boolean } = {}
): number[] {
  const { caseInsensitive = true, exact = false } = opts

  if (typeof col === 'number') {
    return col > -1 && col < df.shape[1] ? [col] : []
  }

  const columns = df._data.map((c) => c.name)

  if (col instanceof RegExp) {
    return whereStrMatches(columns, col, caseInsensitive)
  }

  return exact
    ? whereStrExact(columns, col.toString(), opts)
    : whereStrStartsWith(columns, col.toString(), opts)
}
