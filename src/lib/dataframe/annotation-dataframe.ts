import {
  BaseDataFrame,
  DEFAULT_COLUMN_INDEX_NAME,
  DEFAULT_SHEET_NAME,
  findCol,
  findInSeries,
  findRow,
  shape,
  type LocType,
} from './base-dataframe'

import { fill2d, vfill } from '../fill'
import { getExcelColName } from './cell'
import { ColFrame } from './col-frame'
import { type IDataFrameOptions } from './dataframe'

import {
  DataIndex,
  Index,
  makeColumns,
  makeIndex,
  shapesEqual,
  type IndexFromType,
  type Shape,
} from './index'
import {
  BaseSeries,
  DEFAULT_INDEX_NAME,
  DataSeries,
  type SeriesFromType,
} from './series'
import type { IndexId, SeriesData } from './series-data'

export interface IAnnotationDataFrameOptions extends IDataFrameOptions {
  rowObs?: BaseDataFrame | undefined
  colVars?: BaseDataFrame | undefined
}

export class AnnotationDataFrame extends BaseDataFrame {
  _data: BaseDataFrame
  _rowObs: BaseDataFrame
  _colVars: BaseDataFrame

  constructor(options: IAnnotationDataFrameOptions = {}) {
    const { name = '', index, indexName, columns, rowObs, colVars } = options

    super(name)

    this._data = new ColFrame(options) // DataFrame(options)

    if (rowObs) {
      this._rowObs = rowObs
    } else {
      this._rowObs = new ColFrame({
        data: makeIndex(index, this._data.shape[0]).map((v) => [v]),
        columns: [indexName ?? DEFAULT_INDEX_NAME],
      })
    }

    if (colVars) {
      this._colVars = colVars
    } else {
      this._colVars = new ColFrame({
        data: makeColumns(columns, this._data.shape[1]).map((v) => [v]),
        columns: [DEFAULT_COLUMN_INDEX_NAME],
      })
    }
  }

  get rowObs(): BaseDataFrame {
    return this._rowObs
  }

  get colVars(): BaseDataFrame {
    return this._colVars
  }

  override setName(name: string, inplace = true): BaseDataFrame {
    const df = (inplace ? this : this.copy()) as AnnotationDataFrame

    df._data.setName(name, true)

    return df
  }

  override get name(): string {
    return this._data.name
  }

  override setCol(
    col: IndexId,
    data: SeriesFromType,
    inplace: boolean = true
  ): BaseDataFrame {
    const df = inplace ? this : (this.copy() as AnnotationDataFrame)

    const colIdx = findCol(df, col)

    df._data.setCol(colIdx, data, true)

    setMetadataRow(this._colVars, colIdx, col)

    return df
  }

  override col(col: IndexId): BaseSeries {
    const colData = this._colVars.col(DEFAULT_COLUMN_INDEX_NAME)

    const colIdx = findInSeries(colData, col)

    if (colIdx.length === 0) {
      throw new Error(`Column ${col} not found in table`)
    }

    return new DataSeries(this._data.col(colIdx[0]!).values, {
      name: this._colVars.str(colIdx[0]!, 0),
    })
  }

  override colValues(col: IndexId): SeriesData[] {
    return this._data.colValues(col)
  }

  override get(row: IndexId, col: IndexId): SeriesData {
    return this._data.get(row, col)
  }

  override row(row: IndexId): BaseSeries {
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

  override rowValues(row: IndexId): SeriesData[] {
    return this._data.rowValues(row)
  }

  override setRow(
    row: IndexId,
    data: SeriesFromType,
    inplace: boolean = true
  ): BaseDataFrame {
    const df = inplace ? this : this.copy()

    const rowIdx = findRow(df, row)

    df.setRow(rowIdx, data, true)

    setMetadataRow(this._rowObs, rowIdx, row)

    return df
  }

  override at(
    row: IndexId,
    col: IndexId,
    v: SeriesData,
    inplace: boolean = true
  ): BaseDataFrame {
    return this._data.at(row, col, v, inplace)
  }

  override setIndex(
    index: IndexFromType,
    inplace: boolean = true
  ): BaseDataFrame {
    const df: AnnotationDataFrame = inplace
      ? this
      : (this.copy() as AnnotationDataFrame)

    df._data.setIndex(index, true)
    df._rowObs.setCol(0, df.index.values, true)

    return df
  }

  override setIndexName(name: string, inplace: boolean = true): BaseDataFrame {
    const df: AnnotationDataFrame = inplace
      ? this
      : (this.copy() as AnnotationDataFrame)

    df._data.setIndexName(name, true)

    const cols = df._rowObs.columns
    cols[0] = name
    df._rowObs.setColNames(cols, true)

    return df
  }

  override setColNames(
    index: IndexFromType,
    inplace: boolean = true
  ): BaseDataFrame {
    const df: AnnotationDataFrame = inplace
      ? this
      : (this.copy() as AnnotationDataFrame)

    //df.setColNames(index, true)
    df.colVars.setCol(0, index, true)

    return df
  }

  override get cols(): BaseSeries[] {
    return this._data.cols
  }

  // override get columns(): Index {
  //   return new DataIndex(this._colMetaData.col(0).values as SeriesData[], {
  //     name: this._colMetaData.colName(0),
  //   })
  // }

  override get index(): Index {
    return new DataIndex(this._rowObs.col(0).values as SeriesData[], {
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

  override get size(): number {
    return this._data.size
  }

  override get values(): SeriesData[][] {
    // return copy as we want dataframe to be immutable
    return this._data.values
  }

  override map<T>(f: (v: SeriesData, row: number, col: number) => T): T[][] {
    return this._data.map(f)
  }

  override iloc({
    rows,
    cols,
  }: { rows?: LocType; cols?: LocType } = {}): BaseDataFrame {
    const df = this._data.iloc({ rows, cols }) as BaseDataFrame

    const ret = new AnnotationDataFrame({
      name: this.name,
      data: df.cols,
      //columns: df.columns,
      //index: df.index,
    })

    // both are row oriented so we slice col meta data the same way as rows and row meta data the same way as rows
    ret._rowObs = this._rowObs.iloc({ rows })
    ret._colVars = this._colVars.iloc({ rows: cols })

    return ret
  }

  override rowApply(
    f: (row: SeriesData[], index: number) => SeriesData
  ): BaseSeries {
    return this._data.rowApply(f)
  }

  override rowMap<T>(f: (row: SeriesData[], index: number) => T): T[] {
    return this._data.rowMap(f)
  }

  override colMap<T>(f: (col: SeriesData[], index: number) => T): T[] {
    return this._data.colMap(f)
  }

  // override isin(rows: LocType = ':', cols: LocType = ':'): BaseDataFrame {
  //   return this._dataframe.isin(rows, cols)
  // }

  override min(): number {
    return this._data.min()
  }

  override max(): number {
    return this._data.max()
  }

  override get t(): BaseDataFrame {
    const ret = new AnnotationDataFrame({
      name: this.name,
      data: this._data.t.values,
      //columns: df.columns,
      //index: df.index,
    })

    ret._rowObs = this._colVars
    ret._colVars = this._rowObs

    return ret
  }

  override copy(): BaseDataFrame {
    const ret = new AnnotationDataFrame({
      name: this.name,
      data: this._data.values,
      //index: this._dataframe.index.copy(),
      //columns: this._dataframe.columns.copy(),
    })

    ret._rowObs = this._rowObs.copy()
    ret._colVars = this._colVars.copy()

    return ret
  }

  override replace(
    data: SeriesData[] | SeriesData[][] | BaseSeries
  ): BaseDataFrame {
    if (!shapesEqual(shape(data), this.shape)) {
      throw new Error('replacement data must be same shape as matrix')
    }

    const ret = new AnnotationDataFrame({
      name: this.name,
      data,
      //index: this._dataframe.index.copy(),
      //columns: this._dataframe.columns.copy(),
    })

    ret._rowObs = this._rowObs.copy()
    ret._colVars = this._colVars.copy()

    return ret
  }
}

function setMetadataRow(metadata: BaseDataFrame, rowIdx: number, row: IndexId) {
  if (rowIdx === -1) {
    // we only update the meta data to add new info
    // we fill in the missing annotation by assuming the first
    // meta column is the index label and anything else is
    // extra annotation which we set to the empty string
    metadata.setRow(rowIdx, [row, ...vfill('', metadata.shape[1] - 1)], true)
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
    data: fill2d('', rows, cols),
  })
}

export function create100x26Df() {
  return createEmptyFrame(100, 26)
}

export const DATAFRAME_100x26 = create100x26Df()

export interface ISharedAnnotationDataFrame {
  rowObs: { columns: string[]; data: SeriesData[][] }
  colVars: { columns: string[]; data: SeriesData[][] }
  data: SeriesData[][]
  name: string
}
