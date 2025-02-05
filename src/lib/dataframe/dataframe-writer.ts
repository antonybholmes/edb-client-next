import { range } from '@lib/math/range'
import { BaseDataFrame } from './base-dataframe'
import { cellStr } from './cell'

export interface IDataFrameWriterOpts {
  sep?: string
  dp?: number
  hasIndex?: boolean
  hasHeader?: boolean
}

export class DataFrameWriter {
  private _sep: string
  private _dp: number
  private _index: boolean
  private _header: boolean

  /**
   *
   */
  constructor(options?: IDataFrameWriterOpts) {
    const { sep, dp, hasHeader, hasIndex } = {
      sep: '\t',
      dp: -1,
      hasHeader: true,
      hasIndex: true,
      ...options,
    }

    console.log(options)

    this._sep = sep
    this._dp = dp
    this._index = hasIndex
    this._header = hasHeader
  }

  sep(sep: string): DataFrameWriter {
    const ret = new DataFrameWriter()
    ret._sep = sep
    return ret
  }

  dp(dp: number): DataFrameWriter {
    const ret = new DataFrameWriter()
    ret._dp = dp
    return ret
  }

  /**
   * Returns a string representation of a table for downloading
   *
   * @param df table
   * @param dp precision of numbers
   * @returns
   */
  toString(df: BaseDataFrame): string {
    let ret: string[] = []

    if (this._index) {
      ret = range(df.shape[0]).map(ri =>
        [df.getRowName(ri)]
          .concat(df.row(ri)!.values.map(v => cellStr(v, { dp: this._dp })))
          .join(this._sep)
      )
    } else {
      ret = range(df.shape[0]).map(ri =>
        df
          .row(ri)!
          .values.map(v => cellStr(v, { dp: this._dp }))
          .join(this._sep)
      )
    }

    // add header if required
    if (this._header) {
      const h = this._index
        ? [''].concat(df.colNames).join(this._sep)
        : df.colNames.join(this._sep)
      ret = [h].concat(ret)
    }

    return ret.join('\n')
  }
}
