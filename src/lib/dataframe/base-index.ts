import type { IndexMapFunc, Shape } from '.'
import { cellNum, cellStr } from './cell'
import type { SeriesData } from './series-data'

export abstract class BaseIndex {
  /**
   * Returns all values in the index.
   */
  abstract get values(): SeriesData[]

  /**
   * Returns the value at a given position in the index.
   *
   * @param index the position to get
   */
  abstract at(index: number): SeriesData

  /**
   * Sets the value at a given position in the index.
   *
   * @param index the position to set
   * @param value the value to set
   */
  abstract set(index: number, value: SeriesData): void

  map<T>(f: IndexMapFunc<T>): T[] {
    return _map(this, f)
  }

  /**
   * Return the values as strings
   */
  get strs(): readonly string[] {
    return this.values.map((v) => cellStr(v))
  }

  /**
   * Returns the name of the index.
   */
  abstract get name(): string

  abstract get size(): number

  /**
   * Synonym for size
   */
  get length(): number {
    return this.size
  }

  /**
   * Returns the shape of the index, typically n x 1
   */
  get shape(): Shape {
    return [this.size, 1] as Shape
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
}

function _map<T>(index: BaseIndex, f: IndexMapFunc<T>): T[] {
  return index.values.map((x, i) => f(x, i))
}
