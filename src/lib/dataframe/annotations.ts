import { DataIndex, ExcelIndex, Index, IndexFromType, NumInfIndex } from '.'
import { BaseIndex } from './base-index'
import { cellStr } from './cell'
import { FieldRecord } from './multi-field'
import { SeriesData } from './series-data'

export const DEFAULT_NAME = 'index'

/**
 * Holds named annotations for rows or columns so we can add
 * arbitrary metadata.
 */
export class Annotations {
  private _size: number
  private _fields: string[] = []
  private _fieldMap = new Map<string, Index<SeriesData>>()
  private _indexCreator: () => Index<SeriesData>

  constructor(
    size: number,
    opts: { indexCreator?: () => Index<SeriesData> } = {}
  ) {
    const { indexCreator = () => new NumInfIndex() } = opts
    this._size = size
    this._indexCreator = indexCreator
  }

  get size(): number {
    return this._size
  }

  get names(): string[] {
    return this._fields
  }

  has(name: string): boolean {
    return this._fieldMap.has(name)
  }

  _get(name: string): Index<SeriesData> {
    if (!this._fieldMap.has(name)) {
      this._fieldMap.set(name, this._indexCreator())
    }

    return this._fieldMap.get(name)!
  }

  get(name: string): Index<SeriesData> {
    return this._get(name)
  }

  values(name: string): readonly SeriesData[] {
    return this._get(name).values
  }

  /** Returns all annotation values as strings. */
  strs(name: string): readonly string[] {
    return this._get(name).values.map((v) => cellStr(v))
  }

  /** Adds or replaces an annotation. Missing trailing values are set to `fill`. */
  set(name: string, values: IndexFromType, fill: SeriesData = ''): void {
    if (!values) {
      return
    }

    if (values.length > this._size) {
      throw new Error(
        `annotation "${name}" has ${values.length} values, expected ${this._size}`
      )
    }

    const padded = [...values]

    while (padded.length < this._size) {
      padded.push(fill)
    }

    if (!this._fieldMap.has(name)) {
      this._fields.push(name)
    }

    this._fieldMap.set(name, new DataIndex(padded))
  }

  delete(name: string): boolean {
    const ok = this._fieldMap.delete(name)

    if (ok) {
      this._fields = this._fields.filter((f) => f !== name)
    }

    return ok
  }

  /** Renames an annotation, preserving field order. */
  rename(oldName: string, newName: string): void {
    this.field(oldName)

    if (oldName === newName) {
      return
    }

    if (this._fieldMap.has(newName)) {
      throw new Error(`annotation "${newName}" already exists`)
    }

    this._fieldMap = new Map(
      [...this._fieldMap].map(([k, v]) => [k === oldName ? newName : k, v])
    )

    this._fields = this._fields.map((f) => (f === oldName ? newName : f))
  }

  at(name: string, i: number): SeriesData {
    return this.field(name).at(i)
  }

  // setAt(name: string, i: number, value: SeriesData): void {
  //   this.field(name)[i] = value
  // }

  /** All annotation values for a single position. */
  record(i: number): FieldRecord[] {
    const ret: FieldRecord[] = []

    for (const name of this.names) {
      ret.push({ name, value: this._get(name).at(i) })
    }

    return ret
  }

  // insert(at: number, fill: SeriesData = ''): void {
  //   for (const values of this._fieldMap.values()) {
  //     values.splice(at, 0, fill)
  //   }

  //   ++this._size
  // }

  // remove(at: number): void {
  //   for (const values of this._fieldMap.values()) {
  //     values.splice(at, 1)
  //   }

  //   --this._size
  // }

  /** Appends `n` empty positions. */
  // extend(n: number, fill: SeriesData = ''): void {
  //   for (const values of this._fieldMap.values()) {
  //     for (let i = 0; i < n; ++i) {
  //       values.push(fill)
  //     }
  //   }

  //   this._size += n
  // }

  /**
   * New annotations containing only the given positions, in order.
   */
  take(indices: readonly number[]): Annotations {
    const ret = new Annotations(indices.length)

    for (const [name, index] of this._fieldMap) {
      ret._fieldMap.set(name, new DataIndex(indices.map((i) => index.at(i))))
    }

    return ret
  }

  private field(name: string): BaseIndex<SeriesData> {
    if (!this._fieldMap.has(name)) {
      throw new Error(`annotation "${name}" not found`)
    }

    const values = this._fieldMap.get(name)

    return values
  }
}

export class ColAnnotations extends Annotations {
  constructor(size: number) {
    super(size, {
      indexCreator: () => new ExcelIndex(),
    })
  }
}
