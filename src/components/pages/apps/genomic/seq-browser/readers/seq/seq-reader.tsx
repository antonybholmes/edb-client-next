import { IGenomicLocation } from '@/lib/genomic/genomic-location'
import { type ISeqPos } from '../../svg/base-seq-track-svg'
import {
  type IBigWigTrack,
  type ISampleSearchResult,
  type ISeqTrack,
} from '../../tracks-provider'
import { BaseSeqReader, type IGetPointOptions } from './base-seq-reader'

export class SeqReader extends BaseSeqReader {
  private _track: ISeqTrack | IBigWigTrack
  private _reads: number

  private _trackBinCounts: ISampleSearchResult

  constructor(
    track: ISeqTrack | IBigWigTrack,
    trackBinCounts: ISampleSearchResult
  ) {
    super()
    this._track = track
    this._reads = track.reads ?? 0
    this._trackBinCounts = trackBinCounts
  }

  override async getRealYPoints(
    _location: IGenomicLocation,
    _binSize: number,
    opts: IGetPointOptions = {}
  ): Promise<ISeqPos[]> {
    //const loc = locStr(location)

    let { mode = 'Count' } = opts

    // If the track is a BigWig we ignore scaling
    // and just use data as it, i.e count mode
    if (this._track.type === 'BigWig') {
      return this._getRealYPointsBigWig(_location, _binSize)
    }

    //if (loc !== this._loc || this._binSize !== binSize) {
    return this._trackBinCounts.bins.map((b) => {
      // the real 1 based end
      const start = b.s

      // end is the real end of the block, but for
      // graphical purposes, it must be the same as the
      // start of a block so that line segments can be
      // joined together without small gaps between them
      // thus we add 1 to make it inclusive
      const end = b.e + 1

      const reads = b.c

      let y = 0

      switch (mode) {
        case 'BPM':
          y = (reads / this._trackBinCounts.binReads!) * 1000000 // * this._trackBinCounts.bpmScaleFactor
          break
        case 'CPM':
          y = (reads / this._reads) * 1000000
          break
        default:
          y = reads
      }

      return {
        start,
        end,
        x: 0,
        y: 0,
        realY: y,
        numPoints: 1,
      }
    })
  }

  _getRealYPointsBigWig(
    _location: IGenomicLocation,
    _binSize: number
  ): ISeqPos[] {
    //const loc = locStr(location)

    //if (loc !== this._loc || this._binSize !== binSize) {
    return this._trackBinCounts.bins.map((b) => {
      // the real 1 based end
      const start = b.s

      // end is the real end of the block, but for
      // graphical purposes, it must be the same as the
      // start of a block so that line segments can be
      // joined together without small gaps between them
      // thus we add 1 to make it inclusive
      const end = b.e + 1

      const y = b.c

      return {
        start,
        end,
        x: 0,
        y: 0,
        realY: y,
        numPoints: 1,
      }
    })
  }
}
