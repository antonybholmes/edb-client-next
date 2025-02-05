import { Index, type IIndexOptions } from '.'
import type { IndexData } from './dataframe-types'

export class DataIndex extends Index {
  _data: IndexData[]
  _name: string

  constructor(data: IndexData[], options: IIndexOptions = {}) {
    super()

    const { name } = { name: '', ...options }

    this._data = data
    this._name = name
  }

  // setName(name: IndexType): DataIndex {
  //   this._name = name
  //   return this
  // }

  override get name(): string {
    return this._name
  }

  override get values(): IndexData[] {
    return [...this._data]
  }

  override get(index: number): IndexData {
    return this._data[index] ?? NaN
  }

  override get size(): number {
    return this._data.length
  }

  override filter(idx: number[]): Index {
    return new DataIndex(
      idx.map(i => this._data[i]!),
      { name: this._name }
    )
  }

  isin(idx: IndexData[]): Index {
    const s = new Set(idx)
    return new DataIndex(
      this._data.filter(i => s.has(i)),
      { name: this._name }
    )
  }

  override find(t: IndexData): number[] {
    const s = t.toString().toLowerCase()

    // console.log(
    //   "search col",
    //   s,
    //   this._data.map((v, i) => [v.toString().toLowerCase(), i]),
    //   this._data
    //     .map((v, i) => [v.toString().toLowerCase(), i])
    //     .filter((x: [string, number]) => x[0].includes(s))
    //     .map((x: [string, number]) => x[1]),
    // )

    return this._data
      .map((v, i) => [v.toString().toLowerCase(), i] as [string, number])
      .filter((x: [string, number]) => x[0].includes(s))
      .map((x: [string, number]) => x[1])
  }

  override copy(): Index {
    console.log('copy index', this._name)
    return new DataIndex([...this._data], { name: this._name })
  }
}
