import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'

import { Axis, YAxis } from '@/components/plot/axis'
import { VColorBarSvg } from '@/components/plot/color-bar-svg'
import { type IDrawScatterOptions } from '@/components/plot/scatter/scatter-plot-canvas'
import { SvgBase } from '@/components/plot/svg-base'
import type { IDim } from '@/interfaces/dim'
import { normalize } from '@/lib/math/normalize'

import type { IPos } from '@/interfaces/pos'
import { COLOR_MAPS } from '@/lib/color/colormap'
import type { ILim } from '@/lib/math/math'
import {
  usePlotGrid,
  type IScrnaCluster,
  type IUmapPlot,
} from './plot-grid-store'
import {
  useSingleCellSettings,
  type ISingleCellSettings,
} from './single-cell-settings'
import { drawUmap } from './umap-plot-canvas'

// export interface IUmapPlotGene extends IScrnaGene {
//   hueOrder: number[]
//   hue: number[]
// }

// export interface IUmapPlot {
//   xdata: number[]
//   ydata: number[]
//   genes: IUmapPlotGene[]

//   palette: ColorMap
// }

interface IProps extends ComponentProps<'svg'>, IDrawScatterOptions {
  //plot: IUmapPlot

  //onCanvasChange?: (canvas: HTMLCanvasElement) => void
  displayProps?: ISingleCellSettings
  options?: IDrawScatterOptions
}

export function UmapPlotSvg({ ref, size = undefined }: IProps) {
  //const _canvasRef = useRef<HTMLCanvasElement>(null)

  const _svgRef = useRef<SVGSVGElement>(null)

  const { settings } = useSingleCellSettings()

  const { plots, points, clusterInfo } = usePlotGrid() //useContext(PlotGridContext)!

  useImperativeHandle(ref, () => _svgRef.current as SVGSVGElement)

  const [svg, setSvg] = useState<{ svg: ReactNode; dim: IDim }>({
    svg: null,
    dim: { w: 0, h: 0 },
  })

  useEffect(() => {
    async function render(allPlots: IUmapPlot[]) {
      // Step 2: Convert data URL to Blob using fetch
      //const response = await fetch(dataUrl)
      //const imageBlob = await response.blob()

      // Step 3: Create Object URL for the image
      //const imageUrl = URL.createObjectURL(imageBlob)

      if (allPlots.length < 1) {
        return
      }

      const gridMode = settings.grid.on

      const plots: IUmapPlot[] = gridMode ? allPlots : [allPlots[0]!]

      const xax = new Axis()
        //.setDomain([Math.min(...xdata), Math.max(...xdata)])
        .setDomain(settings.axes.xaxis.domain)
        .setLength(
          gridMode
            ? settings.grid.axes.xaxis.length
            : settings.axes.xaxis.length
        )

      const yax = new YAxis()
        //.setDomain([Math.min(...ydata), Math.max(...ydata)])
        .setDomain(settings.axes.yaxis.domain)
        .setLength(
          gridMode
            ? settings.grid.axes.yaxis.length
            : settings.axes.yaxis.length
        )

      const umapPlotSize: IDim = {
        w: gridMode ? settings.grid.axes.xaxis.length : xax.length!,
        h: gridMode ? settings.grid.axes.yaxis.length : yax.length!,
      }

      const umapContainer: IDim = {
        w: umapPlotSize.w + settings.grid.padding,
        h: umapPlotSize.h + settings.grid.padding,
      }

      const cols = Math.min(settings.grid.cols, plots.length)
      const rows = Math.ceil(plots.length / settings.grid.cols)

      const displayClusters = getDisplayClusters(
        clusterInfo?.clusters || [],
        settings.legend.showUndetClusters
      )

      const width =
        umapContainer.w * cols + settings.margin.left + settings.margin.right

      const legendHeight = settings.legend.show
        ? (settings.legend.height + settings.legend.gap) *
          displayClusters.length
        : 0

      const totalLegendHeight =
        legendHeight +
        (settings.legend.show && settings.legend.colorbar.show
          ? settings.legend.colorbar.size.w + 4 * settings.legend.gap
          : 0)

      //console.log('rows =>', rows, 'cols =>', cols, plots.length)

      const height =
        Math.max(
          umapContainer.h * rows + settings.margin.top + settings.margin.bottom,
          totalLegendHeight
        ) +
        settings.margin.top +
        settings.margin.bottom

      const svgWidth =
        width + (settings.legend.show ? settings.legend.width : 0)

      // render umaps as virtual images
      // this allows us to render the umaps as images in the svg
      // and avoid the performance issues of rendering large canvases
      // with many points.
      const imageUrls: string[] = []

      let range: ILim = settings.gex.range

      if (settings.gex.zscore.on) {
        // if zscore is on, we need to normalize the hue values
        // to the zscore range
        range = settings.gex.zscore.range
      }

      for (const plot of plots) {
        let plotdata: IPos[]
        //let plotYdata: number[]
        let hue: number[]
        let cdata: number[]

        if (plot.mode === 'clusters') {
          plotdata = clusterInfo?.order.map(i => points[i]!) || []
          //plotYdata = clusterInfo.order.map(i => ydata[i]!)
          hue = clusterInfo?.order.map(i => clusterInfo.cdata[i]!) || []
          cdata = hue
        } else {
          plotdata = plot.gex.hueOrder.map(i => points[i]!)
          //plotYdata = plot.gex.hueOrder.map(i => ydata[i]!)

          // in gex mode we need to normalize for range
          hue = normalize(
            plot.gex.hueOrder.map(i => plot.gex.hue[i]!),
            range
          )

          // make a copy of cdata for only the clusters in the plot
          //const clusterIds = new Set(plot.clusters.map(c => c.id))

          // reorder cdata to match hueOrder, but only include clusters that are in the plot
          // if a cluster is not in the plot, use 0 as the value
          // this allows us to plot only the clusters that are in the plot
          // and not all clusters in the dataset.
          // cluster 0 is reserved for "not in plot", real clusters start at 1
          // cdata = plot.gex.hueOrder.map(i => {
          //   const c = clusterInfo.cdata[i]!
          //   const cluster = clusterMap.get(c)
          //   return cluster && cluster.show ? c : 0
          // })

          cdata = plot.gex.hueOrder.map(i => {
            const c = clusterInfo?.cdata[i] || 0

            return c
          })
        }

        const canvas = document.createElement('canvas')

        //console.log(hue, plotdata)

        drawUmap(
          canvas,
          plot,
          clusterInfo!,
          plotdata,
          hue,
          cdata,
          size,
          settings
        )

        imageUrls.push(canvas.toDataURL('image/png'))

        canvas.remove()

        if (!gridMode) {
          break
        }
      }

      // let colorBarRange: ILim = [0, 0]

      // if (settings.gex.zscore.on) {
      //   // if zscore is on, we need to normalize the hue values
      //   // to the zscore range
      //   colorBarRange = settings.gex.zscore.range
      // } else {
      //   if (settings.gex.useGlobalRange) {
      //     colorBarRange = globalGexRange
      //   }
      // }

      // make svg grid using the images
      // this allows us to render the umaps as images in the svg
      // and avoid the performance issues of rendering large canvases
      // with many points.
      // we use the images as background for the svg elements
      // and then draw the clusters on top of them

      const svg = (
        <g
          transform={`translate(${settings.margin.left}, ${settings.margin.top})`}
        >
          {plots.map((plot, pi) => {
            const col = pi % settings.grid.cols
            const row = Math.floor(pi / settings.grid.cols)

            return (
              <g
                key={pi}
                transform={`translate(${col * umapContainer.w}, ${row * umapContainer.h})`}
              >
                {/* Show titles above plots */}
                {settings.grid.titles.show && (
                  <text
                    x={umapPlotSize.w / 2}
                    y={-settings.grid.titles.offset}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={settings.grid.titles.color}
                  >
                    {plot.name}
                  </text>
                )}

                <image
                  xlinkHref={imageUrls[pi]}
                  width={umapPlotSize.w}
                  height={umapPlotSize.h}
                />

                {settings.umap.clusters.show && (
                  <g id="cluster-labels">
                    {displayClusters
                      .filter(c => c.show && c.display.label.show)
                      .map(cluster => {
                        //cluster.pos will be the centroid of the cluster points
                        const x1 = xax.domainToRange(cluster.pos[0])
                        const y1 = yax.domainToRange(cluster.pos[1])

                        return (
                          <g key={cluster.label}>
                            {settings.umap.clusters.roundel.show &&
                              cluster.display.label.roundel.show && (
                                <circle
                                  cx={x1}
                                  cy={y1}
                                  r={settings.umap.clusters.roundel.size}
                                  fill={
                                    settings.umap.clusters.roundel.fill.value
                                  }
                                  fillOpacity={
                                    settings.umap.clusters.roundel.fill.opacity
                                  }
                                  stroke={
                                    settings.umap.clusters.roundel.stroke.value
                                  }
                                  strokeWidth={
                                    settings.umap.clusters.roundel.stroke.width
                                  }
                                  strokeOpacity={
                                    settings.umap.clusters.roundel.stroke
                                      .opacity
                                  }
                                />
                              )}

                            <text
                              x={x1}
                              y={y1}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill={cluster.color}
                            >
                              {cluster.name}
                            </text>
                          </g>
                        )
                      })}
                  </g>
                )}
              </g>
            )
          })}

          <g
            transform={`translate(${svgWidth - settings.legend.width - settings.margin.left}, 0)`}
          >
            <LegendSvg />

            {settings.legend.colorbar.show &&
              settings.genesets.some(g => g.mode !== 'clusters') && (
                <g
                  id="colorbar"
                  transform={`translate(-${settings.legend.colorbar.size.h / 2}, ${legendHeight + 4 * settings.legend.gap})`}
                >
                  <VColorBarSvg
                    size={settings.legend.colorbar.size}
                    domain={range}
                    cmap={COLOR_MAPS[settings.cmap]!}
                    //size={displayOptions.colorbar.size}
                    //stroke={displayOptions.colorbar.stroke}
                  />
                </g>
              )}
          </g>
        </g>
      )

      setSvg({ svg, dim: { w: svgWidth, h: height } })
    }

    //console.log('rendering umap svg', plots)
    render(plots)
  }, [points, settings, plots, size, clusterInfo])

  return (
    <SvgBase
      ref={_svgRef}
      width={svg.dim.w}
      height={svg.dim.h}
      scale={settings.scale}
      className="absolute"
    >
      {svg.svg && svg.svg}
    </SvgBase>
  )
}

//
function getDisplayClusters(
  clusters: IScrnaCluster[],
  showUndetClusters: boolean
): IScrnaCluster[] {
  return clusters.filter(
    cluster =>
      cluster.metadata['scClass'] !== '' &&
      (!cluster.metadata['scClass']?.includes('undet') || showUndetClusters)
  )
}

function LegendSvg() {
  const { clusterInfo } = usePlotGrid()
  const { settings } = useSingleCellSettings()

  const displayClusters = getDisplayClusters(
    clusterInfo?.clusters || [],
    settings.legend.showUndetClusters
  )

  if (!settings.legend.show) {
    return null
  }

  return (
    <g id="legend">
      <g id="clusters">
        {settings.legend.title.show && settings.legend.title.text && (
          <text
            transform={`translate(-${settings.legend.size}, -${settings.legend.height})`}
          >
            {settings.legend.title.text}
          </text>
        )}

        {displayClusters.map((cluster, ci) => {
          return (
            <g
              key={cluster.label}
              transform={`translate(0, ${ci * (settings.legend.height + settings.legend.gap)})`}
            >
              <circle r={settings.legend.size} fill={cluster.color} />

              <text
                x={2 * settings.legend.size + settings.legend.gap}
                textAnchor="start"
                dominantBaseline="middle"
                fill={cluster.color}
              >
                {`${settings.legend.showClusterId ? `${cluster.name}. ` : ''}${cluster.metadata['scClass']} (${cluster.cells.toLocaleString()})`}
              </text>
            </g>
          )
        })}
      </g>
    </g>
  )
}
