import { useMemo } from 'react'

import { type IDivProps } from '@/interfaces/div-props'

import {
  DEFAULT_FILL_PROPS,
  DEFAULT_STROKE_PROPS,
  type IPaintProps,
  type IStrokeProps,
} from '@/components/plot/svg-props'
import { KDE } from '@/lib/math/kde'
import { linspace } from '@/lib/math/linspace'
import { zip } from '@/lib/utils'
import { axisDomainToRange, createAxis, IAxis } from '../axes/axis'
import { SvgPolygon } from '../svg-polygon'
import type { IBoxWhiskerMode } from './box-whisker-plot-svg'

interface IProps extends IDivProps {
  data: number[]
  xsmooth?: number[]
  ysmooth?: number[]
  globalXMax?: number
  yax?: IAxis
  width?: number
  height?: number
  r?: number
  fill?: IPaintProps
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
      yax = createAxis({
        direction: 'y',
        length: height,
        autoDomain: [0, Math.max(...data)],
      })
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
    xsmooth = xsmooth.map((x) => x / globalXMax!)
    // so always join in the middle
    xsmooth[0] = 0
    xsmooth[xsmooth.length - 1] = 0

    switch (mode) {
      case 'left':
        // flip x so draw cdf on left side
        xsmooth = xsmooth.map((x) => -x)

        break
      case 'full':
        // for the left
        xsmooth = [...xsmooth, ...xsmooth.map((x) => -x).toReversed()]
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
      .map(
        (p) => `${0.5 * p[0]! * width},${axisDomainToRange(yax, [p[1]!])[0]!}`
      )
      .join(' ')

    // matching is case insensitive

    return <SvgPolygon points={points} sp={stroke} fp={fill} />
  }, [data, globalXMax, xsmooth, ysmooth, yax])

  return svg
}
