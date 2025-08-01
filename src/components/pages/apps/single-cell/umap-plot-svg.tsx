import {
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'

import { BaseSvg } from '@/components/base-svg'
import { Axis, YAxis } from '@/components/plot/axis'
import { VColorBarSvg } from '@/components/plot/color-bar-svg'
import { type IDrawScatterOptions } from '@/components/plot/scatter/scatter-plot-canvas'
import type { IDim } from '@/interfaces/dim'
import { normalize } from '@/lib/math/normalize'
import {
  PlotGridContext,
  type IScrnaCluster,
  type IUmapPlot,
} from './plot-grid-provider'

import type { IPos } from '@/interfaces/pos'
import {
  useUmapSettings,
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

  const { settings } = useUmapSettings()

  const { plots, points, clusterInfo, globalGexRange } =
    useContext(PlotGridContext)!

  useImperativeHandle(ref, () => _svgRef.current as SVGSVGElement)

  const [svg, setSvg] = useState<{ svg: ReactNode; dim: IDim }>({
    svg: null,
    dim: { w: 0, h: 0 },
  })

  function getDisplayClusters(clusters: IScrnaCluster[]): IScrnaCluster[] {
    return clusters.filter(
      (cluster) =>
        cluster.scClass !== '' &&
        (!cluster.scClass.toLowerCase().includes('undet') ||
          settings.legend.showUndetClusters)
    )
  }

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

      const umapWidth = gridMode ? settings.grid.axes.xaxis.length : xax.length!
      const umapHeight = gridMode
        ? settings.grid.axes.yaxis.length
        : yax.length!

      const cols = Math.min(settings.grid.cols, plots.length)
      const rows = Math.ceil(plots.length / settings.grid.cols)

      const displayClusters = getDisplayClusters(clusterInfo.clusters)

      const width =
        umapWidth * cols + settings.margin.left + settings.margin.right

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
          umapHeight * rows + settings.margin.top + settings.margin.bottom,
          totalLegendHeight
        ) +
        settings.margin.top +
        settings.margin.bottom

      const svgWidth =
        width + (settings.legend.show ? settings.legend.width : 0)

      const imageUrls: string[] = []

      for (const plot of plots) {
        let plotdata: IPos[]
        //let plotYdata: number[]
        let hue: number[]
        let cdata: number[]

        if (plot.mode === 'clusters') {
          plotdata = clusterInfo.order.map((i) => points[i]!)
          //plotYdata = clusterInfo.order.map(i => ydata[i]!)
          hue = clusterInfo.order.map((i) => clusterInfo.cdata[i]!)
          cdata = hue
        } else {
          plotdata = plot.gex.hueOrder.map((i) => points[i]!)
          //plotYdata = plot.gex.hueOrder.map(i => ydata[i]!)

          // in gex mode we need to normalize for range
          hue = normalize(
            plot.gex.hueOrder.map((i) => plot.gex.hue[i]!),
            settings.gex.useGlobalRange ? globalGexRange : plot.gex.range
          )

          // make a copy of cdata for only the clusters in the plot
          const clusterIds = new Set(plot.clusters.map((c) => c.clusterId))

          // reorder cdata to match hueOrder, but only include clusters that are in the plot
          // if a cluster is not in the plot, use 0 as the value
          // this allows us to plot only the clusters that are in the plot
          // and not all clusters in the dataset.
          cdata = plot.gex.hueOrder.map((i) => {
            const c = clusterInfo.cdata[i]!
            return clusterIds.has(c) ? c : 0
          })
        }

        const canvas = document.createElement('canvas')

        //console.log(hue, palette)

        drawUmap(canvas, plot, plotdata, hue, cdata, size, settings)

        imageUrls.push(canvas.toDataURL('image/png'))

        canvas.remove()

        if (!gridMode) {
          break
        }
      }

      //const palette = plots[0]!.palette

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
                transform={`translate(${col * umapWidth}, ${row * umapHeight})`}
              >
                {/* Show titles above plots */}
                {settings.grid.titles.show && (
                  <text
                    x={umapWidth / 2}
                    y={-settings.grid.titles.offset}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={settings.grid.titles.color}
                  >
                    {plot.title}
                  </text>
                )}

                <image
                  xlinkHref={imageUrls[pi]}
                  width={umapWidth}
                  height={umapHeight}
                />

                {settings.umap.clusters.show && (
                  <g id="cluster-labels">
                    {getDisplayClusters(plot.clusters).map((cluster) => {
                      const x1 = xax.domainToRange(cluster.pos[0])
                      const y1 = yax.domainToRange(cluster.pos[1])

                      return (
                        <g key={cluster.clusterId}>
                          {cluster.showRoundel && (
                            <circle
                              cx={x1}
                              cy={y1}
                              r={settings.roundel.size}
                              fill={settings.roundel.fill.color}
                              fillOpacity={settings.roundel.fill.alpha}
                              stroke={settings.roundel.stroke.color}
                              strokeWidth={settings.roundel.stroke.width}
                              strokeOpacity={settings.roundel.stroke.alpha}
                            />
                          )}

                          <text
                            x={x1}
                            y={y1}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill={cluster.color}
                          >
                            {cluster.clusterId.toString()}
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
            {settings.legend.show && (
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
                        key={cluster.clusterId}
                        transform={`translate(0, ${ci * (settings.legend.height + settings.legend.gap)})`}
                      >
                        <circle r={settings.legend.size} fill={cluster.color} />

                        <text
                          x={2 * settings.legend.size + settings.legend.gap}
                          textAnchor="start"
                          dominantBaseline="middle"
                          fill={cluster.color}
                        >
                          {`${settings.legend.showClusterId ? `${cluster.clusterId.toString()}. ` : ''}${cluster.scClass} (${cluster.cells.toLocaleString()})`}
                        </text>
                      </g>
                    )
                  })}
                </g>
              </g>
            )}

            {settings.legend.colorbar.show && (
              <g
                id="colorbar"
                transform={`translate(-${settings.legend.colorbar.size.h / 2}, ${legendHeight + 4 * settings.legend.gap})`}
              >
                <VColorBarSvg
                  size={settings.legend.colorbar.size}
                  domain={globalGexRange}
                  cmap={plots[0]!.palette}
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

    render(plots)
  }, [points, settings, plots, size, clusterInfo])

  return (
    <BaseSvg
      ref={_svgRef}
      width={svg.dim.w}
      height={svg.dim.h}
      scale={settings.scale}
      className="absolute"
    >
      {svg.svg && svg.svg}
    </BaseSvg>
  )
}
