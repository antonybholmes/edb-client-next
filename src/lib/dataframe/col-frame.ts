import { range } from '@/lib/math/range'

import { makeCell } from './cell'

import { BaseDataFrame, findCol, findRow } from './base-dataframe'
import { DataFrameInput, IDataFrameOptions, LocType, shape } from './base-table'
import type { Cell, IndexId } from './cell'
import { makeColumns, makeIndex, StringIndex } from './data-index'
import { DataSeries } from './data-series'
import { Index, Shape, shapesEqual, type IndexFromType } from './index'
import { Series, type SeriesFromType } from './series'

/**
 * A column oriented dataframe where the data is stored as a map of column name to series.
 * This is more efficient for column operations but less efficient for row operations
 * compared to a row oriented dataframe.
 */
export class ColFrame extends BaseDataFrame {
  _index: Index<Cell>
  _columns: Index<Cell>
  _data: Cell[][]

  constructor(options: IDataFrameOptions = {}) {
    let { name = '', index, data = [], columns } = options

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

    if (isSeries) {
      // array of series to be made column wise

      if (!columns) {
        columns = new StringIndex(
          data.map((c: unknown) => (c as Series<Cell, Cell>).name)
        )
      }

      this._data = data.map((c: unknown) => [
        ...(c as Series<Cell, Cell>).values,
      ])

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

      const row1 = data[0]! as Cell[]
      const colN = row1.length

      if (row1.length === 0) {
        throw new Error('data must be a non empty array')
      }

      this._data = new Array(row1.length) as Cell[][]

      for (let col = 0; col < colN; col++) {
        const d = new Array(data.length) as Cell[]

        for (let row = 0; row < data.length; row++) {
          d[row] = (data as Cell[][])[row]![col]!
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

    this._index = makeIndex(index, this._data[0]!.length)

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
    opts: { inplace?: boolean } = {}
  ): ColFrame {
    const { inplace = true } = opts

    const d = [
      ...(data instanceof Series || data instanceof Index ? data.values : data),
    ]

    if (d.length !== this.shape[0]) {
      throw new Error('length of column data must equal the number of rows')
    }

    const df: ColFrame = inplace ? this : this.copy()

    const colIdx: number = findCol(df, col)

    if (colIdx !== -1) {
      df._data[colIdx] = d
    } else {
      // not in columns, add to end of columns and column map
      const colName = col.toString()
      df._columns = new StringIndex([...df.colNames, colName])
      df._data.push(d)
    }

    return df
  }

  override col(c: IndexId): Series<Cell, Cell> {
    const idx = findCol(this, c)

    if (idx === -1) {
      throw new Error(`${c} is an invalid column`)
    }

    const colName = this._columns.str(idx)

    return new DataSeries(this._data[idx]!, {
      name: colName,
    })
  }

  override get(row: IndexId, col: IndexId): Cell {
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
  override row(row: IndexId): Series<Cell, Cell> {
    const idx = findRow(this, row)

    if (idx === -1) {
      throw new Error('invalid row')
    }

    const colNames = this.colNames

    const data = new Array(colNames.length) as Cell[]

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
    data: Cell[] | Series<Cell, Cell>,
    opts: { inplace?: boolean } = {}
  ): ColFrame {
    const d = data instanceof Series ? data.values : data

    if (d.length !== this.shape[1]) {
      throw new Error('length of row data must equal the number of columns')
    }

    const { inplace = true } = opts

    const df: ColFrame = inplace ? this : this.copy()

    const rowIdx: number = findRow(df, row)

    const colNames = df.colNames

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

  override set(
    row: IndexId,
    col: IndexId,
    v: Cell,
    opts: { inplace?: boolean } = {}
  ): BaseDataFrame {
    const { inplace = true } = opts

    const df: ColFrame = inplace ? this : this.copy()

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
    opts: { inplace?: boolean } = {}
  ): BaseDataFrame {
    if (index.length !== this._index.length) {
      throw new Error('index length must match the number of rows in data')
    }

    const { inplace = true } = opts

    const df: ColFrame = inplace ? this : this.copy()

    df._index = makeIndex(index, df.shape[0])

    return df
  }

  override setIndexName(
    name: string,
    opts: { inplace?: boolean } = {}
  ): BaseDataFrame {
    const { inplace = true } = opts

    const df: ColFrame = inplace ? this : this.copy()

    df._index.name = name

    return df
  }

  override get shape(): Shape {
    return [
      this._index.length,
      this._columns.length, // ._data.length > 0 ? this._data[0]!.length : 0,
    ]
  }

  override get index(): Index<Cell> {
    return this._index
  }

  override get columns(): Index<Cell> {
    return this._columns
  }

  override get cols(): Series<Cell, Cell>[] {
    const colNames = this.colNames

    return colNames.map(
      (c, ci) =>
        new DataSeries(this._data[ci]!, {
          name: c,
        })
    )
  }

  override rowName(index: number): string {
    return this.index.str(index)
  }

  override get rowNames(): readonly string[] {
    return this._index.strs
  }

  override setColNames(
    index: IndexFromType,
    opts: { inplace?: boolean } = {}
  ): BaseDataFrame {
    if (index.length !== this._columns.length) {
      throw new Error('columns length must match the number of columns in data')
    }

    const { inplace = true } = opts

    const df: ColFrame = inplace ? this : this.copy()

    df._columns = makeColumns(index, this._columns.length) //new StringIndex(index.map(i => i.toString()))

    return df
  }

  override get values(): Cell[][] {
    // return copy as we want dataframe to be immutable

    const data = new Array(this._index.length) as Cell[][]

    for (let row = 0; row < this._index.length; row++) {
      const d = new Array(this._columns.length) as Cell[]

      for (let col = 0; col < this._columns.length; col++) {
        d[col] = this._data[col]![row]!
      }

      data[row] = d
    }

    return data
  }

  override apply(
    f: (v: Cell, row: number, col: number) => Cell
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

    const data = new Array(cols) as Cell[][]

    for (let col = 0; col < cols; col++) {
      const d = new Array(rows) as Cell[]

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

  override copy(): ColFrame {
    return new ColFrame({
      name: this.name,
      data: this.cols.map((c) => c.copy()),
      index: this._index.copy(),
      columns: this._columns.copy(),
    })
  }

  override copyReplaceData(data: DataFrameInput): BaseDataFrame {
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

function _ilocDim(index: Index<Cell>, rows: LocType = ':'): number[] {
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
          rowIdx = [...rowIdx, ...index.indexOf(s)]
        }

        break
      default:
        break
    }
  }

  return rowIdx
}
