import { ITextFileOpen } from '@/components/pages/open-files'
import { IDBEntity } from '@/interfaces/db-entity'
import {
  makeNewGroup,
  type IClusterGroup,
  type IClusterGroupRow,
} from '@/lib/cluster-group'
import { randomHexColor } from '@/lib/color/color'
import { type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import {
  getFormattedShape,
  getFormattedShapeSmall,
} from '@/lib/dataframe/dataframe-utils'
import type { IGeneSet } from '@/lib/gsea/geneset'
import { PATH_SEP } from '@/lib/http/urls'
import { makeUuid } from '@/lib/id'
import { textToLines } from '@/lib/text/lines'
import { formattedList, UndefNullStr } from '@/lib/text/text'
import { HistoryManager } from '../history-manager'
import { DEFAULT_FILE, DEFAULT_SHEET, init } from './history-init'
import {
  AppendMode,
  FilePath,
  HistoryPath,
  HistoryPlot,
  IGroupOps,
  IHistoryData,
  IHistoryState,
  ISheetOps,
  PathId,
  StrOrIdObj,
} from './history-types'

export type HistoryAction =
  | { type: 'reset' }
  | { type: 'init' }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'seek'; step: number | string }
  | {
      type: 'openFile'
      file: IDBEntity
      sheets: BaseDataFrame[]
      plots: HistoryPlot[]
      groupRows: IClusterGroupRow[]
      genesets: IGeneSet[]
      //groupsName: string
      mode: AppendMode
    }
  | { type: 'addSheets'; sheets: BaseDataFrame[]; opts: ISheetOps }
  | { type: 'addPlots'; plots: HistoryPlot[]; opts: ISheetOps }
  | { type: 'remove'; paths: HistoryPath[] }
  | { type: 'removeFiles'; paths: FilePath[] }
  | { type: 'reorderSheets'; sheets: BaseDataFrame[]; opts: ISheetOps }
  //| { type: 'reorderPlots'; ids: string[]; opts: ISheetOps }
  | { type: 'updatePlot'; plot: HistoryPlot; opts: ISheetOps }
  | { type: 'addGroups'; groupRows: IClusterGroupRow[]; opts: IGroupOps }
  | { type: 'clearGroups'; opts: IGroupOps }
  | { type: 'updateGroup'; group: IClusterGroup; opts: IGroupOps }
  | { type: 'removeGroups'; ids: string[]; opts: IGroupOps }
  | { type: 'openGroupFiles'; files: ITextFileOpen[]; opts: IGroupOps }
  | { type: 'addGenesets'; genesets: IGeneSet[]; opts: IGroupOps }
  | { type: 'clearGenesets'; opts: IGroupOps }
  | { type: 'updateGeneset'; geneset: IGeneSet; opts: IGroupOps }
  | { type: 'removeGenesets'; ids: string[]; opts: IGroupOps }
  //| { type: 'reorderGenesets'; ids: string[]; opts: IGroupOps }
  | { type: 'goto'; path: HistoryPath }

const historyManager = new HistoryManager<IHistoryState>()

// export function dataStoreView(state: IHistoryData): IHistoryDataStore {
//   return {
//     files: state.files,
//     sheets: state.sheets,
//     //plots: state.plots,
//     //groupNames: state.groupNames,
//     //groups: state.groups,
//     //groupRows: state.groupRows,
//     //genesets: state.genesets,
//   }
// }

function getPathType(
  path: PathId
): 'file' | 'sheet' | 'plot' | 'group' | 'geneset' {
  if (path.geneset) {
    return 'geneset'
  } else if (path.plot) {
    return 'plot'
  } else if (path.group) {
    return 'group'
  } else if (path.sheet) {
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
  // if ((state.fileOrder.length || 0) < 2) {
  //   return
  // }

  state.files = state.files.filter((file) => file.id !== p.file)

  delete state.sheets[p.file]
  delete state.plots[p.file]
  delete state.groupRows[p.file]
  delete state.genesets[p.file]

  if (state.files.length === 0) {
    // if there are no files left, reset to initial state
    state.files = [DEFAULT_FILE]
  }

  // select previous sheet/plot

  const lastFile = state.files[state.files.length - 1]!

  state.currentFile = lastFile
  const sheets = state.sheets[lastFile.id]!
  state.currentSheet = sheets[0]
  //const plots = state.plots[lastFile]!
  //state.currentPlot = plots[0]!
  state.currentSelections = [{ type: 'sheet', id: state.currentSheet.id }]
}

function removeSheet(state: IHistoryState, p: PathId) {
  // cannot remove the first sheet
  //if (p.sheet === state.sheetOrder[p.file]?.[0]) {
  if ((state.sheets[p.file]?.length || 0) < 2) {
    return
  }

  state.sheets[p.file] = state.sheets[p.file]!.filter(
    (sheet) => sheet.id !== p.sheet
  )

  const sheets = state.sheets[p.file]!
  state.currentSheet = sheets[0]!
  state.currentSelections = [{ type: 'sheet', id: state.currentSheet.id }]
}

function removePlot(state: IHistoryState, p: PathId) {
  console.log('Removing plot x:', p, [...state.plots[p.file]])
  state.plots[p.file] = state.plots[p.file]!.filter(
    (plot) => plot.id !== p.plot
  )

  if (state.plots[p.file]!.length > 0) {
    // if there are still plots left, select the previous one
    const plots = state.plots[p.file]!
    state.currentPlot = plots[0]!
    state.currentSelections = [{ type: 'plot', id: state.currentPlot.id }]
  } else {
    // otherwise select the last sheet
    const sheets = state.sheets[p.file]!
    state.currentPlot = undefined
    state.currentSheet = sheets[0]!
    state.currentSelections = [{ type: 'sheet', id: state.currentSheet.id }]

    console.log('Removing plot x3:', p, [...state.plots[p.file]])
  }
}

// function removeStorePlot(store: IHistoryDataStore, p: PathId) {
//   console.log('Removing store plot:', p)
//   delete store.plots[p.plot]
// }

function removeGroup(state: IHistoryState, p: PathId) {
  state.groupRows[p.file] = state.groupRows[p.file]!.map((row) => {
    row.groups = row.groups.filter((g) => g.id !== p.group)
    return row
  })
}

function removeGeneset(state: IHistoryState, p: PathId) {
  state.genesets[p.file] = state.genesets[p.file]!.filter(
    (gs) => gs.id !== p.geneset
  )
}

export function applyHistoryUpdate(
  state: IHistoryData,
  name: string,
  description: string,
  updateHistory: (
    state: IHistoryState
    //store: Readonly<IHistoryDataStore>
  ) => void
  //updateStore?: (store: IHistoryDataStore) => void
): IHistoryData {
  const result = historyManager.applyUpdate(
    state,
    name,
    description,
    (draft: IHistoryState) => {
      updateHistory(draft) //, dataStoreView(state) as Readonly<IHistoryDataStore>)
    }
  )

  if (result === state) {
    return state
  }

  const newState = {
    ...state,
    ...result,
  }

  //if (updateStore) {
  //  updateStore(dataStoreView(newState))
  //}

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
        const files = draft.files.filter((file) => file.id !== DEFAULT_FILE.id)
        draft.files = [...files, action.file]
      } else {
        console.log('Resetting draft for new file')
        draft.sheets = {}
        draft.plots = {}
        draft.groupRows = {}
        draft.genesets = {}
        draft.files = [action.file]
      }

      draft.sheets[action.file.id] = action.sheets
      draft.plots[action.file.id] = action.plots
      draft.groupRows[action.file.id] = action.groupRows //.map((g) => g.id)
      draft.genesets[action.file.id] = action.genesets

      draft.currentFile = action.file
      draft.currentSheet = action.sheets[0]
      draft.currentPlot = action.plots.length > 0 ? action.plots[0]! : undefined
      draft.currentSelections = [{ type: 'sheet', id: action.sheets[0]!.id }]
    }
    // (store: IHistoryDataStore) => {
    //   store.files[action.file.id] = action.file
    //   for (const sheet of action.sheets) {
    //     store.sheets[sheet.id] = sheet
    //   }
    //   // for (const plot of action.plots) {
    //   //   store.plots[plot.id] = plot
    //   // }
    //   // for (const group of action.groups) {
    //   //   store.groups[group.id] = group
    //   // }
    //   // for (const geneset of action.genesets) {
    //   //   //store.genesets[geneset.id] = geneset
    //   // }
    //   // if (action.groupsName) {
    //   //   store.groupNames[action.file.id] = action.groupsName
    //   // }
    // }
  )
}

function handleAddSheets(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'addSheets' }>
): IHistoryData {
  const { sheets, opts } = action
  const { name = '', mode = 'set', file = state.present.currentFile.id } = opts
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
      const ids = sheets

      if (mode === 'append') {
        const existing = (draft.sheets[file] || []).filter(
          (f) => f.id !== DEFAULT_SHEET.id
        )
        draft.sheets[file] = [...existing, ...sheets]
      } else {
        draft.sheets[file] = sheets
      }

      draft.currentSheet = sheets[0]
      draft.currentSelections = [{ type: 'sheet', id: sheets[0]!.id }]
    }
    // (store: IHistoryDataStore) => {
    //   for (const sheet of sheets) {
    //     store.sheets[sheet.id] = sheet
    //   }
    // }
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
    file = state.present.currentFile.id,
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
        draft.plots[file]?.push(...plots)
      } else {
        draft.plots[file] = plots
      }

      draft.currentPlot = plots[0]!
      draft.currentSelections = [{ type: 'plot', id: plots[0]!.id }]
    }
    // (store: IHistoryDataStore) => {
    //   for (const plot of plots) {
    //     store.plots[plot.id] = plot
    //   }
    // }
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

  console.log(
    'Removing paths:',
    pathIds,
    pathIds.map((p) => getPathType(p))
  )

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
    // (draft: IHistoryDataStore) => {
    //   for (const p of pathIds) {
    //     switch (getPathType(p)) {
    //       case 'plot':
    //         removeStorePlot(draft, p)
    //         break

    //       default:
    //         console.warn(`Unknown path type for ${p}`)
    //         break
    //     }
    //   }
    // }
  )
}

function handleRemoveFiles(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'removeFiles' }>
): IHistoryData {
  if (action.paths.length === 0) {
    return state
  }

  console.log('Removing files with paths', action.paths)

  const pathIds = action.paths.map(toPathId)
  return applyHistoryUpdate(
    state,
    `Remove ${pathIds.length} file${pathIds.length > 1 ? 's' : ''}`,
    '',
    (draft: IHistoryState) => {
      for (const p of pathIds) {
        removeFile(draft, p)
      }
    }
    // (store: IHistoryDataStore) => {
    //   for (const p of pathIds) {
    //     if (Object.keys(store.files).length > 1) {
    //       delete store.files[p.file]
    //     }
    //   }
    // }
  )
}

function handleReorderSheets(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'reorderSheets' }>
): IHistoryData {
  const { sheets, opts } = action
  const { file = state.present.currentFile.id } = opts

  // default file cannot be reordered
  if (sheets.length === 0 || file === DEFAULT_FILE.id) {
    return state
  }

  return applyHistoryUpdate(state, 'Reorder sheets', '', (draft) => {
    draft.sheets[file] = sheets
  })
}

// function handleReorderPlots(
//   state: IHistoryData,
//   action: Extract<HistoryAction, { type: 'reorderPlots' }>
// ): IHistoryData {
//   const { ids, opts } = action
//   const { file = state.present.currentFile } = opts

//   // default file cannot be reordered
//   if (ids.length === 0 || file === DEFAULT_FILE.id) {
//     return state
//   }

//   return applyHistoryUpdate(state, 'Reorder plots', '', (draft) => {
//     draft.plotOrder[file] = ids
//   })
// }

// function handleUpdatePlot(
//   state: IHistoryData,
//   action: Extract<HistoryAction, { type: 'updatePlot' }>
// ): IHistoryData {
//   return {
//     ...state,
//     plots: {
//       ...state.plots,
//       [action.plot.id]: action.plot,
//     },
//   }
// }

function handleUpdatePlot(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'updatePlot' }>
): IHistoryData {
  const { plot, opts } = action
  const { file = state.present.currentFile.id } = opts

  return applyHistoryUpdate(
    state,
    'Update group',
    '',
    (draft: IHistoryState) => {
      const filePlots = draft.plots[file] ?? []

      for (let i = 0; i < filePlots.length; i++) {
        if (filePlots![i].id === plot.id) {
          // console.log('Found plot at index', i)
          filePlots![i] = plot
        }
      }
    }
  )
}

function handleAddGroups(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'addGroups' }>
): IHistoryData {
  const { groupRows, opts } = action
  const { file = state.present.currentFile.id, mode = 'set' } = opts

  // cannot add groups to default file and empty groups array does not require update
  if (groupRows.length === 0 || file === DEFAULT_FILE.id) {
    return state
  }

  return applyHistoryUpdate(
    state,
    `Add ${formattedList(groupRows.map((gs) => gs.name))} group${
      groupRows.length > 1 ? 's' : ''
    }`,
    '',
    (draft: IHistoryState) => {
      if (mode === 'append') {
        draft.groupRows[file]?.push(...groupRows)
      } else {
        draft.groupRows[file] = groupRows
      }
    }
    // (store: IHistoryDataStore) => {
    //   for (const group of groupRows) {
    //     store.groups[group.id] = group
    //   }
    //   if (name) {
    //     store.groupNames[file] = name
    //   }
    // }
  )
}

function handleClearGroups(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'clearGroups' }>
): IHistoryData {
  const { opts } = action
  const { file = state.present.currentFile.id } = opts

  // cannot add groups to default file and empty groups array does not require update
  if (file === DEFAULT_FILE.id) {
    return state
  }

  return applyHistoryUpdate(
    state,
    'Clear groups',
    '',
    (draft: IHistoryState) => {
      draft.groupRows[file] = []
    }
  )
}

function handleOpenGroupFiles(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'openGroupFiles' }>
) {
  const { files, opts } = action
  const { file = state.present.currentFile.id } = opts

  const groupRows: IClusterGroupRow[] = openGroupFiles(files)

  if (groupRows.length === 0) {
    return state
  }

  return applyHistoryUpdate(
    state,
    'Clear groups',
    '',
    (draft: IHistoryState) => {
      draft.groupRows[file] = groupRows
    }
  )
}

export function openGroupFiles(files: ITextFileOpen[]): IClusterGroupRow[] {
  if (files.length === 0) {
    return []
  }

  const f0 = files[0]!

  let groupRows: IClusterGroupRow[] = []

  if (f0.ext === 'json') {
    const g = JSON.parse(f0.text)

    // v1
    if (Array.isArray(g)) {
      groupRows = g
    } else {
      console.log(g)
      // v2 for storing group rows
      groupRows = g.groupRows
    }
  } else {
    // open cls
    const lines = textToLines(f0.text)

    if (lines.length < 3) {
      return
    }

    const names = lines[1]?.split(' ').slice(1)

    if (!names) {
      return
    }

    // store lowercase for case insensitive searching
    const columnNames = lines[2]?.split(/[ \t]/).map((x) => x.toLowerCase())

    if (!columnNames) {
      return
    }

    const groups: IClusterGroup[] = []

    for (const name of names) {
      groups.push(
        makeNewGroup({
          name,
          search: [name.toLowerCase()],
          color: randomHexColor(),
          columnNames,
        })
      )
    }

    groupRows = [{ id: makeUuid(), name: 'Groups', groups }]
  }

  return groupRows
}

function handleUpdateGroup(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'updateGroup' }>
): IHistoryData {
  const { group, opts } = action
  const { file = state.present.currentFile.id } = opts

  return applyHistoryUpdate(
    state,
    'Update group',
    '',
    (draft: IHistoryState) => {
      for (let gr of draft.groupRows[file] ?? []) {
        for (let i = 0; i < gr.groups.length; i++) {
          if (gr.groups[i].id === group.id) {
            gr.groups[i] = group
          }
        }
      }
    }
  )
}

function handleRemoveGroups(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'removeGroups' }>
): IHistoryData {
  const { ids, opts } = action
  const { file = state.present.currentFile.id } = opts
  // cannot remove groups from default file and empty ids array does not require update
  if (ids.length === 0 || file === DEFAULT_FILE.id) {
    return state
  }

  return applyHistoryUpdate(state, 'Remove groups', '', (draft) => {
    // remove group rows matching these ids
    draft.groupRows[file] = draft.groupRows[file]?.filter(
      (gr) => !ids.includes(gr.id)
    )

    // remove any groups matching the ids
    for (let gr of draft.groupRows[file] ?? []) {
      gr.groups = gr.groups.filter((g) => !ids.includes(g.id))
    }
  })
}

// function handleReorderGroups(
//   state: IHistoryData,
//   action: Extract<HistoryAction, { type: 'reorderGroups' }>
// ): IHistoryData {
//   const { ids, opts } = action
//   const { file = state.present.currentFile } = opts

//   // default file cannot be reordered
//   if (ids.length === 0 || file === DEFAULT_FILE.id) {
//     return state
//   }

//   return applyHistoryUpdate(state, 'Reorder groups', '', (draft) => {
//     draft.groupOrder[file] = ids
//   })
// }

function handleAddGenesets(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'addGenesets' }>
): IHistoryData {
  const { genesets, opts } = action
  const { mode = 'set', file = state.present.currentFile.id } = opts

  // cannot add genesets to default file and empty genesets array does not require update
  if (file === DEFAULT_FILE.id) {
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
        draft.genesets[file]?.push(...genesets)
      } else {
        draft.genesets[file] = genesets
      }
    }
    // (store: IHistoryDataStore) => {
    //   for (const geneset of genesets) {
    //     store.genesets[geneset.id] = geneset
    //   }
    // }
  )
}

function handleUpdateGeneset(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'updateGeneset' }>
): IHistoryData {
  const { geneset, opts } = action
  const { file = state.present.currentFile.id } = opts

  return applyHistoryUpdate(
    state,
    'Update geneset',
    '',
    (draft: IHistoryState) => {
      // update geneset at specific index in the genesets array for the current file
      const index = draft.genesets[file]?.findIndex(
        (gs) => gs.id === geneset.id
      )

      if (index !== undefined && index !== -1) {
        draft.genesets[file]![index] = geneset
      }
    }
  )

  // return {
  //   ...state,
  //   genesets: {
  //     ...state.genesets,
  //     [action.geneset.id]: action.geneset,
  //   },
  // }
}

function handleClearGenesets(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'clearGenesets' }>
): IHistoryData {
  const { opts } = action
  const { file = state.present.currentFile.id } = opts

  // cannot add genesets to default file and empty genesets array does not require update
  if (file === DEFAULT_FILE.id) {
    return state
  }

  return applyHistoryUpdate(
    state,
    'Clear genesets',
    '',
    (draft: IHistoryState) => {
      draft.genesets[file] = []
    }
  )
}

function handleRemoveGenesets(
  state: IHistoryData,
  action: Extract<HistoryAction, { type: 'removeGenesets' }>
): IHistoryData {
  const { ids, opts } = action
  const { file = state.present.currentFile.id } = opts
  // cannot remove genesets from default file and empty ids array does not require update
  if (ids.length === 0 || file === DEFAULT_FILE.id) {
    return state
  }

  return applyHistoryUpdate(
    state,
    `Remove ${ids.join(', ')} geneset${ids.length > 1 ? 's' : ''}`,
    '',
    (draft: IHistoryState) => {
      draft.genesets[file] = draft.genesets[file]!.filter(
        (gs) => !ids.includes(gs.id)
      )
    }
  )
}

// function handleReorderGenesets(
//   state: IHistoryData,
//   action: Extract<HistoryAction, { type: 'reorderGenesets' }>
// ): IHistoryData {
//   const { ids, opts } = action
//   const { file = state.present.currentFile } = opts
//   // default file cannot be reordered and empty ids array does not require update
//   if (ids.length === 0 || file === DEFAULT_FILE.id) {
//     return state
//   }

//   return applyHistoryUpdate(
//     state,
//     `Reorder ${ids.join(', ')} geneset${ids.length > 1 ? 's' : ''}`,
//     '',
//     (draft: IHistoryState) => {
//       draft.genesetOrder[file] = ids
//     }
//   )
// }

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
    (draft: IHistoryState) => {
      if (draft.files.some((f) => f.id === file)) {
        draft.currentFile = draft.files.find((f) => f.id === file)!
      }

      if (plot) {
        if (draft.plots[file].some((p) => p.id === plot)) {
          draft.currentPlot = draft.plots[file].filter((p) => p.id === plot)[0]
          draft.currentSelections = [{ type: 'plot', id: plot }]
        }
      } else {
        if (draft.sheets[file]?.some((s) => s.id === sheet)) {
          draft.currentSheet = draft.sheets[file].filter(
            (s) => s.id === sheet
          )[0]
          draft.currentSelections = [{ type: 'sheet', id: sheet }]
        }
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
      return init()
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
    //case 'reorderSheets':
    //  return handleReorderSheets(state, action)
    //case 'reorderPlots':
    //  return handleReorderPlots(state, action)
    case 'updatePlot':
      return handleUpdatePlot(state, action)
    case 'addGroups':
      return handleAddGroups(state, action)
    case 'updateGroup':
      return handleUpdateGroup(state, action)
    case 'clearGroups':
      return handleClearGroups(state, action)
    case 'openGroupFiles':
      return handleOpenGroupFiles(state, action)
    case 'removeGroups':
      return handleRemoveGroups(state, action)
    //case 'reorderGroups':
    //  return handleReorderGroups(state, action)
    case 'addGenesets':
      return handleAddGenesets(state, action)
    case 'clearGenesets':
      return handleClearGenesets(state, action)
    case 'updateGeneset':
      return handleUpdateGeneset(state, action)
    case 'removeGenesets':
      return handleRemoveGenesets(state, action)
    //case 'reorderGenesets':
    //  return handleReorderGenesets(state, action)
    case 'goto':
      return handleGoto(state, action)
    default:
      return state
  }
}
