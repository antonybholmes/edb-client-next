import { type IGenomicLocation } from '@/lib/genomic/genomic'
import type { ISampleBedFeatures } from '../../svg/bed-track-svg'
import { BaseBedReader } from './base-bed-reader'

/**
 * BedReader is a simple reader that takes pre-fetched bed features from
 * a database and renders them.
 *
 */
export class BedReader extends BaseBedReader {
  private _features: ISampleBedFeatures

  constructor(features: ISampleBedFeatures) {
    super()
    this._features = features
  }

  override async getFeatures(
    _location: IGenomicLocation
  ): Promise<IGenomicLocation[]> {
    return this._features.regions.map(r => r.loc)
  }
}
