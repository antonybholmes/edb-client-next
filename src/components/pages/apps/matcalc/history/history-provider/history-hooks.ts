import { IClusterGroup } from '@/lib/cluster-group'
import { IGeneSet } from '@/lib/gsea/geneset'
import { strOrIdToStr } from './history-actions'
import { useHistory } from './history-provider'
import {
  DataFrameType,
  HistoryPlot,
  IHistoryState,
  OptStrOrIdObj,
} from './history-types'

export function useAllPlots(): HistoryPlot[] {
  const { present, plots } = useHistory()

  const plotIds = present.fileOrder.flatMap(
    (fileId) => present.plotOrder[fileId] || []
  )

  return plotIds.map((id) => plots[id]!)
}

/**
 * Returns the id of a file as a string. if no file is provided
 * returns the current file.
 *
 * @param opts
 * @returns
 */
export function getFileId(
  present: IHistoryState,
  opts: { file?: OptStrOrIdObj } = {}
): string {
  const { file } = opts
  return (typeof file === 'string' ? file : file?.id) || present.currentFile
}

export function getSheets(
  present: IHistoryState,
  sheets: Record<string, DataFrameType>,
  opts: { file?: OptStrOrIdObj } = {}
): DataFrameType[] {
  const fid = getFileId(present, opts)

  return (present.sheetOrder[fid] || []).map((id) => sheets[id]!)
}

export function getPlots(
  present: IHistoryState,
  plots: Record<string, HistoryPlot>,
  opts: { file?: OptStrOrIdObj } = {}
): HistoryPlot[] {
  const fid = getFileId(present, opts)

  return (present.plotOrder[fid] || []).map((id) => plots[id]!)
}

export function getPlot(
  present: IHistoryState,
  plots: Record<string, HistoryPlot>,
  plot: OptStrOrIdObj = undefined
): HistoryPlot | undefined {
  if (!plot) {
    return plots[present.currentPlot!]
  }

  const id = strOrIdToStr(plot)

  return plots[id]
}

export function getGroups(
  present: IHistoryState,
  groups: Record<string, IClusterGroup>,
  opts: { file?: OptStrOrIdObj } = {}
): IClusterGroup[] {
  const fid = getFileId(present, opts)
  return (present.groupOrder[fid] || []).map((id) => groups[id]!)
}

export function getGroupsName(
  present: IHistoryState,
  groupNames: Record<string, string>,
  opts: { file?: OptStrOrIdObj } = {}
): string {
  const fid = getFileId(present, opts)
  return groupNames[fid] || ''
}

export function getGenesets(
  present: IHistoryState,
  genesets: Record<string, IGeneSet>,
  opts: { file?: OptStrOrIdObj } = {}
): IGeneSet[] {
  const fid = getFileId(present, opts)
  return (present.genesetOrder[fid] || []).map((id) => genesets[id]!)
}

export function findSheet(
  present: IHistoryState,
  sheets: Record<string, DataFrameType>,
  q: string,
  opts: { file?: OptStrOrIdObj } = {}
): DataFrameType | undefined {
  const fid = getFileId(present, opts)

  const lid = q.toLowerCase()

  return (present.sheetOrder[fid] || [])
    .map((id) => sheets[id]!)
    .find((s) => s.id === q || s.name.toLowerCase() === lid)
}
