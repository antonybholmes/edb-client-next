import type { IClusterGroup } from '@/lib/cluster-group'
import { type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import {
  getFormattedShape,
  getFormattedShapeSmall,
} from '@/lib/dataframe/dataframe-utils'
import type { IGeneSet } from '@/lib/gsea/geneset'
import { PATH_SEP } from '@/lib/http/urls'
import { formattedList, UndefNullStr } from '@/lib/text/text'
import { HistoryManager } from '../history-manager'
import { DEFAULT_FILE, DEFAULT_SHEET, init } from './history-init'
import {
  AppendMode,
  FilePath,
  HistoryPath,
  HistoryPlot,
  IGroupOps,
  IHistoryComp,
  IHistoryData,
  IHistoryDataStore,
  IHistoryState,
  ISheetOps,
  PathId,
  StrOrIdObj,
} from './history-types'

export type HistoryAction =
  | { type: 'reset'; app: string }
  | { type: 'init'; app: string }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'seek'; step: number | string }
  | {
      type: 'openFile'
      file: IHistoryComp
      sheets: BaseDataFrame[]
      plots: HistoryPlot[]
      groups: IClusterGroup[]
      genesets: IGeneSet[]
      groupsName: string
      mode: AppendMode
    }
  | { type: 'addSheets'; sheets: BaseDataFrame[]; opts: ISheetOps }
  | { type: 'addPlots'; plots: HistoryPlot[]; opts: ISheetOps }
  | { type: 'remove'; paths: HistoryPath[] }
  | { type: 'removeFiles'; paths: FilePath[] }
  | { type: 'reorderSheets'; ids: string[]; opts: ISheetOps }
  | { type: 'reorderPlots'; ids: string[]; opts: ISheetOps }
  | { type: 'updatePlot'; plot: HistoryPlot }
  | { type: 'addGroups'; groups: IClusterGroup[]; opts: IGroupOps }
  | { type: 'updateGroup'; group: IClusterGroup; opts: IGroupOps }
  | { type: 'removeGroups'; ids: string[]; opts: IGroupOps }
  | { type: 'reorderGroups'; ids: string[]; opts: IGroupOps }
  | { type: 'addGenesets'; genesets: IGeneSet[]; opts: IGroupOps }
  | { type: 'updateGeneset'; geneset: IGeneSet }
  | { type: 'removeGenesets'; ids: string[]; opts: IGroupOps }
  | { type: 'reorderGenesets'; ids: string[]; opts: IGroupOps }
  | { type: 'goto'; path: HistoryPath }

const historyManager = new HistoryManager<IHistoryState>()

export function dataStoreView(state: IHistoryData): IHistoryDataStore {
  return {
    app: state.app,
    files: state.files,
    sheets: state.sheets,
    plots: state.plots,
    groupNames: state.groupNames,
    groups: state.groups,
    genesets: state.genesets,
  }
}

function getPathType(
  path: PathId
): 'file' | 'sheet' | 'plot' | 'group' | 'geneset' {
  if ('group' in path) {
    return 'group'
  } else if ('geneset' in path) {
    return 'geneset'
  } else if ('plot' in path) {
    return 'plot'
  } else if ('sheet' in path) {
    return 'sheet'
  } else {
    return 'file'
  }
}

/**
 * Convert a string or an object with an id property to a string ID.
 * This is useful for functions that can accept either an ID string or an
 * object with an ID, allowing for more flexible input while ensuring
 * that the output is always a consistent string ID.
 *
 * @param strOrId
 * @returns
 */
export function strOrIdToStr(strOrId: StrOrIdObj): string {
  return typeof strOrId === 'string' ? strOrId : strOrId.id
}

export function pathJoin(...parts: ({ id: string } | UndefNullStr)[]): string {
  return (
    '/' +
    parts
      .filter((part) => part !== null && part !== undefined)
      .map((part) => (typeof part === 'string' ? part.trim() : part.id))
      .map((part) => part.split(PATH_SEP))
      .flat() // split parts by path separator to avoid issues with nested paths and flatten the result

      .filter((p, pi) => pi > 0 || p !== '') // remove empty leading
      .join(PATH_SEP)
  )
}

/**
 * Normalizes a path object which contains keys mapping to
 * either strings or objects with id property to a set of
 * (possibly empty) strings for each level of the path.
 *
 * @param path
 * @returns
 */
function toPathId(path: Record<string, StrOrIdObj>): PathId {
  const file = 'file' in path ? strOrIdToStr(path.file) : ''
  const sheet = 'sheet' in path ? strOrIdToStr(path.sheet) : ''
  const plot = 'plot' in path ? strOrIdToStr(path.plot) : ''
  const group = 'group' in path ? strOrIdToStr(path.group) : ''
  const geneset = 'geneset' in path ? strOrIdToStr(path.geneset) : ''

  return { file, sheet, plot, group, geneset }
}

function removeFile(state: IHistoryState, p: PathId) {
  if ((state.fileOrder.length || 0) < 2) {
    return
  }

  state.fileOrder = state.fileOrder.filter((fileId) => fileId !== p.file)

  delete state.sheetOrder[p.file]
  delete state.plotOrder[p.file]
  delete state.groupOrder[p.file]
  delete state.genesetOrder[p.file]

  // select previous sheet/plot

  const lastFile = state.fileOrder[state.fileOrder.length - 1]!

  state.currentFile = lastFile
  const sheets = state.sheetOrder[lastFile]!
  state.currentSheet = sheets[sheets.length - 1]!
  const plots = state.plotOrder[lastFile]!
  state.currentPlot = plots[plots.length - 1]!
  state.currentSelections = [{ type: 'sheet', id: state.currentSheet }]
}

function removeSheet(state: IHistoryState, p: PathId) {
  // cannot remove the first sheet
  //if (p.sheet === state.sheetOrder[p.file]?.[0]) {
  if ((state.sheetOrder[p.file]?.length || 0) < 2) {
    return
  }

  state.sheetOrder[p.file] = state.sheetOrder[p.file]!.filter(
    (id) => id !== p.sheet
  )

  console.log('Removing sheet', p.sheet, 'from file', p.file)

  const sheets = state.sheetOrder[p.file]!
  state.currentSheet = sheets[sheets.length - 1]!
  state.currentSelections = [{ type: 'sheet', id: state.currentSheet }]
}

function removePlot(state: IHistoryState, p: PathId) {
  state.plotOrder[p.file] = state.plotOrder[p.file]!.filter(
    (id) => id !== p.plot
  )

  if (state.plotOrder[p.file]!.length > 0) {
    // if there are still plots left, select the previous one
    const plots = state.plotOrder[p.file]!
    state.currentPlot = plots[plots.length - 1]!
    state.currentSelections = [{ type: 'plot', id: state.currentPlot }]
  } else {
    // otherwise select the last sheet
    const sheets = state.sheetOrder[p.file]!
    state.currentPlot = undefined
    state.currentSheet = sheets[sheets.length - 1]!
    state.currentSelections = [{ type: 'sheet', id: state.currentSheet }]
  }
}

function removeGroup(state: IHistoryState, p: PathId) {
  state.groupOrder[p.file] = state.groupOrder[p.file]!.filter(
    (id) => id !== p.group
  )
}

function removeGeneset(state: IHistoryState, p: PathId) {
  state.genesetOrder[p.file] = state.genesetOrder[p.file]!.filter(
    (id) => id !== p.geneset
  )
}

export function applyHistoryUpdate(
  state: IHistoryData,
  name: string,
  description: string,
  updateHistory: (
    state: IHistoryState,
    store: Readonly<IHistoryDataStore>
  ) => void,
  updateStore?: (store: IHistoryDataStore) => void
): IHistoryData {
  const result = historyManager.applyUpdate(
    state,
    name,
    description,
    (draft: IHistoryState) => {
      updateHistory(draft, dataStoreView(state) as Readonly<IHistoryDataStore>)
    }
  )

  if (result === state) {
    return state
  }

  const newState = {
    ...state,
    ...result,
  }

  if (updateStore) {
    updateStore(dataStoreView(newState))
  }

  return newState
}

function handleOpenFile(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'openFile' }>
): IHistoryData {
  return applyHistoryUpdate(
    state,
    `Open file ${action.file.name}`,
    getFormattedShapeSmall(action.sheets[0]),
    (draft: IHistoryState) => {
      if (action.mode === 'append') {
        const files = draft.fileOrder.filter((id) => id !== DEFAULT_FILE.id)
        draft.fileOrder = [...files, action.file.id]
      } else {
        draft.fileOrder = [action.file.id]
      }

      draft.sheetOrder[action.file.id] = action.sheets.map((s) => s.id)
      draft.plotOrder[action.file.id] = action.plots.map((p) => p.id)
      draft.groupOrder[action.file.id] = action.groups.map((g) => g.id)
      draft.genesetOrder[action.file.id] = action.genesets.map((g) => g.id)

      draft.currentFile = action.file.id
      draft.currentSheet = action.sheets[action.sheets.length - 1]!.id
      draft.currentPlot =
        action.plots.length > 0
          ? action.plots[action.plots.length - 1]!.id
          : draft.currentPlot
      draft.currentSelections = [{ type: 'sheet', id: draft.currentSheet }]
    },
    (store: IHistoryDataStore) => {
      store.files[action.file.id] = action.file
      for (const sheet of action.sheets) {
        store.sheets[sheet.id] = sheet
      }
      for (const plot of action.plots) {
        store.plots[plot.id] = plot
      }
      for (const group of action.groups) {
        store.groups[group.id] = group
      }
      for (const geneset of action.genesets) {
        store.genesets[geneset.id] = geneset
      }
      if (action.groupsName) {
        store.groupNames[action.file.id] = action.groupsName
      }
    }
  )
}

function handleAddSheets(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'addSheets' }>
): IHistoryData {
  const { sheets, opts } = action
  const { name = '', mode = 'set', file = state.present.currentFile } = opts
  if (sheets.length === 0 || file === DEFAULT_FILE.id) {
    return state
  }

  const title =
    name ||
    (sheets.length === 1
      ? `Add sheet ${sheets[0]!.name}`
      : `Add ${sheets.length} sheets`)

  return applyHistoryUpdate(
    state,
    title,
    getFormattedShape(sheets[0]!),
    (draft: IHistoryState) => {
      const ids = sheets.map((s) => s.id)

      if (mode === 'append') {
        const existing = (draft.sheetOrder[file] || []).filter(
          (id) => id !== DEFAULT_SHEET.id
        )
        draft.sheetOrder[file] = [...existing, ...ids]
      } else {
        draft.sheetOrder[file] = ids
      }

      draft.currentSheet = sheets[sheets.length - 1]!.id
      draft.currentSelections = [{ type: 'sheet', id: draft.currentSheet }]
    },
    (store: IHistoryDataStore) => {
      for (const sheet of sheets) {
        store.sheets[sheet.id] = sheet
      }
    }
  )
}

function handleAddPlots(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'addPlots' }>
): IHistoryData {
  const { plots, opts } = action
  const {
    name = '',
    mode = 'append',
    file = state.present.currentFile,
  } = opts || {}
  if (plots.length === 0 || file === DEFAULT_FILE.id) {
    return state
  }

  return applyHistoryUpdate(
    state,
    name ||
      (plots.length === 1
        ? `Add plot ${plots[0]!.name}`
        : `Add ${plots.length} plots`),
    '',
    (draft: IHistoryState) => {
      if (mode === 'append') {
        draft.plotOrder[file]?.push(...plots.map((p) => p.id))
      } else {
        draft.plotOrder[file] = plots.map((p) => p.id)
      }
      draft.currentPlot = plots[plots.length - 1]!.id
      draft.currentSelections = [{ type: 'plot', id: draft.currentPlot }]
    },
    (store: IHistoryDataStore) => {
      for (const plot of plots) {
        store.plots[plot.id] = plot
      }
    }
  )
}

function handleRemove(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'remove' }>
): IHistoryData {
  if (action.paths.length === 0) {
    return state
  }

  const pathIds = action.paths.map(toPathId)
  return applyHistoryUpdate(
    state,
    `Remove objects`,
    '',
    (draft: IHistoryState) => {
      for (const p of pathIds) {
        switch (getPathType(p)) {
          case 'file':
            removeFile(draft, p)
            break
          case 'sheet':
            removeSheet(draft, p)
            break
          case 'plot':
            removePlot(draft, p)
            break
          case 'group':
            removeGroup(draft, p)
            break
          case 'geneset':
            removeGeneset(draft, p)
            break
          default:
            console.warn(`Unknown path type for ${p}`)
            break
        }
      }
    }
  )
}

function handleRemoveFiles(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'removeFiles' }>
): IHistoryData {
  if (action.paths.length === 0) {
    return state
  }

  const pathIds = action.paths.map(toPathId)
  return applyHistoryUpdate(
    state,
    `Remove ${pathIds.length} file${pathIds.length > 1 ? 's' : ''}`,
    '',
    (draft: IHistoryState) => {
      for (const p of pathIds) {
        removeFile(draft, p)
      }
    },
    (store: IHistoryDataStore) => {
      for (const p of pathIds) {
        if (Object.keys(store.files).length > 1) {
          delete store.files[p.file]
        }
      }
    }
  )
}

function handleReorderSheets(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'reorderSheets' }>
): IHistoryData {
  const { ids, opts } = action
  const { file = state.present.currentFile } = opts
  if (ids.length === 0 || file === DEFAULT_FILE.id) {
    return state
  }

  return applyHistoryUpdate(state, 'Reorder sheets', '', (draft) => {
    draft.sheetOrder[file] = ids
  })
}

function handleReorderPlots(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'reorderPlots' }>
): IHistoryData {
  const { ids, opts } = action
  const { file = state.present.currentFile } = opts
  if (ids.length === 0 || file === DEFAULT_FILE.id) {
    return state
  }

  return applyHistoryUpdate(state, 'Reorder plots', '', (draft) => {
    draft.plotOrder[file] = ids
  })
}

function handleUpdatePlot(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'updatePlot' }>
): IHistoryData {
  return {
    ...state,
    plots: {
      ...state.plots,
      [action.plot.id]: action.plot,
    },
  }
}

function handleAddGroups(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'addGroups' }>
): IHistoryData {
  const { groups, opts } = action
  const { mode = 'append', name = '', file = state.present.currentFile } = opts
  if (groups.length === 0 || file === DEFAULT_FILE.id) {
    return state
  }

  return applyHistoryUpdate(
    state,
    `Add ${formattedList(groups.map((gs) => gs.name))} group${
      groups.length > 1 ? 's' : ''
    }`,
    '',
    (draft: IHistoryState) => {
      if (mode === 'append') {
        draft.groupOrder[file]?.push(...groups.map((g) => g.id))
      } else {
        draft.groupOrder[file] = groups.map((g) => g.id)
      }
    },
    (store: IHistoryDataStore) => {
      for (const group of groups) {
        store.groups[group.id] = group
      }
      if (name) {
        store.groupNames[file] = name
      }
    }
  )
}

function handleUpdateGroup(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'updateGroup' }>
): IHistoryData {
  return {
    ...state,
    groups: {
      ...state.groups,
      [action.group.id]: action.group,
    },
  }
}

function handleRemoveGroups(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'removeGroups' }>
): IHistoryData {
  const { ids, opts } = action
  const { file = state.present.currentFile } = opts
  if (ids.length === 0 || file === DEFAULT_FILE.id) {
    return state
  }

  return applyHistoryUpdate(state, 'Remove groups', '', (draft) => {
    draft.groupOrder[file] = draft.groupOrder[file]!.filter(
      (id) => !ids.includes(id)
    )
  })
}

function handleReorderGroups(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'reorderGroups' }>
): IHistoryData {
  const { ids, opts } = action
  const { file = state.present.currentFile } = opts
  if (ids.length === 0 || file === DEFAULT_FILE.id) {
    return state
  }

  return applyHistoryUpdate(state, 'Reorder groups', '', (draft) => {
    draft.groupOrder[file] = ids
  })
}

function handleAddGenesets(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'addGenesets' }>
): IHistoryData {
  const { genesets, opts } = action
  const { mode = 'append', file = state.present.currentFile } = opts
  if (genesets.length === 0 || file === DEFAULT_FILE.id) {
    return state
  }

  return applyHistoryUpdate(
    state,
    `Add ${formattedList(genesets.map((gs) => gs.name))} geneset${
      genesets.length > 1 ? 's' : ''
    }`,
    '',
    (draft: IHistoryState) => {
      if (mode === 'append') {
        draft.genesetOrder[file]?.push(...genesets.map((g) => g.id))
      } else {
        draft.genesetOrder[file] = genesets.map((g) => g.id)
      }
    },
    (store: IHistoryDataStore) => {
      for (const geneset of genesets) {
        store.genesets[geneset.id] = geneset
      }
    }
  )
}

function handleUpdateGeneset(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'updateGeneset' }>
): IHistoryData {
  return {
    ...state,
    genesets: {
      ...state.genesets,
      [action.geneset.id]: action.geneset,
    },
  }
}

function handleRemoveGenesets(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'removeGenesets' }>
): IHistoryData {
  const { ids, opts } = action
  const { file = state.present.currentFile } = opts
  if (ids.length === 0 || file === DEFAULT_FILE.id) {
    return state
  }

  return applyHistoryUpdate(
    state,
    `Remove ${ids.join(', ')} geneset${ids.length > 1 ? 's' : ''}`,
    '',
    (draft: IHistoryState) => {
      draft.genesetOrder[file] = draft.genesetOrder[file]!.filter(
        (id) => !ids.includes(id)
      )
    }
  )
}

function handleReorderGenesets(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'reorderGenesets' }>
): IHistoryData {
  const { ids, opts } = action
  const { file = state.present.currentFile } = opts
  if (ids.length === 0 || file === DEFAULT_FILE.id) {
    return state
  }

  return applyHistoryUpdate(
    state,
    `Reorder ${ids.join(', ')} geneset${ids.length > 1 ? 's' : ''}`,
    '',
    (draft: IHistoryState) => {
      draft.genesetOrder[file] = ids
    }
  )
}

function handleGoto(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'goto' }>
): IHistoryData {
  const { path } = action
  const { file, sheet, plot } = toPathId(path)

  return applyHistoryUpdate(
    state,
    `Goto ${
      Boolean(plot)
        ? `plot ${plot}`
        : Boolean(sheet)
          ? `sheet ${sheet}`
          : `file ${file}`
    }`,
    '',
    (draft: IHistoryState, store: Readonly<IHistoryDataStore>) => {
      if (file in store.files) {
        draft.currentFile = file
      }

      if (sheet in store.sheets) {
        draft.currentSheet = sheet
        draft.currentSelections = [{ type: 'sheet', id: draft.currentSheet }]
      }

      if (plot in store.plots) {
        draft.currentPlot = plot
        draft.currentSelections = [{ type: 'plot', id: draft.currentPlot }]
      }
    }
  )
}

export function historyReducer(
  state: IHistoryData,
  action: HistoryAction
): IHistoryData {
  switch (action.type) {
    case 'reset':
      return init(action.app)
    case 'undo':
      return {
        ...state,
        ...historyManager.undo(state),
      }
    case 'redo':
      return {
        ...state,
        ...historyManager.redo(state),
      }
    case 'seek':
      return {
        ...state,
        ...historyManager.goto(state, action.step),
      }
    case 'openFile':
      return handleOpenFile(state, action)
    case 'addSheets':
      return handleAddSheets(state, action)
    case 'addPlots':
      return handleAddPlots(state, action)
    case 'remove':
      return handleRemove(state, action)
    case 'removeFiles':
      return handleRemoveFiles(state, action)
    case 'reorderSheets':
      return handleReorderSheets(state, action)
    case 'reorderPlots':
      return handleReorderPlots(state, action)
    case 'updatePlot':
      return handleUpdatePlot(state, action)
    case 'addGroups':
      return handleAddGroups(state, action)
    case 'updateGroup':
      return handleUpdateGroup(state, action)
    case 'removeGroups':
      return handleRemoveGroups(state, action)
    case 'reorderGroups':
      return handleReorderGroups(state, action)
    case 'addGenesets':
      return handleAddGenesets(state, action)
    case 'updateGeneset':
      return handleUpdateGeneset(state, action)
    case 'removeGenesets':
      return handleRemoveGenesets(state, action)
    case 'reorderGenesets':
      return handleReorderGenesets(state, action)
    case 'goto':
      return handleGoto(state, action)
    default:
      return state
  }
}
