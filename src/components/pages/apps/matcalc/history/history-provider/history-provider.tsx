import { enablePatches } from 'immer'

import { IChildrenProps } from '@/interfaces/children-props'
import type { IClusterGroup, IClusterGroupRow } from '@/lib/cluster-group'
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

import { ITextFileOpen } from '@/components/pages/open-files'
import { AxisRecord } from '@/components/plot/axes/axis'
import { historyReducer } from './history-actions'
import {
  AxesContext,
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
  IFileOpts,
  IGroupOps,
  IHistoryStore,
  ISheetOpts,
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
    (name: string, opts: IFileOpts = {}) => {
      let {
        sheets = [DEFAULT_SHEET],
        plots = [],
        mode = 'append',
        //groupsName = '',
        groupRows = [],
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
        groupRows,
        genesets,

        mode,
      })
    },
    [dispatch]
  )

  const addSheets = useCallback(
    (sheets: BaseDataFrame[], opts: ISheetOpts = {}) => {
      dispatch({ type: 'addSheets', sheets, opts })
    },
    [dispatch]
  )

  const addPlots = useCallback(
    (plots: HistoryPlot[], opts: ISheetOpts = {}) => {
      dispatch({ type: 'addPlots', plots, opts })
    },
    [dispatch]
  )

  const updatePlot = useCallback(
    (plot: HistoryPlot, opts: ISheetOpts = {}) => {
      dispatch({ type: 'updatePlot', plot, opts })
    },
    [dispatch]
  )

  const addAxes = useCallback(
    (axes: AxisRecord, opts: ISheetOpts = {}) => {
      dispatch({ type: 'addAxes', axes, opts })
    },
    [dispatch]
  )

  const updateAxes = useCallback(
    (axes: AxisRecord, opts: ISheetOpts = {}) => {
      dispatch({ type: 'updateAxes', axes, opts })
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
    (sheets: BaseDataFrame[], opts: ISheetOpts = {}) => {
      dispatch({ type: 'reorderSheets', sheets, opts })
    },
    [dispatch]
  )

  const addGroups = useCallback(
    (groupRows: IClusterGroupRow[], opts: IGroupOps = {}) => {
      dispatch({ type: 'addGroups', groupRows, opts })
    },
    [dispatch]
  )

  const clearGroups = useCallback(
    (opts: IGroupOps = {}) => {
      dispatch({ type: 'clearGroups', opts })
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

  const openGroupFiles = useCallback(
    (files: ITextFileOpen[], opts: IGroupOps = {}) => {
      dispatch({ type: 'openGroupFiles', files, opts })
    },
    [dispatch]
  )

  const addGenesets = useCallback(
    (genesets: IGeneSet[], opts: IGroupOps = {}) => {
      dispatch({ type: 'addGenesets', genesets, opts })
    },
    [dispatch]
  )

  const clearGenesets = useCallback(
    (opts: IGroupOps = {}) => {
      dispatch({ type: 'clearGenesets', opts })
    },
    [dispatch]
  )

  const updateGeneset = useCallback(
    (geneset: IGeneSet, opts: IGroupOps = {}) => {
      dispatch({ type: 'updateGeneset', geneset, opts })
    },
    [dispatch]
  )

  const removeGenesets = useCallback(
    (ids: string[], opts: IGroupOps = {}) => {
      dispatch({ type: 'removeGenesets', ids, opts })
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
      file:
        state.present.files.filter(
          (f) => f.id === state.present.currentFile
        )[0]! || undefined,
      files: state.present.files,
    }),
    [state.present.currentFile, state.present.files]
  )

  const sheetsContextValue = useMemo(
    () => ({
      sheet:
        state.present.sheets[state.present.currentFile]?.filter(
          (s) => s.id === state.present.currentSheet
        )[0]! || undefined,
      sheets: state.present.sheets[state.present.currentFile] || [],
    }),
    [
      state.present.currentSheet,
      state.present.currentFile,
      state.present.sheets,
    ]
  )

  const plotsContextValue = useMemo(
    () => ({
      plot:
        state.present.plots[state.present.currentFile]?.filter(
          (p) => p.id === state.present.currentPlot
        )[0]! || undefined,
      plots: state.present.plots[state.present.currentFile] || [],
    }),
    [state.present.currentPlot, state.present.currentFile]
  )

  const groupsContextValue = useMemo(() => {
    const groupRows = state.present.groupRows[state.present.currentFile] || []

    const groups = groupRows.map((row) => row.groups).flat()

    return {
      groupRows,
      groups,
    }
  }, [state.present.currentFile, state.present.groupRows])

  const genesetsContextValue = useMemo(
    () => ({
      genesets: state.present.genesets[state.present.currentFile] || [],
    }),
    [state.present.currentFile, state.present.genesets]
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

  const axesContextValue = useMemo(
    () => ({
      axes:
        state.present.currentPlot &&
        state.present.axes[state.present.currentPlot]
          ? state.present.axes[state.present.currentPlot]
          : {},
    }),
    [state.present.currentPlot, state.present.axes]
  )

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
      updatePlot,
      addAxes,
      updateAxes,
      addGroups,
      clearGroups,
      openGroupFiles,
      removeGroups,
      updateGroup,
      addGenesets,
      clearGenesets,
      //reorderGenesets,
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

      updatePlot,
      addGroups,
      //reorderGroups,
      removeGroups,
      updateGroup,
      addGenesets,
      //reorderGenesets,
      removeGenesets,
      updateGeneset,
      goto,
    ]
  )

  return (
    <FilesContext.Provider value={filesContextValue}>
      <SheetsContext.Provider value={sheetsContextValue}>
        <PlotsContext.Provider value={plotsContextValue}>
          <AxesContext.Provider value={axesContextValue}>
            <GroupsContext.Provider value={groupsContextValue}>
              <GenesetsContext.Provider value={genesetsContextValue}>
                <SelectionsContext.Provider value={selectionsContextValue}>
                  <HistoryContext.Provider value={historyContextValue}>
                    {children}
                  </HistoryContext.Provider>
                </SelectionsContext.Provider>
              </GenesetsContext.Provider>
            </GroupsContext.Provider>
          </AxesContext.Provider>
        </PlotsContext.Provider>
      </SheetsContext.Provider>
    </FilesContext.Provider>
  )
}
