import type { IHeatMapSettings } from '@/components/pages/apps/matcalc/apps/heatmap/heatmap-settings-store'
import { getColIdxFromGroup } from '@/lib/dataframe/dataframe-utils'
import { IClusterFrame } from '@/lib/math/hcluster'
import { range } from '@/lib/math/range'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { IHeatMapPlot } from '../../history/history-provider/history-types'

export interface HeatmapPropsContextType {
  displayProps?: IHeatMapSettings | undefined
  plot?: IHeatMapPlot | undefined
  rowLeaves?: number[]
  colLeaves?: number[]
  setPlot: (plot: IHeatMapPlot) => void
}

export const HeatmapContext = createContext<
  HeatmapPropsContextType | undefined
>(undefined)

export function useHeatmapContext() {
  const ctx = useContext(HeatmapContext)

  if (!ctx) {
    throw new Error(
      'useHeatmapContext must be used within a HeatmapContext.Provider'
    )
  }

  return ctx
}

export function HeatmapProvider({
  plot,
  children,
}: {
  plot?: IHeatMapPlot | undefined
  children: ReactNode
}) {
  const [_plot, setPlot] = useState<IHeatMapPlot | undefined>(plot)
  const [colLeaves, setColLeaves] = useState<number[]>([])
  const [rowLeaves, setRowLeaves] = useState<number[]>([])

  useEffect(() => {
    if (!plot) {
      return
    }

    const cf = plot.dataframes['main'] as IClusterFrame
    const df = cf.df
    const displayOptions = plot.props

    const rowLeaves = getLeaves(cf, 'row')
    setRowLeaves(rowLeaves)

    const groupRows = plot.groupRows || []
    const groups0 = groupRows[0]?.groups || []

    let colLeaves: number[] = []

    if (cf.colTree) {
      colLeaves = cf.colTree.leaves
    } else if (groups0.length > 0) {
      // if we are not clustering columns, but have groups,
      // order by groups

      colLeaves = groups0.map((group) => getColIdxFromGroup(df, group)).flat()

      const used = new Set<number>(colLeaves)

      // add unused indices in the order encountered at the end of the list
      // so we don't lose any data but move the unclassified to the end
      if (displayOptions.groups.keepUnused) {
        colLeaves = [
          ...colLeaves,
          ...range(df.shape[1]).filter((i) => !used.has(i)),
        ]
      }
    } else {
      // no clustering or groups, just show in original order

      colLeaves = range(df.shape[1])
    }

    setColLeaves(colLeaves)

    setPlot(plot)
  }, [plot])

  return (
    <HeatmapContext.Provider
      value={{
        displayProps: _plot?.props,
        plot: _plot,
        rowLeaves,
        colLeaves,
        setPlot,
      }}
    >
      {children}
    </HeatmapContext.Provider>
  )
}

export function getLeaves(cf: IClusterFrame, axis: 'row' | 'col') {
  if (axis === 'row') {
    return cf.rowTree ? cf.rowTree.leaves : range(cf.df.shape[0])
  }
  return cf.colTree ? cf.colTree.leaves : range(cf.df.shape[1])
}
