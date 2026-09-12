import { createContext, useContext, useEffect, type ReactNode } from 'react'

import { useAxes } from '@/components/plot/axes/axes-store'
import { createAxis } from '@/components/plot/axes/axis'
import { IExtGseaResult, IGseaResult } from '@/lib/gsea/ext-gsea'
import { IGeneSet, IRankedGene } from '@/lib/gsea/geneset'
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

export interface IExtGseaPlotResult extends IDBEntity {
  rankedGenes: IRankedGene[]
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

  const displayProps = plot?.props

  useEffect(() => {
    for (const result of plot?.results ?? []) {
      const rankedGenes: IRankedGene[] = result.rankedGenes

      const gseaRes1: IGseaResult = result.gsea1
      const gseaRes2: IGseaResult = result.gsea2

      let y = gseaRes1.esAll //self._ranked_scores
      const x = range(y.length)

      const xmax = max(x)
      const ymax = max(abs([...y, ...gseaRes2.esAll]))

      let xax = createAxis({
        id: 'x',
        title: 'Genes',
        domain: [0, xmax],
        length: displayProps.axes.x.length,
        style: { title: { show: false } },
        tickParams: { which: 'both', show: false },
      })

      const yaxEs = createAxis({
        id: 'y',
        title: 'ES',
        direction: 'y',
        domain: [-ymax, ymax],
        length: displayProps.es.axes.y.length,
        tickParams: { which: 'minor', show: false },
      })

      const yMax = max(abs(rankedGenes.map((e) => e.score)))

      const yaxSnr = createAxis({
        id: 'y',
        direction: 'y',
        title: 'SNR',
        autoDomain: [-yMax, yMax],
        length: displayProps.ranking.axes.y.length,
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
  }, [plot])

  return (
    <ExtGseaContext.Provider value={{ displayProps: plot?.props, plot }}>
      {children}
    </ExtGseaContext.Provider>
  )
}
