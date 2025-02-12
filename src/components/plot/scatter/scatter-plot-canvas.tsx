import { useEffect, useState } from 'react'

import { COLOR_BLACK, COLOR_WHITE } from '@/consts'
import { type IElementProps } from '@interfaces/element-props'
import { setupCanvas } from '@lib/canvas'
import { BWR_CMAP, ColorMap } from '@lib/colormap'
import { BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { findCol, getNumCol } from '@lib/dataframe/dataframe-utils'
import { Axis, YAxis } from '../axis'
import {
  DEFAULT_SCATTER_PROPS,
  type IScatterDisplayOptions,
} from './scatter-plot-svg'

const margin = { top: 100, right: 100, bottom: 100, left: 100 }

function drawScatter(
  canvas: HTMLCanvasElement,
  df: BaseDataFrame,
  x: string,
  y: string,
  hue: string | null = null,
  size: string | null = null,
  cmap = BWR_CMAP,
  displayProps = { ...DEFAULT_SCATTER_PROPS },
  sizeFunc = (x: number) => x
) {
  if (!df) {
    return
  }

  const xdata = getNumCol(df, findCol(df, x))

  const ydata = getNumCol(df, findCol(df, y))

  //hue  && console.log(df,getStrCol(df, findCol(df, hue)), hue)

  const huedata = hue ? getNumCol(df, findCol(df, hue)) : []
  const sizedata = size ? getNumCol(df, findCol(df, size)) : []

  const xax = new Axis()
    //.setDomain([Math.min(...xdata), Math.max(...xdata)])
    .setDomain(displayProps.axes.xaxis.domain)
    .setRange(displayProps.axes.xaxis.range)

  const yax = new YAxis()
    //.setDomain([Math.min(...ydata), Math.max(...ydata)])
    .setDomain(displayProps.axes.yaxis.domain)
    .setRange(displayProps.axes.yaxis.range)

  const innerWidth = xax.range[1]
  const innerHeight = yax.range[1]
  const width = (innerWidth + margin.left + margin.right) * displayProps.scale
  const height = (innerHeight + margin.top + margin.bottom) * displayProps.scale

  if (canvas) {
    // nominally set canvas to be 1000x1000px. The actual canvas can beunknown
    // size but the drawing coordinates will be top left 0-1000,0-1000. We
    // use the scale property to tell the drawing system to upscale each
    // pixel operation. E.g. set the style.width=2000 then use scale factor
    // of 2 such that whatever we draw in 0-1000 will be scaled for us to
    // 0-2000. This should be faster than messing about with doing the scaling
    // ourselves.
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    setupCanvas(canvas, displayProps.scale)

    const ctx = canvas.getContext('2d', { alpha: false })

    if (ctx) {
      //ctx.clearRect(0, 0, width, height)

      ctx.fillStyle = COLOR_WHITE
      ctx.fillRect(0, 0, width, height)

      ctx.save()
      ctx.translate(margin.left, margin.top)

      {
        xdata.map((x, xi) => {
          const x1 = xax.domainToRange(x)
          const y1 = yax.domainToRange(ydata[xi]!)
          const r = sizedata.length > 0 ? sizeFunc(sizedata[xi]!) : 1
          const color =
            huedata.length > 0 ? cmap.getColor(huedata[xi]!) : COLOR_BLACK

          ctx.beginPath()
          ctx.arc(x1, y1, r, 0, 2 * Math.PI)
          ctx.fillStyle = color
          ctx.fill()
        })
      }

      ctx.restore()
    }
  }
}

interface IProps extends IElementProps {
  df: BaseDataFrame
  x: string
  y: string
  hue?: string
  size?: string
  sizeFunc?: (x: number) => number
  onCanvasChange?: (canvas: HTMLCanvasElement) => void
  displayProps?: IScatterDisplayOptions
  cmap?: ColorMap
}

export function ScatterPlotCanvas({
  df,
  x,
  y,
  hue,
  size,
  cmap = BWR_CMAP,
  displayProps = { ...DEFAULT_SCATTER_PROPS },
  sizeFunc,
  onCanvasChange,
}: IProps) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (canvas) {
      drawScatter(canvas, df, x, y, hue, size, cmap, displayProps)
    }
  }, [df, displayProps, sizeFunc, x, y, hue, size, cmap, canvas])

  return (
    <canvas
      ref={(ref) => {
        if (ref) {
          setCanvas(ref)
          onCanvasChange?.(ref)
        }
      }}
      className="absolute left-0 top-0 z-20"
    />
  )
}
