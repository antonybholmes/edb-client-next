import type { IndexMapFunc, Shape } from '.'
import { cellNum, cellStr } from './cell'
import { Fields } from './fields'
import type { SeriesData } from './series-data'

export abstract class BaseIndex<T extends SeriesData> extends Fields {
  constructor(name: string = '') {
    super(name)
  }

  /**
   * Returns all values in the index.
   */
  abstract get values(): T[]

  /**
   * Returns the value at a given position in the index.
   *
   * @param index the position to get
   */
  abstract at(index: number): T

  /**
   * Sets the value at a given position in the index.
   *
   * @param index the position to set
   * @param value the value to set
   */
  abstract set(index: number, value: T): void

  map<T>(f: IndexMapFunc<T>): T[] {
    return _map(this, f)
  }

  /**
   * Return the values as strings
   */
  get strs(): readonly string[] {
    return this.values.map((v) => cellStr(v))
  }

  abstract get length(): number

  /**
   * Synonym for length
   */
  get size(): number {
    return this.length
  }

  /**
   * Returns the shape of the index, typically n x 1
   */
  get shape(): Shape {
    return [this.length, 1] as Shape
  }

  /**
   * Returns an index value as a string.
   *
   * @param index
   * @returns
   */
  str(index: number): string {
    return cellStr(this.at(index))
  }

  /**
   * Returns an index value as a number.
   *
   * @param index
   * @returns
   */
  num(index: number): number {
    return cellNum(this.at(index))
  }

  /**
   * Return the index values as purely numbers
   */
  get nums(): readonly number[] {
    return this.values.map((v) => cellNum(v))
  }

  /**
   * Returns the index values as numbers, removing any NaNs
   */
  get numsNoNA(): number[] {
    return this.nums.filter((v) => !isNaN(v))
  }

  abstract [Symbol.iterator](): Iterator<T>
}

function _map<T>(index: BaseIndex<SeriesData>, f: IndexMapFunc<T>): T[] {
  return index.values.map((x, i) => f(x, i))
}
