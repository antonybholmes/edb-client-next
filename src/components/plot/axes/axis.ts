import { makeUuid } from '@/lib/id'
import type { ILim } from '@/lib/math/math'
import { range as numRange } from '@/lib/math/range'
import { DeepPartial, definedProps } from '@/lib/utils'
import * as d3 from 'd3'
import { deepmerge } from 'deepmerge-ts'
import {
  DEFAULT_AXIS_CONFIG,
  ITickParamProps,
  type IAxisConfig,
  type ITickItem,
  type WhichTick,
} from './svg-axis-props'

type IAxisFormat =
  | { type: 'auto' }
  | { type: 'd3'; specifier: string }
  | { type: 'fixed'; decimalPlaces: number }

export interface IAxis extends IAxisConfig {
  id: string

  /**
   * The length of the axis in pixels derived from the range.
   */
  length: number

  //domainToRange?: d3.ScaleLinear<number, number>
  format?: IAxisFormat
  //userFormat?: (value: number) => string
}

export function copyAxis(axis: IAxis, patch: Partial<IAxis> = {}): IAxis {
  return {
    ...axis,
    ...patch,
    ticks: structuredClone(patch.ticks ?? axis.ticks),
  }
}

function invalidateCache(axis: IAxis): IAxis {
  return copyAxis(axis, {
    ticks: {
      major: { ...axis.ticks.major, items: undefined },
      minor: { ...axis.ticks.minor, items: undefined },
    },
    format: undefined,
  })
}

export function createAxis(
  opts: {
    config?: IAxisConfig
    id?: string
    title?: string
    direction?: IAxis['direction']
    length?: number
    domain?: ILim
    range?: ILim
    autoDomain?: boolean | ILim
    ticks?: number[] | ITickItem[]
    minorTicks?: number[] | ITickItem[]
    style?: DeepPartial<IAxisConfig['style']>
    tickParams?: Partial<ITickParamProps>
    format?: IAxisFormat
  } = {}
): IAxis {
  const {
    config = DEFAULT_AXIS_CONFIG,
    id,
    title,
    direction = 'x',
    length,
    style,
    domain,
    range,
    autoDomain,
    ticks,
    minorTicks,
    tickParams,
    format,
  } = opts
  let ret: IAxis = {
    ...structuredClone(config),
    id: makeUuid(),
    length: 1,

    ...definedProps({ id, title, direction, domain, range, format }),
  }

  if (length !== undefined) {
    ret.range = [0, length]
  }

  ret.length = Math.abs(ret.range[1] - ret.range[0])

  if (autoDomain !== undefined && autoDomain) {
    ret = autoAxisDomain(
      ret,
      typeof autoDomain === 'boolean' ? ret.domain : autoDomain
    )
  }

  if (ticks !== undefined) {
    ret = setAxisTicks(ret, ticks)
  }

  if (minorTicks !== undefined) {
    ret = setAxisTicks(ret, minorTicks, { which: 'minor' })
  }

  if (tickParams !== undefined) {
    ret = setAxisTickParams(ret, tickParams)
  }

  if (style !== undefined) {
    ret.style = deepmerge(ret.style, style)
  }

  return ret
}

export function setAxisDirection(
  axis: IAxis,
  direction: IAxis['direction']
): IAxis {
  // save copy operation if nothing changes
  if (axis.direction === direction) {
    return axis
  }

  return copyAxis(axis, { direction })
}

export function setAxisTitle(axis: IAxis, title: string): IAxis {
  return copyAxis(axis, { title })
}

export function setAxisClip(axis: IAxis, clip: boolean): IAxis {
  return copyAxis(axis, { clip })
}

export function setAxisDP(axis: IAxis, decimalPlaces: number): IAxis {
  if (decimalPlaces < 0) {
    return axis
  }

  return copyAxis(axis, {
    format: { type: 'd3', specifier: `.${decimalPlaces}f` },
  })
}

export function setAxisNumTicks(axis: IAxis, numTicks: number): IAxis {
  return copyAxis(axis, {
    ticks: {
      major: { ...axis.ticks.major, show: true, numTicks, items: undefined },
      minor: { ...axis.ticks.minor, items: undefined },
    },
  })
}

export function setAxisTickParams(
  axis: IAxis,
  params: Partial<ITickParamProps> = {}
): IAxis {
  const { show, style, which = 'both' } = params

  const ticksCopy = structuredClone(axis.ticks)

  if (which === 'major' || which === 'both') {
    ticksCopy!.major.show = show ?? ticksCopy!.major.show
    ticksCopy!.major.style = deepmerge(ticksCopy!.major.style, style)
  }

  if (which === 'minor' || which === 'both') {
    ticksCopy!.minor.show = show ?? ticksCopy!.minor.show
    ticksCopy!.minor.style = deepmerge(ticksCopy!.minor.style, style)
  }

  return copyAxis(axis, { ticks: ticksCopy })
}

export function setAxisDomain(axis: IAxis, domain: ILim): IAxis {
  return invalidateCache(
    copyAxis(axis, {
      domain,
    })
  )
}

export function autoAxisDomain(axis: IAxis, domain: ILim): IAxis {
  const niceDomain = d3.scaleLinear().domain(domain).nice().domain() as ILim
  return invalidateCache(
    copyAxis(axis, {
      domain: niceDomain,
    })
  )
}

export function setAxisRange(axis: IAxis, range: ILim): IAxis {
  return invalidateCache(
    copyAxis(axis, {
      range,
      length: Math.abs(range[1] - range[0]),
    })
  )
}

export function setAxisLength(axis: IAxis, length: number): IAxis {
  return setAxisRange(axis, [0, length])
}

export function getAxisFormatter(axis: IAxis, tickCount: number) {
  switch (axis.format?.type) {
    case 'd3':
      return d3.format(axis.format.specifier)
    case 'fixed':
      return d3.format(`.${axis.format.decimalPlaces}f`)
    default:
      return d3
        .scaleLinear()
        .domain(axis.domain)
        .range(axis.range)
        .tickFormat(tickCount, 'f')
  }
}

export function setAxisTicks(
  axis: IAxis,
  ticks: (number | ITickItem)[] | undefined,
  opts: { which?: WhichTick } = {}
): IAxis {
  const { which = 'major' } = opts
  const items = ticks ? makeTicks(axis, ticks, which === 'major') : undefined

  if (which === 'major') {
    return copyAxis(axis, {
      ticks: {
        major: { ...axis.ticks.major, items },
        minor: { ...axis.ticks.minor, items: undefined },
      },
    })
  }

  return copyAxis(axis, {
    ticks: {
      major: axis.ticks.major,
      minor: { ...axis.ticks.minor, items },
    },
  })
}

export function setAxisTickLabels(
  axis: IAxis,
  labels: string[],
  opts: { which?: WhichTick } = {}
): IAxis {
  const { which = 'major' } = opts
  const tickSet = which === 'major' ? axis.ticks.major : axis.ticks.minor

  if (labels.length !== tickSet.items?.length) {
    return axis
  }

  const items = tickSet.items.map((tick, index) => ({
    ...tick,
    label: labels[index],
  }))

  return copyAxis(axis, {
    ticks:
      which === 'major'
        ? { ...axis.ticks, major: { ...axis.ticks.major, items } }
        : { ...axis.ticks, minor: { ...axis.ticks.minor, items } },
  })
}

export function setAxisMinorTickDivisions(
  axis: IAxis,
  divisions: number
): IAxis {
  return copyAxis(axis, {
    ticks: {
      major: axis.ticks.major,
      minor: { ...axis.ticks.minor, show: true, divisions, items: undefined },
    },
  })
}

export function getAxisTicks(
  axis: IAxis,
  opts: { which?: WhichTick } = {}
): ITickItem[] {
  const { which = 'major' } = opts

  if (axis.ticks[which].items) {
    return axis.ticks[which].items
  }

  const scale = d3.scaleLinear().domain(axis.domain).range(axis.range)
  const format = getAxisFormatter(axis, axis.ticks.major.numTicks)

  const ticks = scale.ticks(axis.ticks.major.numTicks).map((value) => ({
    v: value,
    label: format(value),
  }))

  if (which === 'major') {
    return ticks
  }

  const minorTickDivisions = axis.ticks.minor.divisions

  return ticks.slice(0, -1).flatMap((tick, index) => {
    const next = ticks[index + 1]!.v
    const step = (next - tick.v) / (minorTickDivisions - 1)

    return numRange(0, minorTickDivisions).map((position) => ({
      v: tick.v + position * step,
      label: '',
    }))
  })
}

// export function getAxisMinorTicks(axis: IAxis): ITickItem[] {
//   if (axis.ticks.minor.items) {
//     return axis.ticks.minor.items
//   }

//   const ticks = getAxisTicks(axis)
//   const minorTickDivisions = axis.ticks.minor.divisions

//   return ticks.slice(0, -1).flatMap((tick, index) => {
//     const next = ticks[index + 1]!.v
//     const step = (next - tick.v) / (minorTickDivisions - 1)

//     return numRange(0, minorTickDivisions).map((position) => ({
//       v: tick.v + position * step,
//       label: '',
//     }))
//   })
// }

export type RangeToDomainFunc = (v: number | ITickItem) => number

/**
 * Convert from axis domain to pixel range.
 *
 * @param axis
 * @returns
 */
export function axisDomainToRangeFunc(axis: IAxis): RangeToDomainFunc {
  const scale = d3.scaleLinear().domain(axis.domain).range(axis.range)

  return (v: number | ITickItem) => {
    let mapped = scale(typeof v !== 'number' ? v.v : v)

    if (axis.clip) {
      mapped = Math.min(axis.range[1], Math.max(axis.range[0], mapped))
    }

    return axis.direction === 'y' ? axis.range[1] - mapped : mapped
  }
}

export function axisDomainToRange(
  axis: IAxis,
  values: readonly (ITickItem | number)[]
): number[]
export function axisDomainToRange(axis: IAxis, values: number): number
export function axisDomainToRange(axis: IAxis, values: ITickItem): number
export function axisDomainToRange(
  axis: IAxis,
  values: readonly (ITickItem | number)[] | number | ITickItem
): number[] | number {
  const f = axisDomainToRangeFunc(axis)

  if (Array.isArray(values)) {
    return values.map((value) => f(value))
  } else {
    return f(values as number | ITickItem)
  }
}

/**
 * Convert from pixel range to axis domain.
 *
 * @param axis
 * @returns
 */
export function axisRangeToDomainFunc(
  axis: IAxis
): (item: number | ITickItem) => number {
  const scale = d3.scaleLinear().domain(axis.domain).range(axis.range)

  return (item: number | ITickItem) => {
    let v = typeof item !== 'number' ? item.v : item

    if (axis.direction === 'y') {
      v = axis.domain[1] - v
    }

    let mapped = scale.invert(v)

    if (axis.clip) {
      mapped = Math.min(axis.domain[1], Math.max(axis.domain[0], mapped))
    }

    return mapped
  }
}

export function axisRangeToDomain(
  axis: IAxis,
  values: readonly (ITickItem | number)[]
): number[]
export function axisRangeToDomain(axis: IAxis, values: number): number
export function axisRangeToDomain(axis: IAxis, values: ITickItem): number
export function axisRangeToDomain(
  axis: IAxis,
  values: readonly (ITickItem | number)[] | number | ITickItem
): number[] | number {
  const f = axisRangeToDomainFunc(axis)

  if (Array.isArray(values)) {
    return values.map((value) => f(value))
  } else {
    return f(values as number | ITickItem)
  }
}

function makeTicks(
  axis: IAxis,
  ticks: (ITickItem | number)[],
  addLabels = true
): ITickItem[] {
  if (ticks.length === 0) {
    return []
  }

  const format = getAxisFormatter(axis, ticks.length)

  return ticks.map((value) => {
    if (typeof value !== 'number') {
      return value
    }

    return {
      v: value,
      label: addLabels ? format(value) : undefined,
    }
  })
}

// ---- Miscellaneous utility functions for axis ticks and ranges ---

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
