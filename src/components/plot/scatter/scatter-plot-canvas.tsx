import {
  useEffect,
  useImperativeHandle,
  useRef,
  type ComponentProps,
} from 'react'

import type { IPos } from '@/interfaces/pos'
import type { ILim } from '@/lib/math/math'
import { resizeAndScaleCanvas } from '@lib/canvas'
import { COLOR_BLACK, COLOR_WHITE } from '@lib/color/color'
import { BWR_CMAP_V2, ColorMap } from '@lib/color/colormap'
import { Axis, YAxis } from '../axis'
import {
  DEFAULT_SCATTER_PROPS,
  type IScatterDisplayOptions,
} from './scatter-plot-svg'

const margin = { top: 100, right: 100, bottom: 100, left: 100 }

export interface IScatterLabel {
  text: string
  pos: ILim
  color: string
}

export interface IDrawScatterOptions {
  hue?: number[] | string[] | undefined
  size?: ((idx: number, point: IPos, color: string) => number) | undefined
  palette?: string | ColorMap | ((value: number | string) => string)
  labels?: IScatterLabel[] | undefined
}

export function drawScatter(
  canvas: HTMLCanvasElement,
  //xdata: number[],
  //ydata: number[],
  points: IPos[],
  displayProps: IScatterDisplayOptions = { ...DEFAULT_SCATTER_PROPS },
  options: IDrawScatterOptions = {}
) {
  const { hue, size = 1, palette = BWR_CMAP_V2, labels } = options

  //hue  && console.log(df,getStrCol(df, findCol(df, hue)), hue)

  const xax = new Axis()
    //.setDomain([Math.min(...xdata), Math.max(...xdata)])
    .setDomain(displayProps.axes.xaxis.domain)
    .setLength(displayProps.axes.xaxis.length)

  const yax = new YAxis()
    //.setDomain([Math.min(...ydata), Math.max(...ydata)])
    .setDomain(displayProps.axes.yaxis.domain)
    .setLength(displayProps.axes.yaxis.length)

  const innerWidth = xax.range[1]
  const innerHeight = yax.range[1]
  const width = innerWidth + margin.left + margin.right
  const height = innerHeight + margin.top + margin.bottom

  if (canvas) {
    // nominally set canvas to be 1000x1000px. The actual canvas can beunknown
    // size but the drawing coordinates will be top left 0-1000,0-1000. We
    // use the scale property to tell the drawing system to upscale each
    // pixel operation. E.g. set the style.width=2000 then use scale factor
    // of 2 such that whatever we draw in 0-1000 will be scaled for us to
    // 0-2000. This should be faster than messing about with doing the scaling
    // ourselves.
    //canvas.style.width = `${width}px`
    //canvas.style.height = `${height}px`

    resizeAndScaleCanvas(canvas, width, height, displayProps.scale)

    const ctx = canvas.getContext('2d', { alpha: false })

    if (ctx) {
      //ctx.clearRect(0, 0, width, height)

      ctx.fillStyle = COLOR_WHITE
      ctx.fillRect(0, 0, width, height)

      ctx.save()
      ctx.translate(margin.left, margin.top)

      for (const [xi, p] of points.entries()) {
        //const y = ydata[xi]!
        const x1 = xax.domainToRange(p.x)
        const y1 = yax.domainToRange(p.y)

        let color: string = displayProps.dots.color

        if (typeof palette === 'string') {
          color = palette
        } else if (Array.isArray(hue)) {
          const hueIndex = xi % hue.length
          if (
            palette instanceof ColorMap &&
            typeof hue[hueIndex] === 'number'
          ) {
            color = palette.getHexColor(hue[hueIndex]!)
          } else if (typeof palette === 'function') {
            color = palette(hue[hueIndex]!)
          } else {
            // do nothing
          }
        } else {
          // do nothing
        }

        let r = displayProps.dots.size

        if (typeof size === 'function') {
          r = size(xi, p, color)
        }

        ctx.beginPath()
        // use arc for pure circles
        ctx.arc(x1, y1, r, 0, 2 * Math.PI)
        //ctx.ellipse(x1, y1, r, r, 0, 0, 0)
        ctx.fillStyle = color
        ctx.fill()
      }

      if (labels) {
        for (const label of labels) {
          const x1 = xax.domainToRange(label.pos[0])
          const y1 = yax.domainToRange(label.pos[1])

          ctx.beginPath()
          // use arc for pure circles
          ctx.arc(x1, y1, 12, 0, 2 * Math.PI)
          //ctx.ellipse(x1, y1, r, r, 0, 0, 0)
          ctx.fillStyle = 'rgb(255 255 255 / 70%)'
          ctx.strokeStyle = 'black'
          ctx.lineWidth = 1
          ctx.fill()
          ctx.stroke()

          ctx.fillStyle = label.color
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.font = '12pt Arial'
          ctx.fillText(label.text, x1, y1)
        }
      }

      ctx.restore()
    }
  }
}

interface IProps extends ComponentProps<'canvas'>, IDrawScatterOptions {
  //x: number[]
  //y: number[]
  points: IPos[]
  onCanvasChange?: (canvas: HTMLCanvasElement) => void
  displayProps?: IScatterDisplayOptions
  options?: IDrawScatterOptions
}

export function ScatterPlotCanvas({
  ref,
  points,
  displayProps = { ...DEFAULT_SCATTER_PROPS },
  hue,
  labels,
  size = undefined,
  palette = COLOR_BLACK,

  className,
}: IProps) {
  const _ref = useRef<HTMLCanvasElement>(null)

  useImperativeHandle(ref, () => _ref.current as HTMLCanvasElement)

  useEffect(() => {
    if (_ref.current) {
      drawScatter(_ref.current, points, displayProps, {
        hue,
        size,
        palette,
        labels,
      })
    }
  }, [_ref.current, points, displayProps, hue, size, palette])

  return <canvas ref={_ref} className={className} />
}
