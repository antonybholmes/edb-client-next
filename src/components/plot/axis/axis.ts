import type { ILim } from '@/lib/math/math'
import { DeepPartial, definedProps } from '@/lib/utils'
import * as d3 from 'd3'
import { type ScaleLinear } from 'd3'
import { deepmerge } from 'deepmerge-ts'
import { IAxisDisplayProps, IAxisTickProps } from './svg-axis-props'

export type TickLabel = string | number

const MINOR_TICK_MULTIPLIER = 5

export type TickItem = {
  v: number
  label: string
}

interface IMajorMinorTickParams {
  major: DeepPartial<IAxisTickProps>
  minor: DeepPartial<IAxisTickProps>
}

interface ITickProps extends DeepPartial<IAxisTickProps> {
  which: 'major' | 'minor' | 'both'
}

export class Axis {
  //protected _range: ILim = [0, 500]

  // clip values to be within bounds of axis
  protected _clip: boolean = true
  protected _title: string = ''

  protected _ticks: TickItem[] | undefined = undefined
  protected _minorTicks: TickItem[] | undefined = undefined

  // we use d3 under the hood to do the scaling
  protected _scale: ScaleLinear<number, number> = d3
    .scaleLinear()
    .domain([0, 100])
    .range([0, 500])

  protected _format: ((d: d3.NumberValue) => string) | null = null
  protected _userFormat: ((d: d3.NumberValue) => string) | null = null

  protected _numTicks: number = 5
  protected _numMinorTicks: number = this._numTicks * MINOR_TICK_MULTIPLIER

  protected _params: DeepPartial<IAxisDisplayProps> = {
    //show: true,
    title: {},
    line: {},
    ticks: {
      major: {},
      minor: {},
    },
  }

  private _makeFormatter(n: number): (d: d3.NumberValue) => string {
    if (!this._format) {
      // auto format the ticks if not set
      this._format = this._scale.tickFormat(n, 'f') //  d3.format('.2f')
    }

    return this._format
  }

  private _makeTicks(
    ticks: number[] | string[] | TickItem[],
    addLabels: boolean = true
  ): TickItem[] {
    if (ticks.length === 0) {
      return []
    }

    if (ticks.every((item) => typeof item === 'number')) {
      const format = this._makeFormatter(ticks.length) ?? this._format

      // if ticks are just numbers, convert to TickItem
      return ticks.map((v) => ({
        v,
        label: addLabels ? format(v) : '',
      }))
    } else if (ticks.every((item) => typeof item === 'string')) {
      // if ticks are just strings, convert to TickItem
      return ticks.map((v) => ({
        v: parseFloat(v),
        label: addLabels ? v : '',
      }))
    } else if (
      ticks.every(
        (item) => typeof item === 'object' && 'v' in item && 'label' in item
      )
    ) {
      return ticks as TickItem[]
    } else {
      return []
    }
  }

  /**
   * Clones the properties of an axis onto this axis
   * for the purposes of copying. This method is not
   * designed for external calling.
   *
   * @param target an axis object to add cloned properties to
   * @returns the axis object.
   */
  _copy<T extends Axis>(target: T): T {
    target._scale = this._scale.copy()
    target._clip = this._clip
    target._title = this._title
    target._format = this._format
    target._numTicks = this._numTicks
    target._numMinorTicks = this._numMinorTicks
    target._userFormat = this._userFormat
    target._params = structuredClone(this._params)

    if (this._ticks) {
      target._ticks = [...this._ticks]
    }

    if (this._minorTicks) {
      target._minorTicks = [...this._minorTicks]
    }

    return target
  }

  clone(): Axis {
    const a = new Axis()
    return this._copy(a)
  }

  setTitle(title: string): Axis {
    const a = this.clone()
    a._title = title
    return a
  }

  setClip(clip: boolean): Axis {
    const a = this.clone()
    a._clip = clip
    return a
  }

  setDP(dp: number): Axis {
    const a = this.clone()

    a._userFormat = dp >= 0 ? d3.format(`.${dp}f`) : undefined

    return a
  }

  setNumTicks(numTicks: number): Axis {
    const a = this.clone()
    a._numTicks = numTicks
    a._numMinorTicks = numTicks * MINOR_TICK_MULTIPLIER
    a._ticks = undefined
    a._minorTicks = undefined

    console.log('bb', a)
    return a
  }

  setNumMinorTicks(numTicks: number): Axis {
    const a = this.clone()
    a._numMinorTicks = numTicks
    a._minorTicks = undefined
    console.log('v', a)
    return a
  }

  setTickParams(ticks: Partial<ITickProps> = {}): Axis {
    const { show, line, labels, which = 'both' } = ticks

    const a = this.clone()

    const props = definedProps({ show, line, labels })

    if (which === 'major' || which === 'both') {
      a._params.ticks.major = deepmerge(a._params.ticks.major, props)
    }

    if (which === 'minor' || which === 'both') {
      a._params.ticks.minor = deepmerge(a._params.ticks.minor, props)
    }

    return a
  }

  get params(): DeepPartial<IAxisDisplayProps> {
    return this._params
  }

  get tickParams(): DeepPartial<IMajorMinorTickParams> {
    return this._params.ticks
  }

  /**
   * Invalidate the cached ticks and formatters. This is called
   * when the domain or range changes, so that the ticks can be
   * recalculated. This is an internal method and should not be
   * called directly. It is called automatically when the
   * domain or range changes.
   *
   * @private
   */
  private _invalidateCache() {
    this._ticks = undefined
    this._minorTicks = undefined
    this._format = undefined
  }

  /**
   * The domain is the range of the real data.
   *
   * @param lim
   * @param opts
   * @returns
   */
  setDomain(lim: ILim): Axis {
    const a = this.clone()

    a._scale = d3.scaleLinear().domain(lim).range([0, a._scale.range()[1]!])
    a._invalidateCache()

    return a
  }

  /**
   * Set the drawing range (in pixels) where the axis will
   * be drawn, thus a data point can be scaled to where it
   * will appear in the actual svg.
   *
   * @param range
   * @returns
   */
  setRange(lim: ILim): Axis {
    const a = this.clone()

    a._scale = d3.scaleLinear().domain(a._scale.domain()).range(lim)
    a._invalidateCache()

    return a
  }

  setLength(l: number): Axis {
    return this.setRange([0, l])
  }

  /**
   * Set the axis limit, but auto adjust to be multiples
   * of the interval.
   *
   * @param lim axis domain limit
   * @returns
   */
  autoDomain(lim: ILim): Axis {
    const a = this.clone()

    a._scale = d3
      .scaleLinear()
      .domain(lim)
      .nice()
      .range([0, a._scale.range()[1]!])

    return a
  }

  setTicks(ticks: number[] | string[] | TickItem[]): Axis {
    const a = this.clone()

    a._ticks = a._makeTicks(ticks)

    return a
  }

  setMinorTicks(ticks: number[] | string[] | TickItem[]): Axis {
    const a = this.clone()

    a._minorTicks = a._makeTicks(ticks, false)

    // turn on minor ticks if they are set
    // we can directly set in partial object
    // as show key will be created if it does not exist
    a._params.ticks.minor.show = a._minorTicks.length > 0

    return a
  }

  get title(): string {
    return this._title
  }

  /**
   * The limits of the axis in the domain space, i.e.
   * your input data in metres, seconds etc.
   */
  get domain(): ILim {
    return this._scale.domain() as ILim
  }

  /**
   * The length of the axis in pixels.
   * This is the difference between the two range limits.
   */
  get length(): number {
    return this._scale.range()[1]!
  }

  get range(): ILim {
    return this._scale.range() as ILim
  }

  private generateTicks(n: number): TickItem[] {
    const format = this._makeFormatter(n) ?? this._format

    const ticks = this._scale.ticks(n).map((v) => ({
      v,
      label: format?.(v) ?? v.toString(),
    }))

    return ticks
  }

  get ticks(): TickItem[] {
    if (!this._ticks) {
      // if ticks are not set, generate them from the scale
      this._ticks = this.generateTicks(this._numTicks)
    }

    return this._ticks
  }

  get minorTicks(): TickItem[] {
    if (!this._minorTicks) {
      this._minorTicks = this.generateTicks(this._numMinorTicks)
    }

    return this._minorTicks
  }

  /**
   * Converts a number in domain space to range space.
   *
   * @param x a value in domain space
   * @returns the value in range space (i.e. the pixel coordinate)
   */
  protected _domainToRange(x: number): number {
    let n = this._scale(x)

    if (this._clip) {
      if (n < this.range[0]) {
        n = this.range[0]
      }

      if (n > this.range[1]) {
        n = this.range[1]
      }
    }

    return n
  }

  /**
   * Converts a number in domain space to range space, i.e. real to pixel coordinates.
   *
   * @param x a value in domain space
   * @returns the value in range space (i.e. the pixel coordinate)
   */
  domainToRange(x: number): number {
    return this._domainToRange(x)
  }

  /**
   * Convert from range (i.e. pixel) space to domain space.
   * This is the inverse of domainToRange.
   *
   * @param x a value in range space (i.e. pixel coordinate)
   * @param clip if true, clip the value to the domain limits
   * @returns
   */
  rangeToDomain(x: number): number {
    let n = this._scale.invert(x)

    if (this._clip) {
      if (n < this.domain[0]) {
        n = this.domain[0]
      }

      if (n > this.domain[1]) {
        n = this.domain[1]
      }
    }

    return n
  }
}

export class YAxis extends Axis {
  override clone(): Axis {
    return this._copy(new YAxis())
  }

  override domainToRange(x: number): number {
    // invert the y-axis, so that higher values are at the top since SVG y=0 is at the top
    // but on a graph, y=0 is at the bottom so we need to flip the y-axis for display
    return this._scale.range()[1]! - this._domainToRange(x)
  }

  static fromAxis(axis: Axis): YAxis {
    return axis._copy(new YAxis())
  }
}

/**
 * Calculates a reasonable tick interval for a data axis.
 *
 * https://stackoverflow.com/questions/237220/tickmark-algorithm-for-a-graph-axis
 *
 * @param lim
 * @returns
 */
export function autoTickInterval(lim: ILim): number {
  const range = Math.abs(lim[1] - lim[0])

  const x = Math.pow(10, Math.floor(Math.log10(range)))

  let ret = 0

  if (range / x >= 5) {
    ret = x
  } else if (range / (0.5 * x) >= 5) {
    ret = 0.5 * x
  } else {
    ret = x * 0.2
  }

  if (lim[0] > lim[1]) {
    ret = -ret
  }

  return ret
}

/**
 * Calculates a standardized data range over a given limit.
 * This is to make a graph more visually appealing. For example
 * instead of [.23, 4.1] convert to [0, 5]
 *
 * @param lim
 * @param interval
 * @returns
 */
export function autoLim(lim: ILim, interval?: number): ILim {
  if (!interval) {
    interval = autoTickInterval(lim)
  }

  return [
    Math.floor(lim[0] / interval) * interval,
    Math.ceil(lim[1] / interval) * interval,
  ]
}
