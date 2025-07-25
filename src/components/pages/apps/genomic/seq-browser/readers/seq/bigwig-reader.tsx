import type { BigWig } from '@gmod/bbi'
import { locStr, type IGenomicLocation } from '@lib/genomic/genomic'
import { type ISeqPos } from '../../svg/base-seq-track-svg'
import { BaseSeqReader, makeBins } from './base-seq-reader'

export class BigWigReader extends BaseSeqReader {
  //private _track: IRemoteBigWigTrack | ILocalBigWigTrack
  private _points: Promise<ISeqPos[]> | null = null
  private _loc: string = ''

  // private _mode:
  //   | 'Init'
  //   | 'Cache Bins'
  //   | 'Cache X'
  //   | 'Collapse'
  //   | 'Fully Cached' = 'Init'
  private _bw: BigWig

  constructor(bw: BigWig) {
    super()
    this._bw = bw
  }

  override async getRealYPoints(
    location: IGenomicLocation,
    binSize: number
  ): Promise<ISeqPos[]> {
    const loc = `${locStr(location)}:${binSize}`

    if (this._loc !== loc || this._points === null) {
      const points = makeBins(location, binSize)

      //const bins = makeBins(location, binSize)
      const feats = await this._bw.getFeatures(
        location.chr,
        location.start,
        location.end,
        { scale: 1 / binSize }
      )

      // fill in the occupied bins
      for (const f of feats) {
        const start = f.start + 1
        //const end = f.end-1
        const y = f.score ?? 0
        //const b = Math.max(0, Math.floor(start / binSize)) * binSize
        const bin = Math.max(0, Math.floor((start - location.start) / binSize))

        points[bin]!.realY += y
        points[bin]!.numPoints!++
      }

      // average the point realY to account for multiple bins in a region
      for (const b of points) {
        if (b.numPoints! > 0) {
          // average the bin
          b.realY = b.realY / b.numPoints!
        }
      }

      this._loc = loc
      this._points = new Promise<ISeqPos[]>(resolve => {
        resolve(points)
      })
    }

    return this._points

    //console.log(location, binSize)
    //console.log(points)

    // make up the bins from the reference bin starts
    // const points = binLoc.bins.map(b => ({ ...b }))

    // // fill in the occupied bins
    // for (const b of bins) {
    //   //points[b.bin]!.y = b.y

    //   points[b.bin]!.realY = b.realY
    // }

    // filter down to remove duplicate x coordinates etc
  }
}
