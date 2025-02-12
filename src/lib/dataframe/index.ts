import { BaseIndex, type IndexType } from './base-index'
import { cellStr, getExcelColName } from './cell'
import type { IndexData } from './dataframe-types'

export class Index extends BaseIndex {
  get values(): IndexData[] {
    return []
  }

  /**
   * Return the values as strings
   */
  get strs(): string[] {
    return this.values.map((v) => cellStr(v))
  }

  get(
    _index: number // eslint-disable-line @typescript-eslint/no-unused-vars
  ): IndexData {
    return NaN
  }

  getName(index: number): string {
    return this.get(index).toString()
  }

  // toString(index: number, defaultValue: string = ""): string {
  //   const ret = this.get(index)

  //   if (ret !== null) {
  //     return ret.toString()
  //   } else {
  //     return defaultValue
  //   }
  // }

  map<T>(callback: (v: IndexData, i: number) => T): T[] {
    return this.values.map((x, i) => callback(x, i))
  }

  filter(
    _idx: number[] // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Index {
    return this
  }

  copy(): Index {
    return this
  }

  find(
    _s: IndexData // eslint-disable-line @typescript-eslint/no-unused-vars
  ): number[] {
    return []
  }
}

export interface IIndexOptions {
  name?: string
}

/**
 * Indexes that have a defined size, but do not
 * store each value internally. For example a
 * numerical index only returns the index value
 * at a given index on demand.
 */
export class IterIndex extends Index {
  private _length: number

  constructor(length: number = 0) {
    super()
    this._length = length
  }

  override get size(): number {
    return this._length
  }
}

// export class NumIndex extends DataIndex {
//   constructor(data: number[]) {
//     super(data)
//   }
// }

/**
 * Default numerical index for a data frame that just returns the
 * row index
 */
export class InfNumIndex extends Index {
  constructor() {
    super()
  }

  override get type(): IndexType {
    return 'number'
  }

  override get(index: number): number {
    return index + 1
  }
}

export class InfExcelIndex extends Index {
  constructor() {
    super()
  }

  override get type(): IndexType {
    return 'excel'
  }

  override get(index: number): string {
    return getExcelColName(index)
  }
}

export type IndexFromType = Index | IndexData[] | null

//export const EMPTY_INDEX = new Index()
export const NUM_INDEX = new InfNumIndex()
export const EXCEL_INDEX = new InfExcelIndex()
