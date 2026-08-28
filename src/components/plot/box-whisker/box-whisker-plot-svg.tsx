import { useMemo } from 'react'

import { type IDivProps } from '@/interfaces/div-props'

import { Axis, YAxis } from '@/components/plot/axes/axis'
import {
  DEFAULT_STROKE_PROPS,
  NO_FILL_PROPS,
  type IPaintProps,
  type IStrokeProps,
} from '@/components/plot/svg-props'
import type { LeftRightPos } from '@/components/side'
import { COLOR_RED } from '@/lib/color/color'

export type IBoxWhiskerMode = LeftRightPos | 'full'

interface IProps extends IDivProps {
  data: number[]
  q1: number
  median: number
  q3: number
  yax?: Axis
  width?: number
  height?: number
  stroke?: IStrokeProps
  medianStroke?: IStrokeProps
  fill?: IPaintProps
  mode?: IBoxWhiskerMode
}

export function BoxWhiskerPlotSvg({
  data,
  q1,
  median,
  q3,
  yax,
  width = 50,
  height = 500,
  stroke = { ...DEFAULT_STROKE_PROPS, width: 1.5 },
  medianStroke = { ...DEFAULT_STROKE_PROPS, value: COLOR_RED, width: 1.5 },
  fill = NO_FILL_PROPS,
  mode = 'full',
}: IProps) {
  const svg = useMemo(() => {
    const iqr = q3 - q1
    const iqr15 = 1.5 * iqr
    const q0 = q1 - iqr15
    const q4 = q3 + iqr15

    const w1 = data.filter((x) => x >= q0)
    // reverse copy of array
    const w2 = data.toReversed().filter((x) => x <= q4)

    if (!yax) {
      yax = new YAxis()
        .autoDomain([0, Math.max(...data)])
        //.setDomain([0, plot.dna.seq.length])
        .setLength(height)
    }

    const x1 = mode === 'right' ? 0 : -0.5 * width

    const x2 = mode === 'left' ? 0 : width / 2

    const y1 = yax.domainToRange(w1[0]!)
    const y2 = yax.domainToRange(w2[0]!)

    const yq1 = yax.domainToRange(q1)
    const yq3 = yax.domainToRange(q3)
    const ymed = yax.domainToRange(median)
    // matching is case insensitive

    return (
      <>
        <line
          x1={0}
          x2={0}
          y1={y1}
          y2={y2}
          strokeWidth={stroke?.width ?? 0}
          stroke={stroke?.value ?? 'none'}
        />
        <line
          x1={x1}
          x2={x2}
          y1={y1}
          y2={y1}
          strokeWidth={stroke?.width ?? 0}
          stroke={stroke?.value ?? 'none'}
        />
        <line
          x1={x1}
          x2={x2}
          y1={y2}
          y2={y2}
          strokeWidth={stroke?.width ?? 0}
          stroke={stroke?.value ?? 'none'}
        />

        {/* iqr */}
        <rect
          x={x1}
          y={yq3}
          height={yq1 - yq3}
          width={x2 - x1}
          strokeWidth={stroke?.width ?? 0}
          stroke={stroke?.value ?? 'none'}
          fill={fill?.value ?? 'none'}
          fillOpacity={fill?.opacity ?? 0}
        />

        {/* median */}
        <line
          x1={x1}
          x2={x2}
          y1={ymed}
          y2={ymed}
          strokeWidth={medianStroke?.width ?? 0}
          stroke={medianStroke?.value ?? 'none'}
        />
      </>
    )
  }, [data, yax])

  return svg
}
