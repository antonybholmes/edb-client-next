export type NullUndef = null | undefined

export function isUndef(v: unknown) {
  return v === undefined
}

export function isNullUndef(v: unknown) {
  return v === null || v === undefined
}
