import { range } from '@lib/math/range'
import {
  BaseDataFrame,
  findCol,
  findCols,
  findRow,
  shape,
  type LocType,
} from './base-dataframe'
import { makeCell } from './cell'
import {
  shapesEqual,
  type IndexFromType,
  type IndexId,
  type SeriesData,
  type SeriesFromType,
  type Shape,
} from './dataframe-types'
import { DataIndex, Index, makeColumns, makeIndex } from './index'
import { BaseSeries, Series, type ISeriesOptions } from './series'

export interface IDataFrameOptions extends ISeriesOptions {
  data?: BaseDataFrame | BaseSeries | SeriesData[] | SeriesData[][]
  columns?: IndexFromType | undefined
  indexName?: string
}

export class DataFrame extends BaseDataFrame {
  _index: Index
  _data: SeriesData[][]
  _columns: Index

  constructor(options: IDataFrameOptions = {}) {
    const { name = '', data = [], index, indexName, columns } = options
    super(name)

    const isDf = data instanceof BaseDataFrame

    if (isDf) {
      this._data = data.values
    } else if (data instanceof BaseSeries) {
      this._data = data.values.map(v => [v])
    } else {
      //data is a regular array. If a 2d array, use as.
      // If a 1d array, make, it a column

      if (data.length > 0 && Array.isArray(data[0])) {
        this._data = data as SeriesData[][]
      } else {
        // single array make into a column
        this._data = data.map(v => [v]) as SeriesData[][]
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

    this._index = makeIndex(_index, this._data.length, indexName)

    // Allow support for tables with no rows
    this._columns = makeColumns(
      _columns,
      this._data.length > 0 ? this._data[0]!.length : (_columns?.length ?? 0)
    )
  }

  override setName(name: string, inplace = true): BaseDataFrame {
    const df: DataFrame = inplace ? this : (this.copy() as DataFrame)

    df._name = name

    return df
  }

  override setCol(
    col: IndexId,
    data: SeriesFromType,
    inplace = true
  ): BaseDataFrame {
    const d =
      data instanceof BaseSeries || data instanceof Index ? data.values : data

    if (d.length !== this.shape[0]) {
      throw new Error('length of column data must equal the number of rows')
    }

    const df: DataFrame = inplace ? this : (this.copy() as DataFrame)

    const colIdx: number = findCol(df, col)

    if (colIdx !== -1) {
      // existing column so update each value
      d.forEach((v: SeriesData, r: number) => {
        df._data[r]![colIdx]! = v
      })
    } else {
      if (df._data.length === 0) {
        // empty array so create a column
        df._data = d.map(v => [v])
      } else {
        // since matrix is row wise, append new values to
        // end of each row
        d.forEach((v: SeriesData, r: number) => {
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

  override col(c: IndexId): BaseSeries {
    const idx = findCol(this, c)

    if (idx === -1) {
      throw new Error(`${c} is an invalid column`)
    }

    const v = this._data.map(row => row[idx]!) //this.colValues(idx)

    return new Series(v, {
      name: this._columns.get(idx) as string,
      index: this._index,
    })
  }

  override get(row: IndexId, col: IndexId): SeriesData {
    const rowIdx = findRow(this, row)

    if (rowIdx === -1) {
      throw new Error('invalid row')
    }

    const colIdx = findCol(this, col)

    if (colIdx === -1) {
      throw new Error('invalid col')
    }

    return this._data[rowIdx]![colIdx]! // ?? NaN
  }

  /**
   * Return the data of a particular row.
   *
   * @param row
   * @returns
   */
  override row(row: IndexId): BaseSeries {
    const idx = findRow(this, row)

    if (idx === -1) {
      throw new Error('invalid row')
    }

    return new Series(this._data[idx]!, {
      name: this.rowName(idx),
      index: this._columns,
    })
  }

  override setRow(
    row: IndexId,
    data: SeriesData[] | BaseSeries,
    inplace = true
  ): BaseDataFrame {
    const d = data instanceof BaseSeries ? data.values : data

    if (d.length !== this.shape[1]) {
      throw new Error('length of row data must equal the number of columns')
    }

    const df: DataFrame = inplace ? this : (this.copy() as DataFrame)

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

  override set(row: number, col: number, v: SeriesData): BaseDataFrame {
    this._data[row]![col]! = makeCell(v)
    return this
  }

  override setIndex(index: IndexFromType, inplace = true): BaseDataFrame {
    const df: DataFrame = inplace ? this : (this.copy() as DataFrame)

    df._index = makeIndex(index, df.shape[0])

    return df
  }

  override setIndexName(name: string, inplace: boolean = true): BaseDataFrame {
    const df: DataFrame = inplace ? this : (this.copy() as DataFrame)

    df._index.setName(name)

    return df
  }

  override get index(): Index {
    return this._index
  }

  override get columns(): Index {
    return this._columns
  }

  override setColNames(
    index: IndexFromType,
    inplace: boolean = true
  ): BaseDataFrame {
    const df: DataFrame = inplace ? this : (this.copy() as DataFrame)

    if (index.length === df.shape[1]) {
      if (index instanceof Index) {
        df._columns = index
      } else {
        df._columns = new DataIndex(index)
      }
    }

    return df
  }

  override get cols(): BaseSeries[] {
    return range(this.shape[1]).map(
      (c: number) =>
        new Series(
          this._data.map(row => row[c]!),
          {
            name: this._columns.get(c) as string,
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

  override get size(): number {
    return this.shape[0] * this.shape[1]
  }

  override get values(): SeriesData[][] {
    // return copy as we want dataframe to be immutable
    return this._data.map(row => row.slice())
  }

  override apply(
    f: (v: SeriesData, row: number, col: number) => SeriesData
  ): BaseDataFrame {
    const data = this.map(f)

    const ret = new DataFrame({
      name: this.name,
      data,
      columns: this._columns,
      index: this._index,
    })

    return ret
  }

  override map<T>(f: (v: SeriesData, row: number, col: number) => T): T[][] {
    return _map(this, f)
  }

  // override rowApply(
  //   f: (row: SeriesData[], index: number) => SeriesData
  // ): BaseDataFrame {
  //   return _rowApply(this, f)
  // }

  override rowMap<T>(f: (row: SeriesData[], index: number) => T): T[] {
    return _rowMap(this, f)
  }

  // colApply(f: (col: SeriesType[], index: number) => SeriesType): BaseDataFrame {
  //   return _colApply(this, f)
  // }

  override colMap<T>(f: (col: SeriesData[], index: number) => T): T[] {
    return _colMap(this, f)
  }

  override iloc(rows: LocType = ':', cols: LocType = ':'): BaseDataFrame {
    return _iloc(this, rows, cols)
  }

  min(): number {
    let min = Number.MAX_VALUE
    for (const row of this._data) {
      for (const cell of row) {
        min = Math.min(min, cell as number)
      }
    }

    return min
  }

  max(): number {
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

  override get t(): BaseDataFrame {
    const ret = new DataFrame({
      name: this.name,
      data: _t(this._data),
      columns: this._index,
      index: this._columns,
    })

    return ret
  }

  override copy(): BaseDataFrame {
    return new DataFrame({
      name: this.name,
      data: this.values,
      index: this._index.copy(),
      columns: this._columns.copy(),
    })
  }

  override replaceData(
    data: SeriesData[][] | SeriesData[] | BaseDataFrame | BaseSeries
  ): BaseDataFrame {
    if (!shapesEqual(shape(data), this.shape)) {
      throw new Error('replacement data must be same shape as matrix')
    }

    return new DataFrame({
      name: this.name,
      data: data instanceof BaseDataFrame ? data.values : data,
      index: this._index.copy(),
      columns: this._columns.copy(),
    })
  }
}

export function _t(data: SeriesData[][]): SeriesData[][] {
  return data[0]!.map((_, ci) => data.map(row => row[ci]!))
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
  f: (v: SeriesData, row: number, col: number) => T
): T[][] {
  return df._data.map((rowData, ri) => rowData.map((v, ci) => f(v, ri, ci)))
}

function _rowMap<T>(
  df: DataFrame,
  f: (row: SeriesData[], index: number) => T
): T[] {
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
function _colMap<T>(
  df: DataFrame,
  f: (col: SeriesData[], index: number) => T
): T[] {
  return range(df._data[0]!.length).map(ci => {
    const d = f(
      df._data.map(rowData => rowData[ci]!),
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

  rows.forEach(row => {
    const t = typeof row

    switch (t) {
      case 'number':
        rowIdx.push(row as number)
        break
      case 'string':
        s = row as string

        if (!s.includes(':')) {
          rowIdx = rowIdx.concat(df.index.find(s))
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
                const indices = df.index.find(s)
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
                const indices = df.index.find(s)
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

  cols.forEach(col => {
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

  const d = rowIdx.map(r => colIdx.map(c => df._data[r]![c]!))

  const ret = new DataFrame({
    data: d,
    name: df.name,
    index: df.index.filter(rowIdx),
    columns: df.columns.filter(colIdx),
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
