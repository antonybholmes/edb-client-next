import { customAlphabet } from 'nanoid'
import { v7 } from 'uuid'

const NANO_ID_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'

/**
 * A custom nanoid generator that generates 12 character IDs
 * using numbers and lowercase letters.
 */
const NANOID_12 = customAlphabet(NANO_ID_ALPHABET, 12)

export function makeUUIDv4(): string {
  return crypto.randomUUID()
}

/**
 * Generates a UUID v7 string.
 *
 * @returns A UUID v7 string.
 */
export function makeUUIDv7(): string {
  return v7() //crypto.randomUUID()
}

/**
 * Generates a nanoid string of length 12.
 *
 * @returns A nanoid string.
 */
export function makeNanoIDLen12(): string {
  return NANOID_12()
}

export function makeNanoID(length: number = 12): string {
  if (length === 12) {
    return NANOID_12()
  }

  return customAlphabet(NANO_ID_ALPHABET, length)() //nanoIdGen12()
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
export function randID(prefix: string): string {
  return `${prefix}:${makeNanoIDLen12()}`
}
