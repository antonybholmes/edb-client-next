import { type IGenomicLocation } from '@lib/genomic/genomic'
import { type ISeqPos } from '../../svg/base-seq-track-svg'
import { type ISignalTrack, type ITrackBinCounts } from '../../tracks-provider'
import { BaseSeqReader, type IGetPointOptions } from './base-seq-reader'

export class SeqReader extends BaseSeqReader {
  private _track: ISignalTrack
  //private _points: ISeqPos[] = []
  // private _loc: string = ''
  // private _mode: 'Cache Bins' | 'Cache X' | 'Collapse' | 'Fully Cached' =
  //   'Cache Bins'

  private _trackBinCounts: ITrackBinCounts
  //private _binSize: number = -1

  constructor(track: ISignalTrack, trackBinCounts: ITrackBinCounts) {
    super()
    this._track = track
    this._trackBinCounts = trackBinCounts
  }

  override async getRealYPoints(
    _location: IGenomicLocation,
    _binSize: number,
    { mode = 'Count' }: IGetPointOptions = {}
  ): Promise<ISeqPos[]> {
    //const loc = locStr(location)

    //if (loc !== this._loc || this._binSize !== binSize) {
    return this._trackBinCounts.bins.map(b => {
      // the real 1 based end
      const start = b[0]!

      // end is the real end of the block, but for
      // graphical purposes, it must be the same as the
      // start of a block so that line segments can be
      // joined together without small gaps between them
      const end = b[1]! + 1

      const reads = b[2]!

      let y = 0

      switch (mode) {
        case 'BPM':
          y = reads * this._trackBinCounts.bpmScaleFactor
          break
        case 'CPM':
          y = (reads / this._track.reads) * 1000000
          break
        default:
          y = reads
      }

      //const b = Math.max(0, Math.floor(start / binSize)) * binSize
      //const sb = Math.max(0, Math.floor((start - location.start) / binSize))
      //const eb = Math.max(0, Math.floor((end - location.start) / binSize))

      return {
        start,
        end,
        x: 0,
        y: 0,
        realY: y,
        numPoints: 1,
      }

      // this._points.push({
      //   start: end,
      //   x: 0,
      //   y: 0,
      //   realY: y,
      //   numPoints: 1,
      // })

      // for (let bin = sb; bin <= eb; bin++) {
      //   this._points[bin]!.realY += y
      //   this._points[bin]!.numPoints!++
      //   console.log('vvv', bin, this._points[bin])
      // }
    })

    // for (const b of this._points) {
    //   if (b.numPoints! > 0) {
    //     // average the bin
    //     b.realY = b.realY / b.numPoints!
    //   }
    // }

    // console.log('ljdsfklfslksdflkdflkfds', this._points)

    //this._mode = 'Cache X'
    //}
  }
}
