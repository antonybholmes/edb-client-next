import { ITextFileOpen } from '@/components/pages/open-files'
import { AxisRecord } from '@/components/plot/axes/axis'
import { IDBEntity } from '@/interfaces/db-entity'
import { IClusterGroup, IClusterGroupRow } from '@/lib/cluster-group'
import { type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import type { IGeneSet } from '@/lib/gsea/geneset'
import type { IAxesOpts } from '../history-types'
import {
  AppendMode,
  FilePath,
  HistoryPath,
  HistoryPlot,
  IGroupOps,
  ISheetOpts,
} from '../history-types'

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
  | { type: 'addSheets'; sheets: BaseDataFrame[]; opts: ISheetOpts }
  | { type: 'addPlots'; plots: HistoryPlot[]; opts: ISheetOpts }
  | { type: 'remove'; paths: HistoryPath[] }
  | { type: 'removeFiles'; paths: FilePath[] }
  | { type: 'reorderSheets'; sheets: BaseDataFrame[]; opts: ISheetOpts }
  //| { type: 'reorderPlots'; ids: string[]; opts: ISheetOps }
  | { type: 'updatePlot'; plot: HistoryPlot; opts: ISheetOpts }
  | { type: 'addAxes'; axes: AxisRecord; opts: IAxesOpts }
  | { type: 'updateAxes'; axes: AxisRecord; opts: IAxesOpts }
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
