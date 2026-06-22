import { IGeneSet } from '@/lib/gsea/geneset'
import {
  DataFrameType,
  HistoryPlot,
  IHistoryComp,
  IHistoryDataStore,
  IHistoryState,
  OptStrOrIdObj,
} from './history-types'

export function getFileId(
  state: IHistoryState,
  opts: { file?: OptStrOrIdObj } = {}
): string {
  const { file } = opts
  return (typeof file === 'string' ? file : file?.id) || state.currentFile
}

export function getFiles(
  store: IHistoryDataStore,
  state: IHistoryState
): IHistoryComp[] {
  return state.fileOrder.map((id) => store.files[id]!)
}

export function getSheets(
  store: IHistoryDataStore,
  state: IHistoryState,
  opts: { file?: OptStrOrIdObj } = {}
): DataFrameType[] {
  const { file } = opts
  const id = getFileId(state, { file })

  return (state.sheetOrder[id] || []).map((id) => store.sheets[id]!)
}

export function getPlots(
  store: IHistoryDataStore,
  state: IHistoryState,
  opts: { file?: OptStrOrIdObj } = {}
): HistoryPlot[] {
  const { file } = opts
  const id = getFileId(state, { file })

  return (state.plotOrder[id] || []).map((id) => store.plots[id]!)
}

/**
 * Returns all plots for a given app by first finding all files in the app and then
 * finding all plots for each file and flattening the result.
 * If no app is given, uses the current app.
 *
 * @param store
 * @param state
 * @param app
 * @returns
 */
export function getAllPlots(
  store: IHistoryDataStore,
  state: IHistoryState,
  opts: { app?: OptStrOrIdObj } = {}
): HistoryPlot[] {
  const { app } = opts

  const plotIds = state.fileOrder.flatMap(
    (fileId) => state.plotOrder[fileId] || []
  )

  return plotIds.map((id) => store.plots[id]!)
}

export function getGenesets(
  store: IHistoryDataStore,
  state: IHistoryState,
  opts: { file?: OptStrOrIdObj } = {}
): IGeneSet[] {
  const { file } = opts
  const id = getFileId(state, { file })

  return (state.genesetOrder[id] || []).map((id) => store.genesets[id]!)
}

export function findSheet(
  store: IHistoryDataStore,
  state: IHistoryState,
  q: string,
  opts: { file?: OptStrOrIdObj } = {}
): DataFrameType | undefined {
  const { file } = opts
  const id = getFileId(state, { file })

  const lid = q.toLowerCase()

  return (state.sheetOrder[id] || [])
    .map((id) => store.sheets[id]!)
    .find((s) => s.id === q || s.name.toLowerCase() === lid)
}
