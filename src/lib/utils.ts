import { range, rangeMap } from './math/range'

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

export function zip<T = unknown>(...cols: T[][]): T[][] {
  return rangeMap(
    (i) => range(cols.length).map((j) => cols[j]![i]!),
    cols[0]!.length
  )
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

/**
 * Makes an object deeply readonly in development mode,
 * but returns the same object in production for performance.
 * This allows us to catch accidental mutations during development
 * without incurring a performance penalty in production.
 *
 * @param obj
 * @returns
 */
export function makeReadonly<T extends object>(obj: T): Readonly<T> {
  if (process.env.NODE_ENV !== 'development') {
    return obj
  }

  return deepFreeze(structuredClone(obj)) as Readonly<T>
}

/**
 * Deeply freezes an object, making it immutable.
 *
 * @param obj The object to freeze.
 * @returns The frozen object.
 */
export function deepFreeze<T extends object>(obj: T): T {
  // Skip if not an object or already frozen
  if (!obj || typeof obj !== 'object' || Object.isFrozen(obj)) {
    return obj
  }

  // Recursively freeze each property
  // Object.getOwnPropertyNames(obj).forEach(prop => {
  //   const value = (obj as Record<string, unknown>)[prop]
  //   if (value && typeof value === 'object') {
  //     deepFreeze(value)
  //   }
  // })

  Reflect.ownKeys(obj).forEach((key) => {
    const value = (obj as any)[key]
    if (value && typeof value === 'object') {
      deepFreeze(value)
    }
  })

  // Freeze the object itself
  return Object.freeze(obj)
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

/**
 * Takes an object and a partial object and recursively overwrites
 * nested properties. This allows us to create complex defaults
 * and use partial json to update properties etc.
 *
 * @param defaults
 * @param overrides
 * @returns
 */
export function deepMergeDefaults<T>(
  defaults: T,
  overrides?: DeepPartial<T>
): T {
  if (!overrides) return defaults

  const result: any = { ...defaults }

  for (const key in overrides) {
    const override = overrides[key]
    if (override === undefined) continue

    if (
      typeof override === 'object' &&
      override !== null &&
      !Array.isArray(override)
    ) {
      result[key] = deepMergeDefaults((defaults as any)[key], override)
    } else {
      result[key] = override
    }
  }

  return result
}
