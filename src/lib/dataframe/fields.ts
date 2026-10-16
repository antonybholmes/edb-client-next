import type { SeriesData } from './series-data'
/**
 * Various components such as indexes or columns can have
 * multiple annotations attached to them.
 */
export class Fields {
  private _fieldMap: Map<string, SeriesData>
  private _fields: string[]

  constructor(name: string = '') {
    this._fieldMap = new Map<string, SeriesData>()
    // name must be first
    this._fields = ['name']

    this._fieldMap.set('name', name)
  }

  setName(name: string): Fields {
    this._fieldMap.set('name', name)

    return this
  }

  setField(field: string, value: SeriesData): void {
    if (!this._fieldMap.has(field)) {
      this._fields.push(field)
    }

    this._fieldMap.set(field, value)
  }

  /**
   * Returns the list of fields in the index.
   */
  get fields(): string[] {
    // return fields in reverse order so that name
    // appears last since in a table view, name
    // is typically closest to the data e.g. in an index
    // or looking at column names
    return this._fields.toReversed()
  }

  /**
   * Returns field-value pairs in the index in order.
   */
  record(): { name: string; value: SeriesData }[] {
    return this.fields.map((f) => ({
      name: f,
      value: this._fieldMap.get(f) ?? '',
    }))
  }

  get name(): string {
    return (this._fieldMap.get('name') as string) ?? ''
  }
}
