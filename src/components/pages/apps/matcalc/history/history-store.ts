import {
  AnnotationDataFrame,
  DATAFRAME_100x26,
} from '@/lib/dataframe/annotation-dataframe'

import { makeUuid } from '@/lib/id'
import { enablePatches, produce } from 'immer'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

import {
  DEFAULT_HEATMAP_PROPS,
  type IHeatMapDisplayOptions,
} from '@/components/plot/heatmap/heatmap-svg-props'
import type { IClusterGroup } from '@/lib/cluster-group'
import { type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { getFormattedShape } from '@/lib/dataframe/dataframe-utils'
import type { IExtGseaResult, IGseaResult } from '@/lib/gsea/ext-gsea'
import type { IGeneset, IRankedGenes } from '@/lib/gsea/geneset'
import { PATH_SEP } from '@/lib/http/urls'
import type { IClusterFrame } from '@/lib/math/hcluster'
import { formattedList } from '@/lib/text/text'
import {
  DEFAULT_EXT_GSEA_PROPS,
  type IExtGseaDisplayOptions,
} from '../../genes/gsea/ext-gsea-store'
import {
  DEFAULT_BOX_PLOT_DISPLAY_PROPS,
  type IBoxPlotDisplayOptions,
} from '../apps/boxplot/boxplot-plot-svg'
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
const DEFAULT_FILE = newHistoryFile('Sheet 1')
const DEFAULT_SHEET = DATAFRAME_100x26

export type NodeType = 'app' | 'branch' | 'sheet' | 'plot'

export type GotoType = NodeType | 'path'

export interface ISelectionPath {
  type: 'sheet' | 'plot'
  path: string
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
  gs1: IGeneset
  gs2: IGeneset
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
    gs1 = {} as IGeneset,
    gs2 = {} as IGeneset,
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

export interface IHistoryFile extends IHistoryComp {
  //currentSheet: string
  //sheets: DataFrameType[]
  //currentPlot: string
  //plots: HistoryPlot[]
  //groupsName: string
  //groups: IClusterGroup[] //IHistoryGroups
  //genesets: IGeneset[]
}

export interface IHistoryFileDesc {
  app: string
  file: string
  node: string
  type: 'app' | 'file' | 'sheet' | 'plot'
}

export interface IHistoryApp extends IHistoryComp {
  //currentBranch: IHistoryBranch | undefined
  //currentBranch: string
  //branches: IHistoryBranch[]

  //currentSheet: string
  //sheets: DataFrameType[]

  //currentPlot: string
  //plots: HistoryPlot[]

  //currentFile: string
  //files: IHistoryFile[]

  //IHistoryFileDesc[]

  //nextBranchIndex: number
  type: 'app'
}

// export interface IHistoryBranch extends IHistoryComp {
//   // maintains the current position in the history stack
//   // since the stack can include redo actions if we undo
//   // an action

//   //currentPlot: string
//   //plots: string[]

//   // Name of the group set so we can given them an identifiable name. Defaults to "Groups".
//   groupsName: string
//   groups: IClusterGroup[] //IHistoryGroups

//   genesets: IGeneset[]

//   currentSheet: string
//   sheets: DataFrameType[]

//   currentPlot: string
//   plots: HistoryPlot[]

//   type: 'branch'
// }

// export interface IHistoryStep extends IHistoryComp {
//   //currentId: string
//   //currentSheet: BaseDataFrame | undefined

//   currentSheet: DataFrameType
//   sheets: DataFrameType[]

//   currentPlot: HistoryPlot | undefined
//   plots: HistoryPlot[]
//   type: 'step'
// }

// export const BASE_STEP: IHistoryStep = Object.freeze({
//   id: '',
//   currentSheet: DATAFRAME_100x26,
//   sheets: [DATAFRAME_100x26],
//   currentPlot: undefined,
//   plots: [],
//   type: 'step',
//   path: '',
//   name: '',
//   createdAt: 0,
// })

// const DEFAULT_FILE: IHistoryFile = {
//   id: makeUuid(),
//   name: 'Sheet 1',
//   ////currentSheet: DATAFRAME_100x26.id,
//   //sheets: [DATAFRAME_100x26],
//   //currentPlot: '',
//   //plots: [],
//   //groupsName: '',
//   //groups: [],
//   //genesets: [],
//   //path: '',
//   createdAt: Date.now(),
// }

export function newHistoryApp(name: string): IHistoryApp {
  const id = makeUuid()

  return {
    id,
    //path,
    name,

    //currentFile: files[0]?.id || '',
    //files,

    //currentSheet: sheets[sheets.length - 1]!.id,
    //sheets,
    //currentPlot: plots[plots.length - 1]?.id || '',
    //plots,
    type: 'app',
    createdAt: Date.now(),
  }
}

export function newHistoryFile(name: string): IHistoryFile {
  return {
    id: makeUuid(),
    name,
    //currentSheet: DATAFRAME_100x26.id,
    //sheets: [DATAFRAME_100x26],
    //currentPlot: '',
    //plots: [],
    //groupsName: '',
    //groups: [],
    // genesets: [],
    //path: '',
    createdAt: Date.now(),
  }
}

// interface IHistoryBranchOpts {
//   groupsName?: string
//   groups?: IClusterGroup[]

//   genesets?: IGeneset[]
//   files?: IHistoryFile[]
// }

// function newHistoryBranch(
//   name: string,

//   opts: IHistoryBranchOpts = {}
// ): IHistoryBranch {
//   const {
//     groupsName = '',
//     groups = [],
//     genesets = [],
//     sheets = [DATAFRAME_100x26],
//     plots = [],
//   } = opts

//   return {
//     id: makeUuid(),
//     path: '',
//     name,

//     groupsName,
//     groups,
//     genesets,
//     currentSheet: sheets[sheets.length - 1]!.id,
//     sheets,
//     currentPlot: plots[plots.length - 1]?.id || '',
//     plots,
//     type: 'branch',
//     createdAt: Date.now(),
//   }
// }

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

// interface IOpenBranchOpts {
//   stepName?: string | undefined
//   //sheets?: BaseDataFrame[]
//   groupsName?: string
//   groups?: IClusterGroup[]
//   genesets?: IGeneset[]
//   //plots?: HistoryPlot[]
//   mode?: AppendMode | undefined
//   sheets?: BaseDataFrame[]
// }

interface IAppSlice {
  openApp: (name: string) => void
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
  updatePlot: (plot: HistoryPlot, opts?: ISheetOps) => void
}

type HasId = { id: string }

type StrOrId = string | HasId

type AppPath = { app: StrOrId }

type BaseFilePath = { file: StrOrId }
type FilePath = AppPath & BaseFilePath
type SheetPath = FilePath & { sheet: StrOrId } // omit file
type PlotPath = FilePath & { plot: StrOrId }
type GroupPath = FilePath & { group: StrOrId }
type GenesetPath = FilePath & { geneset: StrOrId }

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
export function strOrIdToStr(strOrId: StrOrId): string {
  return typeof strOrId === 'string' ? strOrId : strOrId.id
}

// function toAppPath(path: AppPath | string): AppPath | null {
//   if (typeof path !== 'string' && 'appId' in path) {
//     return path
//   }

//   const parts = pathSplit(path)

//   if (parts.length < 1) {
//     return null
//   }

//   return { appId: parts[0]! }
// }

// function toGroupPath(path: GroupPath | string): GroupPath | null {
//   if (typeof path !== 'string' && 'groupId' in path) {
//     return path
//   }

//   const parts = pathSplit(path)
//   if (parts.length < 3) {
//     return null
//   }

//   return { appId: parts[0]!, fileId: parts[1]!, groupId: parts[2]! }
// }

// function toFilePath(path: FilePath | string): FilePath | null {
//   if (typeof path !== 'string' && 'appId' in path && 'fileId' in path) {
//     return path
//   }

//   const parts = pathSplit(path)
//   if (parts.length < 2) {
//     return null
//   }

//   return { appId: parts[0]!, fileId: parts[1]! }
// }

// function toSheetPath(path: SheetPath | string): SheetPath | null {
//   if (
//     typeof path !== 'string' &&
//     'appId' in path &&
//     'fileId' in path &&
//     'sheetId' in path
//   ) {
//     return path
//   }

//   const parts = path.split(PATH_SEP)
//   if (parts.length < 3) {
//     return null
//   }

//   return { appId: parts[0]!, fileId: parts[1]!, sheetId: parts[2]! }
// }

// function toPlotPath(path: PlotPath | string): PlotPath | null {
//   if (
//     typeof path !== 'string' &&
//     'appId' in path &&
//     'fileId' in path &&
//     'plotId' in path
//   ) {
//     return path
//   }

//   const parts = path.split(PATH_SEP)
//   if (parts.length < 3) {
//     return null
//   }

//   return { appId: parts[0]!, fileId: parts[1]!, plotId: parts[2]! }
// }

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
  //updateGroup: (group: IClusterGroup, path: AppPath | string) => void
}

interface IGenesetSlice {
  addGenesets: (genesets: IGeneset[], opts?: IGroupOps) => void
  reorderGenesets: (ids: string[], opts?: IGroupOps) => void
  removeGenesets: (ids: string[], opts?: IGroupOps) => void
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
  appOrder: string[] // app IDs in order
  fileOrder: Record<string, string[]> // appId -> file IDs
  sheetOrder: Record<string, string[]> // fileId -> sheet IDs
  plotOrder: Record<string, string[]> // fileId -> plot IDs
  groupOrder: Record<string, string[]> // fileId -> group IDs
  genesetOrder: Record<string, string[]> // fileId -> geneset IDs

  currentApp: string
  currentFile: string
  currentSheet: string
  currentPlot: string
  currentSelections: ISelectionPath[]
}

interface IDataStore {
  apps: Record<string, IHistoryApp>
  files: Record<string, IHistoryFile>
  sheets: Record<string, DataFrameType>
  plots: Record<string, HistoryPlot>
  groupNames: Record<string, string>
  groups: Record<string, IClusterGroup>
  genesets: Record<string, IGeneset>
}

interface IHistoryStore
  extends
    IHistorySlice,
    IAppSlice,
    ISheetSlice,
    IPlotSlice,
    IGroupSlice,
    IGenesetSlice,
    IUndoState<IHistoryState>,
    IDataStore {
  //addAction: (action: HistoryEvent, fn: (draft: IHistoryState) => void) => void

  /**
   * Remove a specific history point.
   * @param id The ID(s) of the history point to remove.
   * @param type The type of history point (app, branch, step, sheet, plot).
   * @returns
   */

  reset: () => void

  historyUndo: () => void
  historyRedo: () => void
  historyGoto: (step: number | string) => void
}

// function getCurrentApp(state: IHistoryState): IHistoryApp {
//   return state.apps.find(app => app.id === state.currentApp)!
// }

// function getCurrentBranch(state: IHistoryState): {
//   app: IHistoryApp
//   branch: IHistoryBranch
// } {
//   const app = getCurrentApp(state)

//   return {
//     app,
//     branch: app.branches.find(branch => branch.id === app.currentBranch)!,
//   }
// }

export function pathJoin(
  ...parts: ({ id: string } | string | undefined | null)[]
): string {
  return (
    '/' +
    parts
      .filter(part => part !== null && part !== undefined)
      .map(part => (typeof part === 'string' ? part.trim() : part.id))
      .map(part => part.split(PATH_SEP))
      .flat() // split parts by path separator to avoid issues with nested paths and flatten the result

      .filter((p, pi) => pi > 0 || p !== '') // remove empty leading
      .join(PATH_SEP)
  )
}

// function newDefaultBranch(): {
//   branch: IHistoryBranch
//   sheet: DataFrameType
// } {
//   const branch = newHistoryBranch('Default')

//   return {
//     branch,
//     sheet: branch.sheets.find(s => s.id === branch.currentSheet)!,
//   }
// }

// function fixBranchPath(
//   branch: IHistoryBranch,

//   root: string
// ) {
//   branch.path = pathJoin(root, branch.id)
//   ////state.nodeMap[branch.id] = branch
// }

// function fixAppPath(state: IHistoryState, app: IHistoryApp) {
//   //app.path = pathJoin(app)
//   state.currentApp = pathJoin(app)
//   console.log('Fixing app path', state.currentApp)
//   const file = app.files[app.files.length - 1]!

//   fixFilePath(state, app, file)
// }

// function fixFilePath(
//   state: IHistoryState,
//   app: IHistoryApp,
//   file: IHistoryFile
// ) {
//   //file.path = pathJoin(app.path, file)

//   state.currentFile = pathJoin(app, file)
//   state.currentSheet = pathJoin(app, file, file.sheets[file.sheets.length - 1]!)
//   state.currentPlot =
//     file.plots.length > 0
//       ? pathJoin(app, file, file.plots[file.plots.length - 1]!)
//       : ''
//   // assume we want to show the sheet in the ui
//   state.currentSelections = [{ type: 'sheet', path: state.currentSheet }]
// }

// function fixHistoryPath(history: IHistoryState) {
//   for (const app of history.apps) {
//     app.path = pathJoin(app.id)
//   }
// }

function resetState(): Omit<IHistoryState, 'id' | 'name' | 'createdAt'> {
  return {
    appOrder: [DEFAULT_APP.id],
    fileOrder: { [DEFAULT_APP.id]: [DEFAULT_FILE.id] },
    sheetOrder: { [DEFAULT_FILE.id]: [DEFAULT_SHEET.id] },
    plotOrder: { [DEFAULT_FILE.id]: [] },
    groupOrder: { [DEFAULT_FILE.id]: [] },
    genesetOrder: { [DEFAULT_FILE.id]: [] },

    currentApp: DEFAULT_APP.id,
    currentFile: DEFAULT_FILE.id,
    currentSheet: DEFAULT_SHEET.id,
    currentPlot: '',
    currentSelections: [{ type: 'sheet', path: DEFAULT_SHEET.id }],
  }
}

function init(): IUndoState<IHistoryState> & IDataStore {
  const id = makeUuid()

  let state: IHistoryState = {
    id,
    name: 'History',
    createdAt: Date.now(),
    ...resetState(),
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
    apps: { [DEFAULT_APP.id]: DEFAULT_APP },
    files: { [DEFAULT_FILE.id]: DEFAULT_FILE },
    sheets: { [DEFAULT_SHEET.id]: DEFAULT_SHEET },
    plots: {},
    groups: {},
    groupNames: { [DEFAULT_FILE.id]: 'Groups' },
    genesets: {},

    present: state,
    history: [historyEntry],
    cursor: 0,
  }
}

const historyManager = new HistoryManager<IHistoryState>()

export const useHistoryStore = create<IHistoryStore>((set, get) => {
  /**
   * To update the history state with an action we use immer to produce the next state
   * and record the patches for undo/redo functionality rather than
   * directly mutating the state.
   *
   * @param action Description of the action for logging and debugging purposes.
   * @param description Optional additional details about the action.
   * @param tory Function that receives a draft of the current history state to apply changes.
   * @returns
   */
  function addAction(
    name: string,
    description: string,
    updateHistory: (state: IHistoryState, store: Readonly<IDataStore>) => void,
    sideEffect?: (store: IDataStore) => void
  ) {
    // use the current state for producing the next state. Inverse
    // patches are used for undo functionality.

    set(state => {
      // const readonlyStore: Readonly<IDataStore> = makeReadonly({
      //   apps: state.apps,
      //   files: state.files,
      //   sheets: state.sheets,
      //   plots: state.plots,
      //   groups: state.groups,
      //   groupNames: state.groupNames,
      //   genesets: state.genesets,
      // })

      const result = historyManager.applyUpdate(
        state,
        name,
        description,
        (draft: IHistoryState) => {
          // draft` is mutable here — Immer handles producing the next state
          // `state as Readonly<IDataStore>` ensures that updateHistory cannot accidentally mutate
          // the rest of the store.
          updateHistory(draft, state as Readonly<IDataStore>)
        }
      )

      const newState = {
        ...state,
        ...result,
      }

      // side effects can safely mutate the returned store
      if (sideEffect) {
        sideEffect(newState)
      }

      // the returned object becomes the new state
      return newState
    })
  }

  return {
    ...init(),

    reset: () => {
      set(
        produce((state: IHistoryStore) => {
          state.present = {
            ...state.present,
            ...resetState(),
          }

          const historyEntry: IHistoryEntry<IHistoryState> = {
            id: makeUuid(),
            name: 'Initialize history',
            description: '',
            createdAt: Date.now(),
            state: state.present,
            type: 'snapshot',
          }

          state.history = [historyEntry]
          state.cursor = 0
        })
      )
    },

    historyUndo: () => {
      // the past becomes the present, the current present becomes the future
      // and the past loses an entry
      set(state => ({
        ...historyManager.undo(state),
      }))
    },

    historyRedo: () => {
      set(state => ({
        ...historyManager.redo(state),
      }))
    },

    historyGoto: (step: number | string) => {
      set(state => ({
        ...historyManager.goto(state, step),
      }))
    },

    openApp: (name: string) => {
      const app = newHistoryApp(name)

      // check if app with this name already exists. If it does, we don't want to create a new app, just switch to it
      const exists = Object.values(get().apps).some(a => a.name === name)

      console.log('Opening app', name, 'exists:', exists)

      addAction(
        `Open ${name} app`,
        '',
        (state: IHistoryState) => {
          //const { branch } = newDefaultBranch()

          // only create a new app if it doesn't already exist. If it does, just switch to it
          if (!exists) {
            state.appOrder.push(app.id)

            state.fileOrder[app.id] = [DEFAULT_FILE.id]

            state.sheetOrder[DEFAULT_FILE.id] = [DEFAULT_SHEET.id]

            state.currentApp = app.id
          }

          const files = state.fileOrder[state.currentApp]!
          state.currentFile = files[files.length - 1]!

          const sheets = state.sheetOrder[state.currentFile]!
          state.currentSheet = sheets[sheets.length - 1]!

          state.currentPlot = ''

          state.currentSelections = [
            { type: 'sheet', path: state.currentSheet },
          ]
        },
        (store: IDataStore) => {
          if (!exists) {
            // after opening the app, we want to make sure the default file and sheet are added to the store
            store.apps[app.id] = app
          }
        }
      )
    },

    openFile: (name: string, opts: IFileOps = {}) => {
      let {
        sheets = [DATAFRAME_100x26],
        plots = [],
        mode = 'append',
        path: appId = get().present.currentApp,
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

      addAction(
        `Open file ${name}`,
        getFormattedShape(sheets[0]),
        (state: IHistoryState) => {
          if (mode === 'append') {
            state.fileOrder[appId]?.push(file.id)
          } else {
            state.fileOrder[appId] = [file.id]
          }

          state.sheetOrder[file.id] = sheets.map(s => s.id)
          state.plotOrder[file.id] = plots.map(p => p.id)
          state.groupOrder[file.id] = groups.map(g => g.id)
          state.genesetOrder[file.id] = genesets.map(g => g.id)

          state.currentFile = file.id
          state.currentSheet = sheets[sheets.length - 1]!.id
          state.currentPlot =
            plots.length > 0 ? plots[plots.length - 1]!.id : state.currentPlot
          state.currentSelections = [
            { type: 'sheet', path: state.currentSheet },
          ]
        },
        (store: IDataStore) => {
          store.files[file.id] = file

          for (const sheet of sheets) {
            store.sheets[sheet.id] = sheet
          }

          for (const plot of plots) {
            store.plots[plot.id] = plot
          }

          for (const group of groups) {
            store.groups[group.id] = group
          }

          for (const geneset of genesets) {
            store.genesets[geneset.id] = geneset
          }

          if (groupsName) {
            store.groupNames[file.id] = groupsName
          }
        }
      )
    },

    addSheets: (sheets: BaseDataFrame[], opts: ISheetOps = {}) => {
      if (sheets.length === 0) {
        return
      }

      let {
        name = '',
        mode = 'set',
        file: fileId = get().present.currentFile,
      } = opts

      addAction(
        name ||
          (sheets.length === 1
            ? `Add sheet ${sheets[0]!.name}`
            : `Add ${sheets.length} sheets`),
        getFormattedShape(sheets[0]!),
        (state: IHistoryState) => {
          if (mode === 'append') {
            state.sheetOrder[fileId]?.push(...sheets.map(s => s.id))
          } else {
            state.sheetOrder[fileId] = sheets.map(s => s.id)
          }

          state.currentSheet = sheets[sheets.length - 1]!.id
          state.currentSelections = [
            { type: 'sheet', path: state.currentSheet },
          ]
        },
        (store: IDataStore) => {
          for (const sheet of sheets) {
            store.sheets[sheet.id] = sheet
          }
        }
      )
    },

    addPlots: (plots: HistoryPlot[], opts: ISheetOps = {}) => {
      if (plots.length === 0) {
        return
      }

      const {
        name = '',
        mode = 'append',
        file = get().present.currentFile,
      } = opts || {}

      addAction(
        name ||
          (plots.length === 1
            ? `Add plot ${plots[0]!.name}`
            : `Add ${plots.length} plots`),
        '',
        (state: IHistoryState) => {
          if (mode === 'append') {
            state.plotOrder[file]?.push(...plots.map(p => p.id))
          } else {
            state.plotOrder[file] = plots.map(p => p.id)
          }

          state.currentPlot = plots[plots.length - 1]!.id
          state.currentSelections = [{ type: 'plot', path: state.currentPlot }]
        },
        (store: IDataStore) => {
          for (const plot of plots) {
            store.plots[plot.id] = plot
          }
        }
      )
    },

    remove: (paths: HistoryPath[]) => {
      if (paths.length === 0) {
        return
      }

      const pathIds: PathId[] = paths.map(path => {
        return toPathId(path)
      })

      addAction(
        `Remove objects`,
        '',
        (state: IHistoryState) => {
          for (const p of pathIds) {
            if (isAppOnly(p)) {
              removeApp(state, p)
            } else if (isFileOnly(p)) {
              removeFile(state, p)
            } else if (isSheet(p)) {
              removeSheet(state, p)
            } else if (isPlot(p)) {
              removePlot(state, p)
            } else if (isGroup(p)) {
              removeGroup(state, p)
            } else if (isGeneset(p)) {
              removeGeneset(state, p)
            } else {
              // do nothing if the path is invalid
            }
          }
        },
        (store: IDataStore) => {
          for (const p of pathIds) {
            if (isAppOnly(p) && Object.keys(store.apps).length > 1) {
              delete store.apps[p.app]
            } else if (isFileOnly(p) && Object.keys(store.files).length > 1) {
              delete store.files[p.file]
            } else if (isSheet(p) && Object.keys(store.sheets).length > 1) {
              delete store.sheets[p.sheet]
            } else if (isPlot(p)) {
              delete store.plots[p.plot]
            } else if (isGroup(p)) {
              delete store.groups[p.group]
            } else if (isGeneset(p)) {
              delete store.genesets[p.geneset]
            } else {
              // do nothing if the path is invalid or if it's the only remaining item of that type
            }
          }
        }
      )
    },

    removeFiles: (paths: FilePath[]) => {
      if (paths.length === 0) {
        return
      }

      const pathIds: PathId[] = paths.map(path => {
        return toPathId(path)
      })

      addAction(
        `Remove file${pathIds.length > 1 ? 's' : ''}`,
        '',
        (state: IHistoryState) => {
          for (const p of pathIds) {
            removeFile(state, p)
          }
        },
        (store: IDataStore) => {
          for (const p of pathIds) {
            if (Object.keys(store.files).length > 1) {
              delete store.files[p.file]
            }
          }
        }
      )
    },

    reorderSheets: (ids: string[], opts: ISheetOps = {}) => {
      if (ids.length === 0) {
        return
      }

      const { file = get().present.currentFile } = opts

      addAction(
        'Reorder sheets',
        '',

        (state: IHistoryState) => {
          state.sheetOrder[file] = ids
        }
      )
    },

    reorderPlots: (ids: string[], opts: ISheetOps = {}) => {
      if (ids.length === 0) {
        return
      }

      const { file = get().present.currentFile } = opts

      addAction('Reorder plots', '', (state: IHistoryState) => {
        state.plotOrder[file] = ids
      })
    },

    updatePlot: (plot: HistoryPlot) => {
      addAction(
        `Update plot ${plot.id}`,
        '',
        () => {},
        (store: IDataStore) => {
          store.plots[plot.id] = plot
        }
      )
    },

    addGroups: (groups: IClusterGroup[], opts: IGroupOps = {}) => {
      if (groups.length === 0) {
        return
      }

      const {
        mode = 'append',
        name = '',
        file = get().present.currentFile,
      } = opts

      addAction(
        `Add ${formattedList(groups.map(gs => gs.name))} group${groups.length > 1 ? 's' : ''}`,
        '',

        (state: IHistoryState) => {
          if (mode === 'append') {
            state.groupOrder[file]?.push(...groups.map(g => g.id))
          } else {
            state.groupOrder[file] = groups.map(g => g.id)
          }
        },
        (store: IDataStore) => {
          for (const group of groups) {
            store.groups[group.id] = group
          }

          if (name) {
            store.groupNames[file] = name
          }
        }
      )
    },

    removeGroups: (ids: string[], opts: IGroupOps = {}) => {
      if (ids.length === 0) {
        return
      }

      const { file = get().present.currentFile } = opts

      addAction(`Remove groups`, '', (state: IHistoryState) => {
        state.groupOrder[file] = state.groupOrder[file]!.filter(
          id => !ids.includes(id)
        )
      })
    },

    reorderGroups: (ids: string[], opts: IGroupOps = {}) => {
      if (ids.length === 0) {
        return
      }

      const { file = get().present.currentFile } = opts

      addAction('Reorder groups', '', (state: IHistoryState) => {
        state.groupOrder[file] = ids
      })
    },

    addGenesets: (genesets: IGeneset[], opts: IGroupOps = {}) => {
      if (genesets.length === 0) {
        return
      }

      const { mode = 'append', file = get().present.currentFile } = opts

      addAction(
        `Add ${formattedList(genesets.map(gs => gs.name))} geneset${genesets.length > 1 ? 's' : ''}`,
        '',
        (state: IHistoryState) => {
          if (mode === 'append') {
            state.genesetOrder[file]?.push(...genesets.map(g => g.id))
          } else {
            state.genesetOrder[file] = genesets.map(g => g.id)
          }
        },
        (store: IDataStore) => {
          for (const geneset of genesets) {
            store.genesets[geneset.id] = geneset
          }
        }
      )
    },

    removeGenesets: (ids: string[], opts: IGroupOps = {}) => {
      if (ids.length === 0) {
        return
      }

      const { file = get().present.currentFile } = opts

      addAction(
        `Remove ${ids.join(', ')} geneset${ids.length > 1 ? 's' : ''}`,
        '',
        (state: IHistoryState) => {
          state.genesetOrder[file] = state.genesetOrder[file]!.filter(
            id => !ids.includes(id)
          )
        }
      )
    },

    reorderGenesets: (ids: string[], opts: IGroupOps = {}) => {
      const { file = get().present.currentFile } = opts

      addAction(
        `Reorder ${ids.join(', ')} geneset${ids.length > 1 ? 's' : ''}`,
        '',
        (state: IHistoryState) => {
          state.genesetOrder[file] = ids
        }
      )
    },

    goto: (path: HistoryPath) => {
      const { app, file, sheet, plot } = toPathId(path)

      addAction(
        `Goto ${Boolean(plot) ? `plot ${plot}` : Boolean(sheet) ? `sheet ${sheet}` : Boolean(file) ? `file ${file}` : `app ${app}`}`,
        '',
        (state: IHistoryState, store: Readonly<IDataStore>) => {
          if (app in store.apps) {
            state.currentApp = app
          }

          if (file in store.files) {
            state.currentFile = file
          }

          if (sheet in store.sheets) {
            state.currentSheet = sheet
            state.currentSelections = [
              {
                type: 'sheet',
                path: state.currentSheet,
              },
            ]
          }

          if (plot in store.plots) {
            state.currentPlot = plot
            state.currentSelections = [
              {
                type: 'plot',
                path: state.currentPlot,
              },
            ]
          }
        }
      )
    },
  }
})

interface IFileOps {
  mode?: AppendMode
  path?: string
  sheets?: BaseDataFrame[]
  plots?: HistoryPlot[]
  groupsName?: string
  groups?: IClusterGroup[]
  genesets?: IGeneset[]
}

interface ISheetOps {
  name?: string
  mode?: AppendMode
  file?: string
  //path?: string
}

export function useHistory(): {
  store: IDataStore
  state: IHistoryState

  history: IHistoryEntry<IHistoryState>[]
  cursor: number
  present: IHistoryEntry<IHistoryState> | undefined
  currentApp: string
  currentFile: string
  currentSheet: string
  currentPlot: string
  currentSelections: { type: 'sheet' | 'plot'; path: string }[]
  currentSelection: ISelectionPath | undefined
  reset: () => void
  openApp: (name: string) => void

  // openBranch: (
  //   name: string,

  //   params?: IOpenBranchOpts
  // ) => void
  //updateBranch: (partial: Partial<IHistoryBranch>) => void

  historyUndo: (mode?: 'clear' | 'all' | 'step') => void
  historyRedo: () => void
  historyGoto: (step: number | string) => void
} & IHistorySlice &
  IAppSlice &
  ISheetSlice &
  IPlotSlice &
  IGroupSlice &
  IGenesetSlice {
  const store = useHistoryStore() as IDataStore

  const {
    state,
    history,
    cursor,
    present,
    currentApp,
    currentFile,
    currentSheet,
    currentPlot,
    currentSelections,
    currentSelection,
  } = useHistoryStore(
    useShallow(state => {
      const presentEntry = state.history[state.cursor]

      return {
        state: state.present,
        history: state.history,
        cursor: state.cursor,
        present: presentEntry,
        currentApp: state.present.currentApp,
        currentFile: state.present.currentFile,
        currentSheet: state.present.currentSheet,
        currentPlot: state.present.currentPlot,
        currentSelections: state.present.currentSelections,
        currentSelection:
          state.present.currentSelections.length > 0
            ? state.present.currentSelections[
                state.present.currentSelections.length - 1
              ]!
            : undefined,
      }
    })
  )

  const openApp = useHistoryStore(state => state.openApp)
  const openFile = useHistoryStore(state => state.openFile)
  const reset = useHistoryStore(state => state.reset)

  const remove = useHistoryStore(state => state.remove)
  const removeFiles = useHistoryStore(state => state.removeFiles)

  const addSheets = useHistoryStore(state => state.addSheets)
  const reorderSheets = useHistoryStore(state => state.reorderSheets)
  const addPlots = useHistoryStore(state => state.addPlots)
  const reorderPlots = useHistoryStore(state => state.reorderPlots)
  const updatePlot = useHistoryStore(state => state.updatePlot)

  const addGroups = useHistoryStore(state => state.addGroups)
  const removeGroups = useHistoryStore(state => state.removeGroups)
  const reorderGroups = useHistoryStore(state => state.reorderGroups)

  const addGenesets = useHistoryStore(state => state.addGenesets)
  const removeGenesets = useHistoryStore(state => state.removeGenesets)
  const reorderGenesets = useHistoryStore(state => state.reorderGenesets)

  const goto = useHistoryStore(state => state.goto)

  const historyUndo = useHistoryStore(state => state.historyUndo)
  const historyRedo = useHistoryStore(state => state.historyRedo)
  const historyGoto = useHistoryStore(state => state.historyGoto)

  return {
    store,
    state,

    history,
    cursor,
    present,
    currentApp,
    currentFile,
    currentSheet,
    currentPlot,
    currentSelections,
    currentSelection,
    openApp,
    openFile,

    reset,
    addSheets,

    reorderSheets,
    reorderPlots,
    updatePlot,
    addPlots,
    addGroups,
    removeGroups,
    reorderGroups,
    addGenesets,
    removeGenesets,
    reorderGenesets,

    remove,
    removeFiles,
    //select,
    goto,
    historyUndo,
    historyRedo,
    historyGoto,
  }
}

export function useState(): IHistoryState {
  return useHistoryStore(useShallow(state => state.present))
}

// export function pathSplit(path: string): string[] {
//   if (!path) {
//     return []
//   }

//   if (path.startsWith(PATH_SEP)) {
//     path = path.slice(1)
//   }

//   return path.split(PATH_SEP).map(part => part.trim())
// }

export function useApp(path: string = ''): IHistoryApp | undefined {
  return useHistoryStore(
    useShallow(state => {
      return state.apps[path || state.present.currentApp]
    })
  )
}

export function useGroups(path: string = ''): IClusterGroup[] {
  return useHistoryStore(
    useShallow(state => {
      return (
        state.present.groupOrder[path || state.present.currentFile] || []
      ).map(id => state.groups[id]!)
    })
  )
}

export function useGroupName(path: string = ''): string {
  return useHistoryStore(
    useShallow(state => {
      return state.groupNames[path || state.present.currentFile] || ''
    })
  )
}

export function useGenesets(path: string = ''): IGeneset[] {
  return useHistoryStore(
    useShallow(state => {
      return (
        state.present.genesetOrder[path || state.present.currentFile] || []
      ).map(id => state.genesets[id]!)
    })
  )
}

/**
 * Returns a files from an app. If no id is given, returns the
 * @param path
 * @param id
 * @returns
 */
export function useFile(path: string = ''): IHistoryFile | undefined {
  return useHistoryStore(
    useShallow(state => {
      return state.files[path || state.present.currentFile]
    })
  )
}

export function useFiles(path: string = ''): IHistoryFile[] {
  return useHistoryStore(
    useShallow(state => {
      const appId = path || state.present.currentApp

      return (state.present.fileOrder[appId] || []).map(id => state.files[id]!)
    })
  )
}

export function useSheet(path: string = ''): DataFrameType | undefined {
  return useHistoryStore(
    useShallow(state => {
      return state.sheets[path || state.present.currentSheet]
    })
  )
}

export function useSheets(path: string = ''): DataFrameType[] {
  return useHistoryStore(
    useShallow(state => {
      return (
        state.present.sheetOrder[path || state.present.currentFile] || []
      ).map(id => state.sheets[id]!)
    })
  )
}

export function usePlots(path: string = ''): HistoryPlot[] {
  return useHistoryStore(
    useShallow(state => {
      return (
        state.present.plotOrder[path || state.present.currentFile] || []
      ).map(id => state.plots[id]!)
    })
  )
}

export function usePlot(path: string = ''): HistoryPlot | undefined {
  return useHistoryStore(
    useShallow(state => {
      return state.plots[path || state.present.currentPlot]
    })
  )
}

export function getApps(
  store: IDataStore,
  state: IHistoryState
): IHistoryApp[] {
  return state.appOrder.map(id => store.apps[id]!)
}

export function getFiles(
  store: IDataStore,
  state: IHistoryState,
  app: string | { id: string } | undefined = ''
): IHistoryFile[] {
  const id = (typeof app === 'string' ? app : app?.id) || state.currentApp

  return (state.fileOrder[id] || []).map(id => store.files[id]!)
}

export function getSheets(
  store: IDataStore,
  state: IHistoryState,
  file: string | { id: string } | undefined = ''
): DataFrameType[] {
  const id = (typeof file === 'string' ? file : file?.id) || state.currentFile

  return (state.sheetOrder[id] || []).map(id => store.sheets[id]!)
}

export function getPlots(
  store: IDataStore,
  state: IHistoryState,
  file: string | { id: string } | undefined = ''
): HistoryPlot[] {
  const id = (typeof file === 'string' ? file : file?.id) || state.currentFile

  return (state.plotOrder[id] || []).map(id => store.plots[id]!)
}

export function getGroups(
  store: IDataStore,
  state: IHistoryState,
  file: string | { id: string } | undefined = ''
): IClusterGroup[] {
  const id = (typeof file === 'string' ? file : file?.id) || state.currentFile

  return (state.groupOrder[id] || []).map(id => store.groups[id]!)
}

export function getGenesets(
  store: IDataStore,
  state: IHistoryState,
  file: string | { id: string } | undefined = ''
): IGeneset[] {
  const id = (typeof file === 'string' ? file : file?.id) || state.currentFile

  return (state.genesetOrder[id] || []).map(id => store.genesets[id]!)
}

// export function usePlots(path: string = ''): HistoryPlot[] {
//   return useHistoryStore(
//     useShallow(state => {
//       return (
//         state.present.plotOrder[path || state.present.currentFile] || []
//       ).map(id => state.present.plots[id]!)
//     })
//   )
// }

// export function findApp(
//   state: IHistoryState,
//   id: string | undefined
// ): IHistoryApp | undefined {
//   if (!id) {
//     return state.apps.find(app => state.currentApp.includes(app.id))
//   }

//   const lid = id.toLowerCase()
//   return state.apps.find(s => s.id === id || s.name.toLowerCase() === lid)
// }

// export function findFile(
//   state: IHistoryState,
//   app: IHistoryApp,
//   id: string | undefined = undefined
// ): IHistoryFile | undefined {
//   if (!id) {
//     return app.files.find(s => state.currentFile.includes(s.id))
//   }

//   const lid = id.toLowerCase()
//   return app.files.find(s => s.id === id || s.name.toLowerCase() === lid)
// }

export function findSheet(
  store: IDataStore,
  state: IHistoryState,
  file: string | { id: string } | undefined,
  q: string
): DataFrameType | undefined {
  if (!file) {
    return undefined
  }

  const id = (typeof file === 'string' ? file : file?.id) || state.currentFile

  const lid = q.toLowerCase()

  return (state.sheetOrder[id] || [])
    .map(id => store.sheets[id]!)
    .find(s => s.id === q || s.name.toLowerCase() === lid)
}

// export function findPlot(
//   state: IHistoryState,
//   file: IHistoryFile,
//   id: string | undefined = undefined
// ): HistoryPlot | undefined {
//   if (!id) {
//     return file.plots.find(s => state.currentPlot.includes(s.id))
//   }

//   const lid = id.toLowerCase()
//   return file.plots.find(s => s.id === id || s.name.toLowerCase() === lid)
// }

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
function toPathId(path: Record<string, StrOrId>): PathId {
  const app = 'app' in path ? strOrIdToStr(path.app) : ''
  const file = 'file' in path ? strOrIdToStr(path.file) : ''
  const sheet = 'sheet' in path ? strOrIdToStr(path.sheet) : ''
  const plot = 'plot' in path ? strOrIdToStr(path.plot) : ''
  const group = 'group' in path ? strOrIdToStr(path.group) : ''
  const geneset = 'geneset' in path ? strOrIdToStr(path.geneset) : ''

  return { app, file, sheet, plot, group, geneset }
}

function removeApp(state: IHistoryState, p: PathId) {
  if ((state.appOrder.length || 0) < 2) {
    return // cannot remove default
  }

  state.appOrder = state.appOrder.filter(id => id !== p.app)
  delete state.fileOrder[p.app]
}

function removeFile(state: IHistoryState, p: PathId) {
  if ((state.fileOrder[p.app]?.length || 0) < 2) {
    return // cannot remove default
  }

  state.fileOrder[p.app] = state.fileOrder[p.app]!.filter(id => id !== p.file)

  delete state.sheetOrder[p.file]
  delete state.plotOrder[p.file]
  delete state.groupOrder[p.file]
  delete state.genesetOrder[p.file]

  // select previous sheet/plot
  const files = state.fileOrder[p.app]!
  const lastFile = files[files.length - 1]!

  state.currentFile = lastFile
  const sheets = state.sheetOrder[lastFile]!
  state.currentSheet = sheets[sheets.length - 1]!
  const plots = state.plotOrder[lastFile]!
  state.currentPlot = plots[plots.length - 1]!
  state.currentSelections = [{ type: 'sheet', path: state.currentSheet }]
}

function removeSheet(state: IHistoryState, p: PathId) {
  if ((state.sheetOrder[p.file]?.length || 0) < 2) {
    return // cannot remove default
  }

  state.sheetOrder[p.file] = state.sheetOrder[p.file]!.filter(
    id => id !== p.sheet
  )

  const sheets = state.sheetOrder[p.file]!
  state.currentSheet = sheets[sheets.length - 1]!
  state.currentSelections = [{ type: 'sheet', path: state.currentSheet }]
}

function removePlot(state: IHistoryState, p: PathId) {
  state.plotOrder[p.file] = state.plotOrder[p.file]!.filter(id => id !== p.plot)

  if (state.plotOrder[p.file]!.length > 0) {
    // if there are still plots left, select the previous one
    const plots = state.plotOrder[p.file]!
    state.currentPlot = plots[plots.length - 1]!
    state.currentSelections = [{ type: 'plot', path: state.currentPlot }]
  } else {
    // otherwise select the last sheet
    const sheets = state.sheetOrder[p.file]!
    state.currentPlot = ''
    state.currentSheet = sheets[sheets.length - 1]!
    state.currentSelections = [{ type: 'sheet', path: state.currentSheet }]
  }
}

function removeGroup(state: IHistoryState, p: PathId) {
  state.groupOrder[p.file] = state.groupOrder[p.file]!.filter(
    id => id !== p.group
  )
}

function removeGeneset(state: IHistoryState, p: PathId) {
  state.genesetOrder[p.file] = state.genesetOrder[p.file]!.filter(
    id => id !== p.geneset
  )
}

function isAppOnly(p: PathId): boolean {
  return (
    Boolean(p.app) && !p.file && !p.sheet && !p.plot && !p.group && !p.geneset
  )
}

function isFileOnly(p: PathId): boolean {
  return (
    Boolean(p.app) &&
    Boolean(p.file) &&
    !p.sheet &&
    !p.plot &&
    !p.group &&
    !p.geneset
  )
}

function isSheet(p: PathId): boolean {
  return Boolean(p.file) && Boolean(p.sheet)
}

function isPlot(p: PathId): boolean {
  return Boolean(p.file) && Boolean(p.plot)
}

function isGroup(p: PathId): boolean {
  return Boolean(p.file) && Boolean(p.group)
}

function isGeneset(p: PathId): boolean {
  return Boolean(p.file) && Boolean(p.geneset)
}
