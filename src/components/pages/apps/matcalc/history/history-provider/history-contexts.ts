import { IClusterGroup } from '@/lib/cluster-group'
import { createContext, useContext } from 'react'
import {
  DataFrameType,
  HistoryPlot,
  IHistoryFilesContext,
} from './history-types'

export const FilesContext = createContext<IHistoryFilesContext | undefined>(
  undefined
)

export function useFiles(): IHistoryFilesContext {
  const ctx = useContext(FilesContext)
  if (!ctx) {
    throw new Error('useFiles must be used within a HistoryProvider')
  }

  return ctx
}

type ISheetsContext = {
  sheet: DataFrameType
  sheets: DataFrameType[]
}

export const SheetsContext = createContext<ISheetsContext | undefined>(
  undefined
)

export function useSheets(): ISheetsContext {
  const ctx = useContext(SheetsContext)
  if (!ctx) {
    throw new Error('useSheets must be used within a HistoryProvider')
  }

  return ctx
}

export type IPlotsContext = {
  plot: HistoryPlot | undefined
  plots: HistoryPlot[]
}

export const PlotsContext = createContext<IPlotsContext | undefined>(undefined)

export function usePlots(): IPlotsContext {
  const ctx = useContext(PlotsContext)
  if (!ctx) {
    throw new Error('usePlots must be used within a HistoryProvider')
  }

  return ctx
}

export type IGroupsContext = {
  groups: IClusterGroup[]
}

export const GroupsContext = createContext<IGroupsContext | undefined>(
  undefined
)

export function useGroups(): IGroupsContext {
  const ctx = useContext(GroupsContext)
  if (!ctx) {
    throw new Error('useGroups must be used within a HistoryProvider')
  }

  return ctx
}
