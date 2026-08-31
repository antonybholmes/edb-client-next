import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { IAxisConfig } from './svg-axis-props'

export type Plot = {
  id: string
  axes: Record<string, IAxisConfig>
}

type PlotState = {
  plots: Record<string, Plot>
}

type PlotActions = {
  updateAxis: (
    plotId: string,
    axisId: string,
    patch: Partial<IAxisConfig>
  ) => void

  addAxis: (plotId: string, axis: IAxisConfig) => void

  removeAxis: (plotId: string, axisId: string) => void
}

type PlotContextValue = {
  state: PlotState
  actions: PlotActions
}

const PlotContext = createContext<PlotContextValue | null>(null)

export function PlotProvider({
  initialPlots,
  children,
}: {
  initialPlots: Plot[]
  children: React.ReactNode
}) {
  const [plots, setPlots] = useState<Record<string, Plot>>(() =>
    Object.fromEntries(initialPlots.map((plot) => [plot.id, plot]))
  )

  const updateAxis = useCallback(
    (plotId: string, axisId: string, patch: Partial<IAxisConfig>) => {
      setPlots((current) => {
        const plot = current[plotId]

        if (!plot) {
          throw new Error(`Unknown plot: ${plotId}`)
        }

        const axis = plot.axes[axisId]

        if (!axis) {
          throw new Error(`Unknown axis "${axisId}" in plot "${plotId}"`)
        }

        return {
          ...current,

          [plotId]: {
            ...plot,

            axes: {
              ...plot.axes,

              [axisId]: {
                ...axis,
                ...patch,
              },
            },
          },
        }
      })
    },
    []
  )

  const addAxis = useCallback((plotId: string, axis: IAxisConfig) => {
    setPlots((current) => {
      const plot = current[plotId]

      if (!plot) {
        throw new Error(`Unknown plot: ${plotId}`)
      }

      return {
        ...current,

        [plotId]: {
          ...plot,
          axes: {
            ...plot.axes,
            [axis.id]: axis,
          },
        },
      }
    })
  }, [])

  const removeAxis = useCallback((plotId: string, axisId: string) => {
    setPlots((current) => {
      const plot = current[plotId]

      if (!plot) {
        throw new Error(`Unknown plot: ${plotId}`)
      }

      const { [axisId]: _, ...axes } = plot.axes

      return {
        ...current,

        [plotId]: {
          ...plot,
          axes,
        },
      }
    })
  }, [])

  const value = useMemo(
    () => ({
      state: { plots },
      actions: {
        updateAxis,
        addAxis,
        removeAxis,
      },
    }),
    [plots, updateAxis, addAxis, removeAxis]
  )

  return <PlotContext.Provider value={value}>{children}</PlotContext.Provider>
}

export function usePlots() {
  const context = useContext(PlotContext)

  if (!context) {
    throw new Error('usePlots must be used inside a PlotProvider')
  }

  return context.state.plots
}

export function usePlotActions() {
  const context = useContext(PlotContext)

  if (!context) {
    throw new Error('usePlotActions must be used inside a PlotProvider')
  }

  return context.actions
}
