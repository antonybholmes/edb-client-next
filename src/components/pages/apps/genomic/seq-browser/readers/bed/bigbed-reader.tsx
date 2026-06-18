import {
  newGenomicLocation,
  type IGenomicLocation,
} from '@/lib/genomic/genomic-location'
import type { BigBed } from '@gmod/bbi'
import { BaseBedReader } from './base-bed-reader'

export class BigBedReader extends BaseBedReader {
  private _bb: BigBed

  constructor(bb: BigBed) {
    super()
    this._bb = bb
  }

  override async getFeatures(
    location: IGenomicLocation
  ): Promise<IGenomicLocation[]> {
    //const bins = makeBins(location, binSize)
    const feats = await this._bb.getFeatures(
      location.chr,
      location.start,
      location.end
    )

    const ret: IGenomicLocation[] = feats.map(f => {
      // convert to 1-based start
      // end is the real end of the block
      const start = f.start + 1

      return newGenomicLocation(location.chr, start, f.end)
    })

    return ret
  }
}
