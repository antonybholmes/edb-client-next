import { vfill, vfill2d } from '../fill'
import { BaseDataFrame, findCol, findRow } from './base-dataframe'
import {
  BaseTable,
  DEFAULT_COLUMN_NAMES,
  DEFAULT_SHEET_NAME,
  findInSeries,
  IDataFrameOptions,
  LocType,
  shape,
  TableInput,
} from './base-table'
import { getExcelColName } from './cell'
import { ColDataFrame } from './col-dataframe'

import type { Cell, IndexId } from './cell'
import { DataIndex, makeColumns, makeIndex } from './data-index'
import { DataSeries } from './data-series'
import { Index, shapesEqual, type IndexFromType, type Shape } from './index'
import { DEFAULT_INDEX_NAME, Series, type SeriesFromType } from './series'

export interface IAnnotationDataFrameOptions extends IDataFrameOptions {
  rowObs?: BaseDataFrame | undefined
  colVars?: BaseDataFrame | undefined
}

export class AnnotationDataFrame extends BaseDataFrame {
  _data: BaseDataFrame
  _rowObs: BaseDataFrame
  _colVars: BaseDataFrame

  constructor(options: IAnnotationDataFrameOptions = {}) {
    const { name = '', index, columns, rowObs, colVars } = options

    super({ name })

    this._data = new ColDataFrame(options)

    if (rowObs) {
      this._rowObs = rowObs
    } else {
      this._rowObs = new ColDataFrame({
        data: [makeIndex(index, this._data.shape[0])],
        columns: [DEFAULT_INDEX_NAME],
      })
    }

    if (colVars) {
      this._colVars = colVars
    } else {
      this._colVars = new ColDataFrame({
        data: [makeColumns(columns, this._data.shape[1])],
        columns: [DEFAULT_COLUMN_NAMES],
      })
    }
  }

  get rowObs(): BaseDataFrame {
    return this._rowObs
  }

  get colVars(): BaseDataFrame {
    return this._colVars
  }

  override setName(
    name: string,
    opts: { inplace?: boolean } = {}
  ): AnnotationDataFrame {
    const { inplace = true } = opts
    const df = inplace ? this : this.copy()

    df._data.setName(name)

    return df
  }

  override get name(): string {
    return this._data.name
  }

  /**
   * Sets meta data for columns in the dataframe.
   *
   * @param col The column identifier in the colVars table to set
   * @param data The data to set for the specified column
   * @param opts Options for setting the column, including whether to do it inplace
   * @returns The updated AnnotationDataFrame instance.
   */
  setColVar(
    col: IndexId,
    data: SeriesFromType,
    opts?: { inplace?: boolean }
  ): AnnotationDataFrame {
    const { inplace = true } = opts ?? {}
    const df = inplace ? this : this.copy()

    df._colVars.setCol(col, data)

    return df
  }

  /**
   * Sets meta data for rows in the dataframe.
   *
   * @param row The row identifier in the rowObs table to set
   * @param data The data to set for the specified row
   * @param opts Options for setting the row, including whether to do it inplace
   * @returns The updated AnnotationDataFrame instance.
   */
  setRowObs(
    row: IndexId,
    data: SeriesFromType,
    opts?: { inplace?: boolean }
  ): AnnotationDataFrame {
    const { inplace = true } = opts ?? {}
    const df = inplace ? this : this.copy()

    df._rowObs.setCol(row, data)

    return df
  }

  override setCol(
    col: IndexId,
    data: SeriesFromType,
    opts: { inplace?: boolean } = {}
  ): AnnotationDataFrame {
    const { inplace = true } = opts
    const df = inplace ? this : this.copy()

    const colIdx = findCol(df, col)

    df._data.setCol(colIdx, data)

    setObsTableData(this._colVars, colIdx, col)

    return df
  }

  override col(col: IndexId): Series<Cell, Cell> {
    const colData = this._colVars.col(DEFAULT_COLUMN_NAMES)

    const colIdx = findInSeries(colData, col)

    if (colIdx.length === 0) {
      throw new Error(`Column ${col} not found in table`)
    }

    return new DataSeries(this._data.col(colIdx[0]!).values, {
      name: this._colVars.str(colIdx[0]!, 0),
    })
  }

  override colValues(col: IndexId): readonly Cell[] {
    return this._data.colValues(col)
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

    return this._data.get(rowIdx, colIdx)
  }

  override row(row: IndexId): Series<Cell, Cell> {
    // col 0 of row meta data is always the index label
    // so we can use that to find the row index
    // then we can just return the row from the main dataframe
    // with the name set from the meta data
    const rowData = this._rowObs.col(0) //DEFAULT_INDEX_NAME)

    const rowIdx = findInSeries(rowData, row)[0]!

    return new DataSeries(this._data.row(rowIdx).values, {
      name: this._rowObs.str(rowIdx, 0),
    })
  }

  override rowValues(row: IndexId): readonly Cell[] {
    return this._data.rowValues(row)
  }

  override setRow(
    row: IndexId,
    data: SeriesFromType,
    opts: { inplace?: boolean } = {}
  ): AnnotationDataFrame {
    const { inplace = true } = opts
    const df = inplace ? this : this.copy()

    const rowIdx = findRow(df, row)

    df._data.setRow(rowIdx, data)

    setObsTableData(df._rowObs, rowIdx, row)

    return df
  }

  override set(
    row: IndexId,
    col: IndexId,
    v: Cell,
    opts: { inplace?: boolean } = {}
  ): AnnotationDataFrame {
    const { inplace = true } = opts

    const df = inplace ? this : this.copy()

    // Always set inplace to true on the underlying data to ensure the changes are applied to df
    df._data.set(row, col, v)

    return df
  }

  override setIndex(
    index: IndexFromType,
    opts: { inplace?: boolean } = {}
  ): AnnotationDataFrame {
    const { inplace = true } = opts
    const df: AnnotationDataFrame = inplace
      ? this
      : (this.copy() as AnnotationDataFrame)

    //df._data.setIndex(index, true)
    df._rowObs.setCol(0, index)

    return df
  }

  override setIndexName(
    name: string,
    opts: { inplace?: boolean } = {}
  ): AnnotationDataFrame {
    const { inplace = true } = opts

    const df = inplace ? this : this.copy()

    const cols = [...df._rowObs.columns]
    cols[0] = name
    df._rowObs.setColNames(cols)

    return df
  }

  override setColNames(
    index: IndexFromType,
    opts: { inplace?: boolean } = {}
  ): AnnotationDataFrame {
    const { inplace = true } = opts

    const df = inplace ? this : this.copy()

    df._data.setColNames(index)
    df._colVars.setCol(0, index)

    return df
  }

  override get cols(): readonly Series<Cell, Cell>[] {
    return this._data.cols
  }

  override get columns(): Index<Cell> {
    return new DataIndex(this._colVars.col(0).values, {
      name: this._colVars.colName(0),
    })
  }

  override get index(): Index<Cell> {
    return new DataIndex(this._rowObs.col(0).values, {
      name: this._rowObs.colName(0),
    })
  }

  override colName(col: number): string {
    return this._colVars.str(col, 0)
  }

  override rowName(row: number): string {
    return this._rowObs.str(row, 0)
  }

  override get shape(): Shape {
    return this._data.shape
  }

  override get length(): number {
    return this._data.length
  }

  override get values(): readonly Cell[][] {
    // return copy as we want dataframe to be immutable
    return this._data.values
  }

  override map<T>(f: (v: Cell, row: number, col: number) => T): T[][] {
    return this._data.map(f)
  }

  override iloc({
    rows,
    cols,
  }: { rows?: LocType; cols?: LocType } = {}): AnnotationDataFrame {
    const df = this._data.iloc({ rows, cols })

    const ret: AnnotationDataFrame = new AnnotationDataFrame({
      name: this.name,
      data: df.cols,
    })

    // both are row oriented so we slice col meta data the same way as rows and row meta data the same way as rows
    ret._rowObs = this._rowObs.iloc({ rows })
    ret._colVars = this._colVars.iloc({ rows: cols })

    return ret
  }

  override rowApply(
    f: (row: Cell[], index: number) => Cell
  ): Series<Cell, Cell> {
    return this._data.rowApply(f)
  }

  override rowMap<T>(f: (row: Cell[], index: number) => T): T[] {
    return this._data.rowMap(f)
  }

  override colMap<T>(f: (col: Cell[], index: number) => T): T[] {
    return this._data.colMap(f)
  }

  override min(): number {
    return this._data.min()
  }

  override max(): number {
    return this._data.max()
  }

  override get t(): AnnotationDataFrame {
    const ret = new AnnotationDataFrame({
      name: this.name,
      data: this._data.t.values,
    })

    ret._rowObs = this._colVars
    ret._colVars = this._rowObs

    return ret
  }

  override copy(): AnnotationDataFrame {
    const ret = new AnnotationDataFrame({
      name: this.name,
      data: this._data.values,
    })

    ret._rowObs = this._rowObs.copy()
    ret._colVars = this._colVars.copy()

    return ret
  }

  override copyReplaceData(data: TableInput): AnnotationDataFrame {
    if (!shapesEqual(shape(data), this.shape)) {
      throw new Error('replacement data must be same shape as matrix')
    }

    const ret = new AnnotationDataFrame({
      name: this.name,
      data,
    })

    ret._rowObs = this._rowObs.copy()
    ret._colVars = this._colVars.copy()

    return ret
  }
}

function setObsTableData(t: BaseTable, rowIdx: number, row: IndexId) {
  if (rowIdx === -1) {
    // we only update the meta data to add new info
    // we fill in the missing annotation by assuming the first
    // meta column is the index label and anything else is
    // extra annotation which we set to the empty string
    t.setRow(rowIdx, [row, ...vfill('', t.shape[1] - 1)])
  }
}

export function toAnnDf(df: BaseDataFrame): AnnotationDataFrame {
  return new AnnotationDataFrame({
    data: df.values,
    index: df.index,
    columns: df.columns,
  })
}

export function create1x1Df() {
  return new AnnotationDataFrame({
    name: DEFAULT_SHEET_NAME,
    data: [['']],
    index: [1],
    columns: [getExcelColName(0)],
  })
}

export const DATAFRAME_1x1 = create1x1Df()

export function createEmptyFrame(rows: number, cols: number) {
  return new AnnotationDataFrame({
    name: DEFAULT_SHEET_NAME,
    data: vfill2d('', { rows, cols }),
  })
}

export function create100x26Df() {
  return createEmptyFrame(100, 26)
}

export const DATAFRAME_100x26 = create100x26Df()

export interface ISharedAnnotationDataFrame {
  rowObs: { columns: string[]; data: Cell[][] }
  colVars: { columns: string[]; data: Cell[][] }
  data: Cell[][]
  name: string
}
