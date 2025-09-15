import type { IGenomicLocation } from '@lib/genomic/genomic'

export abstract class BaseBedReader {
  abstract getFeatures(location: IGenomicLocation): Promise<IGenomicLocation[]>
}

export class EmptyBedReader extends BaseBedReader {
  override async getFeatures(): Promise<IGenomicLocation[]> {
    return []
  }
}

export const EMPTY_BED_READER = new EmptyBedReader()
