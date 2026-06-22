import { IClusterGroup } from '@/lib/cluster-group'
import { IGeneSet } from '@/lib/gsea/geneset'
import { strOrIdToStr } from './history-actions'
import { useCurrentPlots, useFiles } from './history-contexts'
import { useHistory } from './history-provider'
import { DataFrameType, HistoryPlot, OptStrOrIdObj } from './history-types'

/**
 * Returns the id of a file as a string. if no file is provided
 * returns the current file.
 *
 * @param opts
 * @returns
 */
export function useFileId(opts: { file?: OptStrOrIdObj } = {}): string {
  const { file: currentFile } = useFiles()
  const { file } = opts
  return (typeof file === 'string' ? file : file?.id) || currentFile.id
}

export function useSheets(
  opts: { file?: OptStrOrIdObj } = {}
): DataFrameType[] {
  const fid = useFileId(opts)
  const { present, sheets } = useHistory()

  return (present.sheetOrder[fid] || []).map((id) => sheets[id]!)
}

export function usePlots(opts: { file?: OptStrOrIdObj } = {}): HistoryPlot[] {
  const fid = useFileId(opts)
  const { present, plots } = useHistory()

  return (present.plotOrder[fid] || []).map((id) => plots[id]!)
}

export function usePlot(
  plot: OptStrOrIdObj = undefined
): HistoryPlot | undefined {
  const { plots } = useHistory()
  const { plot: currentPlot } = useCurrentPlots()

  if (!plot) {
    return currentPlot
  }

  const id = strOrIdToStr(plot)

  return plots[id]
}

export function useGroups(
  opts: { file?: OptStrOrIdObj } = {}
): IClusterGroup[] {
  const { present, groups } = useHistory()
  const fid = useFileId(opts)
  return (present.groupOrder[fid] || []).map((id) => groups[id]!)
}

export function useGroupName(opts: { file?: OptStrOrIdObj } = {}): string {
  const { groupNames } = useHistory()
  const fid = useFileId(opts)
  return groupNames[fid] || ''
}

export function useGenesets(opts: { file?: OptStrOrIdObj } = {}): IGeneSet[] {
  const { present, genesets } = useHistory()
  const fid = useFileId(opts)
  return (present.genesetOrder[fid] || []).map((id) => genesets[id]!)
}

export function useAllPlots(): HistoryPlot[] {
  const { present, plots } = useHistory()

  const plotIds = present.fileOrder.flatMap(
    (fileId) => present.plotOrder[fileId] || []
  )

  return plotIds.map((id) => plots[id]!)
}

export function findSheet(
  q: string,
  opts: { file?: OptStrOrIdObj } = {}
): DataFrameType | undefined {
  const fid = useFileId(opts)

  const lid = q.toLowerCase()

  const { present, sheets } = useHistory()
  return (present.sheetOrder[fid] || [])
    .map((id) => sheets[id]!)
    .find((s) => s.id === q || s.name.toLowerCase() === lid)
}
