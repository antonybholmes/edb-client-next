import { range } from '@/lib/math/range'
import { BaseDataFrame, findCol, findCols, findRow } from './base-dataframe'
import { makeCell } from './cell'

import { DataFrameInput, IDataFrameOptions, LocType, shape } from './base-table'
import type { Cell, IndexId } from './cell'
import {
  DataIndex,
  Index,
  makeColumns,
  makeIndex,
  shapesEqual,
  type IndexFromType,
  type Shape,
} from './index'
import { DataSeries, Series, type SeriesFromType } from './series'

export class DataFrame extends BaseDataFrame {
  _index: Index<Cell>
  _data: Cell[][]
  _columns: Index<Cell>

  constructor(options: IDataFrameOptions = {}) {
    const { name = '', data = [], index, columns } = options

    super({ name })

    const isDf = data instanceof BaseDataFrame

    if (isDf) {
      this._data = [...data.values]
    } else if (data instanceof Series) {
      this._data = data.values.map((v) => [v])
    } else {
      //data is a regular array. If a 2d array, use as.
      // If a 1d array, make, it a column

      if (data.length > 0 && Array.isArray(data[0])) {
        this._data = data as Cell[][]
      } else {
        // single array make into a column
        this._data = data.map((v) => [v]) as Cell[][]
      }
    }

    // if user supplies a dataframe and does not specify
    // the index or columns, attempt to use those of the
    // input table
    const _index = isDf ? (index ?? data.index) : index
    const _columns = isDf ? (columns ?? data.columns) : columns

    // if (_index && _index.length !== this._data.length) {
    //   throw new Error('index length does not match the number of rows')
    // }

    this._index = makeIndex(_index, this._data.length)

    // Allow support for tables with no rows
    this._columns = makeColumns(
      _columns,
      this._data.length > 0 ? this._data[0]!.length : (_columns?.length ?? 0)
    )
  }

  override setName(name: string, opts: { inplace?: boolean } = {}): DataFrame {
    const { inplace = true } = opts

    const df = inplace ? this : this.copy()

    df._name = name

    return df
  }

  override setCol(
    col: IndexId,
    data: SeriesFromType,
    opts: { inplace?: boolean } = {}
  ): DataFrame {
    const d =
      data instanceof Series || data instanceof Index ? data.values : data

    if (d.length !== this.shape[0]) {
      throw new Error('length of column data must equal the number of rows')
    }

    const { inplace = true } = opts

    const df = inplace ? this : this.copy()

    const colIdx: number = findCol(df, col)

    if (colIdx !== -1) {
      // existing column so update each value
      d.forEach((v: Cell, r: number) => {
        df._data[r]![colIdx]! = v
      })
    } else {
      if (df._data.length === 0) {
        // empty array so create a column
        df._data = d.map((v) => [v])
      } else {
        // since matrix is row wise, append new values to
        // end of each row
        d.forEach((v: Cell, r: number) => {
          df._data[r]!.push(v)
        })
      }

      df._columns = new DataIndex(
        [
          ...df._columns.values,
          Number.isInteger(col) ? df._columns.length : col.toString(),
        ],
        {
          name: df._columns.name,
        }
      )
    }

    return df
  }

  override col(c: IndexId): Series<Cell> {
    const idx = findCol(this, c)

    if (idx === -1) {
      throw new Error(`${c} is an invalid column`)
    }

    const v = this._data.map((row) => row[idx]!)

    return new DataSeries(v, {
      name: this._columns.at(idx) as string,
      index: this._index,
    })
  }

  override get(row: IndexId, col: IndexId): Cell {
    const rowIdx = findRow(this, row)

    if (rowIdx === -1) {
      console.log(this)
      console.log(`invalid row ${row} ${col}`)
      throw new Error(`invalid row ${row} ${col}`)
    }

    const colIdx = findCol(this, col)

    if (colIdx === -1) {
      throw new Error(`invalid col ${col} ${row}`)
    }

    return this._data[rowIdx]![colIdx]! // ?? NaN
  }

  /**
   * Return the data of a particular row.
   *
   * @param row
   * @returns
   */
  override row(row: IndexId): Series<Cell> {
    const idx = findRow(this, row)

    if (idx === -1) {
      throw new Error('invalid row')
    }

    return new DataSeries(this._data[idx]!, {
      name: this.rowName(idx),
      index: this._columns,
    })
  }

  override setRow(
    row: IndexId,
    data: Cell[] | Series<Cell>,
    opts: { inplace?: boolean } = {}
  ): DataFrame {
    const { inplace = true } = opts

    const d = [...(data instanceof Series ? data.values : data)]

    if (d.length !== this.shape[1]) {
      throw new Error('length of row data must equal the number of columns')
    }

    const df: DataFrame = inplace ? this : this.copy()

    const rowIdx: number = findRow(df, row)

    if (rowIdx !== -1) {
      // found existing row, so update it
      df._data[rowIdx] = d
    } else {
      df._data.push(d)

      if (Number.isInteger(row)) {
        df._index = new DataIndex([...df._index.values, df._index.length], {
          name: df._index.name,
        })
      } else {
        df._index = new DataIndex([...df._index.values, row], {
          name: df._index.name,
        })
      }
    }

    return df
  }

  override set(
    row: IndexId,
    col: IndexId,
    v: Cell,
    opts: { inplace?: boolean } = {}
  ): DataFrame {
    const { inplace = true } = opts
    const df: DataFrame = inplace ? this : this.copy()

    const rowIdx = findRow(df, row)
    const colIdx = findCol(df, col)

    if (rowIdx === -1) {
      throw new Error(`${row} is an invalid row`)
    }

    if (colIdx === -1) {
      throw new Error(`${col} is an invalid column`)
    }

    df._data[rowIdx]![colIdx]! = makeCell(v)

    return df
  }

  override setIndex(
    index: IndexFromType,
    opts: { inplace?: boolean } = {}
  ): DataFrame {
    const { inplace = true } = opts
    const df: DataFrame = inplace ? this : this.copy()

    df._index = makeIndex(index, df.shape[0])

    return df
  }

  override setIndexName(
    name: string,
    opts: { inplace?: boolean } = {}
  ): DataFrame {
    const { inplace = true } = opts
    const df: DataFrame = inplace ? this : this.copy()

    df._index.name = name

    return df
  }

  override get index(): Index<Cell> {
    return this._index
  }

  override get columns(): Index<Cell> {
    return this._columns
  }

  override setColNames(
    index: IndexFromType,
    opts: { inplace?: boolean } = {}
  ): DataFrame {
    const { inplace = true } = opts
    const df: DataFrame = inplace ? this : this.copy()

    if (index.length === df.shape[1]) {
      if (index instanceof Index) {
        df._columns = index
      } else {
        df._columns = new DataIndex(index)
      }
    }

    return df
  }

  override get cols(): Series<Cell>[] {
    return range(this.shape[1]).map(
      (c: number) =>
        new DataSeries(
          this._data.map((row) => row[c]!),
          {
            name: this._columns.at(c) as string,
          }
        )
    )
  }

  override get shape(): Shape {
    return [
      this._index.length,
      this._columns.length, // ._data.length > 0 ? this._data[0]!.length : 0,
    ]
  }

  override get length(): number {
    return this.shape[0] * this.shape[1]
  }

  override get values(): Cell[][] {
    // return copy as we want dataframe to be immutable
    return this._data.map((row) => row.slice())
  }

  override apply(f: (v: Cell, row: number, col: number) => Cell): DataFrame {
    const data = this.map(f)

    const ret = new DataFrame({
      name: this.name,
      data,
      columns: this._columns,
      index: this._index,
    })

    return ret
  }

  override map<T>(f: (v: Cell, row: number, col: number) => T): T[][] {
    return _map(this, f)
  }

  // override rowApply(
  //   f: (row: SeriesData[], index: number) => SeriesData
  // ): BaseDataFrame {
  //   return _rowApply(this, f)
  // }

  override rowMap<T>(f: (row: Cell[], index: number) => T): T[] {
    return _rowMap(this, f)
  }

  // colApply(f: (col: SeriesType[], index: number) => SeriesType): BaseDataFrame {
  //   return _colApply(this, f)
  // }

  override colMap<T>(f: (col: Cell[], index: number) => T): T[] {
    return _colMap(this, f)
  }

  override iloc({
    rows,
    cols,
  }: { rows?: LocType; cols?: LocType } = {}): DataFrame {
    return _iloc(this, rows ?? ':', cols ?? ':')
  }

  override min(): number {
    let min = Number.MAX_VALUE
    for (const row of this._data) {
      for (const cell of row) {
        min = Math.min(min, cell as number)
      }
    }

    return min
  }

  override max(): number {
    let max = Number.MIN_VALUE
    for (const row of this._data) {
      for (const cell of row) {
        max = Math.max(max, cell as number)
      }
    }

    return max
  }

  // override isin(rows: LocType = ':', cols: LocType = ':'): BaseDataFrame {
  //   return _isin(this, rows, cols)
  // }

  override get t(): DataFrame {
    const ret = new DataFrame({
      name: this.name,
      data: _t(this._data),
      columns: this._index,
      index: this._columns,
    })

    return ret
  }

  override copy(): DataFrame {
    return new DataFrame({
      name: this.name,
      data: this.values,
      index: this._index.copy(),
      columns: this._columns.copy(),
    })
  }

  override copyReplaceData(data: DataFrameInput): DataFrame {
    if (!shapesEqual(shape(data), this.shape)) {
      throw new Error('replacement data must be same shape as matrix')
    }

    return new DataFrame({
      name: this.name,
      data,
      index: this._index,
      columns: this._columns,
    })
  }
}

export function _t(data: Cell[][]): Cell[][] {
  return data[0]!.map((_, ci) => data.map((row) => row[ci]!))
}

// export function apply(
//   f: (v: SeriesType, row: number, col: number) => SeriesType,
// ): BaseDataFrame {
//   const data = this.map(f)

//   const ret = new DataFrame({
//     name: this.name,
//     data,
//     columns: this._columns,
//     index: this._index,
//   })

//   return ret
// }

function _map<T>(
  df: DataFrame,
  f: (v: Cell, row: number, col: number) => T
): T[][] {
  return df._data.map((rowData, ri) => rowData.map((v, ci) => f(v, ri, ci)))
}

function _rowMap<T>(df: DataFrame, f: (row: Cell[], index: number) => T): T[] {
  return df._data.map((row, ri) => f(row, ri))
}

/* function _rowApply(
  df: DataFrame,
  f: (row: SeriesData[], index: number) => SeriesData
): DataFrame {
  const d: SeriesData[] = _rowMap(df, f)

  return new DataFrame({
    name: df.name,
    data: d.map(r => [r]),
    columns: df._columns,
    index: df._index,
  })
} */

/**
 * Runs a map function on each column of a dataframe.
 *
 * @param df  n x m dataframe
 * @param f   a function to apply to all values in a column. col is a list of the
 *            values in a column and index is the index of the column.
 * @returns   an m x 1 array of the output of f applied to each column.
 */
function _colMap<T>(df: DataFrame, f: (col: Cell[], index: number) => T): T[] {
  return range(df._data[0]!.length).map((ci) => {
    const d = f(
      df._data.map((rowData) => rowData[ci]!),
      ci
    )

    return d
  })
}

function _iloc(
  df: DataFrame,
  rows: LocType = ':',
  cols: LocType = ':'
): DataFrame {
  let rowIdx: number[] = []

  if (!Array.isArray(rows)) {
    rows = [rows]
  }

  // if (Array.isArray(rows)) {
  //   rowIdx = rows.filter((v, i, a) => a.indexOf(v) == i) as number[]
  // } else {

  let s: string

  rows.forEach((row) => {
    const t = typeof row

    switch (t) {
      case 'number':
        rowIdx.push(row as number)
        break
      case 'string':
        s = row as string

        if (!s.includes(':')) {
          rowIdx = rowIdx.concat(df.index.indexOf(s))
        } else {
          let si = 0
          // last row index
          let ei = df.shape[0] - 1

          if (s !== ':') {
            // of the form ":<indices>"
            if (s.startsWith(':')) {
              s = s.slice(1)
              const i = Number.parseInt(s)

              if (Number.isInteger(s)) {
                ei = i
              } else {
                const indices = df.index.indexOf(s)
                if (indices.length > 0) {
                  ei = indices[0]!
                }
              }
            } else {
              // of the form "<indices>:"

              s = s.split(':')[0]!
              const i = Number.parseInt(s)

              if (Number.isInteger(s)) {
                si = i
              } else {
                const indices = df.index.indexOf(s)
                if (indices.length > 0) {
                  si = indices[0]!
                }
              }
            }
          }

          rowIdx = rowIdx.concat(
            range(Math.max(si, 0), Math.min(ei + 1, df.shape[0]))
          )
        }
        break
      default:
        break
    }
  })

  let colIdx: number[] = []

  if (!Array.isArray(cols)) {
    cols = [cols]
  }

  cols.forEach((col) => {
    const t = typeof col

    switch (t) {
      case 'number':
        colIdx.push(col as number)
        break
      case 'string':
        s = col as string

        if (!s.includes(':')) {
          // non range so just parse as is
          colIdx = colIdx.concat(findCols(df, s))
        } else {
          // assume range covers all cols i.e. user specified ":"
          let si = 0
          let ei = df.shape[1] - 1

          if (s !== ':') {
            // of the form ":<indices>" so that start
            // is always 0, but user has specified end
            if (s.startsWith(':')) {
              s = s.slice(1)
              const i = Number.parseInt(s)

              if (Number.isInteger(s)) {
                ei = i
              } else {
                const indices = findCols(df, s)
                // if more than one col found, pick the first, but
                // this means the user is specifying the range in
                // a sloppy manner so we pick a reasonable way of
                // behaving
                if (indices.length > 0) {
                  ei = indices[0]!
                }
              }
            } else {
              // of the form "<indices>:"
              s = s.split(':')[0]!
              const i = Number.parseInt(s)

              if (Number.isInteger(s)) {
                // it's a number so use as is
                si = i
              } else {
                const indices = findCols(df, s)
                if (indices.length > 0) {
                  si = indices[0]!
                }
              }
            }
          }

          // create a range ensuring it's within the bounds of the dataframe.
          // We use ei + 1 because the range function stops at the value before
          // the end value, and since we want to include the ei in the list of
          // of indices, we add 1
          colIdx = colIdx.concat(
            range(Math.max(si, 0), Math.min(ei + 1, df.shape[1]))
          )
        }

        break
      default:
        // user did something stupid so ignore
        break
    }
  })

  const d = rowIdx.map((r) => colIdx.map((c) => df._data[r]![c]!))

  const ret = new DataFrame({
    data: d,
    name: df.name,
    index: df.index.filter(rowIdx),
    columns: df._columns.filter(colIdx),
  })

  return ret
}

// function _isin(
//   df: DataFrame,
//   rows: LocType = ':',
//   cols: LocType = ':'
// ): DataFrame {
//   const rset = new Set(Array.isArray(rows) ? rows : [rows])
//   const cset = new Set(Array.isArray(cols) ? cols : [cols])

//   const rowIdx = range(df.shape[0]).filter(r => rset.has(r))

//   const colIdx = range(df.shape[1]).filter(c => cset.has(c))

//   return _iloc(df, rowIdx, colIdx)
// }
