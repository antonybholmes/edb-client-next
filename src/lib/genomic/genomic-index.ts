import { range } from '@/lib/math/range'
import {
  GenomicLocation,
  sortLocations,
  type IGenomicLocation,
} from './genomic'

const BIN_SIZE = 16384

export class GenomicFeatureIndex<T extends GenomicLocation | IGenomicLocation> {
  private _index: Map<string, Map<number, T[]>>
  private _name: string

  constructor(name: string, features: T[]) {
    this._name = name
    this._index = new Map<string, Map<number, T[]>>()

    for (const feature of sortLocations(features)) {
      if (!this._index.has(feature.chr)) {
        this._index.set(feature.chr, new Map<number, T[]>())
      }

      const startBin = Math.floor(feature.start / BIN_SIZE)
      const endBin = Math.floor(feature.end / BIN_SIZE)

      for (const bin of range(startBin, endBin + 1)) {
        if (!this._index.get(feature.chr)!.has(bin)) {
          this._index.get(feature.chr)!.set(bin, [])
        }

        this._index.get(feature.chr)!.get(bin)!.push(feature)
      }
    }
  }

  get name(): string {
    return this._name
  }

  /**
   * Get features in closest bins
   * @param location
   */
  getFeatures(location: GenomicLocation | IGenomicLocation): T[] {
    if (!this._index.has(location.chr)) {
      return []
    }

    let ret: T[] = []

    const startBin = Math.floor(location.start / BIN_SIZE)
    const endBin = Math.floor(location.end / BIN_SIZE)

    for (const bin of range(startBin, endBin + 1)) {
      if (this._index.get(location.chr)!.has(bin)) {
        ret = [...ret, ...this._index.get(location.chr)!.get(bin)!]
      }
    }

    return ret
  }

  getOverlappingFeatures(location: GenomicLocation): T[] {
    return this.getFeatures(location).filter(
      f => f.start <= location.end && f.end >= location.start
    )
  }
}
