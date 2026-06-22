import { enablePatches } from 'immer'

import { IChildrenProps } from '@/interfaces/children-props'
import type { IClusterGroup } from '@/lib/cluster-group'
import { type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import type { IGeneSet } from '@/lib/gsea/geneset'
import { createContext, useContext, useMemo, useReducer } from 'react'

enablePatches()

import { historyReducer } from './history-actions'
import {
  FilesContext,
  GroupsContext,
  PlotsContext,
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

// function createDefaultSheet(): BaseDataFrame {
//   return create100x26Df()
// }

// function resetState(
//   state: IHistoryState
// ): Omit<IHistoryState, 'id' | 'name' | 'createdAt'> {
//   const defaultSheet = state.sheetOrder[DEFAULT_FILE.id]![0]!

//   return {
//     fileOrder: [DEFAULT_FILE.id],
//     sheetOrder: { [DEFAULT_FILE.id]: [defaultSheet] },
//     plotOrder: { [DEFAULT_FILE.id]: [] },
//     groupOrder: { [DEFAULT_FILE.id]: [] },
//     genesetOrder: { [DEFAULT_FILE.id]: [] },
//     currentFile: DEFAULT_FILE.id,
//     currentSheet: defaultSheet,
//     currentPlot: '',
//     currentSelections: [{ type: 'sheet', id: defaultSheet }],
//   }
// }

// const DEFAULT_HISTORY_STORE: IHistoryDataStore = {
//   apps: { [DEFAULT_APP.id]: DEFAULT_APP },
//   files: { [DEFAULT_FILE.id]: DEFAULT_FILE },
//   sheets: { [DEFAULT_SHEET.id]: DEFAULT_SHEET },
//   plots: {},
//   groups: {},
//   groupNames: { [DEFAULT_FILE.id]: 'Groups' },
//   genesets: {},
// }

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

  function reset() {
    dispatch({ type: 'reset' })
  }

  function undo() {
    dispatch({ type: 'undo' })
  }

  function redo() {
    dispatch({ type: 'redo' })
  }

  function seek(step: number | string) {
    dispatch({ type: 'seek', step })
  }

  function openFile(name: string, opts: IFileOps = {}) {
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
  }

  function addSheets(sheets: BaseDataFrame[], opts: ISheetOps = {}) {
    dispatch({ type: 'addSheets', sheets, opts })
  }

  function addPlots(plots: HistoryPlot[], opts: ISheetOps = {}) {
    dispatch({ type: 'addPlots', plots, opts })
  }

  function remove(paths: HistoryPath[]) {
    dispatch({ type: 'remove', paths })
  }

  function removeFiles(paths: FilePath[]) {
    dispatch({ type: 'removeFiles', paths })
  }

  function reorderSheets(ids: string[], opts: ISheetOps = {}) {
    dispatch({ type: 'reorderSheets', ids, opts })
  }

  function reorderPlots(ids: string[], opts: ISheetOps = {}) {
    dispatch({ type: 'reorderPlots', ids, opts })
  }

  function updatePlot(plot: HistoryPlot) {
    dispatch({ type: 'updatePlot', plot })
  }

  function addGroups(groups: IClusterGroup[], opts: IGroupOps = {}) {
    dispatch({ type: 'addGroups', groups, opts })
  }

  function updateGroup(group: IClusterGroup, opts: IGroupOps = {}) {
    dispatch({ type: 'updateGroup', group, opts })
  }

  function removeGroups(ids: string[], opts: IGroupOps = {}) {
    dispatch({ type: 'removeGroups', ids, opts })
  }

  function reorderGroups(ids: string[], opts: IGroupOps = {}) {
    dispatch({ type: 'reorderGroups', ids, opts })
  }

  function addGenesets(genesets: IGeneSet[], opts: IGroupOps = {}) {
    dispatch({ type: 'addGenesets', genesets, opts })
  }

  function updateGeneset(geneset: IGeneSet) {
    dispatch({ type: 'updateGeneset', geneset })
  }

  function removeGenesets(ids: string[], opts: IGroupOps = {}) {
    dispatch({ type: 'removeGenesets', ids, opts })
  }

  function reorderGenesets(ids: string[], opts: IGroupOps = {}) {
    dispatch({ type: 'reorderGenesets', ids, opts })
  }

  function goto(path: HistoryPath) {
    dispatch({ type: 'goto', path })
  }

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

      plots: state.present.currentPlot
        ? state.present.plotOrder[state.present.currentFile].map(
            (id) => state.plots[id]!
          )
        : [],
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
    }),
    [state.present.currentFile, state.present.groupOrder, state.groups]
  )

  return (
    <FilesContext.Provider value={filesContextValue}>
      <SheetsContext.Provider value={sheetsContextValue}>
        <PlotsContext.Provider value={plotsContextValue}>
          <GroupsContext.Provider value={groupsContextValue}>
            <HistoryContext.Provider
              value={{
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
              }}
            >
              {children}
            </HistoryContext.Provider>
          </GroupsContext.Provider>
        </PlotsContext.Provider>
      </SheetsContext.Provider>
    </FilesContext.Provider>
  )
}
