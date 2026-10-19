import type { Cell } from './cell'

export type FieldRecord = { name: string; value: Cell }

/**
 * Various components such as indexes or columns can have
 * multiple annotations attached to them.
 */
export class MultiField {
  private _fieldMap: Map<string, Cell>
  private _fields: string[]

  constructor(name: string = '') {
    this._fieldMap = new Map<string, Cell>()
    // name must be first
    this._fields = ['name']

    this._fieldMap.set('name', name)
  }

  setName(name: string): MultiField {
    this._fieldMap.set('name', name)

    return this
  }

  setField(field: string, value: Cell): void {
    if (!this._fieldMap.has(field)) {
      this._fields.push(field)
    }

    this._fieldMap.set(field, value)
  }

  /**
   * Returns the list of fields in the index.
   */
  get names(): string[] {
    // return fields in reverse order so that name
    // appears last since in a table view, name
    // is typically closest to the data e.g. in an index
    // or looking at column names
    return this._fields.toReversed()
  }

  /**
   * Returns field-value pairs in the index in order.
   */
  get record(): FieldRecord[] {
    return this.names.map((f) => ({
      name: f,
      value: this._fieldMap.get(f) ?? '',
    }))
  }

  get name(): string {
    return (this._fieldMap.get('name') as string) ?? ''
  }

  get values(): Cell[] {
    return this.names.map((f) => this._fieldMap.get(f) ?? '')
  }

  /**
   * Retrieves the value of the first/default field in the list of fields.
   *
   * @returns the value of the first field, or an empty string if it does not exist
   */
  get value(): Cell {
    return this.at(0)
  }

  /**
   * Retrieves the value of a specific field by its name.
   *
   * @param field the name of the field to retrieve
   * @returns the value of the specified field, or an empty string if it does not exist
   */
  get(field: string): Cell {
    return this._fieldMap.get(field) ?? ''
  }

  /**
   * Retrieves the value of a specific field by its position in the list of fields.
   *
   * @param index the position of the field to retrieve
   * @returns the value of the field at the specified position, or an empty string if it does not exist
   */
  at(index: number): Cell {
    const field = this.names[index]
    return this._fieldMap.get(field) ?? ''
  }
}
