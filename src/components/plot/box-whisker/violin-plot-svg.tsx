import { useMemo } from 'react'

import { type IDivProps } from '@interfaces/div-props'

import { Axis, YAxis } from '@/components/plot/axis'
import {
  DEFAULT_FILL_PROPS,
  DEFAULT_STROKE_PROPS,
  type IColorProps,
  type IStrokeProps,
} from '@components/plot/svg-props'
import { KDE } from '@lib/math/kde'
import { linspace } from '@lib/math/linspace'
import { zip } from '@lib/utils'
import type { IBoxWhiskerMode } from './box-whisker-plot-svg'

interface IProps extends IDivProps {
  data: number[]
  xsmooth?: number[]
  ysmooth?: number[]
  globalXMax?: number
  yax?: Axis
  width?: number
  height?: number
  r?: number
  fill?: IColorProps
  stroke?: IStrokeProps
  // whether to only draw half of the violin
  mode?: IBoxWhiskerMode
}

export function ViolinPlotSvg({
  data,
  xsmooth,
  ysmooth,
  globalXMax,
  yax,
  width = 50,
  height = 500,
  fill = DEFAULT_FILL_PROPS,
  stroke = DEFAULT_STROKE_PROPS,
  mode = 'full',
}: IProps) {
  const svg = useMemo(() => {
    // duplicate to mirror violin

    if (!yax) {
      yax = new YAxis()
        .autoDomain([0, Math.max(...data)])
        //.setDomain([0, plot.dna.seq.length])
        .setLength(height)
    }

    if (!ysmooth) {
      ysmooth = linspace(yax.domain[0], yax.domain[1])
    }

    if (!xsmooth) {
      //let global_xsmooth_max = 0

      const kde = new KDE(data)

      xsmooth = kde.f(ysmooth)
    }

    if (!globalXMax) {
      // global x max not defined, just use the local
      // max, i.e. scale each violin independently
      globalXMax = Math.max(...xsmooth)
    }

    // normalize
    xsmooth = xsmooth.map(x => x / globalXMax!)
    // so always join in the middle
    xsmooth[0] = 0
    xsmooth[xsmooth.length - 1] = 0

    switch (mode) {
      case 'left':
        // flip x so draw cdf on left side
        xsmooth = xsmooth.map(x => -x)

        break
      case 'full':
        // for the left
        xsmooth = [...xsmooth, ...xsmooth.map(x => -x).toReversed()]
        // then return on the right
        ysmooth = [...ysmooth!, ...ysmooth!.toReversed()]
        break

      default:
        // right case, which we create by default so nothing
        // to do

        break
    }

    // if (!split) {
    //   // so that the shape is mirrored, otherwise we just draw half
    //   xsmooth = [...xsmooth, ...xsmooth.map(x => -x).toReversed()]
    //   ysmooth = [...ysmooth!, ...ysmooth!.toReversed()]
    // }

    const points: string = zip(xsmooth, ysmooth)
      .map(p => `${0.5 * p[0]! * width},${yax!.domainToRange(p[1]!)}`)
      .join(' ')

    //console.log(points)

    // matching is case insensitive

    return (
      <polygon
        points={points}
        fill={fill?.color ?? 'none'}
        stroke={stroke?.color ?? 'none'}
        strokeWidth={stroke?.width ?? 0}
        fillOpacity={fill?.alpha ?? 0}
      />
    )
  }, [data, globalXMax, xsmooth, ysmooth, yax])

  return (
    <>
      {svg}

      {/* {toolTipInfo && (
          <>
            <div
              ref={tooltipRef}
              className="pointer-events-none absolute z-50 rounded-theme bg-black/60 p-3 text-xs text-white opacity-100"
              style={{
                left: toolTipInfo.pos.x + TOOLTIP_OFFSET,
                top: toolTipInfo.pos.y + TOOLTIP_OFFSET,
              }}
            >
              <p className="font-semibold">
                {`${sampleMap.get(toolTipInfo.mutation.sample)!.name} (${sampleMap.get(toolTipInfo.mutation.sample)!.coo}, ${sampleMap.get(toolTipInfo.mutation.sample)!.lymphgen})`}
              </p>
              <p>Type: {toolTipInfo.mutation.type.split(":")[1]}</p>
              <p>
                {`Loc: ${toolTipInfo.mutation.chr}:${toolTipInfo.mutation.start.toLocaleString()}-${toolTipInfo.mutation.end.toLocaleString()}`}
              </p>
              <p>
                {`ref: ${toolTipInfo.mutation.ref}, tumor: ${toolTipInfo.mutation.tum.replace("^", "")}`}
              </p>
            </div>

            <span
              ref={highlightRef}
              className="pointer-events-none absolute z-40 border-black"
              style={{
                top: `${toolTipInfo.pos.y - 1}px`,
                left: `${toolTipInfo.pos.x - 1}px`,
                width: `${BASE_W + 1}px`,
                height: `${BASE_H + 1}px`,
                borderWidth: `1px`,
              }}
            />
          </>
        )} */}
    </>
  )
}
