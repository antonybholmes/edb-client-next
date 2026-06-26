import { IClusterGroup } from '@/lib/cluster-group'

import { IGeneSet } from '@/lib/gsea/geneset'
import { createContext, useContext } from 'react'
import {
  DataFrameType,
  HistoryPlot,
  IHistoryFilesContext,
  ISelectionPath,
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
  //sheet: DataFrameType
  sheets: DataFrameType[]
}

export const SheetsContext = createContext<ISheetsContext | undefined>(
  undefined
)

export function useCurrentSheets(): ISheetsContext {
  const ctx = useContext(SheetsContext)
  if (!ctx) {
    throw new Error('useCurrentSheets must be used within a HistoryProvider')
  }

  return ctx
}

export type IPlotsContext = {
  //plot: HistoryPlot | undefined
  plots: HistoryPlot[]
}

export const PlotsContext = createContext<IPlotsContext | undefined>(undefined)

export function useCurrentPlots(): IPlotsContext {
  const ctx = useContext(PlotsContext)
  if (!ctx) {
    throw new Error('useCurrentPlots must be used within a HistoryProvider')
  }

  return ctx
}

export type IGroupsContext = {
  groups: IClusterGroup[]

  groupsName: string
}

export const GroupsContext = createContext<IGroupsContext | undefined>(
  undefined
)

export function useCurrentGroups(): IGroupsContext {
  const ctx = useContext(GroupsContext)
  if (!ctx) {
    throw new Error('useCurrentGroups must be used within a HistoryProvider')
  }

  return ctx
}

export type IGenesetsContext = {
  genesets: IGeneSet[]
}

export const GenesetsContext = createContext<IGenesetsContext | undefined>(
  undefined
)

export function useCurrentGenesets(): IGenesetsContext {
  const ctx = useContext(GenesetsContext)
  if (!ctx) {
    throw new Error('useCurrentGenesets  must be used within a HistoryProvider')
  }

  return ctx
}

export type ISelectionsContext = {
  selection: ISelectionPath | undefined
  selections: ISelectionPath[]
}

export const SelectionsContext = createContext<ISelectionsContext | undefined>(
  undefined
)

export function useCurrentSelections(): ISelectionsContext {
  const ctx = useContext(SelectionsContext)
  if (!ctx) {
    throw new Error(
      'useCurrentSelections must be used within a HistoryProvider'
    )
  }

  return ctx
}
