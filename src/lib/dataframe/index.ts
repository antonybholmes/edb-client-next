import { range } from '../math/range'
import { whereStr } from '../math/where'
import type { UndefStr } from '../text/text'
import { BaseIndex } from './base-index'
import { getExcelColName } from './cell'
import type { SeriesData } from './series-data'

export type Shape = [number, number]

export type IndexFromType = Index | SeriesData[]

export function shapesEqual(s1: Shape, s2: Shape): boolean {
  return s1[0] === s2[0] && s1[1] === s2[1]
}

export type IndexMapFunc<T> = (v: SeriesData, i: number) => T

export abstract class Index extends BaseIndex {
  _name: string

  constructor(name: string = '') {
    super()

    this._name = name
  }

  setName(name: string): BaseIndex {
    this._name = name
    return this
  }

  override get name(): string {
    return this._name
  }

  abstract filter(idx: number[]): Index

  find(s: string, caseInsensitive: boolean = true): number[] {
    return whereStr(this.strs, s, caseInsensitive)
  }

  abstract entries(): IterableIterator<[number, SeriesData]>

  abstract copy(): Index
}

export interface IIndexOptions {
  name?: UndefStr
}

export abstract class InfIndex extends Index {
  private _length: number

  constructor(length: number = 0, opts: IIndexOptions = {}) {
    const { name = '' } = opts
    super(name)
    this._length = length
  }

  override get(index: number): SeriesData {
    return index
  }

  override get length(): number {
    return this._length
  }

  override filter(idx: number[]): Index {
    return new DataIndex(
      idx.map(i => this.get(i)),
      { name: this._name }
    )
  }

  override copy(): Index {
    return this
  }
}

export class NumInfIndex extends InfIndex {
  constructor(length: number = 0, opts: IIndexOptions = {}) {
    const { name = 'Num Index' } = opts

    super(length, { name })
  }

  override get nums(): number[] {
    return range(1, this.length + 1)
  }

  override get values(): SeriesData[] {
    return this.nums
  }

  override num(index: number): number {
    return index + 1
  }

  override get(index: number): SeriesData {
    return this.num(index)
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.length; i++) {
      yield i + 1
    }
  }

  *entries(): IterableIterator<[number, SeriesData]> {
    for (let i = 0; i < this.length; i++) {
      yield [i, i + 1]
    }
  }
}

export class DataIndex extends Index {
  _data: SeriesData[]
  _map: Map<SeriesData, number> | null = null

  constructor(data: SeriesData[], options: IIndexOptions = {}) {
    const { name = '' } = options

    super(name)

    this._data = [...data]
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

  override find(t: string): number[] {
    const lt = t.toLowerCase()

    // lazy initialize the map for faster lookups if not already done
    if (!this._map) {
      this._map = new Map(
        this._data.map((v, i) => [v.toString().toLowerCase(), i])
      )
    }

    return this._map.has(lt) ? [this._map.get(lt)!] : []
  }

  override copy(): Index {
    return new DataIndex([...this._data], { name: this._name })
  }

  *[Symbol.iterator]() {
    for (const x of this._data) {
      yield x
    }
  }

  *entries(): IterableIterator<[number, SeriesData]> {
    for (let i = 0; i < this._data.length; i++) {
      yield [i, this._data[i]!]
    }
  }
}

export class StringIndex extends DataIndex {
  constructor(data: string[], options: IIndexOptions = {}) {
    super(data, options)
  }

  override str(index: number): string {
    return this._data[index]! as string
  }

  override get strs(): string[] {
    return this._data as string[]
  }

  override get values(): SeriesData[] {
    return this.strs
  }
}

export class NumIndex extends DataIndex {
  constructor(data: number[], options: IIndexOptions = {}) {
    super(data, options)
  }

  override num(index: number): number {
    return this._data[index] as number
  }

  override get nums(): number[] {
    return this._data as number[]
  }

  override get values(): SeriesData[] {
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

export class ExcelIndex extends InfIndex {
  constructor(length: number = 0, opts: IIndexOptions = {}) {
    super(length, opts)
  }

  override get values(): SeriesData[] {
    return range(this.length).map(i => getExcelColName(i))
  }

  override get(index: number): SeriesData {
    return getExcelColName(index)
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.length; i++) {
      yield getExcelColName(i)
    }
  }

  *entries(): IterableIterator<[number, SeriesData]> {
    for (let i = 0; i < this.length; i++) {
      yield [i, getExcelColName(i)]
    }
  }
}

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
): Index {
  if (!index) {
    return new NumInfIndex(length)
  }

  if (index.length !== length) {
    throw new Error('length of index does not match table rows')
  }

  let ret: Index | null = null

  if (index instanceof Index) {
    ret = index.copy()
  } else {
    ret = new DataIndex(index)
  }

  if (name) {
    ret.setName(name)
  }

  return ret
}

export function makeColumns(
  index: IndexFromType | null | undefined,
  length: number
): Index {
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

export function strs(data: SeriesData[]): string[] {
  return data.map(d => d.toString())
}

export function nums(data: SeriesData[]): number[] {
  return data.map(d => (typeof d === 'number' ? d : NaN))
}

export function bools(data: SeriesData[]): boolean[] {
  return data.map(d => (typeof d === 'boolean' ? d : Boolean(d)))
}

export function dates(data: SeriesData[]): Date[] {
  return data.map(d => (d instanceof Date ? d : new Date(NaN)))
}
