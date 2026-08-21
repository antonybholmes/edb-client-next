import { createContext, useContext, useMemo, type ReactNode } from 'react'

import { makeUuid } from '@/lib/id'

import { ColorMap, getColorMap } from '@/lib/color/colormap'
import { argsort } from '@/lib/math/argsort'
import { ILim } from '@/lib/math/math'
import { produce } from 'immer'
import { IBasePlot } from '../../../../matcalc/history/history-provider/plot'
import { IGseaBubble } from '../gsea-plot-store'
import { useGseaBubbleSettings } from './gsea-bubble-settings-store'
import {
  DEFAULT_GSEA_BUBBLE_PROPS,
  type IGseaBubbleDisplayOptions,
} from './gsea-bubble-svg'

export interface IGseaBubblePlot extends IBasePlot {
  style: 'gsea-bubble-plot'
  gseaBubble: IGseaBubble
  props: IGseaBubbleDisplayOptions
}

export interface IBubblePoint {
  x: number
  y: number
  p: number
  color: string
  size: number
  r: number
  label: string
}

export interface GseaBubblePropsContextType {
  plots: IGseaBubblePlot[]
  points: IBubblePoint[][]
  xlims: ILim[]
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

  const maxNes =
    posNes.length > 0
      ? Math.ceil(
          Math.max(...posNes.filter((v) => v >= 0).map((v) => Math.abs(v)))
        )
      : 0

  const negNes = gseaBubble.genesets.map((gs) => gs.nes).filter((v) => v < 0)

  const minNes =
    negNes.length > 0
      ? Math.ceil(Math.max(...negNes.map((v) => Math.abs(v))))
      : 0

  return [-minNes, maxNes]
}

export function newGseaBubblePlot(
  name: string,
  gseaBubble: IGseaBubble,
  opts: Partial<IGseaBubblePlot> = {}
): IGseaBubblePlot {
  let { props = { ...DEFAULT_GSEA_BUBBLE_PROPS }, actions = [] } = opts

  props = produce(props, (draft) => {
    draft.axes.xaxis.domain = getXLim(gseaBubble)
  })

  return {
    id: makeUuid(),
    style: 'gsea-bubble-plot',
    name,
    gseaBubble,
    groupRows: [],
    props,
    actions,
    type: 'plot',
    createdAt: new Date().toISOString(),
  }
}

function getColor(
  log10pvalue: number,
  maxlog10pvalue: number,
  colorMap: ColorMap
) {
  const f = Math.min(log10pvalue / maxlog10pvalue, 1)

  const color = colorMap.getHexColor(f)

  return color
}

export function GseaBubbleProvider({
  plots,
  children,
}: {
  plots: IGseaBubblePlot[]
  children: ReactNode
}) {
  //const [_plot, setPlot] = useState<IGseaBubblePlot | undefined>(plot)

  const { settings } = useGseaBubbleSettings()

  const xlims = useMemo(() => plots.map((p) => getXLim(p.gseaBubble)), [plots])

  const points = useMemo(() => {
    if (plots.length === 0) {
      return []
    }

    return plots.map((plot) => {
      let names = plot.gseaBubble.genesets.map((gs) => gs.name)
      let nes = plot.gseaBubble.genesets.map((gs) => gs.nes)
      let sizes = plot.gseaBubble.genesets.map((gs) => gs.size)
      let log10pvalues = plot.gseaBubble.genesets.map((gs) => gs.log10q)

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

      return nes.map((x, i) => {
        const size = sizes[i]!
        const sizeF = Math.min(size / settings.size.maxSize, 1)
        return {
          x,
          y: i + 1,
          p: log10pvalues[i]!,
          color: getColor(
            log10pvalues[i]!,
            settings.p.range[1],
            getColorMap(settings.p.cmap)
          ),
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
    settings.p,
    settings.plot.margin,
    settings.margin,
    settings.padding,
    settings.legend,
    settings.border,
    settings.axes,
    settings.bubbles,
    settings.sortBy,
  ])

  console.log('bubble plot props', plots[0]?.props)

  return (
    <GseaBubbleContext.Provider
      value={{
        plots,
        points,
        xlims,
      }}
    >
      {children}
    </GseaBubbleContext.Provider>
  )
}
