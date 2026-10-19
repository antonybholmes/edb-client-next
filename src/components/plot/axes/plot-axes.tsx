import { produce } from 'immer'
import { ReactNode, useCallback, useEffect } from 'react'
import { create } from 'zustand'
import { IAxis } from './axis'

export interface IPlotsAxes {
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

/**
 * Represents the address of a specific axis within a plot and group.
 * An axis belongs to a group of axes which belong to a specific plot.
 * Ids should be unique but do not have to be uuids themselves to make
 * design easier.
 */
export interface IPlotAddress {
  plotId: string
  groupId: string
  axisId: string
}

interface IAxesStore extends IPlotsAxes {
  updateAxis: (address: IPlotAddress, patch: Partial<IAxis>) => void
  addAxes: (plots: IPlotAxes[]) => void
  addAxis: (plotId: string, groupId: string, axis: IAxis) => void
  removeAxis: (address: IPlotAddress) => void
}

const DEFAULT_AXES_PLOTS: IPlotsAxes = {
  plotIds: [],
  plots: {},
}

export const useAxesStore = create<IAxesStore>((set) => ({
  ...DEFAULT_AXES_PLOTS,

  addAxes: (newPlots) => {
    set((current) => updatePlots(newPlots, current))
  },

  updateAxis: (address: IPlotAddress, patch) => {
    const { plotId, groupId, axisId } = address

    set((current) => {
      const group = current.plots[plotId]?.groups[groupId]

      if (!current.plots[plotId]) {
        throw new Error(`Unknown plot: ${plotId}`)
      }

      if (!group) {
        throw new Error(`Unknown group: ${groupId} in plot: ${plotId}`)
      }

      if (!group.axes[axisId]) {
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

  addAxis: (plotId, groupId, axis) => {
    set((current) => {
      const group = current.plots[plotId]?.groups[groupId]

      if (!current.plots[plotId]) {
        throw new Error(`Unknown plot: ${plotId}`)
      }

      if (!group) {
        throw new Error(`Unknown group: ${groupId} in plot: ${plotId}`)
      }

      return produce(current, (draft) => {
        const axes = draft.plots[plotId].groups[groupId]
        if (!axes.axisIds.includes(axis.id)) {
          axes.axisIds.push(axis.id)
        }
        axes.axes[axis.id] = axis
      })
    })
  },

  removeAxis: (address: IPlotAddress) => {
    const { plotId, groupId, axisId } = address
    set((current) => {
      const group = current.plots[plotId]?.groups[groupId]

      if (!current.plots[plotId]) {
        throw new Error(`Unknown plot: ${plotId}`)
      }

      if (!group) {
        throw new Error(`Unknown group: ${groupId} in plot: ${plotId}`)
      }

      if (!group.axes[axisId]) {
        throw new Error(`Unknown axis "${axisId}" in plot "${plotId}"`)
      }

      return produce(current, (draft) => {
        const axes = draft.plots[plotId].groups[groupId]
        axes.axisIds = axes.axisIds.filter((id) => id !== axisId)
        delete axes.axes[axisId]
      })
    })
  },
}))

export function useAxes() {
  const plots = useAxesStore((state) => state.plots)
  const addAxes = useAxesStore((state) => state.addAxes)
  const updateAxis = useAxesStore((state) => state.updateAxis)
  const addAxis = useAxesStore((state) => state.addAxis)
  const removeAxis = useAxesStore((state) => state.removeAxis)

  return { plots, addAxes, updateAxis, addAxis, removeAxis }
}

export function useAxesPlot(plotId: string) {
  return useAxesStore((state) => state.plots[plotId])
}

export function useAxesGroup(plotId: string, groupId: string) {
  return useAxesStore((state) => state.plots[plotId]?.groups[groupId])
}

export function useAxis(address: IPlotAddress): {
  axis: IAxis | undefined
  updateAxis: (patch: Partial<IAxis>) => void
} {
  const updateAxis = useAxesStore((state) => state.updateAxis)

  const { plotId, groupId, axisId } = address

  const axis = useAxesStore(
    (state) => state.plots[plotId]?.groups[groupId]?.axes[axisId]
  )

  const _updateAxis = useCallback(
    (patch: Partial<IAxis>) => {
      updateAxis({ plotId, groupId, axisId }, patch)
    },
    [plotId, groupId, axisId, updateAxis]
  )

  return { axis, updateAxis: _updateAxis }
}

function updatePlots(axes: IPlotAxes[], current: IPlotsAxes): IPlotsAxes {
  return produce(current, (draft) => {
    for (const axis of axes) {
      if (!draft.plots[axis.plotId]) {
        draft.plots[axis.plotId] = {
          plotId: axis.plotId,
          groupIds: [],
          groups: {},
        }
      }

      const plotGroups = draft.plots[axis.plotId]

      if (!plotGroups.groups[axis.groupId]) {
        plotGroups.groups[axis.groupId] = {
          plotId: axis.plotId,
          groupId: axis.groupId,
          axisIds: [],
          axes: {},
        }
      }

      if (!draft.plotIds.includes(axis.plotId)) {
        draft.plotIds.push(axis.plotId)
      }

      if (!plotGroups.groupIds.includes(axis.groupId)) {
        plotGroups.groupIds.push(axis.groupId)
      }

      const axes = plotGroups.groups[axis.groupId]
      for (const axisId of axis.axisIds) {
        if (!axes.axisIds.includes(axisId)) {
          axes.axisIds.push(axisId)
        }
        axes.axes[axisId] = axis.axes[axisId]
      }
    }
  })
}

export function PlotAxesProvider({
  plots: initialPlots,
  children,
}: {
  plots?: IPlotAxes[]
  children: ReactNode
}) {
  const { addAxes } = useAxes()

  useEffect(() => {
    if (initialPlots !== undefined) {
      addAxes(initialPlots)
    }
  }, [initialPlots, addAxes])

  return children
}
