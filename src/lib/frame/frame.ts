export type Cell = number | string

export type Axis = 'row' | 'col'

/** Named annotation fields, each holding exactly one value per row/col. */
export class Annotations {
  private _size: number
  private _fields: string[] = []
  private _fieldMap = new Map<string, Cell[]>()

  constructor(size: number) {
    this._size = size
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

  get(name: string): readonly Cell[] {
    return this.field(name)
  }

  /** Adds or replaces an annotation. Missing trailing values are set to `fill`. */
  set(name: string, values: readonly Cell[], fill: Cell = ''): void {
    if (values.length > this._size) {
      throw new Error(
        `annotation "${name}" has ${values.length} values, expected ${this._size}`
      )
    }

    const padded = values.slice()

    while (padded.length < this._size) {
      padded.push(fill)
    }

    if (!this._fieldMap.has(name)) {
      this._fields.push(name)
    }

    this._fieldMap.set(name, padded)
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

  at(name: string, i: number): Cell {
    return this.field(name)[i]!
  }

  setAt(name: string, i: number, value: Cell): void {
    this.field(name)[i] = value
  }

  /** All annotation values for a single position. */
  record(i: number): Record<string, Cell> {
    const ret: Record<string, Cell> = {}

    for (const [name, values] of this._fieldMap) {
      ret[name] = values[i]!
    }

    return ret
  }

  insert(at: number, fill: Cell = ''): void {
    for (const values of this._fieldMap.values()) {
      values.splice(at, 0, fill)
    }

    ++this._size
  }

  remove(at: number): void {
    for (const values of this._fieldMap.values()) {
      values.splice(at, 1)
    }

    --this._size
  }

  /** Appends `n` empty positions. */
  extend(n: number, fill: Cell = ''): void {
    for (const values of this._fieldMap.values()) {
      for (let i = 0; i < n; ++i) {
        values.push(fill)
      }
    }

    this._size += n
  }

  /**
   * New annotations containing only the given positions, in order.
   */
  take(indices: readonly number[]): Annotations {
    const ret = new Annotations(indices.length)

    for (const [name, values] of this._fieldMap) {
      ret._fieldMap.set(
        name,
        indices.map((i) => values[i]!)
      )
    }

    return ret
  }

  private field(name: string): Cell[] {
    if (!this._fieldMap.has(name)) {
      throw new Error(`annotation "${name}" not found`)
    }

    const values = this._fieldMap.get(name)

    return values
  }
}

export interface IAnnotatedFrameOptions {
  /** Row-major data. All rows must be the same length. */
  data?: readonly (readonly Cell[])[]
  /** Named annotations; each array must not exceed the number of rows. */
  rowAnnotations?: Record<string, readonly Cell[]>
  /** Named annotations; each array must not exceed the number of columns. */
  colAnnotations?: Record<string, readonly Cell[]>
}

/**
 * A 2D table of numbers or strings with an unlimited number of named
 * annotations on both the rows and the columns. Annotations stay aligned
 * with the data when rows/columns are inserted, removed or selected.
 */
export class AnnotatedFrame {
  private _data: Cell[][]
  private _nCols: number
  readonly rows: Annotations
  readonly cols: Annotations

  constructor({
    data = [],
    rowAnnotations = {},
    colAnnotations = {},
  }: IAnnotatedFrameOptions = {}) {
    const nCols = data[0]?.length ?? 0

    for (const row of data) {
      if (row.length !== nCols) {
        throw new Error('all rows must have the same number of columns')
      }
    }

    this._data = data.map((row) => row.slice())
    this._nCols = nCols
    this.rows = new Annotations(data.length)
    this.cols = new Annotations(nCols)

    for (const [name, values] of Object.entries(rowAnnotations)) {
      this.rows.set(name, values)
    }

    for (const [name, values] of Object.entries(colAnnotations)) {
      this.cols.set(name, values)
    }
  }

  get shape(): [number, number] {
    return [this._data.length, this._nCols]
  }

  get(row: number, col: number): Cell {
    this.checkRow(row)
    this.checkCol(col)
    return this._data[row]![col]!
  }

  set(row: number, col: number, value: Cell): void {
    this.checkRow(row)
    this.checkCol(col)
    this._data[row]![col] = value
  }

  rowValues(row: number): Cell[] {
    this.checkRow(row)
    return this._data[row]!.slice()
  }

  colValues(col: number): Cell[] {
    this.checkCol(col)
    return this._data.map((r) => r[col]!)
  }

  /** Inserts a row (appends by default) with optional annotation values. */
  insertRow(
    values: readonly Cell[],
    at: number = this._data.length,
    annotations: Record<string, Cell> = {}
  ): void {
    if (at < 0 || at > this._data.length) {
      throw new Error(`row index ${at} out of range`)
    }

    if (this._data.length === 0) {
      this.cols.extend(values.length - this._nCols)
      this._nCols = values.length
    } else if (values.length !== this._nCols) {
      throw new Error(`expected ${this._nCols} values, got ${values.length}`)
    }

    this._data.splice(at, 0, values.slice())
    this.rows.insert(at)

    for (const [name, value] of Object.entries(annotations)) {
      this.rows.setAt(name, at, value)
    }
  }

  /** Inserts a column (appends by default) with optional annotation values. */
  insertCol(
    values: readonly Cell[],
    at: number = this._nCols,
    annotations: Record<string, Cell> = {}
  ): void {
    if (at < 0 || at > this._nCols) {
      throw new Error(`column index ${at} out of range`)
    }

    if (values.length !== this._data.length) {
      throw new Error(
        `expected ${this._data.length} values, got ${values.length}`
      )
    }

    this._data.forEach((row, i) => row.splice(at, 0, values[i]!))
    ++this._nCols
    this.cols.insert(at)

    for (const [name, value] of Object.entries(annotations)) {
      this.cols.setAt(name, at, value)
    }
  }

  removeRow(row: number): void {
    this.checkRow(row)
    this._data.splice(row, 1)
    this.rows.remove(row)
  }

  removeCol(col: number): void {
    this.checkCol(col)
    this._data.forEach((r) => r.splice(col, 1))
    --this._nCols
    this.cols.remove(col)
  }

  /** Returns a new frame with the given rows/cols (in order); annotations follow. */
  select(
    rows: readonly number[] = this._data.map((_, i) => i),
    cols: readonly number[] = Array.from({ length: this._nCols }, (_, i) => i)
  ): AnnotatedFrame {
    rows.forEach((r) => this.checkRow(r))
    cols.forEach((c) => this.checkCol(c))

    const df = new AnnotatedFrame({
      data: rows.map((r) => cols.map((c) => this._data[r]![c]!)),
    })

    const rowAnn = this.rows.take(rows)
    const colAnn = this.cols.take(cols)

    // data-less frames lose their size, so restore it before copying fields
    df.rows.extend(rows.length - df.rows.size)
    df.cols.extend(cols.length - df.cols.size)

    for (const name of rowAnn.names) {
      df.rows.set(name, rowAnn.get(name))
    }

    for (const name of colAnn.names) {
      df.cols.set(name, colAnn.get(name))
    }

    return df
  }

  /** Indices of rows/cols where an annotation satisfies the predicate. */
  where(
    axis: Axis,
    name: string,
    predicate: (value: Cell, index: number) => boolean
  ): number[] {
    const values = (axis === 'row' ? this.rows : this.cols).get(name)

    return values.flatMap((v, i) => (predicate(v, i) ? [i] : []))
  }

  copy(): AnnotatedFrame {
    return this.select()
  }

  private checkRow(row: number): void {
    if (!Number.isInteger(row) || row < 0 || row >= this._data.length) {
      throw new Error(`row index ${row} out of range`)
    }
  }

  private checkCol(col: number): void {
    if (!Number.isInteger(col) || col < 0 || col >= this._nCols) {
      throw new Error(`column index ${col} out of range`)
    }
  }
}
