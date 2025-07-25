import { useMemo } from 'react'

import { type IDivProps } from '@interfaces/div-props'

import { Axis, YAxis } from '@/components/plot/axis'
import {
  DEFAULT_FILL_PROPS,
  NO_STROKE_PROPS,
  type IColorProps,
  type IStrokeProps,
} from '@components/plot/svg-props'
import { histogram } from '@lib/math/histogram'
import { range } from '@lib/math/range'
import type { IBoxWhiskerMode } from './box-whisker-plot-svg'

interface IProps extends IDivProps {
  data: number[]

  yax?: Axis
  width?: number
  height?: number
  r?: number
  fill?: IColorProps
  stroke?: IStrokeProps
  mode?: IBoxWhiskerMode
}

export function SwarmPlotSvg({
  data,
  yax,
  width = 50,
  height = 500,
  r = 5,
  fill = { ...DEFAULT_FILL_PROPS, alpha: 1 },
  stroke = { ...NO_STROKE_PROPS },
  mode = 'full',
}: IProps) {
  const svg = useMemo(() => {
    const hist = histogram(data)

    const d = r * 2

    //console.log(maxHeightMap)

    if (!yax) {
      yax = new YAxis()
        .autoDomain([0, Math.max(...data)])
        //.setDomain([0, plot.dna.seq.length])
        .setLength(height)
    }

    if (mode !== 'full') {
      // draw points in half the width

      width *= 0.5
    }

    // matching is case insensitive

    return (
      <>
        {hist
          .filter((bin) => bin.values.length > 0)
          .map((bin, bi) => {
            // width required for all circles in bin
            let w = bin.values.length * d

            //actual amount we need to move each circle
            const dx = d * (width / Math.max(width, w))

            w = dx * (bin.values.length - 1)

            // adjust x depending on whether full or half screen
            let x1 = 0

            switch (mode) {
              case 'right':
                x1 = 0
                break
              case 'left':
                x1 = -(0.5 * (w + width))
                break
              default:
                x1 = -0.5 * w
                break
            }

            // reverse sort as we want higher y on the outside
            let values = bin.values.toReversed()

            // take every other value for one side, then take every
            // other value offset by 1 and reverse it to create a
            // v shape of dots around the center of the plot
            values = [
              ...range(0, values.length, 2).map((i) => values[i]!),
              ...range(1, values.length, 2)
                .map((i) => values[i]!)
                .toReversed(),
            ]

            return (
              <g key={bi}>
                {values.map((v, vi) => {
                  return (
                    <circle
                      key={`${bi}:${vi}`}
                      cx={x1 + vi * dx}
                      cy={yax?.domainToRange(v)}
                      r={r}
                      fill={fill?.color ?? 'none'}
                      stroke={stroke?.color ?? 'none'}
                      strokeWidth={stroke?.width ?? 0}
                      fillOpacity={fill?.alpha ?? 0}
                    />
                  )
                })}
              </g>
            )
          })}
      </>
    )
  }, [data, yax])

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
