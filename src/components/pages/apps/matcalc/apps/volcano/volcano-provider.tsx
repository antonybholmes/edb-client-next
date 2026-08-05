import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { BaseDataFrame, findCol } from '@/lib/dataframe/base-dataframe'
import { getNumCol } from '@/lib/dataframe/dataframe-utils'
import { range } from '@/lib/math/range'
import { VolcanoPlot } from '../../history/history-provider/history-types'
import type { IVolcanoDisplayOptions } from './volcano-plot-svg'

export interface VolcanoPropsContextType {
  displayProps: IVolcanoDisplayOptions
  plot: VolcanoPlot
  data: {
    x: number[]
    y: number[]
  }
  labels: string[]
  highlightedLabels: string[]
  displayLabels: string[]
  setLabels(labels: string[]): void
}

export const VolcanoContext = createContext<
  VolcanoPropsContextType | undefined
>(undefined)

export function useVolcanoContext() {
  const ctx = useContext(VolcanoContext)

  if (!ctx)
    throw new Error(
      'useVolcanoContext must be used within a VolcanoContext.Provider'
    )
  return ctx
}

export function VolcanoProvider({
  plot,
  children,
}: {
  plot: VolcanoPlot
  children: ReactNode
}) {
  const [manualLabels, setManualLabels] = useState<string[]>([])

  const displayProps = useMemo(() => plot.props, [plot.props])
  const sheet = useMemo(
    () => plot!.dataframes['main'] as BaseDataFrame,
    [plot!.dataframes['main']]
  )

  const labels = useMemo(() => sheet.index.strs, [sheet])

  const data = useMemo(() => {
    const xdata = getNumCol(sheet, findCol(sheet, plot.props.axes.xaxis.name))
    const ydata = getNumCol(sheet, findCol(sheet, displayProps.axes.yaxis.name))
    return { x: xdata, y: ydata }
  }, [sheet, plot.props.axes.xaxis.name, displayProps.axes.yaxis.name])

  function getShouldLabel(logFc: number, logP: number): boolean {
    if (displayProps!.logP.show && displayProps!.logFc.show) {
      if (
        logP > displayProps!.logP.threshold &&
        Math.abs(logFc) > displayProps!.logFc.threshold
      ) {
        return true
      }
    } else {
      if (
        (displayProps!.logP.show && logP > displayProps!.logP.threshold) ||
        (displayProps!.logFc.show &&
          Math.abs(logFc) > displayProps!.logFc.threshold)
      ) {
        return true
      }
    }

    return false
  }

  const highlightedLabels = useMemo(() => {
    const idx = new Set(
      range(sheet.shape[0]).filter((i) =>
        getShouldLabel(data.x[i]!, data.y[i]!)
      )
    )

    const values = labels.filter((_v, i) => idx.has(i)).map((l) => l.toString())

    return values
  }, [
    data.x,
    data.y,
    displayProps.axes.xaxis.name,
    displayProps.axes.yaxis.name,
    labels,
  ])

  const displayLabels = useMemo(
    () => (displayProps.labels.auto ? highlightedLabels : manualLabels),
    [displayProps.labels.auto, highlightedLabels, manualLabels]
  )

  const setLabels = (labels: string[]) => {
    if (displayProps.labels.auto) {
      return
    }

    setManualLabels(labels)
  }

  return (
    <VolcanoContext.Provider
      value={{
        displayProps: plot.props,
        plot,
        data,
        labels,
        highlightedLabels,
        displayLabels,
        setLabels,
      }}
    >
      {children}
    </VolcanoContext.Provider>
  )
}
