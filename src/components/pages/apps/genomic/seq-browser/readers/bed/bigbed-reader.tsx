import type { BigBed } from '@gmod/bbi'
import { GenomicLocation } from '@lib/genomic/genomic'
import { BaseBedReader } from './base-bed-reader'

export class BigBedReader extends BaseBedReader {
  private _bb: BigBed

  constructor(bb: BigBed) {
    super()
    this._bb = bb
  }

  override async getFeatures(
    location: GenomicLocation
  ): Promise<GenomicLocation[]> {
    //const bins = makeBins(location, binSize)
    const feats = await this._bb.getFeatures(
      location.chr,
      location.start,
      location.end
    )

    const ret: GenomicLocation[] = feats.map(f => {
      // convert to 1-based start
      // end is the real end of the block
      const start = f.start + 1

      return new GenomicLocation(location.chr, start, f.end)
    })

    return ret
  }
}
