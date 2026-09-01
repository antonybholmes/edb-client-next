import { useMemo } from 'react'

import { type IDivProps } from '@/interfaces/div-props'

import {
  DEFAULT_COLOR_PROPS,
  NO_STROKE_PROPS,
  type IPaintProps,
  type IStrokeProps,
} from '@/components/plot/svg-props'
import { histogram } from '@/lib/math/histogram'
import { range } from '@/lib/math/range'
import { axisDomainToRange, createAxis, IAxis } from '../axes/axis'
import type { IBoxWhiskerMode } from './box-whisker-plot-svg'

interface IProps extends IDivProps {
  data: number[]

  yax?: IAxis
  width?: number
  height?: number
  r?: number
  fill?: IPaintProps
  stroke?: IStrokeProps
  mode?: IBoxWhiskerMode
}

export function SwarmPlotSvg({
  data,
  yax,
  width = 50,
  height = 500,
  r = 5,
  fill = { ...DEFAULT_COLOR_PROPS, opacity: 1 },
  stroke = { ...NO_STROKE_PROPS },
  mode = 'full',
}: IProps) {
  const svg = useMemo(() => {
    const hist = histogram(data)

    const d = r * 2

    if (!yax) {
      yax = createAxis({
        direction: 'y',
        length: height,
        autoDomain: [0, Math.max(...data)],
      })
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

            const cys = axisDomainToRange(yax, values)

            return (
              <g key={bi}>
                {values.map((v, vi) => {
                  return (
                    <circle
                      key={`${bi}:${vi}`}
                      cx={x1 + vi * dx}
                      cy={cys[vi]}
                      r={r}
                      fill={fill?.value ?? 'none'}
                      stroke={stroke?.value ?? 'none'}
                      strokeWidth={stroke?.width ?? 0}
                      fillOpacity={fill?.opacity ?? 0}
                    />
                  )
                })}
              </g>
            )
          })}
      </>
    )
  }, [data, yax])

  return svg
}
