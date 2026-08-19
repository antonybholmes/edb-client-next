import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'

import { makeUuid } from '@/lib/id'

import { ColorMap, getColorMap } from '@/lib/color/colormap'
import { argsort } from '@/lib/math/argsort'
import { produce } from 'immer'
import { IBasePlot } from '../../../matcalc/history/history-provider/plot'
import { useGseaBubbleSettings } from './gsea-bubble-settings-store'
import {
  DEFAULT_GSEA_DOT_PROPS,
  type IGseaBubbleDisplayOptions,
} from './gsea-bubble-svg'

export interface IGseaBubble {
  ids: string[]
  nes: { values: number[]; label: string }
  log10pvalues: { values: number[]; label: string }
  sizes: { values: number[]; label: string }
}

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
  displayProps: IGseaBubbleDisplayOptions
  plot: IGseaBubblePlot
  points: IBubblePoint[]

  //setPlot: (plot: IGseaBubblePlot) => void
  updatePlotSettings: (newSettings: Partial<IGseaBubbleDisplayOptions>) => void
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

export function newGseaBubblePlot(
  name: string,
  gseaBubble: IGseaBubble,
  opts: Partial<IGseaBubblePlot> = {}
): IGseaBubblePlot {
  const posNes = gseaBubble.nes.values.filter((v) => v >= 0)

  const maxNes =
    posNes.length > 0
      ? Math.ceil(
          Math.max(...posNes.filter((v) => v >= 0).map((v) => Math.abs(v)))
        )
      : 0

  const negNes = gseaBubble.nes.values.filter((v) => v < 0)

  const minNes =
    negNes.length > 0
      ? Math.ceil(Math.max(...negNes.map((v) => Math.abs(v))))
      : 0

  let { props = { ...DEFAULT_GSEA_DOT_PROPS }, actions = [] } = opts

  props = produce(props, (draft) => {
    draft.axes.xaxis.domain = [-minNes, maxNes]
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
  plot,
  children,
}: {
  plot?: IGseaBubblePlot
  children: ReactNode
}) {
  //const [_plot, setPlot] = useState<IGseaBubblePlot | undefined>(plot)

  const { settings } = useGseaBubbleSettings()

  useEffect(() => {
    // const posNes = plot.gseaBubble.nes.values.filter((v) => v >= 0)
    // const maxNes =
    //   posNes.length > 0
    //     ? Math.ceil(
    //         Math.max(...posNes.filter((v) => v >= 0).map((v) => Math.abs(v)))
    //       )
    //     : 0
    // const negNes = plot.gseaBubble.nes.values.filter((v) => v < 0)
    // const minNes =
    //   negNes.length > 0
    //     ? Math.ceil(Math.max(...negNes.map((v) => Math.abs(v))))
    //     : 0
    // const newPlot = {
    //   ...plot,
    //   props: produce(plot.props, (draft) => {
    //     draft.axes.xaxis.domain = [-minNes, maxNes]
    //   }),
    // }
    //setPlot(plot)
  }, [plot])

  function updatePlotSettings(newSettings: Partial<IGseaBubbleDisplayOptions>) {
    if (!plot) {
      return
    }

    const newPlot = {
      ...plot,
      props: produce(plot.props, (draft) => {
        Object.assign(draft, newSettings)
      }),
    }

    //setPlot(newPlot)
  }

  const points = useMemo(() => {
    if (!plot) {
      return []
    }

    let ids = plot.gseaBubble.ids
    let nes = plot.gseaBubble.nes.values
    let sizes = plot.gseaBubble.sizes.values
    let log10pvalues = plot.gseaBubble.log10pvalues.values

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
      ids = idx.map((i) => ids[i])
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
        label: ids[i]!,
      }
    })
  }, [
    plot?.gseaBubble.nes.values,
    plot?.gseaBubble.sizes.values,
    settings.size.maxSize,
    settings.bubbles.size,
    settings.p,
    settings.margin,
    settings.padding,
    settings.legend,
    settings.border,
    settings.axes,
    settings.bubbles,
    settings.sortBy,
  ])

  console.log('bubble plot props', plot?.props)

  return (
    <GseaBubbleContext.Provider
      value={{
        plot,
        points,
        displayProps: plot?.props ?? DEFAULT_GSEA_DOT_PROPS,
        updatePlotSettings,
      }}
    >
      {children}
    </GseaBubbleContext.Provider>
  )
}
