import { resizeAndScaleCanvas } from '@lib/canvas'

import { Axis, YAxis } from '@/components/plot/axis'
import type { IPos } from '@/interfaces/pos'
import type { IScrnaCluster, IUmapPlot } from './plot-grid-provider'
import { type ISingleCellSettings } from './single-cell-settings'

export function drawUmap(
  canvas: HTMLCanvasElement,
  plot: IUmapPlot,
  points: IPos[],
  //ydata: number[],
  hue: number[],
  cdata: number[],
  size: ((idx: number, p: IPos, color: string) => number) | number | undefined,
  displayProps: ISingleCellSettings
) {
  const xax = new Axis()
    //.setDomain([Math.min(...xdata), Math.max(...xdata)])
    .setDomain(displayProps.axes.xaxis.domain)
    .setLength(displayProps.axes.xaxis.length)

  const yax = new YAxis()
    //.setDomain([Math.min(...ydata), Math.max(...ydata)])
    .setDomain(displayProps.axes.yaxis.domain)
    .setLength(displayProps.axes.yaxis.length)

  const innerWidth = xax.length
  const innerHeight = yax.length
  // const width =
  //   innerWidth + displayProps.margin.left + displayProps.margin.right
  // const height =
  //   innerHeight + displayProps.margin.top + displayProps.margin.bottom

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

    resizeAndScaleCanvas(canvas, innerWidth, innerHeight, displayProps.scale)

    const ctx = canvas.getContext('2d', { alpha: false })

    if (ctx) {
      //ctx.clearRect(0, 0, width, height)

      //ctx.fillStyle = COLOR_WHITE
      //ctx.fillRect(0, 0, width, height)

      ctx.save()
      //ctx.translate(displayProps.margin.left, displayProps.margin.top)

      let clusterMap: Record<number, IScrnaCluster> = {}

      if (plot.mode === 'clusters') {
        clusterMap = Object.fromEntries(
          plot.clusters.map(c => [c.clusterId, c])
        )
      }

      for (const [xi, p] of points.entries()) {
        //const y = ydata[xi]!
        const x1 = xax.domainToRange(p.x)
        const y1 = yax.domainToRange(p.y)

        let color: string = displayProps.dots.color

        const hueIndex = xi % hue.length

        // the cluster id
        const c = cdata[xi]!

        if (plot.mode === 'clusters') {
          // We pull the cluster color directly from the
          // the cluster object rather than using a heatmap

          if (c in clusterMap) {
            color = clusterMap[c]!.color //'black' // clusterMap[v]!.color
          }
        } else {
          // the color value
          const v = hue[hueIndex]!

          // only plot the color if cell is part of the plot clusters
          // so we can restrict which points are
          color =
            c > 0 ? plot.palette.getHexColor(v) : plot.palette.getHexColor(0)
        }

        let r = -1

        if (typeof size === 'function') {
          r = size(xi, p, color)
        } else if (typeof size === 'number') {
          r = size
        } else {
          r = displayProps.dots.size
        }

        ctx.beginPath()
        // use arc for pure circles
        ctx.arc(x1, y1, r, 0, 2 * Math.PI)
        //ctx.ellipse(x1, y1, r, r, 0, 0, 0)
        ctx.fillStyle = color
        ctx.fill()
      }

      // for (const label of displayProps.clusters) {
      //   const x1 = xax.domainToRange(label.pos[0])
      //   const y1 = yax.domainToRange(label.pos[1])

      //   // if (label.roundel.show) {
      //   //   ctx.beginPath()
      //   //   // use arc for pure circles
      //   //   ctx.arc(x1, y1, 12, 0, 2 * Math.PI)
      //   //   //ctx.ellipse(x1, y1, r, r, 0, 0, 0)
      //   //   ctx.globalAlpha = label.roundel.fill.alpha
      //   //   ctx.fillStyle = label.roundel.fill.color
      //   //   ctx.fill()
      //   //   ctx.globalAlpha = label.roundel.stroke.alpha
      //   //   ctx.strokeStyle = label.roundel.stroke.color
      //   //   ctx.lineWidth = label.roundel.stroke.width
      //   //   ctx.stroke()
      //   //   ctx.globalAlpha = 1
      //   // }

      //   ctx.fillStyle = label.color
      //   ctx.textAlign = 'center'
      //   ctx.textBaseline = 'middle'
      //   ctx.font = '12pt Arial'
      //   ctx.fillText(label.clusterId.toString(), x1, y1)
      // }

      ctx.restore()
    }
  }
}

// interface IProps extends ComponentProps<'canvas'>, IDrawScatterOptions {
//   x: number[]
//   y: number[]

//   onCanvasChange?: (canvas: HTMLCanvasElement) => void
//   displayProps?: ISingleCellSettings
//   options?: IDrawScatterOptions
// }

// export function UmapPlotCanvas({
//   ref,
//   x,
//   y,
//   displayProps = { ...DEFAULT_SETTINGS },
//   hue,
//   labels,
//   size = undefined,
//   palette = COLOR_BLACK,

//   className,
// }: IProps) {
//   const _ref = useRef<HTMLCanvasElement>(null)

//   useImperativeHandle(ref, () => _ref.current as HTMLCanvasElement)

//   useEffect(() => {
//     if (_ref.current) {
//       drawUmap(_ref.current, x, y, displayProps, {
//         hue,
//         size,
//         palette,
//         labels,
//       })
//     }
//   }, [_ref.current, x, y, displayProps, hue, size, palette])

//   return <canvas ref={_ref} className={className} />
// }
