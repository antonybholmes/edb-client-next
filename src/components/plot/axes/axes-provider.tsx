import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { IAxis } from './axis'

export interface IAxesPlot {
  id: string
  axes: Record<string, IAxis>
}

interface IAxesPlotContextValue {
  plots: Record<string, IAxesPlot>

  updateAxis: (plotId: string, axisId: string, patch: Partial<IAxis>) => void

  addPlots: (plots: IAxesPlot[]) => void

  addAxis: (plotId: string, axis: IAxis) => void

  removeAxis: (plotId: string, axisId: string) => void
}

const PlotContext = createContext<IAxesPlotContextValue | null>(null)

export function AxesPlotProvider({
  plots: initialPlots = [],
  children,
}: {
  plots?: IAxesPlot[]
  children: React.ReactNode
}) {
  const [plots, setPlots] = useState<Record<string, IAxesPlot>>(() =>
    Object.fromEntries(initialPlots.map((plot) => [plot.id, plot]))
  )

  const addPlots = useCallback((newPlots: IAxesPlot[]) => {
    setPlots((current) => {
      const updated = { ...current }
      for (const plot of newPlots) {
        updated[plot.id] = plot
      }
      return updated
    })
  }, [])

  const updateAxis = useCallback(
    (plotId: string, axisId: string, patch: Partial<IAxis>) => {
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

  const addAxis = useCallback((plotId: string, axis: IAxis) => {
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
      plots,
      updateAxis,
      addPlots,
      addAxis,
      removeAxis,
    }),
    [plots, updateAxis, addPlots, addAxis, removeAxis]
  )

  return <PlotContext.Provider value={value}>{children}</PlotContext.Provider>
}

export function usePlots() {
  const context = useContext(PlotContext)

  if (!context) {
    throw new Error('usePlots must be used inside a PlotProvider')
  }

  return context
}
