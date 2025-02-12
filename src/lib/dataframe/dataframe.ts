import { range } from '@lib/math/range'
import {
  BaseDataFrame,
  _findCol,
  _findRow,
  type LocType,
} from './base-dataframe'
import { BaseSeries } from './base-series'
import { makeCell } from './cell'
import { DataIndex } from './data-index'
import type { IndexData, SeriesData, Shape } from './dataframe-types'
import {
  EXCEL_INDEX,
  Index,
  InfExcelIndex,
  InfNumIndex,
  NUM_INDEX,
  type IndexFromType,
} from './index'
import { Series, type ISeriesOptions } from './series'

export interface IDataFrameOptions extends ISeriesOptions {
  data?: SeriesData[][]
  index?: IndexFromType
  columns?: IndexFromType
}

export class DataFrame extends BaseDataFrame {
  _index: Index = NUM_INDEX
  _data: SeriesData[][]
  _columns: Index = EXCEL_INDEX

  constructor(options: IDataFrameOptions = {}) {
    const {
      name = '',
      data = [],
      index = null,
      columns = null,
    } = { ...options }

    super(name.toString())

    this._data = data
    this.setIndex(index, true)

    this.setColNames(columns, true)
  }

  override setName(name: string, inplace = true): BaseDataFrame {
    const df: DataFrame = inplace ? this : (this.copy() as DataFrame)

    df._name = name

    return df
  }

  override setCol(
    col: IndexData = -1,
    data: SeriesData[] | BaseSeries,
    inplace = true
  ): BaseDataFrame {
    const d = data instanceof BaseSeries ? data.values : data

    const df: DataFrame = inplace ? this : (this.copy() as DataFrame)

    const colIdx: number[] = _findCol(df, col)

    if (colIdx.length > 0 && colIdx[0]! < df.shape[1]) {
      // existing column so update each value
      d.forEach((v: SeriesData, r: number) => {
        df._data[r]![colIdx[0]!]! = v
      })
    } else {
      if (d.length === 0) {
        // empty array so create array for each row
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
          Number.isInteger(col) ? df._columns.size : col.toString(),
        ],
        {
          name: df._columns.name,
        }
      )
    }

    return df
  }

  override col(c: IndexData): BaseSeries {
    const idx = _findCol(this, c)

    if (idx.length === 0) {
      throw new Error('invalid column')
    }

    const v = this._data.map(row => row[idx[0]!]!) //this.colValues(idx)

    return new Series(v, {
      name: this._columns.get(idx[0]!) as string,
      index: this._index,
    })
  }

  colValues(c: IndexData): SeriesData[] {
    const idx = _findCol(this, c)

    if (idx.length === 0) {
      return []
    }

    return this._data.map(row => row[idx[0]!]!)
  }

  // setCols(cols: Series[]): BaseDataFrame {
  //   this._cols = cols
  //   return this
  // }

  override get(row: number, col: number): SeriesData {
    return this._data[row]?.[col] ?? NaN
  }

  override row(row: IndexData): BaseSeries {
    const idx = _findRow(this, row)

    if (idx.length === 0) {
      throw new Error('invalid row')
    }

    return new Series(this._data[idx[0]!]!, {
      name: this.getRowName(idx[0]!),
      index: this._index,
    })
  }

  rowValues(row: number): SeriesData[] {
    return this._data[row]!.slice()
  }

  override setRow(
    row: IndexData = -1,
    data: SeriesData[] | BaseSeries,
    inplace = true
  ): BaseDataFrame {
    const d = data instanceof BaseSeries ? data.values : data

    const df: DataFrame = inplace ? this : (this.copy() as DataFrame)

    const rowIdx: number[] = _findRow(df, row)

    if (rowIdx.length > 0 && rowIdx[0]! < df.shape[0]) {
      df._data[rowIdx[0]!] = d
    } else {
      if (d.length === 0) {
        // empty array so create
        df._data = [d]
      } else {
        df._data.push(d)
      }

      if (Number.isInteger(row)) {
        df._index = new DataIndex([...df._index.values, df._index.size], {
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

  override set(row: number, col: number, v: IndexData): BaseDataFrame {
    this._data[row]![col]! = makeCell(v)
    return this
  }

  override setIndex(index: IndexFromType, inplace = true): BaseDataFrame {
    const df: DataFrame = inplace ? this : (this.copy() as DataFrame)

    if (index instanceof Index) {
      df._index = index
    } else if (Array.isArray(index)) {
      df._index = new DataIndex(index)
    } else {
      df._index = NUM_INDEX
    }

    return df
  }

  // setCols(columns: IndexFromType): DataFrame {
  //   const df = this //inplace ? this : this.copy()

  //   if (columns instanceof Index) {
  //     df._columns = columns
  //   } else if (Array.isArray(columns)) {
  //     df._columns = new DataIndex(columns)
  //   } else {
  //     df._columns = EXCEL_INDEX
  //   }

  //   return df
  // }

  override get index(): Index {
    return this._index
  }

  override get columns(): Index {
    return this._columns
  }

  // override colName(col: IndexType): string {
  //   const idx = _findCol(this, col)

  //   if (idx.length === 0) {
  //     throw new Error('invalid column')
  //   }

  //   return this._columns.getName(idx[0]!)
  // }

  override setColNames(
    index: IndexFromType,
    inplace: boolean = true
  ): BaseDataFrame {
    const df: DataFrame = inplace ? this : (this.copy() as DataFrame)

    if (index instanceof InfNumIndex || index instanceof InfExcelIndex) {
      df._columns = index
    } else if (index instanceof DataIndex) {
      if (index.size === df.shape[1]) {
        df._columns = index
      }
    } else {
      if (Array.isArray(index)) {
        if (index.length === df.shape[1]) {
          df._columns = new DataIndex(index)
        }
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
      this._data.length,
      this._data.length > 0 ? this._data[0]!.length : 0,
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

  override rowApply(
    f: (row: SeriesData[], index: number) => SeriesData
  ): BaseDataFrame {
    return _rowApply(this, f)
  }

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

  override isin(rows: LocType = ':', cols: LocType = ':'): BaseDataFrame {
    return _isin(this, rows, cols)
  }

  override t(): BaseDataFrame {
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
      data: this._data.map(r => [...r]),
      index: this._index,
      columns: this._columns,
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
  return df._data.map((row, ri) => {
    const ret = f(row, ri)

    return ret
  })
}

function _rowApply(
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
}

// function _colApply(
//   df: DataFrame,
//   f: (col: SeriesType[], index: number) => SeriesType,
// ): DataFrame {
//   const d = _colMap(df, f)

//   // const d: SeriesType[][] = this._data.map((rowData, ri) =>
//   //   rowData.map((v, ci) => f(v, ci)),
//   // )

//   const ret = new DataFrame({
//     name: df.name,
//     data: d.map(r => [r]),
//     index: this._columns,
//   })

//   return ret
// }

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
          colIdx = colIdx.concat(_findCol(df, s))
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
                const indices = _findCol(df, s)
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
                const indices = _findCol(df, s)
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

function _isin(
  df: DataFrame,
  rows: LocType = ':',
  cols: LocType = ':'
): DataFrame {
  const rset = new Set(Array.isArray(rows) ? rows : [rows])
  const cset = new Set(Array.isArray(cols) ? cols : [cols])

  const rowIdx = range(df.shape[0]).filter(r => rset.has(r))

  const colIdx = range(df.shape[1]).filter(c => cset.has(c))

  return _iloc(df, rowIdx, colIdx)
}
