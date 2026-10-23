import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useVolcanoSettings } from './volcano-settings'

import { createAxis } from '@/components/plot/axes/axis'
import { useAxes } from '@/components/plot/axes/plot-axes'
import { range } from '@/lib/math/range'
import { produce } from 'immer'
import { IVolcanoPlot } from '../matcalc/history/history-provider/history-types'
import type { IVolcanoDisplayOptions } from './volcano-plot-svg'

export interface VolcanoPropsContextType {
  displayProps: IVolcanoDisplayOptions | null
  plot: IVolcanoPlot
  highlightedLabels: string[]
  displayLabels: string[]
  setLabels(labels: string[]): void
  addHighlightedLabels(): void
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
  plot: IVolcanoPlot | null
  children: ReactNode
}) {
  const [manualLabels, setManualLabels] = useState<string[]>([])

  const { settings, updateSettings } = useVolcanoSettings()

  const volcano = plot?.volcano
  const displayOptions = useMemo(() => plot?.props, [plot?.props])

  const { addAxes } = useAxes()

  const thresholdLogP = settings.preprocess.applyMinusLog10P
    ? -Math.log10(settings.thresholds.pvalue.threshold)
    : settings.thresholds.pvalue.threshold

  function getShouldLabel(logFc: number, logP: number): boolean {
    if (settings.thresholds.pvalue.show && settings!.thresholds.logFc.show) {
      if (
        logP > thresholdLogP &&
        Math.abs(logFc) > settings!.thresholds.logFc.threshold
      ) {
        return true
      }
    } else {
      if (
        (settings.thresholds.pvalue.show && logP > thresholdLogP) ||
        (settings!.thresholds.logFc.show &&
          Math.abs(logFc) > settings!.thresholds.logFc.threshold)
      ) {
        return true
      }
    }

    return false
  }

  const highlightedLabels = useMemo(() => {
    const idx = new Set(
      range(volcano?.entries.length ?? 0).filter((i) =>
        getShouldLabel(
          volcano?.entries[i]!.log2foldChange ?? 0,
          volcano?.entries[i]!.logpvalue ?? 0
        )
      )
    )

    const values =
      volcano?.entries
        .filter((_v, i) => idx.has(i))
        .map((l) => l.label.toString())
        .sort() ?? []

    return values
  }, [volcano?.entries, displayOptions, thresholdLogP])

  useEffect(() => {
    if (!plot) {
      return
    }

    // const minX = Math.min(
    //   ...(volcano?.entries ?? []).map((p) => p.log2foldChange)
    // )
    // const maxX = Math.max(
    //   ...(volcano?.entries ?? []).map((p) => p.log2foldChange)
    // )
    // const minY = Math.min(...(volcano?.entries ?? []).map((p) => p.logpvalue))
    // const maxY = Math.max(...(volcano?.entries ?? []).map((p) => p.logpvalue))

    const xax = createAxis({
      id: 'x',
      title: settings.axes.xaxis.name,
      length: settings.axes.xaxis.length,
      domain: settings.axes.xaxis.domain,
      autoDomain: true,
    })

    const yax = createAxis({
      id: 'y',
      title: settings.axes.yaxis.name,
      direction: 'y',
      length: settings.axes.yaxis.length,
      domain: settings.axes.yaxis.domain,
      autoDomain: true,
    })

    console.log('Creating axes for volcano plot')

    addAxes([
      {
        plotId: plot.id ?? '',
        groupId: 'volcano',
        axisIds: ['x', 'y'],
        axes: { x: xax, y: yax },
      },
    ])
  }, [plot, settings])

  useEffect(() => {
    if (settings.labels.auto) {
      setManualLabels(highlightedLabels)
    }
  }, [settings.labels.auto, highlightedLabels])

  // const displayLabels = useMemo(
  //   () => (settings.labels.auto ? highlightedLabels : manualLabels),
  //   [settings.labels.auto, highlightedLabels, manualLabels]
  // )

  const setLabels = useCallback(
    (labels: string[]) => {
      setManualLabels(labels)
      updateSettings(
        produce(settings, (draft) => {
          draft.labels.auto = false
        })
      )
    },
    [setManualLabels, updateSettings, settings]
  )

  /**
   * Automatically set manual labels to the highlighted labels
   */
  const addHighlightedLabels = useCallback(() => {
    setLabels(highlightedLabels)
  }, [setLabels, highlightedLabels])

  return (
    <VolcanoContext.Provider
      value={{
        displayProps: plot?.props,
        plot,
        highlightedLabels,
        displayLabels: manualLabels,
        setLabels,
        addHighlightedLabels,
      }}
    >
      {children}
    </VolcanoContext.Provider>
  )
}
