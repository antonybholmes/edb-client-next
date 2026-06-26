import { enablePatches } from 'immer'

import { IChildrenProps } from '@/interfaces/children-props'
import type { IClusterGroup } from '@/lib/cluster-group'
import { type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import type { IGeneSet } from '@/lib/gsea/geneset'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react'

enablePatches()

import { historyReducer } from './history-actions'
import {
  FilesContext,
  GenesetsContext,
  GroupsContext,
  PlotsContext,
  SelectionsContext,
  SheetsContext,
} from './history-contexts'
import { newHistoryFile } from './history-factories'
import { DEFAULT_SHEET, init } from './history-init'
import {
  FilePath,
  HistoryPath,
  HistoryPlot,
  IFileOps,
  IGroupOps,
  IHistoryStore,
  ISheetOps,
} from './history-types'

export const HISTORY_STEP_TYPE_OPEN = 'open'

export const DEFAULT_APP_NAME = 'Default'

export const DEFAULT_STEP_NAME = 'Load sheet'

const HistoryContext = createContext<IHistoryStore | undefined>(undefined)

export function useHistory() {
  const ctx = useContext(HistoryContext)
  if (!ctx) {
    throw new Error('useHistory must be used within a HistoryProvider')
  }

  return ctx
}

export function HistoryProvider({ children }: IChildrenProps) {
  const [state, dispatch] = useReducer(historyReducer, init())

  const reset = useCallback(() => {
    dispatch({ type: 'reset' })
  }, [dispatch])

  const undo = useCallback(() => {
    dispatch({ type: 'undo' })
  }, [dispatch])

  const redo = useCallback(() => {
    dispatch({ type: 'redo' })
  }, [dispatch])

  const seek = useCallback(
    (step: number | string) => {
      dispatch({ type: 'seek', step })
    },
    [dispatch]
  )

  const openFile = useCallback(
    (name: string, opts: IFileOps = {}) => {
      let {
        sheets = [DEFAULT_SHEET],
        plots = [],
        mode = 'append',
        groupsName = '',
        groups = [],
        genesets = [],
      } = opts

      if (sheets.length === 0) {
        return
      }
      if (!name) {
        name = sheets[0]!.name
      }

      const file = newHistoryFile(name)

      dispatch({
        type: 'openFile',
        file,
        sheets,
        plots,
        groups,
        genesets,
        groupsName,
        mode,
      })
    },
    [dispatch]
  )

  const addSheets = useCallback(
    (sheets: BaseDataFrame[], opts: ISheetOps = {}) => {
      dispatch({ type: 'addSheets', sheets, opts })
    },
    [dispatch]
  )

  const addPlots = useCallback(
    (plots: HistoryPlot[], opts: ISheetOps = {}) => {
      dispatch({ type: 'addPlots', plots, opts })
    },
    [dispatch]
  )

  const remove = useCallback(
    (paths: HistoryPath[]) => {
      dispatch({ type: 'remove', paths })
    },
    [dispatch]
  )

  const removeFiles = useCallback(
    (paths: FilePath[]) => {
      dispatch({ type: 'removeFiles', paths })
    },
    [dispatch]
  )

  const reorderSheets = useCallback(
    (ids: string[], opts: ISheetOps = {}) => {
      dispatch({ type: 'reorderSheets', ids, opts })
    },
    [dispatch]
  )

  const reorderPlots = useCallback(
    (ids: string[], opts: ISheetOps = {}) => {
      dispatch({ type: 'reorderPlots', ids, opts })
    },
    [dispatch]
  )

  const updatePlot = useCallback(
    (plot: HistoryPlot) => {
      dispatch({ type: 'updatePlot', plot })
    },
    [dispatch]
  )

  const addGroups = useCallback(
    (groups: IClusterGroup[], opts: IGroupOps = {}) => {
      dispatch({ type: 'addGroups', groups, opts })
    },
    [dispatch]
  )

  const updateGroup = useCallback(
    (group: IClusterGroup, opts: IGroupOps = {}) => {
      dispatch({ type: 'updateGroup', group, opts })
    },
    [dispatch]
  )

  const removeGroups = useCallback(
    (ids: string[], opts: IGroupOps = {}) => {
      dispatch({ type: 'removeGroups', ids, opts })
    },
    [dispatch]
  )

  const reorderGroups = useCallback(
    (ids: string[], opts: IGroupOps = {}) => {
      dispatch({ type: 'reorderGroups', ids, opts })
    },
    [dispatch]
  )

  const addGenesets = useCallback(
    (genesets: IGeneSet[], opts: IGroupOps = {}) => {
      dispatch({ type: 'addGenesets', genesets, opts })
    },
    [dispatch]
  )

  const updateGeneset = useCallback(
    (geneset: IGeneSet) => {
      dispatch({ type: 'updateGeneset', geneset })
    },
    [dispatch]
  )

  const removeGenesets = useCallback(
    (ids: string[], opts: IGroupOps = {}) => {
      dispatch({ type: 'removeGenesets', ids, opts })
    },
    [dispatch]
  )

  const reorderGenesets = useCallback(
    (ids: string[], opts: IGroupOps = {}) => {
      dispatch({ type: 'reorderGenesets', ids, opts })
    },
    [dispatch]
  )

  const goto = useCallback(
    (path: HistoryPath) => {
      dispatch({ type: 'goto', path })
    },
    [dispatch]
  )

  const filesContextValue = useMemo(
    () => ({
      file: state.files[state.present.currentFile]!,
      files: state.present.fileOrder.map((id) => state.files[id]!),
    }),
    [state.present.currentFile, state.present.fileOrder, state.files]
  )

  const sheetsContextValue = useMemo(
    () => ({
      sheet: state.sheets[state.present.currentSheet]!,
      sheets: state.present.sheetOrder[state.present.currentFile].map(
        (id) => state.sheets[id]!
      ),
    }),
    [
      state.present.currentSheet,
      state.present.sheetOrder,
      state.present.currentFile,
      state.sheets,
    ]
  )

  const plotsContextValue = useMemo(
    () => ({
      plot: state.present.currentPlot
        ? state.plots[state.present.currentPlot]
        : undefined,

      plots: state.present.plotOrder[state.present.currentFile].map(
        (id) => state.plots[id]!
      ),
    }),
    [
      state.present.currentPlot,
      state.present.plotOrder,
      state.present.currentFile,
      state.plots,
    ]
  )

  const groupsContextValue = useMemo(
    () => ({
      groups: (state.present.groupOrder[state.present.currentFile] || []).map(
        (id) => state.groups[id]!
      ),

      groupsName: state.groupNames[state.present.currentFile] || '',
    }),
    [state.present.currentFile, state.present.groupOrder, state.groups]
  )

  const genesetsContextValue = useMemo(
    () => ({
      genesets: (
        state.present.genesetOrder[state.present.currentFile] || []
      ).map((id) => state.genesets[id]!),
    }),
    [state.present.currentFile, state.present.genesetOrder, state.genesets]
  )

  const selectionsContextValue = useMemo(
    () => ({
      selection:
        state.present.currentSelections.length > 0
          ? state.present.currentSelections[0]
          : undefined,
      selections: state.present.currentSelections,
    }),
    [state.present.currentSelections]
  )

  console.log('groups', groupsContextValue)

  const historyContextValue = useMemo(
    () => ({
      ...state,
      reset,
      undo,
      redo,
      seek,
      openFile,
      remove,
      removeFiles,
      addSheets,
      reorderSheets,
      addPlots,
      reorderPlots,
      updatePlot,
      addGroups,
      reorderGroups,
      removeGroups,
      updateGroup,
      addGenesets,
      reorderGenesets,
      removeGenesets,
      updateGeneset,
      goto,
    }),
    [
      state,
      reset,
      undo,
      redo,
      seek,
      openFile,
      remove,
      removeFiles,
      addSheets,
      reorderSheets,
      addPlots,
      reorderPlots,
      updatePlot,
      addGroups,
      reorderGroups,
      removeGroups,
      updateGroup,
      addGenesets,
      reorderGenesets,
      removeGenesets,
      updateGeneset,
      goto,
    ]
  )

  return (
    <FilesContext.Provider value={filesContextValue}>
      <SheetsContext.Provider value={sheetsContextValue}>
        <PlotsContext.Provider value={plotsContextValue}>
          <GroupsContext.Provider value={groupsContextValue}>
            <GenesetsContext.Provider value={genesetsContextValue}>
              <SelectionsContext.Provider value={selectionsContextValue}>
                <HistoryContext.Provider value={historyContextValue}>
                  {children}
                </HistoryContext.Provider>
              </SelectionsContext.Provider>
            </GenesetsContext.Provider>
          </GroupsContext.Provider>
        </PlotsContext.Provider>
      </SheetsContext.Provider>
    </FilesContext.Provider>
  )
}
