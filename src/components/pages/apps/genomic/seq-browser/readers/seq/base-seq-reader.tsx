import type { Axis } from '@/components/plot/axis'
import type { IGenomicLocation } from '@lib/genomic/genomic'
import { range } from '@lib/math/range'
import { type ISeqPos } from '../../svg/base-seq-track-svg'

export interface IGetPointOptions {
  mode?: 'CPM' | 'BPM' | 'Count'
  //smooth?: boolean
  accessToken?: string
}

export abstract class BaseSeqReader {
  abstract getRealYPoints(
    location: IGenomicLocation,

    binSize: number,
    options?: IGetPointOptions
  ): Promise<ISeqPos[]>

  // abstract getPoints(
  //   location: IGenomicLocation,
  //   xax: Axis,
  //   yax: Axis,
  //   binSize: number,
  //   smoothingFactor: number,
  //   options?: IGetPointOptions
  // ): Promise<ISeqPos[]>

  async getPoints(
    location: IGenomicLocation,
    xax: Axis,
    yax: Axis,
    binSize: number,
    smoothingFactor: number,
    { mode = 'Count' }: IGetPointOptions = {}
  ): Promise<ISeqPos[]> {
    const points = await this.getRealYPoints(location, binSize, { mode })

    //if (this._mode === 'Cache X') {
    //for (const b of this._points) {
    //  b.x = xax.domainToRange(b.start!)
    //}

    //this._mode = 'Collapse'
    //}

    //if (this._mode === 'Collapse') {
    //this._points = collapsePoints(this._points, xax, binSize, smooth)

    // for (const b of this._points) {
    //   console.log(yax.domainToRange(b.realY), yax.domain)
    //   b.y = yax.domainToRange(b.realY)
    // }

    //this._mode = 'Fully Cached'
    //}

    return collapsePoints(points, xax, yax, smoothingFactor)
  }
}

export class EmptySeqReader extends BaseSeqReader {
  override async getRealYPoints(
    _location: IGenomicLocation,
    _binSize: number
  ): Promise<ISeqPos[]> {
    return []
  }

  override async getPoints(
    _location: IGenomicLocation,
    _xax: Axis,
    _yax: Axis,
    _binSize: number,
    _smoothingFactor: number
  ): Promise<ISeqPos[]> {
    return []
  }
}

export const EMPTY_SEQ_READER = new EmptySeqReader()

export interface ISeqReaderBin {
  start: number
  realY: number
  numPoints: number
}

export function makeBins(
  location: IGenomicLocation,
  binSize: number
): ISeqPos[] {
  const start = Math.floor(location.start / binSize) * binSize // Math.max(1, location.start + 4 * binSize)
  const end = Math.ceil(location.end / binSize) * binSize

  return range(start, end, binSize).map(b => {
    // one based start
    const s = b + 1
    return {
      start: s,
      end: s + binSize,
      x: 0,
      //x2: 0,
      y: 0,

      realY: 0,
      // how many points are in the is window
      numPoints: 0,
    }
  })
}

export function makePoints(
  location: IGenomicLocation,
  xax: Axis,
  binSize: number
): ISeqPos[] {
  const start = Math.floor(location.start / binSize) * binSize // Math.max(1, location.start + 4 * binSize)
  const end = Math.ceil(location.end / binSize) * binSize

  return range(start, end, binSize).map(b => {
    const s = b + 1
    const e = s + binSize
    return {
      start: s,
      end: e,
      x: xax.domainToRange(s),
      x2: xax.domainToRange(e),
      y: 0,
      realY: 0,
      // how many points are in the is window
      numPoints: 0,
    }
  })
}

export function collapsePoints(
  points: ISeqPos[],
  xax: Axis,
  yax: Axis,
  smoothingFactor: number
): ISeqPos[] {
  // no data, so no point attempting to collapse them
  if (points.length === 0) {
    return []
  }

  //console.log(points)
  // filter down to remove duplicate x coordinates etc

  // fill the gaps

  let filledPoints: ISeqPos[] = [points[0]!]

  let p2: ISeqPos
  //let p1: ISeqPos
  let npi = 0
  //let joins: number[][] = [[0]]

  for (let i2 = 1; i2 < points.length; i2++) {
    npi = filledPoints.length - 1

    p2 = points[i2]!

    if (
      p2.start === filledPoints[npi]!.end &&
      Math.abs(p2.realY - filledPoints[npi]!.realY) < Number.EPSILON
    ) {
      // both points are contiguous and of the same height, so merge them
      filledPoints[npi]!.end = p2.end
    } else {
      // if there is a gap between points, add a zero spacer
      if (p2.start > filledPoints[npi]!.end) {
        filledPoints.push({
          start: filledPoints[npi]!.end,
          end: p2.start,
          x: 0,
          y: 0,
          realY: 0, //smooth ? (p1.realY + p2.realY) / 2 : 0,
          numPoints: 0,
        })
      }

      filledPoints.push(p2)
    }
  }

  //console.log(filledPoints, 'fill', smoothingFactor)

  if (smoothingFactor > 0) {
    // increase size of zero regions to mean of flanking regions so that dips are not
    // as severe

    for (let i = 1; i < filledPoints.length - 1; i++) {
      if (filledPoints[i]!.realY === 0) {
        filledPoints[i]!.realY =
          (filledPoints[i - 1]!.realY + filledPoints[i + 1]!.realY) *
          0.5 *
          smoothingFactor
      }
    }
  }

  let linePoints: ISeqPos[] = []

  // we need to duplicate starts and ends as unique
  // points for drawing lines. end will be ignored
  // by the renderer so only start is important. We
  // set end to equal start to indicate this

  for (const b of filledPoints) {
    linePoints.push({ ...b, end: b.start })
    linePoints.push({ ...b, start: b.end })
  }

  for (const b of linePoints) {
    b.x = xax.domainToRange(b.start)
    b.y = yax.domainToRange(b.realY)
  }

  // zero the ends
  const y0 = yax.domainToRange(0)

  linePoints = [
    { ...linePoints[0]!, y: y0, realY: 0 },
    ...linePoints,
    { ...linePoints[linePoints.length - 1]!, y: y0, realY: 0 },
  ]

  return linePoints
}
