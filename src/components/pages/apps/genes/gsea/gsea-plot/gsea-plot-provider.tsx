import { createContext, useContext, useEffect, useMemo } from 'react'

import { IPlotAxes, useAxes } from '@/components/plot/axes/axes-store'
import { createAxis } from '@/components/plot/axes/axis'
import { IChildrenProps } from '@/interfaces/children-props'
import { ILim } from '@/lib/math/math'
import { IRankedGene, sortRankedGenes } from './geneset'
import { useGseaSettings } from './gsea-settings-store'
import { IGseaTableResult, useGseaInUse } from './gsea-store'

type GseaPlotContext = {
  pathways: IGseaTableResult[]
}

export const GseaPlotContext = createContext<GseaPlotContext | null>(null)

export function useGseaPlot() {
  const context = useContext(GseaPlotContext)

  if (!context) {
    throw new Error('useGseaPlot must be used inside a GseaPlotProvider')
  }

  return context
}

export function GseaPlotProvider({ children }: IChildrenProps) {
  const { settings } = useGseaSettings()
  const { addAxes } = useAxes()
  const { scores, inUseReports, resultsMap } = useGseaInUse()

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
      const result = resultsMap[pathway.name]!

      // ranks are 0-based in the results files
      const maxRank = scores.length - 1

      let xax = createAxis({
        id: 'x',
        title: 'Genes',
        domain: [0, maxRank],
        length: settings.es.axes.x.length,
        style: { title: { show: false } },
        tickParams: { which: 'both', show: false },
      })

      const hits: IRankedGene[] = sortRankedGenes(result.hits, maxRank, {
        reverse: settings.phenotypes.mode !== 'normal',
      })

      let ylim: ILim = [
        Math.min(...hits.map((e) => e.esScore)),
        Math.max(...hits.map((e) => e.esScore)),
      ]

      let yaxEs = createAxis({
        id: 'y',
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
        axisIds: ['x', 'y'],
        axes: { x: xax, y: yaxEs },
      })

      // scores is snr for all genes
      ylim = [
        Math.min(...scores.map((e) => e.score)),
        Math.max(...scores.map((e) => e.score)),
      ]

      let yaxSnr = createAxis({
        direction: 'y',
        title: 'SNR',
        autoDomain: ylim,
        length: settings.ranking.axes.y.length,
        tickParams: { which: 'minor', show: false },
      })

      axesPlots.push({
        plotId: pathway.id,
        groupId: 'snr',
        axisIds: ['x', 'y'],
        axes: { x: xax, y: yaxSnr },
      })
    }
    addAxes(axesPlots)
  }, [pathways, resultsMap, scores, settings, addAxes])

  return (
    <GseaPlotContext.Provider value={{ pathways }}>
      {children}
    </GseaPlotContext.Provider>
  )
}
