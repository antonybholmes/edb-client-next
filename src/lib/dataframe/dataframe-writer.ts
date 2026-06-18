import { range } from '@/lib/math/range'
import { vfill } from '../fill'
import type { IFormatNumOpts } from '../text/text'
import { AnnotationDataFrame } from './annotation-dataframe'
import { BaseDataFrame } from './base-dataframe'
import { cellStr } from './cell'

export interface IDataFrameWriterOpts extends IFormatNumOpts {
  sep?: string

  hasIndex?: boolean
  hasHeader?: boolean
}

export class DataFrameWriter {
  private _sep: string
  private _dp: number
  private _index: boolean
  private _header: boolean
  private _commas: boolean

  /**
   *
   */
  constructor(options: IDataFrameWriterOpts = {}) {
    const {
      sep = '\t',
      dp = -1,
      commas = true,
      hasHeader = true,
      hasIndex = true,
    } = options

    this._sep = sep
    this._dp = dp
    this._commas = commas
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

  commas(commas: boolean): DataFrameWriter {
    const ret = new DataFrameWriter()
    ret._commas = commas
    return ret
  }

  /**
   * Returns a string representation of a table for downloading
   *
   * @param df table
   * @param dp precision of numbers
   * @returns
   */
  toString(df: BaseDataFrame | AnnotationDataFrame): string {
    if (df instanceof AnnotationDataFrame) {
      return this._annDftoString(df)
    } else {
      return this._toString(df)
    }
  }

  private _toString(df: BaseDataFrame): string {
    let ret: string[] = []

    if (this._index) {
      ret = range(df.shape[0]).map(ri =>
        [df.rowName(ri)]
          .concat(
            df
              .row(ri)!
              .values.map(v =>
                cellStr(v, { dp: this._dp, commas: this._commas })
              )
          )
          .join(this._sep)
      )
    } else {
      ret = range(df.shape[0]).map(ri =>
        df
          .row(ri)!
          .values.map(v => cellStr(v, { dp: this._dp, commas: this._commas }))
          .join(this._sep)
      )
    }

    // add header if required
    if (this._header) {
      const h = this._index
        ? [''].concat(df.columns).join(this._sep)
        : df.columns.join(this._sep)
      ret = [h].concat(ret)
    }

    return ret.join('\n')
  }

  private _annDftoString(df: AnnotationDataFrame): string {
    let ret: string[] = []

    const rowMetaN = df.rowObs.shape[1]
    const colMetaN = df.colVars.shape[1]

    if (this._index) {
      ret = range(df.shape[0]).map(ri =>
        [
          ...range(rowMetaN).map(mi => df.rowObs.get(ri, mi)),
          ...df
            .row(ri)!
            .values.map(v =>
              cellStr(v, { dp: this._dp, commas: this._commas })
            ),
        ].join(this._sep)
      )
    } else {
      ret = range(df.shape[0]).map(ri =>
        df
          .row(ri)!
          .values.map(v => cellStr(v, { dp: this._dp, commas: this._commas }))
          .join(this._sep)
      )
    }

    // add header if required
    if (this._header) {
      let headers: string[][] = []

      if (this._index) {
        const emptyHeadings = vfill('', rowMetaN)

        headers = range(colMetaN).map(mi => [
          ...emptyHeadings,
          ...df.colVars.col(mi).strs,
        ])

        // add the row meta data column names to the last header row
        headers[headers.length - 1]!.splice(
          0,
          df.rowObs.columns.length,
          ...df.rowObs.columns
        )
      } else {
        headers = range(colMetaN).map(mi => df.colVars.col(mi).strs)
      }

      ret = [...headers.map(h => h.join(this._sep)), ...ret]
    }

    return ret.join('\n')
  }
}
