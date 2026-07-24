// The store is a datastore of files and an undo state

import { IDBEntity } from '@/interfaces/db-entity'
import { DATAFRAME_100x26 } from '@/lib/dataframe/annotation-dataframe'
import { makeUuid } from '@/lib/id'
import { IHistoryEntry } from '../history-manager'
import { IHistoryData, IHistoryDataStore, IHistoryState } from './history-types'

// The history store is initialized with a default file and
// sheet to ensure that there is always a valid current file and sheet,
// which simplifies the logic for other parts of the app that rely on these values.
// The default file and sheet cannot be edited.
export const DEFAULT_FILE: IDBEntity = {
  id: '019f1f0d-87c5-75fd-a25f-3e7dbef278e3',
  name: 'Default File',
  createdAt: '2026-07-01T18:59:41.291Z',
}

export const DEFAULT_SHEET = DATAFRAME_100x26

export function resetStore(): IHistoryDataStore {
  return {
    files: { [DEFAULT_FILE.id]: DEFAULT_FILE },
    sheets: { [DEFAULT_SHEET.id]: DEFAULT_SHEET },
    plots: {},
    //groupRows: {},
    //groupNames: { [DEFAULT_FILE.id]: 'Groups' },
    genesets: {},
  }
}

// that stores IHistoryState snapshots and patches for undo/redo functionality.
export function init(): IHistoryData {
  const id = makeUuid()

  let state: IHistoryState = {
    id,
    name: 'History',
    createdAt: new Date().toISOString(),
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
    version: 0,
  }
}

export function initState(): Omit<IHistoryState, 'id' | 'name' | 'createdAt'> {
  return {
    fileOrder: [DEFAULT_FILE.id],
    sheetOrder: { [DEFAULT_FILE.id]: [DEFAULT_SHEET.id] },
    plotOrder: { [DEFAULT_FILE.id]: [] },
    groupRows: { [DEFAULT_FILE.id]: [] },
    genesetOrder: { [DEFAULT_FILE.id]: [] },

    currentFile: DEFAULT_FILE.id,
    currentSheet: DEFAULT_SHEET.id,
    currentPlot: '',
    currentSelections: [{ type: 'sheet', id: DEFAULT_SHEET.id }],
  }
}
