import { customAlphabet } from 'nanoid'
import { v4, v7 } from 'uuid'

const NANO_ID_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'

export const BLANK_UUID = '00000000-0000-0000-0000-000000000000'
export const BLANK_TIMENANOID = '00000000000000'
export const BLANK_NANOID = '000000000000'

/**
 * A custom nanoid generator that generates 12 character IDs
 * using numbers and lowercase letters.
 */
export const NANOID6 = customAlphabet(NANO_ID_ALPHABET, 6)
export const NANOID12 = customAlphabet(NANO_ID_ALPHABET, 12)

export const UUIDV7 = () => v7() //crypto.randomUUID()

// Generate a unique identifier
export const makeUuid = () => UUIDV7()

export function makeUUIDv4(): string {
  return v4()
}

export const makeNanoId = () => NANOID6()

/**
 * Generates a UUID v7 string.
 *
 * @returns A UUID v7 string.
 */
// export function makeUUIDv7(): string {
//   return v7() //crypto.randomUUID()
// }

/**
 * Generates a nanoid string of length 12.
 *
 * @returns A nanoid string.
 */
// export function makeNanoId12(): string {
//   return NANOID12()
// }

// export function makeNanoId(length: number = 12): string {
//   if (length === 12) {
//     return makeUuid()
//   }

//   return customAlphabet(NANO_ID_ALPHABET, length)() //nanoIdGen12()
// }

export function makeTimeNanoId(): string {
  return Date.now().toString(36) + NANOID6()
}

// export function makeRandId(): string {
//   return makeTimeNanoId() // smakeNanoIdLen12()
// }

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
  return randUUIDv7Id(prefix)
}

export function randNanoId(prefix: string): string {
  return `${prefix}:${makeUuid()}`
}

export function randUUIDv7Id(prefix: string): string {
  return `${prefix}:${makeUuid()}`
}
