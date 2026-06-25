import { range } from '@/lib/math/range'
import {
  BaseDataFrame,
  findCol,
  findRow,
  shape,
  type LocType,
} from './base-dataframe'
import { makeCell } from './cell'
import type { IDataFrameOptions } from './dataframe'

import {
  Index,
  makeColumns,
  makeIndex,
  shapesEqual,
  StringIndex,
  type IndexFromType,
  type Shape,
} from './index'
import {
  BaseSeries,
  DataSeries,
  type ISeriesOptions,
  type SeriesFromType,
} from './series'
import type { IndexId, SeriesData } from './series-data'

export interface IColFrameOptions extends ISeriesOptions {
  index?: Index
  data?: SeriesData[] | SeriesData[][] | BaseSeries | BaseSeries[]
  columns?: IndexFromType
  indexName?: string
}

/**
 * A column oriented dataframe where the data is stored as a map of column name to series.
 * This is more efficient for column operations but less efficient for row operations
 * compared to a row oriented dataframe.
 */
export class ColFrame extends BaseDataFrame {
  _index: Index
  _columns: Index
  _data: SeriesData[][]

  constructor(options: IDataFrameOptions = {}) {
    let { name = '', index, indexName, data = [], columns } = options
    super(name)

    if (!Array.isArray(data)) {
      data = [data]
    }

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
    const isSeries = data.some((d) => d instanceof BaseSeries)

    if (isSeries && !data.every((d) => d instanceof BaseSeries)) {
      throw new Error(
        'All columns must be a series if the first column is a series'
      )
    }

    if (isSeries) {
      // array of series to be made column wise

      if (!columns) {
        columns = new StringIndex(data.map((c) => (c as BaseSeries).name))
      }

      this._data = data.map((c) => (c as BaseSeries).values)

      // all columns must have the same length
      const colLengths = new Array(this._data.length)

      let ci = 0
      for (const c of this._data) {
        colLengths[ci++] = c.length
      }

      const length = colLengths[0] ?? 0

      if (colLengths.some((l) => l !== length)) {
        throw new Error('All columns must have the same length')
      }
    } else {
      // regular 2d array that is assumed row wise but will be stored column wise

      const row1 = data[0]! as SeriesData[]
      const colN = row1.length

      if (row1.length === 0) {
        throw new Error('data must be a non empty array')
      }

      this._data = new Array(row1.length) as SeriesData[][]

      for (let col = 0; col < colN; col++) {
        const d = new Array(data.length) as SeriesData[]

        for (let row = 0; row < data.length; row++) {
          d[row] = (data as SeriesData[][])[row]![col]!
        }

        this._data[col] = d
      }
      // } else {
      //   // 1d array of values to be made a single column
      //   if (!cols) {
      //     cols = new ExcelIndex(1)
      //   }

      //   if (cols.length !== 1) {
      //     throw new Error('columns must have length 1 when data is 1d')
      //   }

      //   this._data = [[...(data[0] as SeriesData[])]]
      // }
    }

    this._index = makeIndex(index, this._data[0]!.length, indexName)

    if (this._index.length !== this._data[0]!.length) {
      throw new Error('index length must match the number of rows in data')
    }

    // set the remaining parts of the dataframe
    this._columns = makeColumns(columns, this._data.length) //  cols

    if (this._columns.length !== this._data.length) {
      throw new Error('columns length must match the number of columns in data')
    }
  }

  // override setName(name: string, inplace = true): BaseDataFrame {
  //   const df: ColFrame = inplace ? this : (this.copy() as ColFrame)

  //   df._name = name

  //   return df
  // }

  override setCol(
    col: IndexId,
    data: SeriesFromType,
    inplace = true
  ): BaseDataFrame {
    const d =
      data instanceof BaseSeries || data instanceof Index
        ? data.values
        : [...data]

    if (d.length !== this.shape[0]) {
      throw new Error('length of column data must equal the number of rows')
    }

    const df: ColFrame = inplace ? this : (this.copy() as ColFrame)

    const colIdx: number = findCol(df, col)

    if (colIdx !== -1) {
      df._data[colIdx] = d
    } else {
      // not in columns, add to end of columns and column map
      const colName = col.toString()
      df._columns = new StringIndex([...df._columns.strs, colName])
      df._data.push(d)
    }

    return df
  }

  override col(c: IndexId): BaseSeries {
    const idx = findCol(this, c)

    if (idx === -1) {
      throw new Error(`${c} is an invalid column`)
    }

    const colName = this._columns.str(idx)

    return new DataSeries(this._data[idx]!, {
      name: colName,
    })
  }

  override get(row: IndexId, col: IndexId): SeriesData {
    const colIdx = findCol(this, col)

    if (colIdx === -1) {
      throw new Error(`${col} is an invalid column`)
    }

    const rowIdx = findRow(this, row)

    if (rowIdx === -1) {
      throw new Error(`${row} is an invalid row`)
    }

    return this._data[colIdx]![rowIdx]!
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

    const colNames = this._columns.strs

    const data = new Array(colNames.length) as SeriesData[]

    for (let col = 0; col < colNames.length; col++) {
      data[col] = this._data[col]![idx]!
    }

    return new DataSeries(data, {
      name: this.rowName(idx),
      index: colNames,
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

    const df: ColFrame = inplace ? this : (this.copy() as ColFrame)

    const rowIdx: number = findRow(df, row)

    const colNames = df._columns.strs

    if (rowIdx !== -1) {
      for (let col = 0; col < colNames.length; col++) {
        df._data[col]![rowIdx] = d[col]!
      }
    } else {
      // recreate each colum and append the new value to the end of the column
      df._data = df._data.map((c, i) => [...c, d[i]!])
      df._index = new StringIndex([...df._index.strs, row.toString()])
    }

    return df
  }

  override at(
    row: IndexId,
    col: IndexId,
    v: SeriesData,
    inplace: boolean = true
  ): BaseDataFrame {
    const df: ColFrame = inplace ? this : (this.copy() as ColFrame)

    const rowIdx: number = findRow(df, row)

    if (rowIdx === -1) {
      throw new Error(`${row} is an invalid row`)
    }

    const colIdx: number = findCol(df, col)

    if (colIdx === -1) {
      throw new Error(`${col} is an invalid column`)
    }

    df._data[colIdx]![rowIdx]! = makeCell(v)

    return df
  }

  override setIndex(
    index: IndexFromType,
    inplace: boolean = true
  ): BaseDataFrame {
    if (index.length !== this._index.length) {
      throw new Error('index length must match the number of rows in data')
    }

    const df: ColFrame = inplace ? this : (this.copy() as ColFrame)

    df._index = makeIndex(index, df.shape[0])

    return df
  }

  override setIndexName(name: string, inplace: boolean = true): BaseDataFrame {
    const df: ColFrame = inplace ? this : (this.copy() as ColFrame)

    df._index.setName(name)

    return df
  }

  override get index(): Index {
    return this._index
  }

  override get columns(): string[] {
    return this._columns.strs
  }

  override get cols(): BaseSeries[] {
    const colNames = this._columns.strs

    return colNames.map(
      (c, ci) =>
        new DataSeries(this._data[ci]!, {
          name: c,
        })
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

  override rowName(index: number): string {
    return this.index.str(index)
  }

  override get rowNames(): string[] {
    return this._index.strs
  }

  override setColNames(
    index: IndexFromType,
    inplace: boolean = true
  ): BaseDataFrame {
    if (index.length !== this._columns.length) {
      throw new Error('columns length must match the number of columns in data')
    }

    const df: ColFrame = inplace ? this : (this.copy() as ColFrame)

    df._columns = makeColumns(index, this._columns.length) //new StringIndex(index.map(i => i.toString()))

    return df
  }

  override get values(): SeriesData[][] {
    // return copy as we want dataframe to be immutable

    const data = new Array(this._index.length) as SeriesData[][]

    for (let row = 0; row < this._index.length; row++) {
      const d = new Array(this._columns.length) as SeriesData[]

      for (let col = 0; col < this._columns.length; col++) {
        d[col] = this._data[col]![row]!
      }

      data[row] = d
    }

    return data
  }

  override apply(
    f: (v: SeriesData, row: number, col: number) => SeriesData
  ): BaseDataFrame {
    const data = this.map(f)

    const ret = new ColFrame({
      name: this.name,
      data,
      columns: this._columns,
      index: this._index,
    })

    return ret
  }

  override map<T>(f: (v: SeriesData, row: number, col: number) => T): T[][] {
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

  // override rowApply(
  //   f: (row: SeriesData[], index: number) => SeriesData
  // ): BaseDataFrame {
  //   return _rowApply(this, f)
  // }

  // override rowMap<T>(f: (row: SeriesData[], index: number) => T): T[] {
  //   return _rowMap(this, f)
  // }

  // colApply(f: (col: SeriesType[], index: number) => SeriesType): BaseDataFrame {
  //   return _colApply(this, f)
  // }

  // override colMap<T>(f: (col: SeriesData[], index: number) => T): T[] {
  //   return _colMap(this, f)
  // }

  override iloc({
    rows,
    cols,
  }: { rows?: LocType; cols?: LocType } = {}): BaseDataFrame {
    let rowIdx = _ilocDim(this.index, rows)
    let colIdx = _ilocDim(this._columns, cols)

    const data = new Array(rowIdx.length) as SeriesData[][]

    for (let i = 0; i < rowIdx.length; i++) {
      const r = rowIdx[i]!

      const d = new Array(colIdx.length) as SeriesData[]

      for (let j = 0; j < colIdx.length; j++) {
        const c = colIdx[j]!

        d[j] = this._data[c]![r]!
      }

      data[i] = d
    }

    const ret = new ColFrame({
      data,
      name: this.name,
      index: this._index.filter(rowIdx),
      columns: this._columns.filter(colIdx),
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

  override get t(): BaseDataFrame {
    const rows = this.shape[0]
    const cols = this.shape[1]

    const data = new Array(cols) as SeriesData[][]

    for (let col = 0; col < cols; col++) {
      const d = new Array(rows) as SeriesData[]

      for (let row = 0; row < rows; row++) {
        d[row] = this._data[col]![row]!
      }

      data[col] = d
    }

    const ret = new ColFrame({
      name: this.name,
      data,
      columns: this._index.copy(),
      index: this._columns.copy(),
    })

    return ret
  }

  override copy(): BaseDataFrame {
    return new ColFrame({
      name: this.name,
      data: this.cols.map((c) => c.copy()),
      index: this._index.copy(),
      columns: this._columns.copy(),
    })
  }

  override replace(
    data: SeriesData[] | SeriesData[][] | BaseSeries
  ): BaseDataFrame {
    if (!shapesEqual(shape(data), this.shape)) {
      throw new Error('replacement data must be same shape as matrix')
    }

    return new ColFrame({
      name: this.name,
      data,
      index: this._index,
      columns: this._columns,
    })
  }
}

function _ilocDim(index: Index, rows: LocType = ':'): number[] {
  let rowIdx: number[] = []

  // if (Array.isArray(rows)) {
  //   rowIdx = rows.filter((v, i, a) => a.indexOf(v) == i) as number[]
  // } else {

  let s: string
  let si: number
  let ei: number
  let t: string

  if (!Array.isArray(rows)) {
    rows = [rows]
  }

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
          rowIdx = [...rowIdx, ...index.find(s)]
        }

        break
      default:
        break
    }
  }

  return rowIdx
}
