import { whereStr } from '../math/where'
import type { UndefStr } from '../text/text'
import { BaseIndex } from './base-index'
import type { Cell } from './cell'
import { getExcelColName } from './cell'

export type Shape = [number, number]

export type IndexFromType = Index<Cell> | readonly Cell[]

export function shapesEqual(s1: Shape, s2: Shape): boolean {
  return s1[0] === s2[0] && s1[1] === s2[1]
}

export type IndexMapFunc<T> = (v: Cell, i: number) => T

export abstract class Index<T extends Cell> extends BaseIndex<T> {
  constructor(opts: { name?: string } = {}) {
    super(opts)
  }

  abstract filter(idx: number[]): Index<T>

  indexOf(s: string, opts: { caseInsensitive?: boolean } = {}): number[] {
    return whereStr(this.strs, s, opts)
  }

  abstract copy(): Index<T>
}

export interface IIndexOptions {
  name?: UndefStr
}

export abstract class EmptyIndex<T extends Cell> extends Index<T> {
  private _size: number

  constructor(size: number, opts: IIndexOptions = {}) {
    super(opts)
    this._size = size
  }

  override set(_index: number, _value: T): void {
    // do nothing for now
  }

  override get length(): number {
    return this._size
  }

  override copy(): EmptyIndex<T> {
    return this
  }
}

export class EmptyNumIndex extends EmptyIndex<number> {
  constructor(length: number = 0, opts: IIndexOptions = {}) {
    const { name = 'Num Index' } = opts

    super(length, { name })
  }

  override get nums(): number[] {
    return [] //range(1, this.size + 1)
  }

  override get values(): number[] {
    return this.nums
  }

  override num(index: number): number {
    return index + 1
  }

  override at(index: number): number {
    return this.num(index)
  }

  override set(): void {
    // do nothing for now
  }

  override filter(): EmptyNumIndex {
    return new EmptyNumIndex(this.length, { name: this.name })
  }

  // override *[Symbol.iterator]() {
  //   for (let i = 0; i < this.length; i++) {
  //     yield i + 1
  //   }
  // }

  // override *entries(): IterableIterator<[number, number]> {
  //   for (let i = 0; i < this.length; i++) {
  //     yield [i, i + 1]
  //   }
  // }

  override [Symbol.iterator]() {
    return [][Symbol.iterator]()
  }

  override entries(): IterableIterator<[number, number]> {
    return [][Symbol.iterator]()
  }
}

export class ExcelIndex extends EmptyIndex<string> {
  constructor(length: number = 0, opts: IIndexOptions = {}) {
    super(length, opts)
  }

  override get values(): string[] {
    return [] //range(this.length).map((i) => getExcelColName(i))
  }

  override at(index: number): string {
    return getExcelColName(index)
  }

  override filter(): ExcelIndex {
    return new ExcelIndex(this.length, { name: this.name })
  }

  // *[Symbol.iterator]() {
  //   for (let i = 0; i < this.length; i++) {
  //     yield getExcelColName(i)
  //   }
  // }

  // *entries(): IterableIterator<[number, string]> {
  //   for (let i = 0; i < this.length; i++) {
  //     yield [i, getExcelColName(i)]
  //   }
  // }

  override [Symbol.iterator]() {
    return [][Symbol.iterator]()
  }

  override entries(): IterableIterator<[number, string]> {
    return [][Symbol.iterator]()
  }
}

/**
 * Converts an index to its values or if the index is already an
 * array of basic types, returns the array as is.
 * @param index
 * @returns
 */
export function indexAsValues(index: IndexFromType): readonly Cell[] {
  if (index instanceof Index) {
    return index.values
  } else {
    return index
  }
}

export function strs(data: Cell[]): string[] {
  return data.map((d) => d.toString())
}

export function nums(data: Cell[]): number[] {
  return data.map((d) => (typeof d === 'number' ? d : NaN))
}

export function bools(data: Cell[]): boolean[] {
  return data.map((d) => (typeof d === 'boolean' ? d : Boolean(d)))
}

export function dates(data: Cell[]): Date[] {
  return data.map((d) => (d instanceof Date ? d : new Date(NaN)))
}
