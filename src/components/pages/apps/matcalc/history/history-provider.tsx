import {
  AnnotationDataFrame,
  DATAFRAME_100x26,
} from '@/lib/dataframe/annotation-dataframe'

import { makeUuid } from '@/lib/id'
import { enablePatches, produce } from 'immer'

import {
  DEFAULT_HEATMAP_PROPS,
  type IHeatMapDisplayOptions,
} from '@/components/plot/heatmap/heatmap-svg-props'
import { IChildrenProps } from '@/interfaces/children-props'
import type { IClusterGroup } from '@/lib/cluster-group'
import { type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import {
  getFormattedShape,
  getFormattedShapeSmall,
} from '@/lib/dataframe/dataframe-utils'
import type { IExtGseaResult, IGseaResult } from '@/lib/gsea/ext-gsea'
import type { IGeneSet, IRankedGenes } from '@/lib/gsea/geneset'
import { PATH_SEP } from '@/lib/http/urls'
import type { IClusterFrame } from '@/lib/math/hcluster'
import { formattedList, type UndefNullStr } from '@/lib/text/text'
import { createContext, useContext, useMemo, useReducer } from 'react'
import {
  DEFAULT_BOX_PLOT_DISPLAY_PROPS,
  type IBoxPlotDisplayOptions,
} from '../apps/boxplot/boxplot-plot-svg'
import {
  DEFAULT_EXT_GSEA_PROPS,
  type IExtGseaDisplayOptions,
} from '../apps/ext-gsea/ext-gsea-store'
import {
  DEFAULT_VOLCANO_PROPS,
  type IVolcanoDisplayOptions,
} from '../apps/volcano/volcano-plot-svg'
import {
  HistoryManager,
  type IHistoryEntry,
  type IUndoState,
} from './history-manager'

enablePatches()

export const HISTORY_STEP_TYPE_OPEN = 'open'

export const DEFAULT_APP_NAME = 'Default'

export const DEFAULT_STEP_NAME = 'Load sheet'

const DEFAULT_APP = newHistoryApp('Default')
const DEFAULT_FILE = newHistoryFile('Default')
const DEFAULT_SHEET = DATAFRAME_100x26

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

// export interface IHistorySheet extends IHistoryComp {
//   df: DataFrameType
//   type: 'sheet'
// }

// export interface IHistoryGroup extends IHistoryComp {
//   group: IClusterGroup
//   type: 'group'
// }

// export interface IHistoryGeneset extends IHistoryComp {
//   geneset: IGeneset
//   type: 'geneset'
// }

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
  // singlePlotDisplayOptions: Record<
  //   string,
  //   Record<string, IBoxPlotDisplayOptions>
  // >
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

export type HistoryPlot =
  | HeatMapPlot
  | VolcanoPlot
  //| LollipopPlot
  | ExtGseaPlot
  | BoxPlot

export type HistoryNode = IHistoryApp | HistoryPlot

// function createDefaultSheet(): BaseDataFrame {
//   return create100x26Df()
// }

export function newHeatMapPlot(
  name: string,
  dataframes: Record<string, DataFrameType> = {},
  opts: Partial<HeatMapPlot> = {}
): HeatMapPlot {
  const {
    style = 'heatmap',
    props = { ...DEFAULT_HEATMAP_PROPS },
    actions = [],
    groups = [],
  } = opts

  return {
    id: makeUuid(),
    //path: '',
    style,
    name,
    dataframes,
    groups,
    props,
    actions,
    type: 'plot',
    createdAt: Date.now(),
  }
}

export function newBoxPlot(
  name: string,
  dataframes: Record<string, BaseDataFrame> = {},
  opts: Partial<BoxPlot> = {}
): BoxPlot {
  const {
    style = 'box',
    props = { ...DEFAULT_BOX_PLOT_DISPLAY_PROPS },
    actions = [],
    groups = [],
    x = '',
    y = '',
    hue = '',
    xOrder = [],
    hueOrder = [],
    singlePlotDisplayOptions = {},
  } = opts

  return {
    id: makeUuid(),
    //path: '',
    style,
    name,
    dataframes,
    groups,
    props,
    actions,
    x,
    y,
    hue,
    xOrder,
    hueOrder,
    singlePlotDisplayOptions,
    type: 'plot',
    createdAt: Date.now(),
  }
}

export function newVolcanoPlot(
  name: string,
  dataframes: Record<string, BaseDataFrame> = {},

  opts: Partial<VolcanoPlot> = {}
): VolcanoPlot {
  const {
    style = 'volcano',
    props = { ...DEFAULT_VOLCANO_PROPS },
    actions = [],
    groups = [],
  } = opts

  return {
    id: makeUuid(),
    ////path: '',
    style,
    name,
    dataframes,
    groups,
    props,
    actions,
    type: 'plot',
    createdAt: Date.now(),
  }
}

// export function newLollipopPlot(
//   name: string,
//   dataframes: Record<string, DataFrameType> = {},
//   opts: Partial<LollipopPlot> = {}
// ): LollipopPlot {
//   const { actions = [], groups = [] } = opts

//   return {
//     id: makeUuid(),
//     path: '',
//     style: 'lollipop',
//     name,
//     dataframes,
//     groups,
//     actions,
//     type: 'plot',
//     createdAt: Date.now(),
//   }
// }

export function newExtGseaPlot(
  name: string,
  //dataframes: Record<string, DataFrameType> = {},

  opts: Partial<ExtGseaPlot> = {}
): ExtGseaPlot {
  const {
    actions = [],
    groups = [],
    extGseaRes = {} as IExtGseaResult,
    gseaRes1 = {} as IGseaResult,
    gseaRes2 = {} as IGseaResult,
    rankedGenes = {} as IRankedGenes,
    gs1 = {} as IGeneSet,
    gs2 = {} as IGeneSet,
    props = { ...DEFAULT_EXT_GSEA_PROPS },
  } = opts

  return {
    id: makeUuid(),
    //path: '',
    style: 'ext-gsea',
    name,
    //dataframes,
    groups,
    extGseaRes,
    gseaRes1,
    gseaRes2,
    rankedGenes,
    gs1,
    gs2,
    props,
    actions,
    type: 'plot',
    createdAt: Date.now(),
  }
}

export interface IHistoryFileDesc {
  app: string
  file: string
  node: string
  type: 'app' | 'file' | 'sheet' | 'plot'
}

export interface IHistoryApp extends IHistoryComp {
  type: 'app'
}

export function newHistoryApp(name: string): IHistoryApp {
  const id = makeUuid()

  return {
    id,
    //path,
    name,
    type: 'app',
    createdAt: Date.now(),
  }
}

export function newHistoryFile(name: string): IHistoryComp {
  return {
    id: makeUuid(),
    name,
    createdAt: Date.now(),
  }
}

export function cloneHistory(history: IHistoryApp): IHistoryApp {
  return produce(history, () => {})
}

export function defaultHistoryTree(): IHistoryApp {
  //const branch = newHistoryBranch(DEFAULT_APP_NAME)

  return newHistoryApp(DEFAULT_APP_NAME)
}

type AppendMode = 'set' | 'append'

export type HistoryUpdateProps = (
  addr: string,
  name: string,
  prop: unknown
) => void

interface IAppSlice {
  openFile: (name: string, opts: IFileOps) => void
  //updateGroupsName: (name: string, path: AppPath | string) => void
}

// interface IBranchSlice {
//   openBranch: (name: string, params?: IOpenBranchOpts) => void

//   updateBranch: (partial: Partial<IHistoryBranch>) => void
// }

interface IPlotSlice {
  addPlots: (plot: HistoryPlot[], opts?: ISheetOps) => void
  reorderPlots: (plotIds: string[], opts?: ISheetOps) => void
  updatePlot: (plot: HistoryPlot) => void
}

type IdObj = { id: string }

type StrOrIdObj = string | IdObj
type OptStrOrIdObj = StrOrIdObj | undefined

type AppPath = { app: StrOrIdObj }

type BaseFilePath = { file: StrOrIdObj }
type FilePath = AppPath & BaseFilePath
export type SheetPath = FilePath & { sheet: StrOrIdObj } // omit file
type PlotPath = FilePath & { plot: StrOrIdObj }
type GroupPath = FilePath & { group: StrOrIdObj }
type GenesetPath = FilePath & { geneset: StrOrIdObj }

type HistoryPath =
  | AppPath
  | FilePath
  | SheetPath
  | PlotPath
  | GroupPath
  | GenesetPath

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

interface IGroupOps {
  name?: string
  mode?: AppendMode
  file?: string
}

interface IHistorySlice {
  remove: (ids: HistoryPath[]) => void
  removeFiles: (ids: FilePath[]) => void
  //select: (paths: string[], mode?: AppendMode) => void
  goto: (path: HistoryPath) => void
}

interface IGroupSlice {
  addGroups: (groups: IClusterGroup[], opts?: IGroupOps) => void
  reorderGroups: (ids: string[], opts?: IGroupOps) => void
  removeGroups: (ids: string[], opts?: IGroupOps) => void
  updateGroup: (group: IClusterGroup, opts?: IGroupOps) => void
}

interface IGenesetSlice {
  addGenesets: (genesets: IGeneSet[], opts?: IGroupOps) => void
  reorderGenesets: (ids: string[], opts?: IGroupOps) => void
  removeGenesets: (ids: string[], opts?: IGroupOps) => void
  updateGeneset: (geneset: IGeneSet) => void
}

interface ISheetSlice {
  addSheets: (
    sheets: BaseDataFrame[],

    opts?: ISheetOps
  ) => void
  reorderSheets: (
    sheets: string[],

    opts?: ISheetOps
  ) => void
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
interface IHistoryDataStore {
  files: Record<string, IHistoryComp>
  sheets: Record<string, DataFrameType>
  plots: Record<string, HistoryPlot>
  groupNames: Record<string, string>
  groups: Record<string, IClusterGroup>
  genesets: Record<string, IGeneSet>
}

type IHistoryData = IUndoState<IHistoryState> & IHistoryDataStore

interface IHistoryStore
  extends
    IHistorySlice,
    IAppSlice,
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

function initState(): Omit<IHistoryState, 'id' | 'name' | 'createdAt'> {
  return {
    fileOrder: [DEFAULT_FILE.id],
    sheetOrder: { [DEFAULT_FILE.id]: [DEFAULT_SHEET.id] },
    plotOrder: { [DEFAULT_FILE.id]: [] },
    groupOrder: { [DEFAULT_FILE.id]: [] },
    genesetOrder: { [DEFAULT_FILE.id]: [] },

    currentFile: DEFAULT_FILE.id,
    currentSheet: DEFAULT_SHEET.id,
    currentPlot: '',
    currentSelections: [{ type: 'sheet', id: DEFAULT_SHEET.id }],
  }
}

function resetState(
  state: IHistoryState
): Omit<IHistoryState, 'id' | 'name' | 'createdAt'> {
  const defaultSheet = state.sheetOrder[DEFAULT_FILE.id]![0]!

  return {
    fileOrder: [DEFAULT_FILE.id],
    sheetOrder: { [DEFAULT_FILE.id]: [defaultSheet] },
    plotOrder: { [DEFAULT_FILE.id]: [] },
    groupOrder: { [DEFAULT_FILE.id]: [] },
    genesetOrder: { [DEFAULT_FILE.id]: [] },
    currentFile: DEFAULT_FILE.id,
    currentSheet: defaultSheet,
    currentPlot: '',
    currentSelections: [{ type: 'sheet', id: defaultSheet }],
  }
}

// const DEFAULT_HISTORY_STORE: IHistoryDataStore = {
//   apps: { [DEFAULT_APP.id]: DEFAULT_APP },
//   files: { [DEFAULT_FILE.id]: DEFAULT_FILE },
//   sheets: { [DEFAULT_SHEET.id]: DEFAULT_SHEET },
//   plots: {},
//   groups: {},
//   groupNames: { [DEFAULT_FILE.id]: 'Groups' },
//   genesets: {},
// }

function resetStore(): IHistoryDataStore {
  return {
    files: { [DEFAULT_FILE.id]: DEFAULT_FILE },
    sheets: { [DEFAULT_SHEET.id]: DEFAULT_SHEET },
    plots: {},
    groups: {},
    groupNames: { [DEFAULT_FILE.id]: 'Groups' },
    genesets: {},
  }
}

// The store is a datastore of files and an undo state
// that stores IHistoryState snapshots and patches for undo/redo functionality.
function init(): IHistoryData {
  const id = makeUuid()

  //const defaultSheet = createDefaultSheet()

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

function dataStoreView(state: IHistoryData): IHistoryDataStore {
  return {
    files: state.files,
    sheets: state.sheets,
    plots: state.plots,
    groupNames: state.groupNames,
    groups: state.groups,
    genesets: state.genesets,
  }
}

const historyManager = new HistoryManager<IHistoryState>()

type IHistoryFilesContext = {
  file: IHistoryComp
  files: IHistoryComp[]
}

const FilesContext = createContext<IHistoryFilesContext | undefined>(undefined)

export function useFileContext(): IHistoryFilesContext {
  const ctx = useContext(FilesContext)
  if (!ctx) {
    throw new Error('useFiles must be used within a HistoryProvider')
  }

  return ctx
}

type ISheetsContext = {
  sheet: DataFrameType
  sheets: DataFrameType[]
}

const SheetsContext = createContext<ISheetsContext | undefined>(undefined)

export function useSheetsContext(): ISheetsContext {
  const ctx = useContext(SheetsContext)
  if (!ctx) {
    throw new Error('useSheets must be used within a HistoryProvider')
  }

  return ctx
}

type IPlotsContext = {
  plot: HistoryPlot | undefined
  plots: HistoryPlot[]
}

const PlotsContext = createContext<IPlotsContext | undefined>(undefined)

export function usePlotsContext(): IPlotsContext {
  const ctx = useContext(PlotsContext)
  if (!ctx) {
    throw new Error('usePlots must be used within a HistoryProvider')
  }

  return ctx
}

type HistoryAction =
  | { type: 'reset' }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'seek'; step: number | string }
  | {
      type: 'openFile'
      file: IHistoryComp
      sheets: BaseDataFrame[]
      plots: HistoryPlot[]
      groups: IClusterGroup[]
      genesets: IGeneSet[]
      groupsName: string
      mode: AppendMode
    }
  | { type: 'addSheets'; sheets: BaseDataFrame[]; opts: ISheetOps }
  | { type: 'addPlots'; plots: HistoryPlot[]; opts: ISheetOps }
  | { type: 'remove'; paths: HistoryPath[] }
  | { type: 'removeFiles'; paths: FilePath[] }
  | { type: 'reorderSheets'; ids: string[]; opts: ISheetOps }
  | { type: 'reorderPlots'; ids: string[]; opts: ISheetOps }
  | { type: 'updatePlot'; plot: HistoryPlot }
  | { type: 'addGroups'; groups: IClusterGroup[]; opts: IGroupOps }
  | { type: 'updateGroup'; group: IClusterGroup; opts: IGroupOps }
  | { type: 'removeGroups'; ids: string[]; opts: IGroupOps }
  | { type: 'reorderGroups'; ids: string[]; opts: IGroupOps }
  | { type: 'addGenesets'; genesets: IGeneSet[]; opts: IGroupOps }
  | { type: 'updateGeneset'; geneset: IGeneSet }
  | { type: 'removeGenesets'; ids: string[]; opts: IGroupOps }
  | { type: 'reorderGenesets'; ids: string[]; opts: IGroupOps }
  | { type: 'goto'; path: HistoryPath }

function applyHistoryUpdate(
  state: IHistoryData,
  name: string,
  description: string,
  updateHistory: (
    state: IHistoryState,
    store: Readonly<IHistoryDataStore>
  ) => void,
  updateStore?: (store: IHistoryDataStore) => void
): IHistoryData {
  const result = historyManager.applyUpdate(
    state,
    name,
    description,
    (draft: IHistoryState) => {
      updateHistory(draft, dataStoreView(state) as Readonly<IHistoryDataStore>)
    }
  )

  if (result === state) {
    return state
  }

  const newState = {
    ...state,
    ...result,
  }

  if (updateStore) {
    updateStore(dataStoreView(newState))
  }

  return newState
}

function historyReducer(
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
    case 'openFile': {
      return applyHistoryUpdate(
        state,
        `Open file ${action.file.name}`,
        getFormattedShapeSmall(action.sheets[0]),
        (draft: IHistoryState) => {
          if (action.mode === 'append') {
            const files = draft.fileOrder.filter((id) => id !== DEFAULT_FILE.id)
            draft.fileOrder = [...files, action.file.id]
          } else {
            draft.fileOrder = [action.file.id]
          }

          draft.sheetOrder[action.file.id] = action.sheets.map((s) => s.id)
          draft.plotOrder[action.file.id] = action.plots.map((p) => p.id)
          draft.groupOrder[action.file.id] = action.groups.map((g) => g.id)
          draft.genesetOrder[action.file.id] = action.genesets.map((g) => g.id)

          draft.currentFile = action.file.id
          draft.currentSheet = action.sheets[action.sheets.length - 1]!.id
          draft.currentPlot =
            action.plots.length > 0
              ? action.plots[action.plots.length - 1]!.id
              : draft.currentPlot
          draft.currentSelections = [{ type: 'sheet', id: draft.currentSheet }]
        },
        (store: IHistoryDataStore) => {
          store.files[action.file.id] = action.file
          for (const sheet of action.sheets) {
            store.sheets[sheet.id] = sheet
          }
          for (const plot of action.plots) {
            store.plots[plot.id] = plot
          }
          for (const group of action.groups) {
            store.groups[group.id] = group
          }
          for (const geneset of action.genesets) {
            store.genesets[geneset.id] = geneset
          }
          if (action.groupsName) {
            store.groupNames[action.file.id] = action.groupsName
          }
        }
      )
    }
    case 'addSheets': {
      const { sheets, opts } = action
      const { name = '', mode = 'set', file = state.present.currentFile } = opts
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
          const ids = sheets.map((s) => s.id)

          if (mode === 'append') {
            const existing = (draft.sheetOrder[file] || []).filter(
              (id) => id !== DEFAULT_SHEET.id
            )
            draft.sheetOrder[file] = [...existing, ...ids]
          } else {
            draft.sheetOrder[file] = ids
          }

          draft.currentSheet = sheets[sheets.length - 1]!.id
          draft.currentSelections = [{ type: 'sheet', id: draft.currentSheet }]
        },
        (store: IHistoryDataStore) => {
          for (const sheet of sheets) {
            store.sheets[sheet.id] = sheet
          }
        }
      )
    }
    case 'addPlots': {
      const { plots, opts } = action
      const {
        name = '',
        mode = 'append',
        file = state.present.currentFile,
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
            draft.plotOrder[file]?.push(...plots.map((p) => p.id))
          } else {
            draft.plotOrder[file] = plots.map((p) => p.id)
          }
          draft.currentPlot = plots[plots.length - 1]!.id
          draft.currentSelections = [{ type: 'plot', id: draft.currentPlot }]
        },
        (store: IHistoryDataStore) => {
          for (const plot of plots) {
            store.plots[plot.id] = plot
          }
        }
      )
    }
    case 'remove': {
      if (action.paths.length === 0) {
        return state
      }

      const pathIds = action.paths.map(toPathId)
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
      )
    }
    case 'removeFiles': {
      if (action.paths.length === 0) {
        return state
      }

      const pathIds = action.paths.map(toPathId)
      return applyHistoryUpdate(
        state,
        `Remove ${pathIds.length} file${pathIds.length > 1 ? 's' : ''}`,
        '',
        (draft: IHistoryState) => {
          for (const p of pathIds) {
            removeFile(draft, p)
          }
        },
        (store: IHistoryDataStore) => {
          for (const p of pathIds) {
            if (Object.keys(store.files).length > 1) {
              delete store.files[p.file]
            }
          }
        }
      )
    }
    case 'reorderSheets': {
      const { ids, opts } = action
      const { file = state.present.currentFile } = opts
      if (ids.length === 0 || file === DEFAULT_FILE.id) {
        return state
      }

      return applyHistoryUpdate(state, 'Reorder sheets', '', (draft) => {
        draft.sheetOrder[file] = ids
      })
    }
    case 'reorderPlots': {
      const { ids, opts } = action
      const { file = state.present.currentFile } = opts
      if (ids.length === 0 || file === DEFAULT_FILE.id) {
        return state
      }

      return applyHistoryUpdate(state, 'Reorder plots', '', (draft) => {
        draft.plotOrder[file] = ids
      })
    }
    case 'updatePlot': {
      return {
        ...state,
        plots: {
          ...state.plots,
          [action.plot.id]: action.plot,
        },
      }
    }
    case 'addGroups': {
      const { groups, opts } = action
      const {
        mode = 'append',
        name = '',
        file = state.present.currentFile,
      } = opts
      if (groups.length === 0 || file === DEFAULT_FILE.id) {
        return state
      }

      return applyHistoryUpdate(
        state,
        `Add ${formattedList(groups.map((gs) => gs.name))} group${
          groups.length > 1 ? 's' : ''
        }`,
        '',
        (draft: IHistoryState) => {
          if (mode === 'append') {
            draft.groupOrder[file]?.push(...groups.map((g) => g.id))
          } else {
            draft.groupOrder[file] = groups.map((g) => g.id)
          }
        },
        (store: IHistoryDataStore) => {
          for (const group of groups) {
            store.groups[group.id] = group
          }
          if (name) {
            store.groupNames[file] = name
          }
        }
      )
    }
    case 'updateGroup': {
      const { group } = action
      return {
        ...state,
        groups: {
          ...state.groups,
          [group.id]: group,
        },
      }
    }
    case 'removeGroups': {
      const { ids, opts } = action
      const { file = state.present.currentFile } = opts
      if (ids.length === 0 || file === DEFAULT_FILE.id) {
        return state
      }

      return applyHistoryUpdate(state, 'Remove groups', '', (draft) => {
        draft.groupOrder[file] = draft.groupOrder[file]!.filter(
          (id) => !ids.includes(id)
        )
      })
    }
    case 'reorderGroups': {
      const { ids, opts } = action
      const { file = state.present.currentFile } = opts
      if (ids.length === 0 || file === DEFAULT_FILE.id) {
        return state
      }

      return applyHistoryUpdate(state, 'Reorder groups', '', (draft) => {
        draft.groupOrder[file] = ids
      })
    }
    case 'addGenesets': {
      const { genesets, opts } = action
      const { mode = 'append', file = state.present.currentFile } = opts
      if (genesets.length === 0 || file === DEFAULT_FILE.id) {
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
            draft.genesetOrder[file]?.push(...genesets.map((g) => g.id))
          } else {
            draft.genesetOrder[file] = genesets.map((g) => g.id)
          }
        },
        (store: IHistoryDataStore) => {
          for (const geneset of genesets) {
            store.genesets[geneset.id] = geneset
          }
        }
      )
    }
    case 'updateGeneset': {
      return {
        ...state,
        genesets: {
          ...state.genesets,
          [action.geneset.id]: action.geneset,
        },
      }
    }
    case 'removeGenesets': {
      const { ids, opts } = action
      const { file = state.present.currentFile } = opts
      if (ids.length === 0 || file === DEFAULT_FILE.id) {
        return state
      }

      return applyHistoryUpdate(
        state,
        `Remove ${ids.join(', ')} geneset${ids.length > 1 ? 's' : ''}`,
        '',
        (draft: IHistoryState) => {
          draft.genesetOrder[file] = draft.genesetOrder[file]!.filter(
            (id) => !ids.includes(id)
          )
        }
      )
    }
    case 'reorderGenesets': {
      const { ids, opts } = action
      const { file = state.present.currentFile } = opts
      if (ids.length === 0 || file === DEFAULT_FILE.id) {
        return state
      }

      return applyHistoryUpdate(
        state,
        `Reorder ${ids.join(', ')} geneset${ids.length > 1 ? 's' : ''}`,
        '',
        (draft: IHistoryState) => {
          draft.genesetOrder[file] = ids
        }
      )
    }
    case 'goto': {
      const { path } = action
      const { app, file, sheet, plot } = toPathId(path)
      return applyHistoryUpdate(
        state,
        `Goto ${
          Boolean(plot)
            ? `plot ${plot}`
            : Boolean(sheet)
              ? `sheet ${sheet}`
              : Boolean(file)
                ? `file ${file}`
                : `app ${app}`
        }`,
        '',
        (draft: IHistoryState, store: Readonly<IHistoryDataStore>) => {
          if (file in store.files) {
            draft.currentFile = file
          }

          if (sheet in store.sheets) {
            draft.currentSheet = sheet
            draft.currentSelections = [
              { type: 'sheet', id: draft.currentSheet },
            ]
          }

          if (plot in store.plots) {
            draft.currentPlot = plot
            draft.currentSelections = [{ type: 'plot', id: draft.currentPlot }]
          }
        }
      )
    }
    default:
      return state
  }
}

const HistoryContext = createContext<IHistoryStore | undefined>(undefined)

export function useHistory() {
  const ctx = useContext(HistoryContext)
  if (!ctx) {
    throw new Error('useHistory must be used within a HistoryProvider')
  }

  return ctx
}

export function HistoryProvider({ children }: IChildrenProps) {
  const [state, dispatch] = useReducer(historyReducer, init())

  function reset() {
    dispatch({ type: 'reset' })
  }

  function undo() {
    dispatch({ type: 'undo' })
  }

  function redo() {
    dispatch({ type: 'redo' })
  }

  function seek(step: number | string) {
    dispatch({ type: 'seek', step })
  }

  function openFile(name: string, opts: IFileOps = {}) {
    let {
      sheets = [DEFAULT_SHEET],
      plots = [],
      mode = 'append',
      groupsName = '',
      groups = [],
      genesets = [],
    } = opts

    if (sheets.length === 0) {
      return
    }
    if (!name) {
      name = sheets[0]!.name
    }

    const file = newHistoryFile(name)

    dispatch({
      type: 'openFile',
      file,
      sheets,
      plots,
      groups,
      genesets,
      groupsName,
      mode,
    })
  }

  function addSheets(sheets: BaseDataFrame[], opts: ISheetOps = {}) {
    dispatch({ type: 'addSheets', sheets, opts })
  }

  function addPlots(plots: HistoryPlot[], opts: ISheetOps = {}) {
    dispatch({ type: 'addPlots', plots, opts })
  }

  function remove(paths: HistoryPath[]) {
    dispatch({ type: 'remove', paths })
  }

  function removeFiles(paths: FilePath[]) {
    dispatch({ type: 'removeFiles', paths })
  }

  function reorderSheets(ids: string[], opts: ISheetOps = {}) {
    dispatch({ type: 'reorderSheets', ids, opts })
  }

  function reorderPlots(ids: string[], opts: ISheetOps = {}) {
    dispatch({ type: 'reorderPlots', ids, opts })
  }

  function updatePlot(plot: HistoryPlot) {
    dispatch({ type: 'updatePlot', plot })
  }

  function addGroups(groups: IClusterGroup[], opts: IGroupOps = {}) {
    dispatch({ type: 'addGroups', groups, opts })
  }

  function updateGroup(group: IClusterGroup, opts: IGroupOps = {}) {
    dispatch({ type: 'updateGroup', group, opts })
  }

  function removeGroups(ids: string[], opts: IGroupOps = {}) {
    dispatch({ type: 'removeGroups', ids, opts })
  }

  function reorderGroups(ids: string[], opts: IGroupOps = {}) {
    dispatch({ type: 'reorderGroups', ids, opts })
  }

  function addGenesets(genesets: IGeneSet[], opts: IGroupOps = {}) {
    dispatch({ type: 'addGenesets', genesets, opts })
  }

  function updateGeneset(geneset: IGeneSet) {
    dispatch({ type: 'updateGeneset', geneset })
  }

  function removeGenesets(ids: string[], opts: IGroupOps = {}) {
    dispatch({ type: 'removeGenesets', ids, opts })
  }

  function reorderGenesets(ids: string[], opts: IGroupOps = {}) {
    dispatch({ type: 'reorderGenesets', ids, opts })
  }

  function goto(path: HistoryPath) {
    dispatch({ type: 'goto', path })
  }

  const filesContextValue = useMemo(
    () => ({
      file: state.files[state.present.currentFile]!,
      files: state.present.fileOrder.map((id) => state.files[id]!),
    }),
    [state.present.currentFile, state.present.fileOrder, state.files]
  )

  const sheetsContextValue = useMemo(
    () => ({
      sheet: state.sheets[state.present.currentSheet]!,
      sheets: state.present.sheetOrder[state.present.currentFile].map(
        (id) => state.sheets[id]!
      ),
    }),
    [
      state.present.currentSheet,
      state.present.sheetOrder,
      state.present.currentFile,
      state.sheets,
    ]
  )

  const plotsContextValue = useMemo(
    () => ({
      plot: state.present.currentPlot
        ? state.plots[state.present.currentPlot]
        : undefined,

      plots: state.present.currentPlot
        ? state.present.plotOrder[state.present.currentFile].map(
            (id) => state.plots[id]!
          )
        : [],
    }),
    [
      state.present.currentPlot,
      state.present.plotOrder,
      state.present.currentFile,
      state.plots,
    ]
  )

  return (
    <FilesContext.Provider value={filesContextValue}>
      <SheetsContext.Provider value={sheetsContextValue}>
        <PlotsContext.Provider value={plotsContextValue}>
          <HistoryContext.Provider
            value={{
              ...state,
              reset,
              undo,
              redo,
              seek,
              openFile,
              remove,
              removeFiles,
              addSheets,
              reorderSheets,
              addPlots,
              reorderPlots,
              updatePlot,
              addGroups,
              reorderGroups,
              removeGroups,
              updateGroup,
              addGenesets,
              reorderGenesets,
              removeGenesets,
              updateGeneset,
              goto,
            }}
          >
            {children}
          </HistoryContext.Provider>
        </PlotsContext.Provider>
      </SheetsContext.Provider>
    </FilesContext.Provider>
  )
}

interface IFileOps {
  mode?: AppendMode

  sheets?: BaseDataFrame[]
  plots?: HistoryPlot[]
  groupsName?: string
  groups?: IClusterGroup[]
  genesets?: IGeneSet[]
}

interface ISheetOps {
  name?: string
  mode?: AppendMode
  file?: string
  //path?: string
}

function getFileId(
  state: IHistoryState,
  opts: { file?: OptStrOrIdObj } = {}
): string {
  const { file } = opts
  return (typeof file === 'string' ? file : file?.id) || state.currentFile
}

export function useGroups(file: OptStrOrIdObj = undefined): IClusterGroup[] {
  const { present, groups } = useHistory()
  const fid = getFileId(present, { file })
  return (present.groupOrder[fid] || []).map((id) => groups[id]!)
}

export function useGroupName(file: OptStrOrIdObj = undefined): string {
  const { present, groupNames } = useHistory()
  const fid = getFileId(present, { file })
  return groupNames[fid] || ''
}

export function useGenesets(file: OptStrOrIdObj = undefined): IGeneSet[] {
  const { present, genesets } = useHistory()
  const fid = getFileId(present, { file })
  return (present.genesetOrder[fid] || []).map((id) => genesets[id]!)
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

export function getGroups(
  store: IHistoryDataStore,
  state: IHistoryState,
  opts: { file?: OptStrOrIdObj } = {}
): IClusterGroup[] {
  const { file } = opts

  const id = getFileId(state, { file })

  return (state.groupOrder[id] || []).map((id) => store.groups[id]!)
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

type PathId = {
  app: string
  file: string
  sheet: string
  plot: string
  group: string
  geneset: string
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
  const app = 'app' in path ? strOrIdToStr(path.app) : ''
  const file = 'file' in path ? strOrIdToStr(path.file) : ''
  const sheet = 'sheet' in path ? strOrIdToStr(path.sheet) : ''
  const plot = 'plot' in path ? strOrIdToStr(path.plot) : ''
  const group = 'group' in path ? strOrIdToStr(path.group) : ''
  const geneset = 'geneset' in path ? strOrIdToStr(path.geneset) : ''

  return { app, file, sheet, plot, group, geneset }
}

function removeFile(state: IHistoryState, p: PathId) {
  if ((state.fileOrder.length || 0) < 2) {
    return
  }

  state.fileOrder = state.fileOrder.filter((fileId) => fileId !== p.file)

  delete state.sheetOrder[p.file]
  delete state.plotOrder[p.file]
  delete state.groupOrder[p.file]
  delete state.genesetOrder[p.file]

  // select previous sheet/plot

  const lastFile = state.fileOrder[state.fileOrder.length - 1]!

  state.currentFile = lastFile
  const sheets = state.sheetOrder[lastFile]!
  state.currentSheet = sheets[sheets.length - 1]!
  const plots = state.plotOrder[lastFile]!
  state.currentPlot = plots[plots.length - 1]!
  state.currentSelections = [{ type: 'sheet', id: state.currentSheet }]
}

function removeSheet(state: IHistoryState, p: PathId) {
  // cannot remove the first sheet
  //if (p.sheet === state.sheetOrder[p.file]?.[0]) {
  if ((state.sheetOrder[p.file]?.length || 0) < 2) {
    return
  }

  state.sheetOrder[p.file] = state.sheetOrder[p.file]!.filter(
    (id) => id !== p.sheet
  )

  console.log('Removing sheet', p.sheet, 'from file', p.file)

  const sheets = state.sheetOrder[p.file]!
  state.currentSheet = sheets[sheets.length - 1]!
  state.currentSelections = [{ type: 'sheet', id: state.currentSheet }]
}

function removePlot(state: IHistoryState, p: PathId) {
  state.plotOrder[p.file] = state.plotOrder[p.file]!.filter(
    (id) => id !== p.plot
  )

  if (state.plotOrder[p.file]!.length > 0) {
    // if there are still plots left, select the previous one
    const plots = state.plotOrder[p.file]!
    state.currentPlot = plots[plots.length - 1]!
    state.currentSelections = [{ type: 'plot', id: state.currentPlot }]
  } else {
    // otherwise select the last sheet
    const sheets = state.sheetOrder[p.file]!
    state.currentPlot = undefined
    state.currentSheet = sheets[sheets.length - 1]!
    state.currentSelections = [{ type: 'sheet', id: state.currentSheet }]
  }
}

function removeGroup(state: IHistoryState, p: PathId) {
  state.groupOrder[p.file] = state.groupOrder[p.file]!.filter(
    (id) => id !== p.group
  )
}

function removeGeneset(state: IHistoryState, p: PathId) {
  state.genesetOrder[p.file] = state.genesetOrder[p.file]!.filter(
    (id) => id !== p.geneset
  )
}

function getPathType(
  path: PathId
): 'file' | 'sheet' | 'plot' | 'group' | 'geneset' {
  if ('group' in path) {
    return 'group'
  } else if ('geneset' in path) {
    return 'geneset'
  } else if ('plot' in path) {
    return 'plot'
  } else if ('sheet' in path) {
    return 'sheet'
  } else {
    return 'file'
  }
}
