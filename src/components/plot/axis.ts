import type { ILim } from '@lib/math/math'
import type { ScaleLinear } from 'd3'
import * as d3 from 'd3'
export type TickLabel = string | number

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

  // we use d3 under the hood to do the scaling
  protected _scale: ScaleLinear<number, number> = d3
    .scaleLinear()
    .domain([0, 100])
    .range([0, 500])
  protected _format: ((d: d3.NumberValue) => string) | null = null // d3.format(',d') //(`.2f`)

  protected _numTicks: number = 5

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
    a._scale = this._scale.copy()
    a._clip = this._clip
    a._title = this._title
    a._format = this._format
    a._ticks = this._ticks
    a._numTicks = this._numTicks

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

  setDP(dp: number): Axis {
    const a = this.copy()

    a._format = d3.format(`.${dp}f`)
    return a
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
    return a
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

    //console.log('autoDomain', lim, a._scale.domain())

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
  // setRange(lim: ILim): Axis {
  //   const a = this.copy()

  //   a._range = lim
  //   a._length = lim[1] - lim[0]
  //   a._maxIdx = a._length - 1

  //   return a
  // }

  setLength(l: number): Axis {
    const a = this.copy()

    a._scale = d3.scaleLinear().domain(a._scale.domain()).range([0, l])

    return a
  }

  setTicks(ticks?: number[] | string[] | TickItem[]): Axis {
    if (!ticks) {
      return this
    }

    const a = this.copy()

    if (ticks.every((item) => typeof item === 'number')) {
      if (!a._format) {
        // auto format the ticks if not set
        a._format = this._scale.tickFormat(ticks.length)! //  d3.format('.2f')
      }

      // if ticks are just numbers, convert to TickItem
      a._ticks = ticks.map((v) => ({
        v,
        label: a._format!(v),
      }))
    } else if (ticks.every((item) => typeof item === 'string')) {
      // if ticks are just strings, convert to TickItem
      a._ticks = ticks.map((v) => ({
        v: parseFloat(v),
        label: v,
      }))
    } else if (
      ticks.every(
        (item) => typeof item === 'object' && 'v' in item && 'label' in item
      )
    ) {
      a._ticks = ticks
    } else {
      // do nothing
    }

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
   * The size of the axis in pixels.
   */
  // get range(): ILim {
  //   return this._range
  // }

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

  get ticks(): TickItem[] {
    if (!this._ticks) {
      this._ticks =
        this._scale.ticks(this._numTicks).map((v) => ({
          v,
          label: this._scale.tickFormat?.()(v) ?? String(v),
        })) ?? []
    }

    return this._ticks
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
   * Converts a number in domain space to range space.
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

    //console.log('rangeToDomain', x, n, this.domain)

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
    return this._clone(a)
  }

  override domainToRange(x: number): number {
    // invert the y-axis, so that higher values are at the top since SVG y=0 is at the top
    // but on a graph, y=0 is at the bottom so we need to flip the y-axis for display
    return this.range[1]! - this._domainToRange(x)
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

// export class Axis {
//   protected _domain: ILim = [0, 100]
//   protected _domainDiff: number = 100
//   protected _ticks: number[] = [0, 100]
//   protected _ticklabels: string[] = ['0', '100']
//   //protected _range: ILim = [0, 500]
//   protected _length: number = 500
//   // clip values to be within bounds of axis
//   protected _clip: boolean = true
//   protected _title: string = ''
//   protected _dp: number = 2
//   protected _range: number = 499 // max index in the range, used for rangeToDomain

//   // constructor(
//   //   opt: {
//   //     domain?: ILim
//   //     range?: ILim
//   //     ticks?: number[]
//   //     tickLabels?: TickLabel[]
//   //     clip?: boolean
//   //     title?: string
//   //   } = {},
//   // ) {
//   //   const { domain, range, ticks, tickLabels, clip, title } = opt

//   //   if (domain) {
//   //     this.setDomain(domain)
//   //   }

//   //   if (range) {
//   //     this.setLength(range)
//   //   }

//   //   if (ticks) {
//   //     this.setTicks(ticks)
//   //   }

//   //   if (tickLabels) {
//   //     this._ticklabels = tickLabels.map(x => x.toLocaleString())
//   //   }

//   //   if (clip) {
//   //     this._clip = clip
//   //   }

//   //   if (title) {
//   //     this._title = title
//   //   }
//   // }

//   /**
//    * Clones the properties of this axis onto an axis
//    * parameter for the purposes of copying an axis object.
//    * This method is not designed for external calling.
//    *
//    * @param a an axis object to add cloned properties to
//    * @returns the axis object.
//    */
//   _clone(a: Axis): Axis {
//     a._domain = this._domain
//     a._domainDiff = this._domainDiff
//     //a._range = this._range
//     a._length = this._length
//     a._range = this._range
//     a._ticks = this._ticks
//     a._ticklabels = this._ticklabels
//     a._clip = this._clip
//     a._title = this._title
//     a._dp = this._dp

//     return a
//   }

//   copy(): Axis {
//     const a = new Axis()
//     return this._clone(a)
//   }

//   setTitle(title: string): Axis {
//     const a = this.copy()
//     a._title = title
//     return a
//   }

//   setClip(clip: boolean): Axis {
//     const a = this.copy()
//     a._clip = clip
//     return a
//   }

//   /**
//    * The domain is the range of the real data.
//    *
//    * @param lim
//    * @param opts
//    * @returns
//    */
//   setDomain(lim: ILim, interval?: number): Axis {
//     const a = this.copy()

//     a._domain = lim
//     a._domainDiff = Math.abs(lim[1] - lim[0])
//     return a.setTicks(makeTicks(lim, interval))
//   }

//   /**
//    * Set the axis limit, but auto adjust to be multiples
//    * of the interval.
//    *
//    * @param lim axis domain limit
//    * @returns
//    */
//   autoDomain(lim: ILim, interval?: number): Axis {
//     const a = this.copy()

//     if (isNullUndef(interval)) {
//       interval = autoTickInterval(lim!)
//     }

//     //console.log("auto", autoLim(lim, interval))

//     return a.setDomain(autoLim(lim, interval), interval)
//   }

//   /**
//    * Set the drawing range (in pixels) where the axis will
//    * be drawn, thus a data point can be scaled to where it
//    * will appear in the actual svg.
//    *
//    * @param range
//    * @returns
//    */
//   // setRange(lim: ILim): Axis {
//   //   const a = this.copy()

//   //   a._range = lim
//   //   a._length = lim[1] - lim[0]
//   //   a._maxIdx = a._length - 1

//   //   return a
//   // }

//   setLength(l: number): Axis {
//     const a = this.copy()

//     a._length = l
//     a._range = l - 1

//     return a
//   }

//   setTicks(ticks?: number[]): Axis {
//     if (!ticks) {
//       return this
//     }

//     const a = this.copy()

//     a._ticks = ticks
//     // with fix for stupid -0 problem
//     a._ticklabels = a._ticks.map(tick =>
//       Number.isInteger(tick)
//         ? tick.toLocaleString()
//         : tick.toFixed(this._dp).replace('-0', '0')
//     )

//     return a
//   }

//   setTickLabels(labels: TickLabel[]): Axis {
//     const a = this.copy()

//     a._ticklabels = labels.map(x => x.toLocaleString())

//     return a
//   }

//   get title(): string {
//     return this._title
//   }

//   /**
//    * The limits of the axis in the domain space, i.e.
//    * your input data in metres, seconds etc.
//    */
//   get domain(): ILim {
//     return this._domain
//   }

//   /**
//    * The size of the axis in pixels.
//    */
//   // get range(): ILim {
//   //   return this._range
//   // }

//   /**
//    * The length of the axis in pixels.
//    * This is the difference between the two range limits.
//    */
//   get length(): number {
//     return this._length
//   }

//   get range(): number {
//     return this._range
//   }

//   get ticks(): number[] {
//     return this._ticks ? this._ticks : this._domain
//   }

//   get tickLabels(): string[] {
//     return this._ticklabels
//       ? this._ticklabels
//       : this.ticks.map(x => x.toLocaleString())
//   }

//   /**
//    * Normalizes a value in the domain space.
//    *
//    * @param x
//    * @returns
//    */
//   domainNorm(x: number, clip: boolean = false): number {
//     let s =
//       (this.domain[0] > this.domain[1]
//         ? this.domain[0] - x
//         : x - this.domain[0]) / this._domainDiff

//     //console.log(x, s, this.domain)

//     if (this._clip || clip) {
//       s = Math.max(0, Math.min(s, 1))
//     }

//     return s
//   }

//   /**
//    * Converts a number in domain space to range space.
//    *
//    * @param x a value in domain space
//    * @returns the value in range space (i.e. the pixel coordinate)
//    */
//   domainToRange(x: number, clip: boolean = false): number {
//     //console.log('d', this.range[0], this.domainNorm(x, clip))
//     return this.domainNorm(x, clip) * this._range //this._length
//   }

//   rangeNorm(x: number, clip: boolean = false): number {
//     let s = x / this._range //this._length

//     if (this._clip || clip) {
//       s = Math.max(0, Math.min(s, 1))
//     }

//     return s
//   }

//   /**
//    * Converts a number in domain space to range space.
//    *
//    * @param x a value in domain space
//    * @returns the value in range space (i.e. the pixel coordinate)
//    */
//   rangeToDomain(x: number, clip: boolean = false): number {
//     const n = this.rangeNorm(x, clip) * this._domainDiff

//     if (this.domain[0] > this.domain[1]) {
//       // reverse
//       return this.domain[0] - n
//     } else {
//       return this.domain[0] + n
//     }

//     // return (
//     //   (this.domain[0] > this.domain[1] ? this.domain[1] : this.domain[0]) +
//     //   this.rangeNorm(x, clip) * this._domainDiff
//     // )
//   }
// }

// export class YAxis extends Axis {
//   override copy(): Axis {
//     const a = new YAxis()
//     return this._clone(a)
//   }

//   override domainToRange(x: number, clip: boolean = false): number {
//     return (1 - this.domainNorm(x, clip)) * this._range
//   }
// }
