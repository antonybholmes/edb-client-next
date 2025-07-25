import { type IGenomicLocation } from '@lib/genomic/genomic'
import type { IBedFeature } from '../../svg/bed-track-svg'
import { BaseBedReader } from './base-bed-reader'

export class BedReader extends BaseBedReader {
  private _features: IBedFeature[]

  constructor(features: IBedFeature[]) {
    super()
    this._features = features
  }

  override async getFeatures(
    _location: IGenomicLocation
  ): Promise<IGenomicLocation[]> {
    return this._features.map(feature => feature.loc)
  }
}
