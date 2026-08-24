import { createContext, useContext, useMemo, type ReactNode } from 'react'

import { makeUuid } from '@/lib/id'

import { ColorMap, getColorMap } from '@/lib/color/colormap'
import { argsort } from '@/lib/math/argsort'
import { ILim } from '@/lib/math/math'
import { IBasePlot } from '../../../../matcalc/history/history-provider/plot'
import { IGseaBubble } from '../gsea-plot-store'
import { useGseaBubbleSettings } from './gsea-bubble-settings-store'

export interface IGseaBubblePlot extends IBasePlot {
  style: 'gsea-bubble-plot'
  gseaBubble: IGseaBubble
  //props: IGseaBubbleDisplayOptions
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
}

export interface GseaBubblePropsContextType {
  plots: IGseaBubble[]
  points: IBubblePoint[][]
  xlims: ILim[]
  globalXLim: ILim
}

export const GseaBubbleContext = createContext<
  GseaBubblePropsContextType | undefined
>(undefined)

export function useGseaBubbleContext() {
  const ctx = useContext(GseaBubbleContext)

  if (!ctx)
    throw new Error(
      'useGseaBubbleContext must be used within a GseaBubbleContext.Provider'
    )
  return ctx
}

function getXLim(gseaBubble: IGseaBubble): ILim {
  const posNes = gseaBubble.genesets.map((gs) => gs.nes).filter((v) => v >= 0)

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

  const negNes = gseaBubble.genesets.map((gs) => gs.nes).filter((v) => v < 0)

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
  name: string,
  gseaBubble: IGseaBubble,
  opts: Partial<IGseaBubblePlot> = {}
): IGseaBubblePlot {
  let { actions = [] } = opts

  return {
    id: makeUuid(),
    style: 'gsea-bubble-plot',
    name,
    gseaBubble,
    groupRows: [],

    actions,
    type: 'plot',
    createdAt: new Date().toISOString(),
  }
}

function getColor(v: number, lim: ILim, colorMap: ColorMap) {
  const r = lim[1] - lim[0]
  const f = Math.min((v - lim[0]) / r, 1)

  const color = colorMap.getHexColor(f)

  return color
}

export function GseaBubbleProvider({
  plots,
  children,
}: {
  plots: IGseaBubble[]
  children: ReactNode
}) {
  //const [_plot, setPlot] = useState<IGseaBubblePlot | undefined>(plot)

  const { settings } = useGseaBubbleSettings()

  const xlims = useMemo(() => plots.map((p) => getXLim(p)), [plots])

  const globalXLim: ILim = useMemo(
    () => [
      Math.min(...xlims.map((lim) => lim[0])),
      Math.max(...xlims.map((lim) => lim[1])),
    ],
    [xlims]
  )

  const points: IBubblePoint[][] = useMemo(() => {
    if (plots.length === 0) {
      return []
    }

    return plots.map((plot, pi) => {
      let names = plot.genesets.map((gs) => gs.name)
      let nes = plot.genesets.map((gs) => gs.nes)
      let sizes = plot.genesets.map((gs) => gs.size)
      let log10pvalues = plot.genesets.map((gs) => gs.log10q)

      const xlim = xlims[pi]

      let idx: number[] = []

      switch (settings.sortBy) {
        case 'nes':
          idx = argsort(nes, true)

          break
        case 'size':
          idx = argsort(sizes, true)
          break
        case 'pvalue':
          idx = argsort(log10pvalues, true)
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

      return nes.map((score, i) => {
        const size = sizes[i]!
        const sizeF = Math.min(size / settings.size.maxSize, 1)
        const p = log10pvalues[i]!
        const color =
          settings.scale.mode === 'p'
            ? getColor(
                log10pvalues[i]!,
                settings.scale.p.range,
                getColorMap(settings.scale.cmap)
              )
            : getColor(nes[i]!, globalXLim, getColorMap(settings.scale.cmap))

        return {
          x: score,
          y: i + 1,
          nes: score,
          p,
          color,
          size: sizeF,
          r: sizeF * settings.bubbles.size,
          label: names[i]!,
        }
      })
    })
  }, [
    plots,
    settings.size.maxSize,
    settings.bubbles.size,
    settings.scale,
    settings.plot.margin,
    settings.margin,
    settings.padding,
    settings.legend,
    settings.border,
    settings.axes,
    settings.bubbles,
    settings.sortBy,
  ])

  return (
    <GseaBubbleContext.Provider
      value={{
        plots,
        points,
        xlims,
        globalXLim,
      }}
    >
      {children}
    </GseaBubbleContext.Provider>
  )
}
