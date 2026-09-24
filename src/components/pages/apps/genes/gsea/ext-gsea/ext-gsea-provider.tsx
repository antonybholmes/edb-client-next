import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  IExtGseaResult,
  IGseaResult,
  sortExtGseaResult,
  sortGseaResult,
} from '@/components/pages/apps/genes/gsea/ext-gsea/ext-gsea'
import {
  IGeneSet,
  IRankedGene,
  sortRankedGenes,
} from '@/components/pages/apps/genes/gsea/gsea-plot/geneset'
import { useAxes } from '@/components/plot/axes/axes-store'
import { createAxis } from '@/components/plot/axes/axis'
import { abs } from '@/lib/math/abs'
import { range } from '@/lib/math/range'

import {
  DEFAULT_EXT_GSEA_SETTINGS,
  IExtGseaSettings,
} from './ext-gsea-settings'

import { IDBEntity } from '@/interfaces/db-entity'
import { makeUuid } from '@/lib/id'
import { max } from '@/lib/math/math'
import { IBasePlot } from '../../../matcalc/history/history-provider/plot'
import { useGseaSettings } from '../gsea-plot/gsea-settings-store'

export interface IExtGseaPlotResult extends IDBEntity {
  scores: IRankedGene[]
  id: string
  gs1: IGeneSet
  gs2: IGeneSet
  extGsea: IExtGseaResult
  gsea1: IGseaResult
  gsea2: IGseaResult
}

export interface IExtGseaPlot extends IBasePlot {
  style: 'ext-gsea'
  props: IExtGseaSettings
  results: IExtGseaPlotResult[]
}

export function newExtGseaPlot(
  name: string,

  opts: Partial<IExtGseaPlot> = {}
): IExtGseaPlot {
  const {
    actions = [],

    results = [],
    props = { ...DEFAULT_EXT_GSEA_SETTINGS },
  } = opts

  return {
    id: makeUuid(),
    //path: '',
    style: 'ext-gsea',
    name,
    results,
    props,
    actions,
    type: 'plot',
    createdAt: new Date().toISOString(),
  }
}

export interface IExtGseaPropsContextType {
  displayProps: IExtGseaSettings
  plot: IExtGseaPlot
  results: IExtGseaPlotResult[]
}

export const ExtGseaContext = createContext<
  IExtGseaPropsContextType | undefined
>(undefined)

export function useExtGseaContext() {
  const ctx = useContext(ExtGseaContext)

  if (!ctx)
    throw new Error(
      'useExtGseaContext must be used within a ExtGseaContext.Provider'
    )
  return ctx
}

export function ExtGseaProvider({
  plot,
  children,
}: {
  plot?: IExtGseaPlot
  children: ReactNode
}) {
  const { addAxes } = useAxes()
  const { settings } = useGseaSettings()
  const [results, setResults] = useState<IExtGseaPlotResult[]>([])

  const displayProps = useMemo(() => plot?.props, [plot])

  useEffect(() => {
    if (!plot || !plot.results.length) {
      return
    }

    let results = plot.results

    if (settings.phenotypes.mode !== 'normal') {
      results = results.map((result) => {
        const maxRank = result.scores.length - 1

        // assign 1 to 2 and vice versa and
        // for gsea, invert and resort scores

        const gsea1 = sortGseaResult(result.gsea1, maxRank, { reverse: true })

        const gsea2 = sortGseaResult(result.gsea2, maxRank, { reverse: true })

        // swap around groups if inverted
        // const gs1 = result.gs1
        // const gs2 =
        //   settings.phenotypes.mode === 'inverted' ? result.gs1 : result.gs2

        return {
          ...result,
          extGsea: sortExtGseaResult(result.extGsea, maxRank, {
            reverse: true,
          }),

          gsea1,
          gsea2,

          scores: sortRankedGenes(result.scores, maxRank, { reverse: true }),
        }
      })
    }

    setResults(results)
  }, [plot, settings.phenotypes.mode])

  useEffect(() => {
    for (const result of plot?.results ?? []) {
      const scores: IRankedGene[] = result.scores

      const gseaRes1: IGseaResult = result.gsea1
      const gseaRes2: IGseaResult = result.gsea2

      let y = gseaRes1.es
      const x = range(y.length)

      const xmax = max(x)
      const ymax = max(
        abs([
          ...gseaRes1.es.map((g) => g.esScore),
          ...gseaRes2.es.map((g) => g.esScore),
        ])
      )

      const xax = createAxis({
        id: 'x',
        title: 'Genes',
        domain: [0, xmax],
        length: settings.es.axes.x.length,
        style: { title: { show: false } },
        tickParams: { which: 'both', show: false },
      })

      const yaxEs = createAxis({
        id: 'y',
        title: 'ES',
        direction: 'y',
        domain: [-ymax, ymax],
        length: settings.es.axes.y.length,
        tickParams: { which: 'minor', show: false },
      })

      const xaxGenes = { ...xax }

      const yMax = max(abs(scores.map((e) => e.score)))

      const yaxSnr = createAxis({
        id: 'y',
        direction: 'y',
        title: 'SNR',
        autoDomain: [-yMax, yMax],
        length: settings.ranking.axes.y.length,
        tickParams: { which: 'minor', show: false },
      })

      addAxes([
        {
          plotId: result.id,
          groupId: 'es',
          axisIds: ['x'],
          axes: {
            x: xax,
          },
        },
        {
          plotId: result.id,
          groupId: 'es',
          axisIds: ['y'],
          axes: {
            y: yaxEs,
          },
        },
        {
          plotId: result.id,
          groupId: 'snr',
          axisIds: ['y'],
          axes: {
            y: yaxSnr,
          },
        },
      ])
    }
  }, [plot, settings])

  return (
    <ExtGseaContext.Provider
      value={{ displayProps: plot?.props, plot, results }}
    >
      {children}
    </ExtGseaContext.Provider>
  )
}
