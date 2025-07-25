import { customAlphabet } from 'nanoid'
import { range, rangeMap } from '../lib/math/range'

const NANOID = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12)

export function isStr(x: unknown) {
  return typeof x === 'string'
}

/**
 * #move - Moves an array item from one position in an array to another.
 * Note: This is a pure function so a new array will be returned, instead
 * of altering the array argument.
 *
 * https://github.com/granteagon/move
 *
 * @param array       Array in which to move an item
 * @param moveIndex   The index of the item to move.
 * @param toIndex     The index to move item at moveIndex to.
 * @returns
 */
export function move<T>(array: T[], moveIndex: number, toIndex: number) {
  const itemRemovedArray = [
    ...array.slice(0, moveIndex),
    ...array.slice(moveIndex + 1, array.length),
  ]
  return [
    ...itemRemovedArray.slice(0, toIndex),
    array[moveIndex],
    ...itemRemovedArray.slice(toIndex, itemRemovedArray.length),
  ]
}

export function result<T>(f: () => T | null | undefined) {
  try {
    const result = f()
    return [result, null]
  } catch (error) {
    return [null, error]
  }
}

export function uuid(): string {
  return crypto.randomUUID()
}

export function nanoid(): string {
  return NANOID()
}

/**
 * Add a random id to the end of a prefix. Useful for when
 * we need to cause a state variable to repeatedly change,
 * e.g. click a button that sends an open message where
 * we want the message to be sent everytime and not cached
 * by react, so we add some randomness to it.
 * @param prefix
 * @returns
 */
export function randId(prefix: string): string {
  return `${prefix}:${nanoid()}`
}

export function zip<T = unknown>(...cols: T[][]): T[][] {
  const colIdx = range(cols.length)

  return rangeMap(i => colIdx.map(j => cols[j]![i]!), cols[0]!.length)
}

/**
 * Returns the unique items in a list in the order they
 * appear in the list.
 *
 * @param values
 * @returns
 */
export function uniqueInOrder<T>(values: T[]): T[] {
  const used = new Set<T>()
  const ret: T[] = []

  for (const v of values) {
    if (!used.has(v)) {
      ret.push(v)
      used.add(v)
    }
  }

  return ret
}
