import { IClusterGroup, IClusterGroupRow } from '@/lib/cluster-group'
import { IGeneSet } from '@/lib/gsea/geneset'
import { useHistory } from './history-provider'
import {
  DataFrameType,
  HistoryPlot,
  IHistoryState,
  OptStrOrIdObj,
} from './history-types'

export function useAllPlots(): HistoryPlot[] {
  const { present } = useHistory()

  const plots = present.files.flatMap((file) => present.plots[file.id] || [])

  return plots
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
  opts: { file?: OptStrOrIdObj } = {}
): DataFrameType[] {
  const fid = getFileId(present, opts)

  return present.sheets[fid] || []
}

export function getPlots(
  present: IHistoryState,
  opts: { file?: OptStrOrIdObj } = {}
): HistoryPlot[] {
  const fid = getFileId(present, opts)

  //console.log('Getting plots for file ID:', fid)

  return present.plots[fid] || []
}

// export function getPlot(
//   present: IHistoryState,
//   plots: Record<string, HistoryPlot>,
//   plot: OptStrOrIdObj = undefined
// ): HistoryPlot | undefined {
//   if (!plot) {
//     return plots[present.currentPlot!]
//   }

//   const id = strOrIdToStr(plot)

//   return plots[id]
// }

export function getGroups(
  present: IHistoryState,
  opts: { file?: OptStrOrIdObj } = {}
): IClusterGroup[] {
  const fid = getFileId(present, opts)
  return (present.groupRows[fid] || []).flatMap((row) => row.groups)
}

export function getGroupRows(
  present: IHistoryState,
  opts: { file?: OptStrOrIdObj } = {}
): IClusterGroupRow[] {
  const fid = getFileId(present, opts)
  return present.groupRows[fid] || []
}

// export function getGroupsName(
//   present: IHistoryState,
//   groupNames: Record<string, string>,
//   opts: { file?: OptStrOrIdObj } = {}
// ): string {
//   const fid = getFileId(present, opts)
//   return groupNames[fid] || ''
// }

export function getGenesets(
  present: IHistoryState,
  opts: { file?: OptStrOrIdObj } = {}
): IGeneSet[] {
  const fid = getFileId(present, opts)
  return present.genesets[fid] || []
}

export function findSheet(
  present: IHistoryState,
  q: string,
  opts: { file?: OptStrOrIdObj } = {}
): DataFrameType | undefined {
  const fid = getFileId(present, opts)

  const lid = q.toLowerCase()

  return (present.sheets[fid] || []).find(
    (s) => s.id === q || s.name.toLowerCase() === lid
  )
}
