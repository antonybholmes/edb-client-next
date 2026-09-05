import { produce } from 'immer'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { IAxis } from './axis'

export interface IAxesPlots {
  plotIds: string[]
  plots: Record<string, IPlotAxesGroups>
}

export interface IPlotAxesGroups {
  plotId: string
  groupIds: string[]
  groups: Record<string, IPlotAxes>
}

export interface IPlotAxes {
  plotId: string
  groupId: string
  axisIds: string[]
  axes: Record<string, IAxis>
}

export interface IPlotAddress {
  plotId: string
  groupId: string
  axisId: string
}

interface IPlotAxesContextValue extends IAxesPlots {
  updateAxis: (address: IPlotAddress, patch: Partial<IAxis>) => void

  addAxesPlots: (plots: IPlotAxes[]) => void

  addAxis: (plotId: string, groupId: string, axis: IAxis) => void

  removeAxis: (plotId: string, groupId: string, axisId: string) => void
}

const AxesPlotContext = createContext<IPlotAxesContextValue | null>(null)

const DEFAULT_AXES_PLOTS: IAxesPlots = {
  plotIds: [],
  plots: {},
}

export function AxesPlotProvider({
  plots: initialPlots = [],
  children,
}: {
  plots?: IPlotAxes[]
  children: React.ReactNode
}) {
  const [plots, setPlots] = useState<IAxesPlots>({
    ...DEFAULT_AXES_PLOTS,
  })

  useEffect(() => {
    if (initialPlots && initialPlots.length > 0) {
      const updated = updatePlots(initialPlots, plots)

      console.log(initialPlots)

      setPlots(updated)
    }
  }, [initialPlots])

  const addAxesPlots = useCallback((newPlots: IPlotAxes[]) => {
    setPlots((current) => {
      return updatePlots(newPlots, current)
    })
  }, [])

  const updateAxis = useCallback(
    (address: IPlotAddress, patch: Partial<IAxis>) => {
      setPlots((current) => {
        const { plotId, groupId, axisId } = address

        const plot = current.plots[plotId]

        if (!plot) {
          throw new Error(`Unknown plot: ${plotId}`)
        }

        const groups = plot.groups[groupId]

        if (!groups) {
          throw new Error(`Unknown group: ${groupId} in plot: ${plotId}`)
        }

        const axis = groups.axes[axisId]

        if (!axis) {
          throw new Error(`Unknown axis "${axisId}" in plot "${plotId}"`)
        }

        return produce(current, (draft) => {
          draft.plots[plotId].groups[groupId].axes[axisId] = {
            ...draft.plots[plotId].groups[groupId].axes[axisId],
            ...patch,
          }
        })
      })
    },
    []
  )

  const addAxis = useCallback(
    (plotId: string, groupId: string, axis: IAxis) => {
      setPlots((current) => {
        const plot = current.plots[plotId]

        if (!plot) {
          throw new Error(`Unknown plot: ${plotId}`)
        }

        const groups = plot.groups[groupId]

        if (!groups) {
          throw new Error(`Unknown group: ${groupId} in plot: ${plotId}`)
        }

        return produce(current, (draft) => {
          draft.plots[plotId].groups[groupId].axes[axis.id] = axis
        })
      })
    },
    []
  )

  const removeAxis = useCallback(
    (plotId: string, groupId: string, axisId: string) => {
      setPlots((current) => {
        const plot = current.plots[plotId]

        if (!plot) {
          throw new Error(`Unknown plot: ${plotId}`)
        }

        const groups = plot.groups[groupId]

        if (!groups) {
          throw new Error(`Unknown group: ${groupId} in plot: ${plotId}`)
        }

        const axis = groups.axes[axisId]

        if (!axis) {
          throw new Error(`Unknown axis "${axisId}" in plot "${plotId}"`)
        }

        return produce(current, (draft) => {
          delete draft.plots[plotId].groups[groupId].axes[axisId]
        })
      })
    },
    []
  )

  const value = useMemo(
    () => ({
      plotIds: plots.plotIds,
      plots: plots.plots,
      updateAxis,
      addAxesPlots,
      addAxis,
      removeAxis,
    }),
    [plots, updateAxis, addAxesPlots, addAxis, removeAxis]
  )

  return (
    <AxesPlotContext.Provider value={value}>
      {children}
    </AxesPlotContext.Provider>
  )
}

export function useAxes() {
  const context = useContext(AxesPlotContext)

  if (!context) {
    throw new Error('useAxes must be used inside a AxesPlotProvider')
  }

  return context
}

function updatePlots(newPlots: IPlotAxes[], plots: IAxesPlots) {
  const updated = { ...plots }

  for (const plot of newPlots) {
    if (!updated.plots[plot.plotId]) {
      updated.plots[plot.plotId] = {
        plotId: plot.plotId,
        groupIds: [],
        groups: {},
      }
    }

    if (!updated.plots[plot.plotId].groups[plot.groupId]) {
      updated.plots[plot.plotId].groups[plot.groupId] = {
        plotId: plot.plotId,
        groupId: plot.groupId,
        axisIds: [],
        axes: {},
      }
    }

    if (!updated.plotIds.includes(plot.plotId)) {
      updated.plotIds.push(plot.plotId)
    }

    if (!updated.plots[plot.plotId].groupIds.includes(plot.groupId)) {
      updated.plots[plot.plotId].groupIds.push(plot.groupId)
    }

    for (const axisId of plot.axisIds) {
      if (
        !updated.plots[plot.plotId].groups[plot.groupId].axisIds.includes(
          axisId
        )
      ) {
        updated.plots[plot.plotId].groups[plot.groupId].axisIds.push(axisId)
      }

      updated.plots[plot.plotId].groups[plot.groupId].axes[axisId] =
        plot.axes[axisId]
    }
  }

  return updated
}
