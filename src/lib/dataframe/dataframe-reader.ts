import { range } from '@lib/math/range'
import { AnnotationDataFrame } from './annotation-dataframe'
import { DEFAULT_COLUMN_INDEX_NAME } from './base-dataframe'
import { makeCell } from './cell'
import { DataFrame } from './dataframe'
import type { SeriesData } from './dataframe-types'
import { DEFAULT_INDEX_NAME } from './series'

export type Delimiter = '\t' | ',' | ' '

export interface IDataFrameReaderOpts {
  colNames?: number
  skipRows?: number
  indexCols?: number
  ignoreRows?: Set<number> | number
  delimiter?: Delimiter
  keepDefaultNA?: boolean
  trimWhitespace?: boolean
}

export class DataFrameReader {
  private _colNames: number
  private _skipRows: number
  private _indexCols: number
  private _ignoreRows: Set<number>
  private _delimiter: Delimiter
  private _keepDefaultNA: boolean
  private _trimWhitespace: boolean

  /**
   *
   */
  constructor(options?: IDataFrameReaderOpts) {
    const {
      colNames = 1,
      skipRows = 0,
      indexCols = 0,
      ignoreRows = new Set<number>(),
      delimiter = '\t' as Delimiter,
      keepDefaultNA = true,
      trimWhitespace = true,
    } = options ?? {}

    this._colNames = colNames
    this._skipRows = skipRows
    this._indexCols = indexCols
    this._delimiter = delimiter
    this._keepDefaultNA = keepDefaultNA
    this._trimWhitespace = trimWhitespace

    if (typeof ignoreRows === 'number') {
      this._ignoreRows = new Set<number>([...range(ignoreRows)])
    } else {
      this._ignoreRows = ignoreRows
    }
  }

  copy(): DataFrameReader {
    const ret = new DataFrameReader()
    ret._colNames = this._colNames
    ret._skipRows = this._skipRows
    ret._indexCols = this._indexCols
    ret._ignoreRows = this._ignoreRows
    ret._delimiter = this._delimiter
    ret._keepDefaultNA = this._keepDefaultNA

    return ret
  }

  colNames(colNames: number): DataFrameReader {
    const ret = this.copy()
    ret._colNames = colNames
    return ret
  }

  skipRows(skipRows: number): DataFrameReader {
    const ret = this.copy()
    ret._skipRows = skipRows
    return ret
  }

  indexCols(indexCols: number): DataFrameReader {
    const ret = this.copy()
    ret._indexCols = indexCols
    return ret
  }

  ignoreRows(ignoreRows: number[]): DataFrameReader {
    const ret = this.copy()
    ret._ignoreRows = new Set(ignoreRows)
    return ret
  }

  delimiter(delimiter: Delimiter): DataFrameReader {
    const ret = this.copy()
    ret._delimiter = delimiter
    return ret
  }

  keepDefaultNA(keepDefaultNA: boolean): DataFrameReader {
    const ret = this.copy()
    ret._keepDefaultNA = keepDefaultNA
    return ret
  }

  trimWhitespace(trimWhitespace: boolean): DataFrameReader {
    const ret = this.copy()
    ret._trimWhitespace = trimWhitespace
    return ret
  }

  read(lines: string[]): AnnotationDataFrame {
    let tokens: string[]

    //let rowIndexName: string | null = null

    let colNames: string[] = []

    tokens = lines[this._skipRows]!.trimEnd()
      .replaceAll('"', '')
      .split(this._delimiter)

    if (this._trimWhitespace) {
      tokens = tokens.map(t => t.trim())
    }

    //console.log(tokens)

    // how many columns are in the file
    const columns = tokens.length - this._indexCols

    if (this._colNames > 0) {
      // if (this._indexCols > 0) {
      //   rowIndexName = tokens[0]!
      // }

      colNames = tokens.slice(this._indexCols)
    }

    const index: string[][] = []
    const data: SeriesData[][] = []
    const defaultCellValue = makeCell('', this._keepDefaultNA)

    let indexNames =
      this._colNames > 0
        ? lines[this._skipRows + this._colNames - 1]!.replaceAll('"', '')
            .split(this._delimiter)
            .slice(0, this._indexCols)
        : []

    if (this._trimWhitespace) {
      indexNames = indexNames.map(t => t.trim())
    }

    for (const [li, line] of lines
      .slice(this._skipRows + this._colNames)
      .entries()) {
      // only parse rows we are not ignoring
      if (!this._ignoreRows.has(li)) {
        tokens = line.replaceAll('"', '').split(this._delimiter)

        if (this._trimWhitespace) {
          tokens = tokens.map(t => t.trim())
        }

        if (tokens.length > 0) {
          if (this._indexCols > 0) {
            index.push(tokens.slice(0, this._indexCols))
          }

          // tokens.slice(this._indexCols).forEach((token, ci) => {
          //   // data has to be col centric so add new col first
          //   // time we process a row
          //   if (ci === data.length) {
          //     data.push([])
          //   }

          //   data[ci].push(makeCell(token))
          // })

          // each row must be the have the same number of rows
          const cells = Array(columns).fill(defaultCellValue)

          // overwrite with the real values. This means if text file
          // has missing values (e.g. row is short because couldn't be
          // bothered to regularize table), a complete row is created
          // for the matrix
          tokens.slice(this._indexCols).forEach((t, ti) => {
            cells[ti] = makeCell(t, this._keepDefaultNA)
          })

          data.push(cells)
        }
      }
    }

    //console.log(data)

    const rowIndex =
      index.length > 0
        ? new DataFrame({
            data: index,
            columns:
              indexNames.length > 0
                ? indexNames
                : range(this._indexCols).map(
                    i => `${DEFAULT_INDEX_NAME} ${i + 1}`
                  ),
          })
        : undefined

    const colIndex =
      colNames.length > 0
        ? new DataFrame({
            data: colNames.map(v => [v]),
            columns: [DEFAULT_COLUMN_INDEX_NAME],
          })
        : undefined

    const ret = new AnnotationDataFrame({
      data,
      rowMetaData: rowIndex,
      colMetaData: colIndex,
    })

    return ret
  }
}

export const DEFAULT_READER = new DataFrameReader()
