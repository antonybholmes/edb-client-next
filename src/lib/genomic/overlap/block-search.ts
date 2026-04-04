import { range } from '@/lib/math/range'
import { overlaps, type GenLoc } from '../genomic'

export class BlockSearch<T> {
  private _binSize: number
  private _blockMap: Map<string, Map<number, [GenLoc, T][]>>

  constructor(binSize = 1000) {
    this._binSize = binSize
    this._blockMap = new Map<string, Map<number, [GenLoc, T][]>>()
  }

  addFeature(loc: GenLoc, feature: T) {
    const bs = Math.floor(loc.start / this._binSize)
    const be = Math.floor(loc.end / this._binSize)

    for (const b of range(bs, be + 1)) {
      if (!this._blockMap.has(loc.chr)) {
        this._blockMap.set(loc.chr, new Map<number, [GenLoc, T][]>())
      }

      if (!this._blockMap.get(loc.chr)?.has(b)) {
        this._blockMap.get(loc.chr)!.set(b, [])
      }

      this._blockMap.get(loc.chr)!.get(b)!.push([loc, feature])
    }
  }

  getOverlappingFeatures(loc: GenLoc): T[] {
    const ret: T[] = []
    const used = new Set<string>()

    const bs = Math.floor(loc.start / this._binSize)
    const be = Math.floor(loc.end / this._binSize)

    for (const b of range(bs, be + 1)) {
      if (this._blockMap.get(loc.chr)?.get(b)) {
        const items = this._blockMap.get(loc.chr)!.get(b)!

        //console.log(loc, items, this._blockMap.get(loc.chr)!)

        for (const item of items) {
          if (overlaps(loc, item[0]!)) {
            const s = JSON.stringify(item[1]!)
            if (!used.has(s)) {
              ret.push(item[1]!)
              used.add(s)
            }
          }
        }
      }
    }

    return ret
  }
}
