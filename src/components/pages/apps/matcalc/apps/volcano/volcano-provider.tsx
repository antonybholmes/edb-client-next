import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useVolcanoSettings } from './volcano-settings-store'

import { useAxes } from '@/components/plot/axes/axes-store'
import { createAxis } from '@/components/plot/axes/axis'
import { range } from '@/lib/math/range'
import { IVolcanoPlot } from '../../history/history-provider/history-types'
import type { IVolcanoDisplayOptions } from './volcano-plot-svg'

export interface VolcanoPropsContextType {
  displayProps: IVolcanoDisplayOptions
  plot: IVolcanoPlot

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
  plot: IVolcanoPlot
  children: ReactNode
}) {
  const [manualLabels, setManualLabels] = useState<string[]>([])

  const volcano = plot.volcano
  const displayOptions = useMemo(() => plot.props, [plot.props])
  const { settings } = useVolcanoSettings()
  const { addAxes } = useAxes()

  // const sheet = useMemo(
  //   () => plot!.dataframes['main'] as BaseDataFrame,
  //   [plot!.dataframes['main']]
  // )

  // const labels = useMemo(() => sheet.index.strs, [sheet])

  // const data = useMemo(() => {
  //   const xdata = getNumCol(sheet, findCol(sheet, plot.props.axes.xaxis.name))
  //   const ydata = getNumCol(sheet, findCol(sheet, displayProps.axes.yaxis.name))

  //   return { x: xdata, y: ydata }
  // }, [sheet, plot.props.axes.xaxis.name, displayProps.axes.yaxis.name])

  const thresholdLogP = settings.preprocess.applyMinusLog10P
    ? -Math.log10(settings.pvalue.threshold)
    : settings.pvalue.threshold

  function getShouldLabel(logFc: number, logP: number): boolean {
    if (settings.pvalue.show && settings!.logFc.show) {
      if (logP > thresholdLogP && Math.abs(logFc) > settings!.logFc.threshold) {
        return true
      }
    } else {
      if (
        (settings.pvalue.show && logP > thresholdLogP) ||
        (settings!.logFc.show && Math.abs(logFc) > settings!.logFc.threshold)
      ) {
        return true
      }
    }

    return false
  }

  const highlightedLabels = useMemo(() => {
    const idx = new Set(
      range(volcano.ids.length).filter((i) =>
        getShouldLabel(volcano.log2foldChanges[i]!, volcano.logpvalues[i]!)
      )
    )

    const values = volcano.ids
      .filter((_v, i) => idx.has(i))
      .map((l) => l.toString())

    return values
  }, [
    volcano.log2foldChanges,
    volcano.logpvalues,
    displayOptions,
    volcano.ids,
    thresholdLogP,
  ])

  useEffect(() => {
    const xax = createAxis({
      id: 'x',
      title: displayOptions.axes.xaxis.name,
      length: displayOptions.axes.xaxis.length,
      autoDomain: displayOptions.axes.xaxis.domain,
    })

    const yax = createAxis({
      id: 'y',
      title: displayOptions.axes.yaxis.name,
      direction: 'y',
      length: displayOptions.axes.yaxis.length,
      autoDomain: displayOptions.axes.yaxis.domain,
    })

    addAxes([
      {
        plotId: plot.id,
        groupId: 'volcano',
        axisIds: ['x', 'y'],
        axes: { x: xax, y: yax },
      },
    ])
  }, [
    displayOptions.axes.xaxis.length,
    displayOptions.axes.xaxis.domain,
    displayOptions.axes.yaxis.length,
    displayOptions.axes.yaxis.domain,
  ])

  const displayLabels = useMemo(
    () => (settings.labels.auto ? highlightedLabels : manualLabels),
    [settings.labels.auto, highlightedLabels, manualLabels]
  )

  const setLabels = (labels: string[]) => {
    if (settings.labels.auto) {
      return
    }

    console.log(labels)
    setManualLabels(labels)
  }

  return (
    <VolcanoContext.Provider
      value={{
        displayProps: plot.props,
        plot,

        highlightedLabels,
        displayLabels,
        setLabels,
      }}
    >
      {children}
    </VolcanoContext.Provider>
  )
}
