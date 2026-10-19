import { describe, expect, it } from 'vitest'
import { deepMerge } from './deepmerge'

// factory so no test can mutate another test's defaults
const makeDefaults = () => ({
  a: 1,
  b: 'x',
  n: null as string | null,
  list: [1],
  rec: {} as Record<string, number>,
  nested: { c: true, d: 'y' },
  action: () => 'default action',
})

describe('deepMerge', () => {
  it('returns the defaults when nothing was saved (first-time user)', () => {
    const defaults = makeDefaults()
    expect(deepMerge(defaults, undefined)).toEqual(defaults)
  })

  it('keeps saved values that still match the default type', () => {
    const result = deepMerge(makeDefaults(), { a: 42, b: 'saved' })
    expect(result.a).toBe(42)
    expect(result.b).toBe('saved')
  })

  it('fills in keys missing from saved (newly added settings)', () => {
    const result = deepMerge(makeDefaults(), { a: 42 })
    expect(result.b).toBe('x')
    expect(result.nested).toEqual({ c: true, d: 'y' })
  })

  it('falls back to the default when the type changed (string -> number)', () => {
    const result = deepMerge(makeDefaults(), { a: '5' })
    expect(result.a).toBe(1)
  })

  it('falls back to the default when an object default meets a primitive', () => {
    const result = deepMerge(makeDefaults(), { nested: 5 })
    expect(result.nested).toEqual({ c: true, d: 'y' })
  })

  it('keeps a saved value when the default is null', () => {
    const result = deepMerge(makeDefaults(), { n: 'abc' })
    expect(result.n).toBe('abc')
  })

  it('uses null (not undefined) when the default is null and nothing was saved', () => {
    const result = deepMerge(makeDefaults(), {})
    expect(result.n).toBeNull()
  })

  it('drops keys that no longer exist in the defaults', () => {
    const result = deepMerge(makeDefaults(), { old: 1, nested: { gone: true } })
    expect(result).not.toHaveProperty('old')
    expect(result.nested).not.toHaveProperty('gone')
  })

  it('preserves dynamic-key records (empty default object)', () => {
    const result = deepMerge(makeDefaults(), { rec: { k: 2, j: 3 } })
    expect(result.rec).toEqual({ k: 2, j: 3 })
  })

  it('merges nested objects key by key', () => {
    const result = deepMerge(makeDefaults(), { nested: {} })
    expect(result.nested.c).toBe(true) // filled from defaults

    const result2 = deepMerge(makeDefaults(), { nested: { c: false } })
    expect(result2.nested).toEqual({ c: false, d: 'y' }) // saved wins, gap filled
  })

  it('treats arrays as leaves: saved wins, no concatenation', () => {
    const result = deepMerge(makeDefaults(), { list: [2, 3] })
    expect(result.list).toEqual([2, 3])
  })

  it('falls back to the default array when saved is not an array', () => {
    const result = deepMerge(makeDefaults(), { list: 'nope' })
    expect(result.list).toEqual([1])
  })

  it('keeps store actions, which never exist in the saved JSON', () => {
    const defaults = makeDefaults()
    const result = deepMerge(defaults, { a: 2 })
    expect(result.action).toBe(defaults.action)
  })

  it('does not mutate the defaults or the saved object', () => {
    const defaults = makeDefaults()
    const saved = { a: 9, nested: { c: false } }
    const defaultsSnapshot = structuredClone({ ...defaults, action: undefined })
    const savedSnapshot = structuredClone(saved)

    deepMerge(defaults, saved)

    expect({ ...defaults, action: undefined }).toEqual(defaultsSnapshot)
    expect(saved).toEqual(savedSnapshot)
  })
})
