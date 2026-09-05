import { createContext, ReactNode, useContext, useEffect, useMemo } from 'react'

import { IPlotAxes, useAxes } from '@/components/plot/axes/axes-store'
import { createAxis } from '@/components/plot/axes/axis'
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
  const { addAxesPlots } = useAxes()
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

  useEffect(() => {
    const axesPlots: IPlotAxes[] = []

    for (const pathway of pathways) {
      const results = resultsMap[pathway.name]!

      // ranks are 0-based in the results files
      const maxRank = rankedGenes.length - 1

      let xax = createAxis({
        title: 'ES X-axis',
        domain: [0, maxRank],
        length: settings.axes.x.length,
        style: { title: { show: false } },
        tickParams: { which: 'both', show: false },
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

      let yax = createAxis({
        direction: 'y',
        title: 'ES',
        //style: { title: { show: false } },
        domain: ylim,
        length: settings.es.axes.y.length,
        tickParams: { which: 'minor', show: false },
      })

      axesPlots.push({
        plotId: pathway.id,
        groupId: 'es',
        axisIds: ['es-x', 'es-y'],
        axes: { 'es-x': xax, 'es-y': yax },
      })
    }
    addAxesPlots(axesPlots)
  }, [pathways, resultsMap, rankedGenes, settings, addAxesPlots])

  return (
    <GseaPlotContext.Provider value={{ pathways }}>
      {children}
    </GseaPlotContext.Provider>
  )
}
