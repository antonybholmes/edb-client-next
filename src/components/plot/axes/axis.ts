import type { ILim } from '@/lib/math/math'
import { range as numRange } from '@/lib/math/range'
import { definedProps } from '@/lib/utils'
import * as d3 from 'd3'
import { deepmerge } from 'deepmerge-ts'
import {
  DEFAULT_AXIS_CONFIG,
  ITickParamProps,
  type IAxisConfig,
  type ITickItem,
  type WhichTick,
} from './svg-axis-props'

export interface IAxis extends IAxisConfig {
  length: number
  format?: (value: d3.NumberValue) => string
  userFormat?: (value: d3.NumberValue) => string
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
    direction?: IAxis['direction']
    name?: string
    length?: number
    domain?: ILim
    range?: ILim
    autoDomain?: boolean | ILim
    ticks?: number[] | ITickItem[]
    minorTicks?: number[] | ITickItem[]
    tickParams?: Partial<ITickParamProps>
  } = {}
): IAxis {
  const {
    config = DEFAULT_AXIS_CONFIG,
    direction = 'x',
    name,
    length,
    domain,
    range,
    autoDomain,
    ticks,
    minorTicks,
    tickParams,
  } = opts
  let ret = {
    ...structuredClone(config),
    length: 1,
    ...definedProps({ direction, name, domain, range }),
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

  return ret
}

export function setAxisDirection(
  axis: IAxis,
  direction: IAxis['direction']
): IAxis {
  return copyAxis(axis, { direction })
}

export function setAxisTitle(axis: IAxis, title: string): IAxis {
  return copyAxis(axis, { name: title })
}

export function setAxisClip(axis: IAxis, clip: boolean): IAxis {
  return copyAxis(axis, { clip })
}

export function setAxisDP(axis: IAxis, decimalPlaces: number): IAxis {
  return copyAxis(axis, {
    userFormat:
      decimalPlaces >= 0 ? d3.format(`.${decimalPlaces}f`) : undefined,
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
      domain: [...domain] as ILim,
      length: domain[1] - domain[0],
    })
  )
}

export function autoAxisDomain(axis: IAxis, domain: ILim): IAxis {
  const niceDomain = d3.scaleLinear().domain(domain).nice().domain() as ILim
  return invalidateCache(
    copyAxis(axis, {
      domain: niceDomain,
      length: niceDomain[1] - niceDomain[0],
    })
  )
}

export function setAxisRange(axis: IAxis, range: ILim): IAxis {
  return invalidateCache(copyAxis(axis, { range: [...range] as ILim }))
}

export function setAxisLength(axis: IAxis, length: number): IAxis {
  return setAxisRange(axis, [0, length])
}

export function getAxisLength(axis: IAxis): number {
  return axis.range[1] - axis.range[0]
}

function makeFormatter(axis: IAxis, count: number): IAxis {
  if (axis.format) {
    return axis
  }

  const format = d3
    .scaleLinear()
    .domain(axis.domain)
    .range(axis.range)
    .tickFormat(count, 'f')
  return copyAxis(axis, { format })
}

function makeTicks(
  axis: IAxis,
  ticks: number[] | ITickItem[],
  addLabels = true
): ITickItem[] {
  if (ticks.length === 0) {
    return []
  }

  if (ticks.every((tick) => typeof tick === 'number')) {
    const format = makeFormatter(axis, ticks.length).format!
    return ticks.map((value) => ({
      v: value,
      label: addLabels ? format(value) : undefined,
    }))
  }

  return ticks
}

export function setAxisTicks(
  axis: IAxis,
  ticks: number[] | ITickItem[],
  opts: { which?: WhichTick } = {}
): IAxis {
  const { which = 'major' } = opts
  const items = makeTicks(axis, ticks, which === 'major')

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

export function getAxisTicks(axis: IAxis): ITickItem[] {
  if (axis.ticks.major.items) {
    return axis.ticks.major.items
  }

  const scale = d3.scaleLinear().domain(axis.domain).range(axis.range)
  const format = axis.format ?? scale.tickFormat(axis.ticks.major.numTicks, 'f')
  return scale.ticks(axis.ticks.major.numTicks).map((value) => ({
    v: value,
    label: format(value),
  }))
}

export function getAxisMinorTicks(axis: IAxis): ITickItem[] {
  if (axis.ticks.minor.items) {
    return axis.ticks.minor.items
  }

  const ticks = getAxisTicks(axis)
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

export function axisDomainToRangeFunc(
  axis: IAxis
): (v: number | ITickItem) => number {
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

export function axisRangeToDomain(
  axis: IAxis,
  values: (ITickItem | number)[]
): number[] {
  const scale = d3.scaleLinear().domain(axis.domain).range(axis.range)

  return values.map((value) => {
    if (typeof value !== 'number') {
      value = value.v
    }

    const rangeValue = axis.direction === 'y' ? axis.range[1] - value : value
    let mapped = scale.invert(rangeValue)

    if (axis.clip) {
      mapped = Math.min(axis.domain[1], Math.max(axis.domain[0], mapped))
    }

    return mapped
  })
}
