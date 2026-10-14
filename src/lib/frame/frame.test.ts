import { describe, expect, it } from 'vitest'
import { AnnotatedFrame } from './frame'

function make() {
  return new AnnotatedFrame({
    data: [
      [1, 'a', 3],
      [4, 'b', 6],
    ],
    rowAnnotations: { gene: ['G1', 'G2'], score: [0.5, 0.9] },
    colAnnotations: { sample: ['s1', 's2', 's3'], group: ['x', 'y', 'x'] },
  })
}

describe('AnnotatedFrame', () => {
  it('stores numbers and strings', () => {
    const df = make()
    expect(df.shape).toEqual([2, 3])
    expect(df.get(0, 0)).toBe(1)
    expect(df.get(1, 1)).toBe('b')
  })

  it('supports unlimited annotations', () => {
    const df = make()
    for (let i = 0; i < 100; ++i) {
      df.rows.set(`r${i}`, [i, `v${i}`])
      df.cols.set(`c${i}`, [i, i, i])
    }
    expect(df.rows.names.length).toBe(102)
    expect(df.cols.record(1).c99).toBe(99)
  })

  it('keeps annotations aligned on insert and remove', () => {
    const df = make()
    df.insertRow([7, 'c', 9], 1, { gene: 'G3' })
    expect(df.rows.get('gene')).toEqual(['G1', 'G3', 'G2'])
    df.removeCol(0)
    expect(df.cols.get('sample')).toEqual(['s2', 's3'])
    expect(df.shape).toEqual([3, 2])
  })

  it('selects by annotation', () => {
    const df = make()
    const cols = df.where('col', 'group', (v) => v === 'x')
    const sub = df.select(undefined, cols)
    expect(sub.cols.get('sample')).toEqual(['s1', 's3'])
    expect(sub.rowValues(1)).toEqual([4, 6])
  })

  it('rejects mismatched sizes and bad indices', () => {
    expect(() => new AnnotatedFrame({ data: [[1], [1, 2]] })).toThrow()
    expect(() => make().rows.set('x', [1, 2, 3])).toThrow()
    expect(() => make().get(5, 0)).toThrow()
  })

  it('builds from empty and copies independently', () => {
    const df = new AnnotatedFrame()
    df.cols.set('a', [])
    df.insertRow([1, 2])
    expect(df.cols.get('a')).toEqual(['', ''])
    const c = df.copy()
    c.set(0, 0, 'z')
    expect(df.get(0, 0)).toBe(1)
  })
})
