import {
  EmptyNumIndex,
  ExcelIndex,
  IIndexOptions,
  Index,
  IndexFromType,
} from '.'
import { Cell } from './cell'

export class DataIndex<T extends Cell> extends Index<T> {
  _data: T[]
  _map: Map<string, number> | null = null

  constructor(data: readonly T[], opts: IIndexOptions = {}) {
    super(opts)

    this._data = [...data]
  }

  override get values(): T[] {
    return [...this._data]
  }

  override at(index: number): T {
    if (index < 0 || index >= this._data.length) {
      throw new Error(`Index out of bounds: ${index}`)
    }

    return this._data[index]
  }

  override set(index: number, value: T): DataIndex<T> {
    this._data[index] = value
    return this
  }

  override get length(): number {
    return this._data.length
  }

  override filter(idx: number[]): DataIndex<T> {
    return new DataIndex<T>(
      idx.map((i) => this._data[i]!),
      { name: this.name }
    )
  }

  override indexOf(t: string): number[] {
    const lt = t.toLowerCase()

    // lazy initialize the map for faster lookups if not already done
    if (!this._map) {
      this._map = new Map(
        this._data.map((v, i) => [v.toString().toLowerCase(), i])
      )
    }

    return this._map.has(lt) ? [this._map.get(lt)!] : []
  }

  override copy(): DataIndex<T> {
    return new DataIndex<T>([...this._data], { name: this.name })
  }

  override [Symbol.iterator]() {
    return this._data[Symbol.iterator]()
  }

  override entries(): IterableIterator<[number, T]> {
    return this._data.entries()
  }
}

export class StringIndex extends DataIndex<string> {
  constructor(data: string[], options: IIndexOptions = {}) {
    super(data, options)
  }

  override str(index: number): string {
    return this._data[index]! as string
  }

  override get strs(): string[] {
    return this._data as string[]
  }

  override get values(): string[] {
    return this.strs
  }
}

export class NumIndex extends DataIndex<number> {
  constructor(data: number[], options: IIndexOptions = {}) {
    super(data, options)
  }

  override num(index: number): number {
    return this._data[index] as number
  }

  override get nums(): number[] {
    return this._data as number[]
  }

  override get values(): number[] {
    return this.nums
  }
}

//export type IndexFromType = Index | SeriesData[] | null

/**
 * Default numerical index for a data frame that just returns the
 * row index
 */

// export class InfNumIndex extends DataIndex {
//   constructor(length: number) {
//     super(range(1, length + 1))
//   }
// }

// export class ExcelIndex extends DataIndex {
//   constructor(length: number) {
//     super(range(0, length).map(i => getExcelColName(i)))
//   }
// }

//export const EMPTY_INDEX = new Index()
//export const NUM_INDEX = new InfNumIndex()
//export const EXCEL_INDEX = new InfExcelIndex()

/**
 * Make an index from an array of values or an existing index. If the input is null or undefined,
 * creates a default numerical index of the given length.
 * If the input is an index, returns the index as is. If the input is an array of values,
 * creates a new DataIndex from the values.
 *
 * @param index - an Index, an array of values, or null/undefined to create a default numerical index
 */
export function makeIndex(
  index: IndexFromType | null | undefined,
  length: number,
  name?: string
): Index<Cell> {
  if (!index) {
    return new EmptyNumIndex(length)
  }

  if (index.length !== length) {
    throw new Error('length of index does not match table rows')
  }

  let ret: Index<Cell> | null = null

  if (index instanceof Index) {
    ret = index.copy()
  } else {
    ret = new DataIndex(index)
  }

  if (name) {
    ret.name = name
  }

  return ret
}

export function makeColumns(
  index: IndexFromType | null | undefined,
  length: number
): Index<Cell> {
  if (!index) {
    return new ExcelIndex(length)
  }

  if (index.length !== length) {
    throw new Error('length of columns does not match table cols')
  }

  if (index instanceof Index) {
    // if an existing index, make a copy of it as
    // we try to keep indexes immutable
    return index.copy()
  } else {
    return new DataIndex(index)
  }
}
