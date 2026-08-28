import { IHeatMapSettings } from '@/components/pages/apps/matcalc/apps/heatmap/heatmap-settings-store'
import { ITextFileOpen } from '@/components/pages/open-files'
import { IDBEntity } from '@/interfaces/db-entity'
import { IClusterGroup, IClusterGroupRow } from '@/lib/cluster-group'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { IExtGseaResult, IGseaResult } from '@/lib/gsea/ext-gsea'
import { IGeneSet, IRankedGenes } from '@/lib/gsea/geneset'
import { IClusterFrame } from '@/lib/math/hcluster'
import { IGseaBubblePlot } from '../../../genes/gsea/gsea-plot/bubble/gsea-bubble-provider'
import { ISankeyPlot } from '../../../sankey/sankey-provider'
import { IBoxPlotDisplayOptions } from '../../apps/boxplot/boxplot-plot-svg'

import { AxisRecord } from '@/components/plot/axes/axis'
import { IExtGseaDisplayOptions } from '../../apps/gsea/ext-gsea/ext-gsea-store'
import { IVolcanoDisplayOptions } from '../../apps/volcano/volcano-plot-svg'
import { IUndoState } from './history-manager'
import { IBasePlot } from './plot'

export type NodeType = 'app' | 'branch' | 'sheet' | 'plot'

export type GotoType = NodeType | 'path'

export interface ISelectionPath {
  type: NodeType
  //file: string
  id: string
}

//export interface IHistoryComp extends IDBEntity {}

export type DataFrameType = BaseDataFrame | AnnotationDataFrame | IClusterFrame

export interface HeatMapPlot extends IBasePlot {
  style: 'heatmap' | 'dot'
  dataframes: Record<string, DataFrameType>
  props: IHeatMapSettings
}

export interface IVolcano {
  ids: string[]
  log2foldChanges: number[]
  logpvalues: number[]
  sizes?: number[]
}

export interface IVolcanoPlot extends IBasePlot {
  style: 'volcano'
  volcano: IVolcano
  props: IVolcanoDisplayOptions
}

export interface BoxPlot extends IBasePlot {
  style: 'box'
  dataframes: Record<string, BaseDataFrame>
  props: IBoxPlotDisplayOptions
  x: string
  y: string
  hue: string
  xOrder: string[]
  hueOrder: string[]

  singlePlotDisplayOptions: object
}

export interface LollipopPlot extends IBasePlot {
  style: 'lollipop'
}

export interface ExtGseaPlot extends IBasePlot {
  style: 'ext-gsea'
  props: IExtGseaDisplayOptions
  rankedGenes: IRankedGenes
  gs1: IGeneSet
  gs2: IGeneSet
  extGseaRes: IExtGseaResult
  gseaRes1: IGseaResult
  gseaRes2: IGseaResult
}

export type HistoryPlot =
  | HeatMapPlot
  | IVolcanoPlot
  | IGseaBubblePlot
  | ExtGseaPlot
  | BoxPlot
  | ISankeyPlot

export type HistoryNode = IHistoryApp | HistoryPlot

export interface IHistoryApp extends IDBEntity {
  type: 'app'
}

export type AppendMode = 'set' | 'append'

export type HistoryUpdateProps = (
  addr: string,
  name: string,
  prop: unknown
) => void

interface IFileSlice {
  openFile: (name: string, opts?: IFileOpts) => void
  //updateGroupsName: (name: string, path: AppPath | string) => void
}

// interface IBranchSlice {
//   openBranch: (name: string, params?: IOpenBranchOpts) => void

//   updateBranch: (partial: Partial<IHistoryBranch>) => void
// }

export interface IPlotSlice {
  addPlots: (plot: HistoryPlot[], opts?: ISheetOpts) => void
  updatePlot: (plot: HistoryPlot, opts?: ISheetOpts) => void
}

export interface IAxesSlice {
  //addAxes: (axes: AxisRecord, opts?: ISheetOpts) => void
  //reorderPlots: (plotIds: string[], opts?: ISheetOps) => void
  updateAxes: (axes: AxisRecord, opts?: ISheetOpts) => void
}

export type IdObj = { id: string }

export type StrOrIdObj = string | IdObj
export type OptStrOrIdObj = StrOrIdObj | undefined

export type FilePath = { file: StrOrIdObj }

export type SheetPath = FilePath & { sheet: StrOrIdObj } // omit file
export type PlotPath = FilePath & { plot: StrOrIdObj }
export type GroupPath = FilePath & { group: StrOrIdObj }
export type GenesetPath = FilePath & { geneset: StrOrIdObj }

export type HistoryPath =
  FilePath | SheetPath | PlotPath | GroupPath | GenesetPath

export interface IGroupOps {
  name?: string
  mode?: AppendMode
  file?: string
}

export interface IHistorySlice {
  remove: (ids: HistoryPath[]) => void
  removeFiles: (ids: FilePath[]) => void
  //select: (paths: string[], mode?: AppendMode) => void
  goto: (path: HistoryPath) => void
}

export interface IGroupSlice {
  openGroupFiles: (files: ITextFileOpen[]) => void
  addGroups: (groupRows: IClusterGroupRow[], opts?: IGroupOps) => void
  clearGroups: () => void
  //reorderGroups: (ids: string[], opts?: IGroupOps) => void
  removeGroups: (ids: string[], opts?: IGroupOps) => void
  updateGroup: (group: IClusterGroup, opts?: IGroupOps) => void
}

export interface IGenesetSlice {
  addGenesets: (genesets: IGeneSet[], opts?: IGroupOps) => void
  clearGenesets: () => void
  //reorderGenesets: (ids: string[], opts?: IGroupOps) => void
  removeGenesets: (ids: string[], opts?: IGroupOps) => void
  updateGeneset: (geneset: IGeneSet) => void
}

export interface ISheetSlice {
  addSheets: (sheets: DataFrameType[], opts?: ISheetOpts) => void
  // reorderSheets: (
  //   sheets: string[],

  //   opts?: ISheetOps
  // ) => void
}

export interface IFileOpts {
  mode?: AppendMode
  sheets?: BaseDataFrame[]
  plots?: HistoryPlot[]
  //groupsName?: string
  groupRows?: IClusterGroupRow[]
  genesets?: IGeneSet[]
}

export interface ISheetOpts {
  message?: string
  mode?: AppendMode
  file?: string
}

export interface IAxesOpts {
  message?: string
  file?: string
  plot?: string
}

/**
 * For keeping track of which app, file, sheet, the ui is currently showing.
 * Current selection can be either a sheet or a plot for ui instances where
 * it needs to decide which one to show. For example, if user clicks on a plot in the file tree,
 * the current selection will be set to that plot, and the ui will show the plot.
 * If user clicks on a sheet, the current selection will be set to that sheet, and the ui will show the sheet.
 */
export interface IHistoryState extends IDBEntity {
  // order maps to preserve hierarchy

  files: IDBEntity[] // appId -> file IDs
  //sheetOrder: Record<string, string[]> // fileId -> sheet IDs
  sheets: Record<string, DataFrameType[]>
  ///plotOrder: Record<string, string[]> // fileId -> plot IDs
  //groupOrder: Record<string, string[]> // fileId -> group IDs
  groupRows: Record<string, IClusterGroupRow[]>
  plots: Record<string, HistoryPlot[]>
  axes: Record<string, AxisRecord>
  genesets: Record<string, IGeneSet[]> // fileId -> geneset IDs

  currentFile: string | undefined
  currentSheet: string | undefined
  currentPlot: string | undefined
  currentAxes: string | undefined
  currentSelections: ISelectionPath[]
}

// Stores all objects by ID for easy access and immutability
// export interface IHistoryDataStore {
//   //files: Record<string, IDBEntity>
//   //sheets: Record<string, DataFrameType>
//   //plots: Record<string, HistoryPlot>
//   //groupNames: Record<string, string>
//   //groups: Record<string, IClusterGroup>
//   //genesets: Record<string, IGeneSet>
// }

export type IHistoryData = IUndoState<IHistoryState>

export interface IHistoryStore
  extends
    IHistorySlice,
    IFileSlice,
    ISheetSlice,
    IPlotSlice,
    IAxesSlice,
    IGroupSlice,
    IGenesetSlice,
    IHistoryData {
  //addAction: (action: HistoryEvent, fn: (draft: IHistoryState) => void) => void

  /**
   * Remove a specific history point.
   * @param id The ID(s) of the history point to remove.
   * @param type The type of history point (app, branch, step, sheet, plot).
   * @returns
   */

  reset: () => void

  undo: () => void
  redo: () => void
  seek: (step: number | string) => void
}

export type IHistoryFilesContext = {
  file: IDBEntity
  files: IDBEntity[]
}

export type PathId = {
  file: string
  sheet: string
  plot: string
  group: string
  geneset: string
}
