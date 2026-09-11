import { createContext, useContext, useEffect, type ReactNode } from 'react'

import { useAxes } from '@/components/plot/axes/axes-store'
import { createAxis } from '@/components/plot/axes/axis'
import { IExtGseaResult, IGseaResult } from '@/lib/gsea/ext-gsea'
import { IGeneSet, IRankedGenes } from '@/lib/gsea/geneset'
import { abs } from '@/lib/math/abs'
import { range } from '@/lib/math/range'

import { DEFAULT_EXT_GSEA_PROPS, IExtGseaSettings } from './ext-gsea-settings'

import { makeUuid } from '@/lib/id'
import { IBasePlot } from '../../../matcalc/history/history-provider/plot'

export interface IExtGseaPlot extends IBasePlot {
  style: 'ext-gsea'
  props: IExtGseaSettings
  rankedGenes: IRankedGenes
  gs1: IGeneSet
  gs2: IGeneSet
  extGseaRes: IExtGseaResult
  gseaRes1: IGseaResult
  gseaRes2: IGseaResult
}

export interface ExtGseaPropsContextType {
  displayProps: IExtGseaSettings
  plot: IExtGseaPlot
}

export function newExtGseaPlot(
  name: string,

  opts: Partial<IExtGseaPlot> = {}
): IExtGseaPlot {
  const {
    actions = [],
    groupRows: groups = [],
    extGseaRes = {} as IExtGseaResult,
    gseaRes1 = {} as IGseaResult,
    gseaRes2 = {} as IGseaResult,
    rankedGenes = {} as IRankedGenes,
    gs1 = {} as IGeneSet,
    gs2 = {} as IGeneSet,
    props = { ...DEFAULT_EXT_GSEA_PROPS },
  } = opts

  return {
    id: makeUuid(),
    //path: '',
    style: 'ext-gsea',
    name,
    //dataframes,
    groupRows: groups,
    extGseaRes,
    gseaRes1,
    gseaRes2,
    rankedGenes,
    gs1,
    gs2,
    props,
    actions,
    type: 'plot',
    createdAt: new Date().toISOString(),
  }
}

export const ExtGseaContext = createContext<
  ExtGseaPropsContextType | undefined
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
  plot: IExtGseaPlot
  children: ReactNode
}) {
  const { addAxes } = useAxes()

  const displayProps = plot.props

  useEffect(() => {
    const rankedGenes: IRankedGenes = plot.rankedGenes
    const gseaRes1: IGseaResult = plot.gseaRes1
    const gseaRes2: IGseaResult = plot.gseaRes2

    let y = gseaRes1.esAll //self._ranked_scores
    const x = range(y.length)

    const xmax = Math.max(...x)
    const ymax = Math.max(...abs([...y, ...gseaRes2.esAll]))

    let xax = createAxis({
      id: 'x',
      title: 'Genes',
      domain: [0, xmax],
      length: displayProps.axes.x.length,
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

    const yMax = Math.max(...abs(rankedGenes.genes.map((e) => e.score)))

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
        plotId: plot.id,
        groupId: 'ext-gsea',
        axisIds: ['x'],
        axes: {
          x: xax,
        },
      },
      {
        plotId: plot.id,
        groupId: 'es',
        axisIds: ['y'],
        axes: {
          y: yaxEs,
        },
      },
      {
        plotId: plot.id,
        groupId: 'snr',
        axisIds: ['y'],
        axes: {
          y: yaxSnr,
        },
      },
    ])
  }, [plot])

  return (
    <ExtGseaContext.Provider value={{ displayProps: plot.props, plot }}>
      {children}
    </ExtGseaContext.Provider>
  )
}
