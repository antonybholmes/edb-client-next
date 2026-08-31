import { createContext, ReactNode, useContext, useMemo } from 'react'

import {
  AxesPlotProvider,
  IAxesPlot,
} from '@/components/plot/axes/axes-provider'
import { newAxisConfig } from '@/components/plot/axes/svg-axis-props'
import { produce } from 'immer'
import { IGseaGeneSet, useGsea } from './gsea-plot-store'
import { useGseaSettings } from './gsea-settings-store'

type GseaPlotContext = {
  pathways: IGseaGeneSet[]
}

export const GseaPlotContext = createContext<GseaPlotContext | null>(null)

export function useGseaPlot() {
  const context = useContext(GseaPlotContext)

  if (!context) {
    throw new Error('useGseaPlot must be used inside a GseaPlotProvider')
  }

  return context
}

export function GseaPlotProvider({ children }: { children: ReactNode }) {
  const { settings } = useGseaSettings()

  const { rankedGenes, inUseReports, resultsMap } = useGsea()

  // keep only pathways for which we have results, i.e. with
  // suitable q values. If q == 1, unlikely GSEA generated it
  // so we cannot plot it
  const pathways = useMemo(
    () =>
      inUseReports.filter(
        (report) => report.q < 1 && report.name in resultsMap
      ),
    [inUseReports, resultsMap]
  )

  const axesPlots: IAxesPlot[] = []

  for (const pathway of pathways) {
    const results = resultsMap[pathway.name]!

    // ranks are 0-based in the results files
    const maxRank = rankedGenes.length - 1

    let xax = produce(newAxisConfig(), (draft) => {
      draft.domain = [0, maxRank]
      draft.range = [0, settings.axes.x.length]
      draft.ticks.major.show = false
      draft.ticks.minor.show = false
    })

    const es = settings.phenotypes.invert
      ? results.es
          .map((e) => ({
            ...e,
            rank: maxRank - e.rank,
            score: -e.score,
          }))
          .sort((a, b) => a.rank - b.rank)
      : results.es

    const ylim: [number, number] = [
      Math.min(...es.map((e) => e.score)),
      Math.max(...es.map((e) => e.score)),
    ]

    let yax = produce(newAxisConfig(), (draft) => {
      draft.domain = ylim
      draft.range = [0, settings.es.axes.y.length]

      draft.ticks.minor.show = false
    })

    axesPlots.push({ id: pathway.id, axes: { x: xax, y: yax } })
  }

  return (
    <AxesPlotProvider plots={axesPlots}>
      <GseaPlotContext.Provider value={{ pathways }}>
        {children}
      </GseaPlotContext.Provider>
    </AxesPlotProvider>
  )
}
