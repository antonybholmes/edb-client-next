export type NullUndef = null | undefined

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isUndef(v: any) {
  return v === undefined
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isNullUndef(v: any) {
  return v === null || v === undefined
}
