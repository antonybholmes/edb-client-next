import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { makeUuid } from '@/lib/id'

import { ColorMap, getColorMap } from '@/lib/color/colormap'
import { argsort } from '@/lib/math/argsort'
import { ILim } from '@/lib/math/math'
import { IBasePlot } from '../../../../matcalc/history/history-provider/plot'

import { useEdbSettings } from '@/components/edb/edb-settings'
import { nodeRadiusFunc } from '@/components/pages/apps/heatmap/svg/cell-svg'
import { IPlotAxes, useAxes } from '@/components/plot/axes/axes-store'
import { createAxis, setAxisTickParams } from '@/components/plot/axes/axis'
import { IGseaBubble, IGseaTableResult } from '../gsea-store'
import { useGseaBubbleSettings } from './gsea-bubble-settings'

export interface IGseaBubblePlot extends IBasePlot, IGseaBubble {
  style: 'gsea-bubble-plot'
}

export interface IBubblePoint {
  x: number
  y: number
  nes: number
  p: number
  color: string
  size: number
  r: number
  label: string
  geneset: IGseaTableResult
}

export interface IGseaBubblePropsContext {
  plots: IGseaBubblePlot[]
  points: IBubblePoint[][]
  xlims: ILim[]
  globalXLim: ILim
  setPlots(plots: IGseaBubblePlot[]): void
}

export const GseaBubbleContext = createContext<
  IGseaBubblePropsContext | undefined
>(undefined)

export function useGseaBubbleContext() {
  const ctx = useContext(GseaBubbleContext)

  if (!ctx)
    throw new Error(
      'useGseaBubbleContext must be used within a GseaBubbleContext.Provider'
    )
  return ctx
}

/**
 * Find the xlim to accommotate all genesets in the plot
 * @param gseaBubble
 * @returns
 */
function getXLim(gseaBubble: IGseaBubble): ILim {
  const posNes = gseaBubble.groups
    .flatMap((gr) => gr.genesets)
    .map((gs) => gs.nes)
    .filter((v) => v >= 0)

  let maxNes = 0

  if (posNes.length > 0) {
    maxNes = Math.max(...posNes.filter((v) => v >= 0).map((v) => Math.abs(v)))
    // round up to nearest multiple of 0.5
    let ceilNes = Math.ceil(maxNes * 2) / 2

    // Add a small buffer to the positive NES to make the axis look nicer
    if (ceilNes - maxNes < 0.25) {
      ceilNes += 0.5
    }

    maxNes = ceilNes
  }

  const negNes = gseaBubble.groups
    .flatMap((gr) => gr.genesets)
    .map((gs) => gs.nes)
    .filter((v) => v < 0)

  let minNes = 0

  if (negNes.length > 0) {
    minNes = Math.max(...negNes.map((v) => Math.abs(v)))
    let ceilNes = Math.ceil(minNes * 2) / 2
    // Add a small buffer to the negative NES to make the axis look nicer
    if (ceilNes - minNes < 0.25) {
      ceilNes += 0.5
    }

    minNes = ceilNes
  }

  const m = Math.max(minNes, maxNes)

  return [-minNes, maxNes] //[-m, m]
}

export function newGseaBubblePlot(
  gseaBubble: IGseaBubble,
  opts: Partial<IGseaBubblePlot> = {}
): IGseaBubblePlot {
  let { actions = [] } = opts

  return {
    id: makeUuid(),
    style: 'gsea-bubble-plot',
    groupRows: [],
    actions,
    type: 'plot',
    createdAt: new Date().toISOString(),
    ...gseaBubble,
  }
}

function getColor(v: number, lim: ILim, colorMap: ColorMap) {
  const r = lim[1] - lim[0]
  const f = Math.min((v - lim[0]) / r, 1)

  const color = colorMap.getHexColor(f)

  return color
}

export function GseaBubbleProvider({
  plots = [],
  children,
}: {
  plots?: IGseaBubblePlot[]
  children: ReactNode
}) {
  const [_plots, setPlots] = useState<IGseaBubblePlot[]>(plots)
  const { settings } = useGseaBubbleSettings()
  const { settings: edbSettings } = useEdbSettings()

  const { addAxes } = useAxes()

  useEffect(() => {
    if (plots.length !== 0 && _plots !== plots) {
      setPlots(plots)
    }
  }, [plots])

  const xlims = useMemo(() => _plots.map((p) => getXLim(p)), [_plots])

  const globalXLim: ILim = useMemo(
    () => [
      Math.min(...xlims.map((lim) => lim[0])),
      Math.max(...xlims.map((lim) => lim[1])),
    ],
    [xlims]
  )

  const radiusScale = nodeRadiusFunc(
    settings.bubbles.size,
    settings.bubbles.scale.mode
  )

  const points: IBubblePoint[][] = useMemo(() => {
    if (_plots.length === 0) {
      return []
    }

    const colorMap = getColorMap(settings.scale.cmap)

    return _plots.map((plot) => {
      let y = 1

      const bubbles: IBubblePoint[] = []

      for (const gr of plot.groups.filter((g) => g.show)) {
        const genesets = gr.genesets

        let names = genesets.map((gs) => gs.name)
        let nes = genesets.map((gs) => gs.nes)
        let sizes = genesets.map((gs) => gs.size)
        let log10pvalues = genesets.map((gs) => gs.log10q)

        let idx: number[] = []

        switch (settings.sortBy) {
          case 'nes':
            idx = argsort(nes, { reverse: true })

            break
          case 'size':
            idx = argsort(sizes, { reverse: true })
            break
          case 'pvalue':
            idx = argsort(log10pvalues, { reverse: true })
            break

          default:
            break
        }

        if (idx.length > 0) {
          nes = idx.map((i) => nes[i])
          sizes = idx.map((i) => sizes[i])
          log10pvalues = idx.map((i) => log10pvalues[i])
          names = idx.map((i) => names[i])
        }

        for (const [i, score] of nes.entries()) {
          const size = sizes[nes.indexOf(score)]!
          const normSize = Math.min(size / settings.size.maxSize, 1)
          const p = log10pvalues[i]!
          const color =
            settings.scale.mode === 'p'
              ? getColor(log10pvalues[i]!, settings.scale.p.range, colorMap)
              : getColor(nes[i]!, globalXLim, colorMap)

          bubbles.push({
            x: score,
            y,
            nes: score,
            p,
            color,
            size: normSize,
            r: radiusScale(normSize), //normSize * settings.bubbles.size,
            label: names[i]!,
            geneset: genesets[i]!,
          })

          y += 1
        }

        y += settings.groups.show ? 1 : 0
      }

      return bubbles
    })
  }, [_plots, globalXLim, settings])

  useEffect(() => {
    const axes: IPlotAxes[] = []

    for (const [pi, plot] of _plots.entries()) {
      const xlim = xlims[pi]
      const domain = settings.axes.x.auto ? xlim : settings.axes.x.domain

      // offer per plot x-axis domain
      let xax = createAxis({
        id: 'x',
        title: plot.nes.label,
        autoDomain: domain,
        length: settings.axes.x.length,
      })
      xax = setAxisTickParams(xax, {
        which: 'major',
        show: edbSettings.plots.axes.x.ticks.major.show,
      })
      xax = setAxisTickParams(xax, {
        which: 'minor',
        show: edbSettings.plots.axes.x.ticks.minor.show,
      })

      axes.push({
        plotId: plot.id,
        groupId: 'nes',
        axisIds: [xax.id],
        axes: { [xax.id]: xax },
      })
    }

    // now the colorbar
    const rangeDiff =
      settings.scale.mode === 'p'
        ? settings.scale.p.range[1] - settings.scale.p.range[0]
        : globalXLim[1] - globalXLim[0]

    let cax =
      settings.scale.mode === 'p'
        ? createAxis({
            id: 'cbar',
            domain: settings.scale.p.range,
            length: edbSettings.plots.colorbar.size.w,
            ticks: [
              settings.scale.p.range[0],
              settings.scale.p.range[0] + rangeDiff / 2,
              settings.scale.p.range[1],
            ],
            minorTicks: [
              settings.scale.p.range[0] + rangeDiff * 0.25,
              settings.scale.p.range[0] + rangeDiff * 0.75,
            ],
          })
        : createAxis({
            id: 'cbar',
            domain: globalXLim,
            length: edbSettings.plots.colorbar.size.w,
            ticks: [
              globalXLim[0],
              globalXLim[0] + rangeDiff / 2,
              globalXLim[1],
            ],
            minorTicks: [
              globalXLim[0] + rangeDiff * 0.25,
              globalXLim[0] + rangeDiff * 0.75,
            ],
          })

    cax = setAxisTickParams(cax, {
      which: 'major',
      show: edbSettings.plots.axes.x.ticks.major.show,
    })

    cax = setAxisTickParams(cax, {
      which: 'minor',
      show: edbSettings.plots.axes.x.ticks.minor.show,
    })

    axes.push({
      plotId: 'cbar',
      groupId: 'cbar',
      axisIds: [cax.id],
      axes: { [cax.id]: cax },
    })

    addAxes(axes)
  }, [_plots, xlims, settings, edbSettings, globalXLim, addAxes])

  return (
    <GseaBubbleContext.Provider
      value={{
        plots: _plots,
        points,
        xlims,
        globalXLim,
        setPlots,
      }}
    >
      {children}
    </GseaBubbleContext.Provider>
  )
}
