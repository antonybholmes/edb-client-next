import { type IGenomicLocation } from '@lib/genomic/genomic'
import type { GenomicFeatureIndex } from '@lib/genomic/genomic-index'
import { BaseBedReader } from './base-bed-reader'

export class LocalBedReader extends BaseBedReader {
  private _index: GenomicFeatureIndex<IGenomicLocation>

  constructor(index: GenomicFeatureIndex<IGenomicLocation>) {
    super()
    this._index = index
  }

  override async getFeatures(
    location: IGenomicLocation
  ): Promise<IGenomicLocation[]> {
    return this._index.getOverlappingFeatures(location)
  }
}
