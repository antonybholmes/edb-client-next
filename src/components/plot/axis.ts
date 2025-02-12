import { isNullUndef } from '@interfaces/null-undef'

export type ILim = [number, number]

export type TickLabel = string | number

/**
 * Calculates a reasonable tick interval for a data axis.
 *
 * https://stackoverflow.com/questions/237220/tickmark-algorithm-for-a-graph-axis
 *
 * @param lim
 * @returns
 */
export function autoTickInterval(lim: ILim): number {
  const range = lim[1] - lim[0]

  const x = Math.pow(10, Math.floor(Math.log10(range)))

  if (range / x >= 5) {
    return x
  } else if (range / (0.5 * x) >= 5) {
    return 0.5 * x
  } else {
    return x * 0.2
  }
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

  //console.log("interval", interval, lim)

  return [
    Math.floor(lim[0] / interval) * interval,
    Math.ceil(lim[1] / interval) * interval,
  ]
}

export function makeTicks(lim: ILim, interval?: number): number[] {
  if (!interval) {
    interval = autoTickInterval(lim)
  }

  const ticks = [lim[0]]

  // keep adding ticks whilst within the limits
  while (ticks[ticks.length - 1]! + interval <= lim[1]) {
    ticks.push(ticks[ticks.length - 1]! + interval)
  }

  return ticks
}

export class Axis {
  protected _domain: ILim = [0, 100]
  protected _domainDiff: number = 100
  protected _ticks: number[] = [0, 100]
  protected _ticklabels: string[] = ['0', '100']
  protected _range: ILim = [0, 500]
  protected _length: number = 500
  // clip values to be within bounds of axis
  protected _clip: boolean = true
  protected _title: string = ''
  protected _dp: number = 2

  // constructor(
  //   opt: {
  //     domain?: ILim
  //     range?: ILim
  //     ticks?: number[]
  //     tickLabels?: TickLabel[]
  //     clip?: boolean
  //     title?: string
  //   } = {},
  // ) {
  //   const { domain, range, ticks, tickLabels, clip, title } = opt

  //   if (domain) {
  //     this.setDomain(domain)
  //   }

  //   if (range) {
  //     this.setRange(range)
  //   }

  //   if (ticks) {
  //     this.setTicks(ticks)
  //   }

  //   if (tickLabels) {
  //     this._ticklabels = tickLabels.map(x => x.toLocaleString())
  //   }

  //   if (clip) {
  //     this._clip = clip
  //   }

  //   if (title) {
  //     this._title = title
  //   }
  // }

  /**
   * Clones the properties of this axis onto an axis
   * parameter for the purposes of copying an axis object.
   * This method is not designed for external calling.
   *
   * @param a an axis object to add cloned properties to
   * @returns the axis object.
   */
  _clone(a: Axis): Axis {
    a._domain = this._domain
    a._domainDiff = this._domainDiff
    a._range = this._range
    a._length = this._length
    a._ticks = this._ticks
    a._ticklabels = this._ticklabels
    a._clip = this._clip
    a._title = this._title
    a._dp = this._dp

    return a
  }

  copy(): Axis {
    const a = new Axis()
    return this._clone(a)
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

  /**
   * The domain is the range of the real data.
   *
   * @param lim
   * @param opts
   * @returns
   */
  setDomain(lim: ILim, interval?: number): Axis {
    const a = this.copy()

    a._domain = lim
    a._domainDiff = lim[1] - lim[0]
    return a.setTicks(makeTicks(lim, interval))
  }

  /**
   * Set the axis limit, but auto adjust to be multiples
   * of the interval.
   *
   * @param lim axis domain limit
   * @returns
   */
  autoDomain(lim: ILim, interval?: number): Axis {
    // eslint-disable-next-line prefer-const
    const a = this.copy()

    if (isNullUndef(interval)) {
      interval = autoTickInterval(lim!)
    }

    //console.log("auto", autoLim(lim, interval))

    return a.setDomain(autoLim(lim, interval), interval)
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

    a._range = lim
    a._length = lim[1] - lim[0]

    return a
  }

  setLength(l: number): Axis {
    return this.setRange([0, l])
  }

  setTicks(ticks?: number[]): Axis {
    if (!ticks) {
      return this
    }

    const a = this.copy()

    a._ticks = ticks
    // with fix for stupid -0 problem
    a._ticklabels = a._ticks.map(tick =>
      Number.isInteger(tick)
        ? tick.toLocaleString()
        : tick.toFixed(this._dp).replace('-0', '0')
    )

    return a
  }

  setTickLabels(labels: TickLabel[]): Axis {
    const a = this.copy()

    a._ticklabels = labels.map(x => x.toLocaleString())

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
    return this._domain
  }

  /**
   * The size of the axis in pixels.
   */
  get range(): ILim {
    return this._range
  }

  get length(): number {
    return this._length
  }

  get ticks(): number[] {
    return this._ticks ? this._ticks : this._domain
  }

  get tickLabels(): string[] {
    return this._ticklabels
      ? this._ticklabels
      : this.ticks.map(x => x.toLocaleString())
  }

  /**
   * Normalizes a value in the domain space.
   *
   * @param x
   * @returns
   */
  domainNorm(x: number): number {
    let s = (x - this.domain[0]) / this._domainDiff

    if (this._clip) {
      s = Math.max(0, Math.min(s, 1))
    }

    return s
  }

  /**
   * Converts a number in domain space to range space.
   *
   * @param x a value in domain space
   * @returns the value in range space (i.e. the pixel coordinate)
   */
  domainToRange(x: number): number {
    return this.range[0] + this.domainNorm(x) * this._length
  }

  rangeNorm(x: number): number {
    let s = (x - this.range[0]) / this._length

    if (this._clip) {
      s = Math.max(0, Math.min(s, 1))
    }

    return s
  }

  /**
   * Converts a number in domain space to range space.
   *
   * @param x a value in domain space
   * @returns the value in range space (i.e. the pixel coordinate)
   */
  rangeToDomain(x: number): number {
    return this.domain[0] + this.rangeNorm(x) * this._domainDiff
  }
}

export class YAxis extends Axis {
  override copy(): Axis {
    const a = new YAxis()
    return this._clone(a)
  }

  override domainToRange(x: number): number {
    return this.range[1] - this.domainNorm(x) * this._length
  }
}
