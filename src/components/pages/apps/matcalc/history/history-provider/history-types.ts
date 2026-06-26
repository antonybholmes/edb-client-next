import { IHeatMapDisplayOptions } from '@/components/plot/heatmap/heatmap-svg-props'
import { IClusterGroup } from '@/lib/cluster-group'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { IExtGseaResult, IGseaResult } from '@/lib/gsea/ext-gsea'
import { IGeneSet, IRankedGenes } from '@/lib/gsea/geneset'
import { IClusterFrame } from '@/lib/math/hcluster'
import { IBoxPlotDisplayOptions } from '../../apps/boxplot/boxplot-plot-svg'
import { IExtGseaDisplayOptions } from '../../apps/ext-gsea/ext-gsea-store'
import { IVolcanoDisplayOptions } from '../../apps/volcano/volcano-plot-svg'
import { IUndoState } from '../history-manager'

export type NodeType = 'app' | 'branch' | 'sheet' | 'plot'

export type GotoType = NodeType | 'path'

export interface ISelectionPath {
  type: NodeType
  id: string
}

export interface IHistoryComp {
  id: string
  //path: string
  name: string
  createdAt: number
}

export type DataFrameType = BaseDataFrame | AnnotationDataFrame | IClusterFrame

export interface BasePlot extends IHistoryComp {
  //style: PlotStyle
  // groups to make plots so that they are independent
  // of history such that if user moves groups around
  // it won't affect any plots generated
  groups: IClusterGroup[]
  actions: string[]
  type: 'plot'
}

export interface HeatMapPlot extends BasePlot {
  style: 'heatmap' | 'dot'
  dataframes: Record<string, DataFrameType>
  props: IHeatMapDisplayOptions
}

export interface VolcanoPlot extends BasePlot {
  style: 'volcano'
  dataframes: Record<string, BaseDataFrame>
  props: IVolcanoDisplayOptions
}

export interface BoxPlot extends BasePlot {
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

export interface LollipopPlot extends BasePlot {
  style: 'lollipop'
}

export interface ExtGseaPlot extends BasePlot {
  style: 'ext-gsea'
  props: IExtGseaDisplayOptions
  rankedGenes: IRankedGenes
  gs1: IGeneSet
  gs2: IGeneSet
  extGseaRes: IExtGseaResult
  gseaRes1: IGseaResult
  gseaRes2: IGseaResult
}

export type HistoryPlot = HeatMapPlot | VolcanoPlot | ExtGseaPlot | BoxPlot

export type HistoryNode = IHistoryApp | HistoryPlot

export interface IHistoryApp extends IHistoryComp {
  type: 'app'
}

export type AppendMode = 'set' | 'append'

export type HistoryUpdateProps = (
  addr: string,
  name: string,
  prop: unknown
) => void

interface IFileSlice {
  openFile: (name: string, opts?: IFileOps) => void
  //updateGroupsName: (name: string, path: AppPath | string) => void
}

// interface IBranchSlice {
//   openBranch: (name: string, params?: IOpenBranchOpts) => void

//   updateBranch: (partial: Partial<IHistoryBranch>) => void
// }

export interface IPlotSlice {
  addPlots: (plot: HistoryPlot[], opts?: ISheetOps) => void
  reorderPlots: (plotIds: string[], opts?: ISheetOps) => void
  updatePlot: (plot: HistoryPlot, opts?: ISheetOps) => void
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
  | FilePath
  | SheetPath
  | PlotPath
  | GroupPath
  | GenesetPath

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
  addGroups: (groups: IClusterGroup[], opts?: IGroupOps) => void
  reorderGroups: (ids: string[], opts?: IGroupOps) => void
  removeGroups: (ids: string[], opts?: IGroupOps) => void
  updateGroup: (group: IClusterGroup, opts?: IGroupOps) => void
}

export interface IGenesetSlice {
  addGenesets: (genesets: IGeneSet[], opts?: IGroupOps) => void
  reorderGenesets: (ids: string[], opts?: IGroupOps) => void
  removeGenesets: (ids: string[], opts?: IGroupOps) => void
  updateGeneset: (geneset: IGeneSet) => void
}

export interface ISheetSlice {
  addSheets: (sheets: BaseDataFrame[], opts?: ISheetOps) => void
  reorderSheets: (
    sheets: string[],

    opts?: ISheetOps
  ) => void
}

export interface IFileOps {
  mode?: AppendMode

  sheets?: BaseDataFrame[]
  plots?: HistoryPlot[]
  groupsName?: string
  groups?: IClusterGroup[]
  genesets?: IGeneSet[]
}

export interface ISheetOps {
  name?: string
  mode?: AppendMode
  file?: string
  //path?: string
}

/**
 * For keeping track of which app, file, sheet, the ui is currently showing.
 * Current selection can be either a sheet or a plot for ui instances where
 * it needs to decide which one to show. For example, if user clicks on a plot in the file tree,
 * the current selection will be set to that plot, and the ui will show the plot.
 * If user clicks on a sheet, the current selection will be set to that sheet, and the ui will show the sheet.
 */
export interface IHistoryState extends IHistoryComp {
  // order maps to preserve hierarchy

  fileOrder: string[] // appId -> file IDs
  sheetOrder: Record<string, string[]> // fileId -> sheet IDs
  plotOrder: Record<string, string[]> // fileId -> plot IDs
  groupOrder: Record<string, string[]> // fileId -> group IDs
  genesetOrder: Record<string, string[]> // fileId -> geneset IDs

  currentFile: string
  currentSheet: string
  currentPlot: string | undefined
  currentSelections: ISelectionPath[]
}

// Stores all objects by ID for easy access and immutability
export interface IHistoryDataStore {
  files: Record<string, IHistoryComp>
  sheets: Record<string, DataFrameType>
  plots: Record<string, HistoryPlot>
  groupNames: Record<string, string>
  groups: Record<string, IClusterGroup>
  genesets: Record<string, IGeneSet>
}

export type IHistoryData = IUndoState<IHistoryState> & IHistoryDataStore

export interface IHistoryStore
  extends
    IHistorySlice,
    IFileSlice,
    ISheetSlice,
    IPlotSlice,
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
  file: IHistoryComp
  files: IHistoryComp[]
}

export type PathId = {
  file: string
  sheet: string
  plot: string
  group: string
  geneset: string
}
