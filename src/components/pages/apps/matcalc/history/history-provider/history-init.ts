// The store is a datastore of files and an undo state

import { DATAFRAME_100x26 } from '@/lib/dataframe/annotation-dataframe'
import { makeUuid } from '@/lib/id'
import { IHistoryEntry } from '../history-manager'
import { newHistoryFile } from './history-factories'
import { IHistoryData, IHistoryDataStore, IHistoryState } from './history-types'

export const DEFAULT_FILE = newHistoryFile('Default')
export const DEFAULT_SHEET = DATAFRAME_100x26

export function resetStore(): IHistoryDataStore {
  return {
    files: { [DEFAULT_FILE.id]: DEFAULT_FILE },
    sheets: { [DEFAULT_SHEET.id]: DEFAULT_SHEET },
    plots: {},
    groups: {},
    groupNames: { [DEFAULT_FILE.id]: 'Groups' },
    genesets: {},
  }
}

// that stores IHistoryState snapshots and patches for undo/redo functionality.
export function init(): IHistoryData {
  const id = makeUuid()

  let state: IHistoryState = {
    id,
    name: 'History',
    createdAt: Date.now(),
    ...initState(),
  }

  const historyEntry: IHistoryEntry<IHistoryState> = {
    id: makeUuid(),
    name: 'Initialize history',
    description: '',
    createdAt: Date.now(),
    state,
    type: 'snapshot',
  }

  return {
    ...resetStore(),

    present: state,
    history: [historyEntry],
    cursor: 0,
  }
}

export function initState(): Omit<IHistoryState, 'id' | 'name' | 'createdAt'> {
  return {
    fileOrder: [DEFAULT_FILE.id],
    sheetOrder: { [DEFAULT_FILE.id]: [DEFAULT_SHEET.id] },
    plotOrder: { [DEFAULT_FILE.id]: [] },
    groupOrder: { [DEFAULT_FILE.id]: [] },
    genesetOrder: { [DEFAULT_FILE.id]: [] },

    currentFile: DEFAULT_FILE.id,
    //currentSheet: DEFAULT_SHEET.id,
    //currentPlot: '',
    currentSelections: [{ type: 'sheet', id: DEFAULT_SHEET.id }],
  }
}
