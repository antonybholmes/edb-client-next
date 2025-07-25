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

import { fill, fill2d } from '../fill'
import { getExcelColName } from './cell'
import { DataFrame, type IDataFrameOptions } from './dataframe'
import {
  shapesEqual,
  type IndexFromType,
  type IndexId,
  type SeriesData,
  type SeriesFromType,
  type Shape,
} from './dataframe-types'
import { DataIndex, Index, makeColumns, makeIndex } from './index'
import { BaseSeries, DEFAULT_INDEX_NAME, Series } from './series'

export interface IAnnotationDataFrameOptions extends IDataFrameOptions {
  rowMetaData?: BaseDataFrame | undefined
  colMetaData?: BaseDataFrame | undefined
}

export class AnnotationDataFrame extends BaseDataFrame {
  _dataframe: BaseDataFrame
  _rowMetaData: BaseDataFrame
  _colMetaData: BaseDataFrame

  constructor(options: IAnnotationDataFrameOptions = {}) {
    const {
      name = '',
      index,
      indexName,
      columns,
      rowMetaData,
      colMetaData,
    } = options

    super(name)

    this._dataframe = new DataFrame(options)

    if (rowMetaData) {
      this._rowMetaData = rowMetaData
    } else {
      this._rowMetaData = new DataFrame({
        data: makeIndex(index, this._dataframe.shape[0]).map(v => [v]),
        columns: [indexName ?? DEFAULT_INDEX_NAME],
      })
    }

    if (colMetaData) {
      this._colMetaData = colMetaData
    } else {
      this._colMetaData = new DataFrame({
        data: makeColumns(columns, this._dataframe.shape[1]).map(v => [v]),
        columns: [DEFAULT_COLUMN_INDEX_NAME],
      })
    }
  }

  get rowMetaData(): BaseDataFrame {
    return this._rowMetaData
  }

  get colMetaData(): BaseDataFrame {
    return this._colMetaData
  }

  override setName(name: string, inplace = false): BaseDataFrame {
    const df = (inplace ? this : this.copy()) as AnnotationDataFrame

    df._dataframe.setName(name, true)

    return df
  }

  override get name(): string {
    return this._dataframe.name
  }

  override setCol(
    col: IndexId,
    data: SeriesFromType,
    inplace: false
  ): BaseDataFrame {
    const df = inplace ? this : (this.copy() as AnnotationDataFrame)

    const colIdx = findCol(df, col)

    df._dataframe.setCol(colIdx, data, true)

    setMetadataRow(this._colMetaData, colIdx, col)

    return df
  }

  override col(col: IndexId): BaseSeries {
    const colData = this._colMetaData.col(DEFAULT_COLUMN_INDEX_NAME)

    const colIdx = findInSeries(colData, col)[0]!

    return new Series(this._dataframe.col(colIdx).values, {
      name: this._colMetaData.str(colIdx, 0),
    })
  }

  override colValues(col: IndexId): SeriesData[] {
    return this._dataframe.colValues(col)
  }

  override get(row: IndexId, col: IndexId): SeriesData {
    return this._dataframe.get(row, col)
  }

  override row(row: IndexId): BaseSeries {
    // return new Series(this._dataframe.row(row).values, {
    //   name: this._rowMetaData.str(row, 0),
    // })

    const rowData = this._rowMetaData.col(DEFAULT_INDEX_NAME)

    const rowIdx = findInSeries(rowData, row)[0]!

    return new Series(this._dataframe.row(rowIdx).values, {
      name: this._rowMetaData.str(rowIdx, 0),
    })
  }

  override rowValues(row: IndexId): SeriesData[] {
    return this._dataframe.rowValues(row)
  }

  override setRow(
    row: IndexId,
    data: SeriesFromType,
    inplace: boolean = false
  ): BaseDataFrame {
    const df = inplace ? this : this.copy()

    const rowIdx = findRow(df, row)

    df.setRow(rowIdx, data, true)

    setMetadataRow(this._rowMetaData, rowIdx, row)

    return df
  }

  override set(row: number, col: number, v: SeriesData): BaseDataFrame {
    return this._dataframe.set(row, col, v)
  }

  override setIndex(
    index: IndexFromType,
    inplace: boolean = true
  ): BaseDataFrame {
    const df: AnnotationDataFrame = inplace
      ? this
      : (this.copy() as AnnotationDataFrame)

    df._dataframe.setIndex(index, true)
    df._rowMetaData.setCol(0, df.index.values, true)

    return df
  }

  override setIndexName(name: string, inplace: boolean = true): BaseDataFrame {
    const df: AnnotationDataFrame = inplace
      ? this
      : (this.copy() as AnnotationDataFrame)

    df._dataframe.setIndexName(name, true)

    const cols = df._rowMetaData.colNames
    cols[0] = name
    df._rowMetaData.setColNames(cols, true)

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
    df.colMetaData.setCol(0, index, true)

    return df
  }

  override get cols(): BaseSeries[] {
    return this._dataframe.cols
  }

  override get columns(): Index {
    return new DataIndex(this._colMetaData.col(0).values as SeriesData[], {
      name: this._colMetaData.colName(0),
    })
  }

  override get index(): Index {
    return new DataIndex(this._rowMetaData.col(0).values as SeriesData[], {
      name: this._rowMetaData.colName(0),
    })
  }

  override colName(col: number): string {
    return this._colMetaData.str(col, 0)
  }

  override rowName(row: number): string {
    return this._rowMetaData.str(row, 0)
  }

  override get shape(): Shape {
    return this._dataframe.shape
  }

  override get size(): number {
    return this._dataframe.size
  }

  override get values(): SeriesData[][] {
    // return copy as we want dataframe to be immutable
    return this._dataframe.values
  }

  override map<T>(f: (v: SeriesData, row: number, col: number) => T): T[][] {
    return this._dataframe.map(f)
  }

  override iloc(rows: LocType = ':', cols: LocType = ':'): BaseDataFrame {
    const df = this._dataframe.iloc(rows, cols)

    const ret = new AnnotationDataFrame({
      name: this.name,
      data: df,
      //columns: df.columns,
      //index: df.index,
    })

    ret._rowMetaData = this._rowMetaData.iloc(rows, ':')
    ret._colMetaData = this._colMetaData.iloc(cols, ':')

    return ret
  }

  override rowApply(
    f: (row: SeriesData[], index: number) => SeriesData
  ): BaseSeries {
    return this._dataframe.rowApply(f)
  }

  override rowMap<T>(f: (row: SeriesData[], index: number) => T): T[] {
    return this._dataframe.rowMap(f)
  }

  override colMap<T>(f: (col: SeriesData[], index: number) => T): T[] {
    return this._dataframe.colMap(f)
  }

  // override isin(rows: LocType = ':', cols: LocType = ':'): BaseDataFrame {
  //   return this._dataframe.isin(rows, cols)
  // }

  min(): number {
    return this._dataframe.min()
  }

  max(): number {
    return this._dataframe.max()
  }

  override get t(): BaseDataFrame {
    const ret = new AnnotationDataFrame({
      name: this.name,
      data: this._dataframe.t,
      //columns: df.columns,
      //index: df.index,
    })

    ret._rowMetaData = this._colMetaData
    ret._colMetaData = this._rowMetaData

    return ret
  }

  override copy(): BaseDataFrame {
    const ret = new AnnotationDataFrame({
      name: this.name,
      data: this._dataframe.values,
      //index: this._dataframe.index.copy(),
      //columns: this._dataframe.columns.copy(),
    })

    ret._rowMetaData = this._rowMetaData.copy()
    ret._colMetaData = this._colMetaData.copy()

    return ret
  }

  override replaceData(
    data: SeriesData[][] | SeriesData[] | BaseDataFrame | BaseSeries
  ): BaseDataFrame {
    const d = data instanceof BaseDataFrame ? data.values : data

    if (!shapesEqual(shape(data), this.shape)) {
      throw new Error('replacement data must be same shape as matrix')
    }

    const ret = new AnnotationDataFrame({
      name: this.name,
      data: d,
      //index: this._dataframe.index.copy(),
      //columns: this._dataframe.columns.copy(),
    })

    ret._rowMetaData = this._rowMetaData.copy()
    ret._colMetaData = this._colMetaData.copy()

    return ret
  }
}

function setMetadataRow(metadata: BaseDataFrame, rowIdx: number, row: IndexId) {
  if (rowIdx === -1) {
    // we only update the meta data to add new info
    // we fill in the missing annotation by assuming the first
    // meta column is the index label and anything else is
    // extra annotation which we set to the empty string
    metadata.setRow(rowIdx, [row, ...fill('', metadata.shape[1] - 1)], true)
  }
}

export function toAnnDf(df: BaseDataFrame): AnnotationDataFrame {
  return new AnnotationDataFrame({
    data: df,
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

export function create100x26Df() {
  return new AnnotationDataFrame({
    name: DEFAULT_SHEET_NAME,
    data: fill2d('', 100, 26),
  })
}

export const DATAFRAME_100x26 = create100x26Df()

export interface ISharedAnnotationDataFrame {
  rowMetaData: { columns: string[]; data: SeriesData[][] }
  colMetaData: { columns: string[]; data: SeriesData[][] }
  data: SeriesData[][]
  name: string
}
