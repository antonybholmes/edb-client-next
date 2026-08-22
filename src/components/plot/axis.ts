import type { ILim } from '@/lib/math/math'
import type { ScaleLinear } from 'd3'
import * as d3 from 'd3'
export type TickLabel = string | number

const MINOR_TICK_MULTIPLIER = 10

export type TickItem = {
  v: number
  label: string
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

  protected _tickSize: number = 5
  protected _minorTickSize: number = 3
  protected _tickPadding: number = 2

  private _makeTicks(ticks: number[] | string[] | TickItem[]): TickItem[] {
    if (ticks.length === 0) {
      return []
    }

    if (!this._format) {
      // auto format the ticks if not set
      this._format = this._scale.tickFormat(ticks.length, 'f') //  d3.format('.2f')
    }

    const format = this._userFormat ? this._userFormat : this._format

    if (ticks.every((item) => typeof item === 'number')) {
      // if ticks are just numbers, convert to TickItem
      return ticks.map((v) => ({
        v,
        label: format(v),
      }))
    } else if (ticks.every((item) => typeof item === 'string')) {
      // if ticks are just strings, convert to TickItem
      return ticks.map((v) => ({
        v: parseFloat(v),
        label: v,
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
   * Clones the properties of this axis onto an axis
   * parameter for the purposes of copying an axis object.
   * This method is not designed for external calling.
   *
   * @param a an axis object to add cloned properties to
   * @returns the axis object.
   */
  _clone(a: Axis): Axis {
    //a._range = this._range
    this._scale = a._scale.copy()
    this._clip = a._clip
    this._title = a._title
    this._format = a._format
    this._ticks = a._ticks
    this._numTicks = a._numTicks
    this._userFormat = a._userFormat
    this._minorTicks = a._minorTicks
    this._tickSize = a._tickSize
    this._minorTickSize = a._minorTickSize
    this._tickPadding = a._tickPadding

    return this
  }

  copy(): Axis {
    const a = new Axis()
    return a._clone(this)
  }

  setTitle(title: string): Axis {
    const a = this.copy()
    a._title = title
    return a
  }

  setClip(clip: boolean): Axis {
    const a = this.copy()
    a._clip = clip
    return a
  }

  setDP(dp: number): Axis {
    const a = this.copy()

    a._userFormat = dp >= 0 ? d3.format(`.${dp}f`) : undefined

    a._updateTickLabels()

    return a
  }

  private _updateTickLabels() {
    this._ticks = this._ticks?.map((t) => ({
      v: t.v,
      label: this._userFormat ? this._userFormat(t.v) : this._format!(t.v),
    }))

    this._minorTicks = this._minorTicks?.map((t) => ({
      v: t.v,
      label: this._userFormat ? this._userFormat(t.v) : this._format!(t.v),
    }))
  }

  setNumTicks(numTicks: number): Axis {
    const a = this.copy()
    a._numTicks = numTicks
    return a
  }

  /**
   * The domain is the range of the real data.
   *
   * @param lim
   * @param opts
   * @returns
   */
  setDomain(lim: ILim): Axis {
    const a = this.copy()

    a._scale = d3.scaleLinear().domain(lim).range([0, a._scale.range()[1]!])
    a._format = undefined // reset the format so that it will be auto generated for the new domain

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
    const a = this.copy()

    a._scale = d3.scaleLinear().domain(a._scale.domain()).range(lim)

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
    const a = this.copy()

    a._scale = d3
      .scaleLinear()
      .domain(lim)
      .nice()
      .range([0, a._scale.range()[1]!])

    return a
  }

  setTicks(ticks: number[] | string[] | TickItem[]): Axis {
    const a = this.copy()

    a._ticks = this._makeTicks(ticks)

    //const tickSet = new Set(this.ticks.map((t) => t.v))

    //a._minorTicks = a.minorTicks //.filter((t) => !tickSet.has(t.v))

    return a
  }

  setMinorTicks(ticks: number[] | string[] | TickItem[]): Axis {
    const a = this.copy()

    //const tickSet = new Set(this.ticks.map((t) => t.v))

    a._minorTicks = this._makeTicks(ticks) //.filter((t) => !tickSet.has(t.v))

    return a
  }

  setTickSize(size: number): Axis {
    const a = this.copy()
    a._tickSize = size
    return a
  }

  setMinorTickSize(size: number): Axis {
    const a = this.copy()
    a._minorTickSize = size
    return a
  }

  setTickPadding(padding: number): Axis {
    const a = this.copy()
    a._tickPadding = padding
    return a
  }

  get tickPadding(): number {
    return this._tickPadding
  }

  get tickSize(): number {
    return this._tickSize
  }

  get minorTickSize(): number {
    return this._minorTickSize
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
    const ticks = this._scale.ticks(n).map((v) => ({
      v,
      label: this._scale.tickFormat?.()(v) ?? v.toString(),
    }))

    return ticks
  }

  get ticks(): TickItem[] {
    if (!this._ticks) {
      // if ticks are not set, generate them from the scale
      this._ticks = this.generateTicks(this._numTicks)

      const tickSet = new Set(this._ticks.map((t) => t.v))

      this._minorTicks = this.minorTicks.filter((t) => !tickSet.has(t.v))
    }

    return this._ticks
  }

  get minorTicks(): TickItem[] {
    if (!this._minorTicks) {
      const tickSet = new Set(this.ticks.map((t) => t.v))
      this._minorTicks = this.generateTicks(
        this._numTicks * MINOR_TICK_MULTIPLIER
      ).filter((t) => !tickSet.has(t.v))
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
    // return (
    //   (this.domain[0] > this.domain[1] ? this.domain[1] : this.domain[0]) +
    //   this.rangeNorm(x, clip) * this._domainDiff
    // )
  }
}

export class YAxis extends Axis {
  override copy(): Axis {
    const a = new YAxis()
    return a._clone(this)
  }

  override domainToRange(x: number): number {
    // invert the y-axis, so that higher values are at the top since SVG y=0 is at the top
    // but on a graph, y=0 is at the bottom so we need to flip the y-axis for display
    return this._scale.range()[1]! - this._domainToRange(x)
  }

  static fromAxis(axis: Axis): YAxis {
    const y = new YAxis()
    return y._clone(axis)
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
