import { EmptyNumIndex, Index } from '.'
import { Cell } from './cell'
import { Series } from './series'

export class EmptySeries<T extends Cell> extends Series<number, T> {
  _index: Index<number>

  constructor(size: number) {
    super()

    this._index = new EmptyNumIndex(size)
  }

  override get index(): Index<number> {
    return this._index
  }

  override setIndex(): EmptySeries<T> {
    return this
  }

  override get values(): T[] {
    return []
  }

  override at(): T {
    return null as T
  }

  override set(): EmptySeries<T> {
    return this
  }

  override get length() {
    return this._index.length
  }

  override filter(): EmptySeries<T> {
    return this
  }

  override copy(): EmptySeries<T> {
    return this
  }

  override [Symbol.iterator](): IterableIterator<T> {
    return [][Symbol.iterator]()
  }

  override entries(): IterableIterator<[number, T]> {
    return [][Symbol.iterator]()
  }
}
