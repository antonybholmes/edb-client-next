import { produce } from 'immer'
import { ReactNode, useEffect } from 'react'
import { create } from 'zustand'
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

interface IAxesStore extends IAxesPlots {
  updateAxis: (address: IPlotAddress, patch: Partial<IAxis>) => void
  addAxesPlots: (plots: IPlotAxes[]) => void
  addAxis: (plotId: string, groupId: string, axis: IAxis) => void
  removeAxis: (address: IPlotAddress) => void
}

const DEFAULT_AXES_PLOTS: IAxesPlots = {
  plotIds: [],
  plots: {},
}

export const useAxesStore = create<IAxesStore>((set) => ({
  ...DEFAULT_AXES_PLOTS,

  addAxesPlots: (newPlots) => {
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
  const addAxesPlots = useAxesStore((state) => state.addAxesPlots)
  const updateAxis = useAxesStore((state) => state.updateAxis)
  const addAxis = useAxesStore((state) => state.addAxis)
  const removeAxis = useAxesStore((state) => state.removeAxis)

  return { plots, addAxesPlots, updateAxis, addAxis, removeAxis }
}

function updatePlots(newPlots: IPlotAxes[], current: IAxesPlots): IAxesPlots {
  return produce(current, (draft) => {
    for (const plot of newPlots) {
      if (!draft.plots[plot.plotId]) {
        draft.plots[plot.plotId] = {
          plotId: plot.plotId,
          groupIds: [],
          groups: {},
        }
      }

      const plotGroups = draft.plots[plot.plotId]

      if (!plotGroups.groups[plot.groupId]) {
        plotGroups.groups[plot.groupId] = {
          plotId: plot.plotId,
          groupId: plot.groupId,
          axisIds: [],
          axes: {},
        }
      }

      if (!draft.plotIds.includes(plot.plotId)) {
        draft.plotIds.push(plot.plotId)
      }

      if (!plotGroups.groupIds.includes(plot.groupId)) {
        plotGroups.groupIds.push(plot.groupId)
      }

      const axes = plotGroups.groups[plot.groupId]
      for (const axisId of plot.axisIds) {
        if (!axes.axisIds.includes(axisId)) {
          axes.axisIds.push(axisId)
        }
        axes.axes[axisId] = plot.axes[axisId]
      }
    }
  })
}

export function AxesPlotProvider({
  plots: initialPlots,
  children,
}: {
  plots?: IPlotAxes[]
  children: ReactNode
}) {
  const { addAxesPlots } = useAxes()

  useEffect(() => {
    if (initialPlots !== undefined) {
      addAxesPlots(initialPlots)
    }
  }, [initialPlots, addAxesPlots])

  return children
}
