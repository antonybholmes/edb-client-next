import type { IndexMapFunc, SeriesData, Shape } from '.'
import { cellNum, cellStr } from './cell'

export abstract class BaseIndex {
  /**
   * Returns all values in the index.
   */
  abstract get values(): SeriesData[]

  /**
   * Returns the value at a given position in the index.
   * @param index
   */
  abstract get(index: number): SeriesData

  map<T>(f: IndexMapFunc<T>): T[] {
    return _map(this, f)
  }

  /**
   * Return the values as strings
   */
  get strs(): string[] {
    return this.values.map(v => cellStr(v))
  }

  abstract get name(): string

  /**
   * Synonym for size
   */
  abstract get length(): number

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
    return cellStr(this.get(index))
  }

  /**
   * Returns an index value as a number.
   *
   * @param index
   * @returns
   */
  num(index: number): number {
    return cellNum(this.get(index))
  }

  /**
   * Return the index values as purely numbers
   */
  get nums(): number[] {
    return this.values.map(v => cellNum(v))
  }

  /**
   * Returns the index values as numbers, removing any NaNs
   */
  get numsNoNA(): number[] {
    return this.nums.filter(v => !isNaN(v))
  }
}

function _map<T>(index: BaseIndex, f: IndexMapFunc<T>): T[] {
  return index.values.map((x, i) => f(x, i))
}
