import { range } from '../math/range'
import { BaseIndex } from './base-index'
import { getExcelColName } from './cell'

import type { IndexFromType, SeriesData } from './dataframe-types'

export type IndexMapFunc<T> = (v: SeriesData, i: number) => T

export abstract class Index extends BaseIndex {
  abstract copy(): Index

  abstract find(s: SeriesData): number[]

  abstract filter(idx: number[]): Index
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
export abstract class IterIndex extends Index {
  private _length: number

  constructor(length: number = 0) {
    super()
    this._length = length
  }

  override get(index: number) {
    return index
  }

  override get length(): number {
    return this._length
  }
}

export abstract class InfIndex extends IterIndex {
  constructor(length: number = 0) {
    super(length)
  }

  override copy(): Index {
    return this
  }

  override find(_s: SeriesData): number[] {
    return []
  }
  override filter(_idx: number[]): Index {
    return this
  }
}

export class NumIndex extends InfIndex {
  override setName(): BaseIndex {
    return this
  }

  constructor(length: number = 0) {
    super(length)
  }

  override get values(): SeriesData[] {
    return range(1, this.length + 1)
  }

  override get name(): string {
    return 'Num Index'
  }

  override get(index: number) {
    return index + 1
  }
}

export class DataIndex extends Index {
  _data: SeriesData[]
  _name: string

  constructor(data: SeriesData[], options: IIndexOptions = {}) {
    super()

    const { name } = { name: '', ...options }

    this._data = data
    this._name = name
  }

  override setName(name: string): DataIndex {
    this._name = name
    return this
  }

  override get name(): string {
    return this._name
  }

  override get values(): SeriesData[] {
    return [...this._data]
  }

  override get(index: number): SeriesData {
    return this._data[index] ?? NaN
  }

  override get length(): number {
    return this._data.length
  }

  override filter(idx: number[]): Index {
    return new DataIndex(
      idx.map(i => this._data[i]!),
      { name: this._name }
    )
  }

  // isin(idx: SeriesData[]): Index {
  //   const s = new Set(idx)
  //   return new DataIndex(
  //     this._data.filter(i => s.has(i)),
  //     { name: this._name }
  //   )
  // }

  override find(t: SeriesData): number[] {
    const s = t.toString().toLowerCase()

    return this._data
      .map((v, i) => [v.toString().toLowerCase(), i] as [string, number])
      .filter((x: [string, number]) => x[0].includes(s))
      .map((x: [string, number]) => x[1])
  }

  override copy(): Index {
    return new DataIndex([...this._data], { name: this._name })
  }
}

// export class NumIndex extends DataIndex {
//   constructor(data: number[]) {
//     super(data)
//   }
// }

//export type IndexFromType = Index | SeriesData[] | null

/**
 * Default numerical index for a data frame that just returns the
 * row index
 */

export class InfNumIndex extends DataIndex {
  constructor(length: number) {
    super(range(1, length + 1))
  }
}

export class InfExcelIndex extends DataIndex {
  constructor(length: number) {
    super(range(0, length).map(i => getExcelColName(i)))
  }
}

//export const EMPTY_INDEX = new Index()
//export const NUM_INDEX = new InfNumIndex()
//export const EXCEL_INDEX = new InfExcelIndex()

export function makeIndex(
  index: IndexFromType | undefined,
  length: number,
  name?: string
): Index {
  if (!index) {
    return new InfNumIndex(length)
  }

  if (index.length !== length) {
    throw new Error('length of index does not match table rows')
  }

  let ret: Index | null = null

  if (index instanceof Index) {
    ret = index
  } else {
    ret = new DataIndex(index)
  }

  if (name) {
    ret.setName(name)
  }

  return ret
}

export function makeColumns(
  index: IndexFromType | undefined,
  length: number
): Index {
  if (!index) {
    return new InfExcelIndex(length)
  }

  if (index.length !== length) {
    throw new Error('length of columns does not match table cols')
  }

  if (index instanceof Index) {
    return index
  } else {
    return new DataIndex(index)
  }
}

/**
 * Converts an index to its values or if the index is already an
 * array of basic types, returns the array as is.
 * @param index
 * @returns
 */
export function indexAsValues(index: IndexFromType): SeriesData[] {
  if (index instanceof Index) {
    return index.values
  } else {
    return index
  }
}
