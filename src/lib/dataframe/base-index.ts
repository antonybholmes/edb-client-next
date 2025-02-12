import type { Shape } from './dataframe-types'

export type IndexType = 'number' | 'excel' | 'data'

export class BaseIndex {
  // setName(name: string): BaseIndex {
  //   return this
  // }

  get name(): string {
    return ''
  }

  get type(): IndexType {
    return 'data'
  }

  get size(): number {
    return -1
  }

  /**
   * Returns the shape of the index, typically n x 1
   */
  get shape(): Shape {
    return [this.size, 0]
  }

  /**
   * Synonym for size
   */
  get length(): number {
    return this.size
  }
}
