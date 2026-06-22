// import {
//   AnnotationDataFrame,
//   DATAFRAME_100x26,
// } from '@/lib/dataframe/annotation-dataframe'

// import { makeUuid } from '@/lib/id'
// import { enablePatches, produce } from 'immer'
// import { create } from 'zustand'
// import { useShallow } from 'zustand/react/shallow'

// import {
//   DEFAULT_HEATMAP_PROPS,
//   type IHeatMapDisplayOptions,
// } from '@/components/plot/heatmap/heatmap-svg-props'
// import type { IClusterGroup } from '@/lib/cluster-group'
// import { type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
// import {
//   getFormattedShape,
//   getFormattedShapeSmall,
// } from '@/lib/dataframe/dataframe-utils'
// import type { IExtGseaResult, IGseaResult } from '@/lib/gsea/ext-gsea'
// import type { IGeneSet, IRankedGenes } from '@/lib/gsea/geneset'
// import { PATH_SEP } from '@/lib/http/urls'
// import type { IClusterFrame } from '@/lib/math/hcluster'
// import { formattedList, type UndefNullStr } from '@/lib/text/text'
// import { useHydration } from '@/stores/hydration'
// import {
//   DEFAULT_BOX_PLOT_DISPLAY_PROPS,
//   type IBoxPlotDisplayOptions,
// } from '../apps/boxplot/boxplot-plot-svg'
// import {
//   DEFAULT_EXT_GSEA_PROPS,
//   type IExtGseaDisplayOptions,
// } from '../apps/ext-gsea/ext-gsea-store'
// import {
//   DEFAULT_VOLCANO_PROPS,
//   type IVolcanoDisplayOptions,
// } from '../apps/volcano/volcano-plot-svg'
// import {
//   HistoryManager,
//   type IHistoryEntry,
//   type IUndoState,
// } from './history-manager'

// enablePatches()

// export const HISTORY_STEP_TYPE_OPEN = 'open'

// export const DEFAULT_APP_NAME = 'Default'

// export const DEFAULT_STEP_NAME = 'Load sheet'

// const DEFAULT_APP = newHistoryApp('Default')
// const DEFAULT_FILE = newHistoryFile('Default')
// const DEFAULT_SHEET = DATAFRAME_100x26

// export type NodeType = 'app' | 'branch' | 'sheet' | 'plot'

// export type GotoType = NodeType | 'path'

// export interface ISelectionPath {
//   type: NodeType
//   id: string
// }

// export interface IHistoryComp {
//   id: string
//   //path: string
//   name: string
//   createdAt: number
// }

// export type DataFrameType = BaseDataFrame | AnnotationDataFrame | IClusterFrame

// export interface BasePlot extends IHistoryComp {
//   //style: PlotStyle
//   // groups to make plots so that they are independent
//   // of history such that if user moves groups around
//   // it won't affect any plots generated
//   groups: IClusterGroup[]
//   actions: string[]
//   type: 'plot'
// }

// export interface HeatMapPlot extends BasePlot {
//   style: 'heatmap' | 'dot'
//   dataframes: Record<string, DataFrameType>
//   props: IHeatMapDisplayOptions
// }

// export interface VolcanoPlot extends BasePlot {
//   style: 'volcano'
//   dataframes: Record<string, BaseDataFrame>
//   props: IVolcanoDisplayOptions
// }

// export interface BoxPlot extends BasePlot {
//   style: 'box'
//   dataframes: Record<string, BaseDataFrame>
//   props: IBoxPlotDisplayOptions
//   x: string
//   y: string
//   hue: string
//   xOrder: string[]
//   hueOrder: string[]
//   // singlePlotDisplayOptions: Record<
//   //   string,
//   //   Record<string, IBoxPlotDisplayOptions>
//   // >
//   singlePlotDisplayOptions: object
// }

// export interface LollipopPlot extends BasePlot {
//   style: 'lollipop'
// }

// export interface ExtGseaPlot extends BasePlot {
//   style: 'ext-gsea'
//   props: IExtGseaDisplayOptions
//   rankedGenes: IRankedGenes
//   gs1: IGeneSet
//   gs2: IGeneSet
//   extGseaRes: IExtGseaResult
//   gseaRes1: IGseaResult
//   gseaRes2: IGseaResult
// }

// export type HistoryPlot =
//   | HeatMapPlot
//   | VolcanoPlot
//   //| LollipopPlot
//   | ExtGseaPlot
//   | BoxPlot

// export type HistoryNode = IHistoryApp | HistoryPlot

// // function createDefaultSheet(): BaseDataFrame {
// //   return create100x26Df()
// // }

// export function newHeatMapPlot(
//   name: string,
//   dataframes: Record<string, DataFrameType> = {},
//   opts: Partial<HeatMapPlot> = {}
// ): HeatMapPlot {
//   const {
//     style = 'heatmap',
//     props = { ...DEFAULT_HEATMAP_PROPS },
//     actions = [],
//     groups = [],
//   } = opts

//   return {
//     id: makeUuid(),
//     //path: '',
//     style,
//     name,
//     dataframes,
//     groups,
//     props,
//     actions,
//     type: 'plot',
//     createdAt: Date.now(),
//   }
// }

// export function newBoxPlot(
//   name: string,
//   dataframes: Record<string, BaseDataFrame> = {},
//   opts: Partial<BoxPlot> = {}
// ): BoxPlot {
//   const {
//     style = 'box',
//     props = { ...DEFAULT_BOX_PLOT_DISPLAY_PROPS },
//     actions = [],
//     groups = [],
//     x = '',
//     y = '',
//     hue = '',
//     xOrder = [],
//     hueOrder = [],
//     singlePlotDisplayOptions = {},
//   } = opts

//   return {
//     id: makeUuid(),
//     //path: '',
//     style,
//     name,
//     dataframes,
//     groups,
//     props,
//     actions,
//     x,
//     y,
//     hue,
//     xOrder,
//     hueOrder,
//     singlePlotDisplayOptions,
//     type: 'plot',
//     createdAt: Date.now(),
//   }
// }

// export function newVolcanoPlot(
//   name: string,
//   dataframes: Record<string, BaseDataFrame> = {},

//   opts: Partial<VolcanoPlot> = {}
// ): VolcanoPlot {
//   const {
//     style = 'volcano',
//     props = { ...DEFAULT_VOLCANO_PROPS },
//     actions = [],
//     groups = [],
//   } = opts

//   return {
//     id: makeUuid(),
//     ////path: '',
//     style,
//     name,
//     dataframes,
//     groups,
//     props,
//     actions,
//     type: 'plot',
//     createdAt: Date.now(),
//   }
// }

// export function newExtGseaPlot(
//   name: string,

//   opts: Partial<ExtGseaPlot> = {}
// ): ExtGseaPlot {
//   const {
//     actions = [],
//     groups = [],
//     extGseaRes = {} as IExtGseaResult,
//     gseaRes1 = {} as IGseaResult,
//     gseaRes2 = {} as IGseaResult,
//     rankedGenes = {} as IRankedGenes,
//     gs1 = {} as IGeneSet,
//     gs2 = {} as IGeneSet,
//     props = { ...DEFAULT_EXT_GSEA_PROPS },
//   } = opts

//   return {
//     id: makeUuid(),
//     //path: '',
//     style: 'ext-gsea',
//     name,
//     //dataframes,
//     groups,
//     extGseaRes,
//     gseaRes1,
//     gseaRes2,
//     rankedGenes,
//     gs1,
//     gs2,
//     props,
//     actions,
//     type: 'plot',
//     createdAt: Date.now(),
//   }
// }

// export interface IHistoryFileDesc {
//   app: string
//   file: string
//   node: string
//   type: 'app' | 'file' | 'sheet' | 'plot'
// }

// export interface IHistoryApp extends IHistoryComp {
//   type: 'app'
// }

// export function newHistoryApp(name: string): IHistoryApp {
//   const id = makeUuid()

//   return {
//     id,
//     //path,
//     name,
//     type: 'app',
//     createdAt: Date.now(),
//   }
// }

// export function newHistoryFile(name: string): IHistoryComp {
//   return {
//     id: makeUuid(),
//     name,
//     createdAt: Date.now(),
//   }
// }

// export function cloneHistory(history: IHistoryApp): IHistoryApp {
//   return produce(history, () => {})
// }

// export function defaultHistoryTree(): IHistoryApp {
//   return newHistoryApp(DEFAULT_APP_NAME)
// }

// type AppendMode = 'set' | 'append'

// export type HistoryUpdateProps = (
//   addr: string,
//   name: string,
//   prop: unknown
// ) => void

// interface IAppSlice {
//   openApp: (name: string) => void
//   openFile: (name: string, opts: IFileOps) => void
//   //updateGroupsName: (name: string, path: AppPath | string) => void
// }

// interface IPlotSlice {
//   addPlots: (plot: HistoryPlot[], opts?: ISheetOps) => void
//   reorderPlots: (plotIds: string[], opts?: ISheetOps) => void
//   updatePlot: (plot: HistoryPlot) => void
// }

// type IdObj = { id: string }

// type StrOrIdObj = string | IdObj
// type OptStrOrIdObj = StrOrIdObj | undefined

// type AppPath = { app: StrOrIdObj }

// type BaseFilePath = { file: StrOrIdObj }
// type FilePath = AppPath & BaseFilePath
// export type SheetPath = FilePath & { sheet: StrOrIdObj } // omit file
// type PlotPath = FilePath & { plot: StrOrIdObj }
// type GroupPath = FilePath & { group: StrOrIdObj }
// type GenesetPath = FilePath & { geneset: StrOrIdObj }

// type HistoryPath =
//   | AppPath
//   | FilePath
//   | SheetPath
//   | PlotPath
//   | GroupPath
//   | GenesetPath

// /**
//  * Convert a string or an object with an id property to a string ID.
//  * This is useful for functions that can accept either an ID string or an
//  * object with an ID, allowing for more flexible input while ensuring
//  * that the output is always a consistent string ID.
//  *
//  * @param strOrId
//  * @returns
//  */
// export function strOrIdToStr(strOrId: StrOrIdObj): string {
//   return typeof strOrId === 'string' ? strOrId : strOrId.id
// }

// interface IGroupOps {
//   name?: string
//   mode?: AppendMode
//   file?: string
// }

// interface IHistorySlice {
//   remove: (ids: HistoryPath[]) => void
//   removeFiles: (ids: FilePath[]) => void
//   //select: (paths: string[], mode?: AppendMode) => void
//   goto: (path: HistoryPath) => void
// }

// interface IGroupSlice {
//   addGroups: (groups: IClusterGroup[], opts?: IGroupOps) => void
//   reorderGroups: (ids: string[], opts?: IGroupOps) => void
//   removeGroups: (ids: string[], opts?: IGroupOps) => void
//   updateGroup: (group: IClusterGroup, opts?: IGroupOps) => void
// }

// interface IGenesetSlice {
//   addGenesets: (genesets: IGeneSet[], opts?: IGroupOps) => void
//   reorderGenesets: (ids: string[], opts?: IGroupOps) => void
//   removeGenesets: (ids: string[], opts?: IGroupOps) => void
//   updateGeneset: (geneset: IGeneSet) => void
// }

// interface ISheetSlice {
//   addSheets: (
//     sheets: BaseDataFrame[],

//     opts?: ISheetOps
//   ) => void
//   reorderSheets: (
//     sheets: string[],

//     opts?: ISheetOps
//   ) => void
// }

// /**
//  * For keeping track of which app, file, sheet, the ui is currently showing.
//  * Current selection can be either a sheet or a plot for ui instances where
//  * it needs to decide which one to show. For example, if user clicks on a plot in the file tree,
//  * the current selection will be set to that plot, and the ui will show the plot.
//  * If user clicks on a sheet, the current selection will be set to that sheet, and the ui will show the sheet.
//  */
// export interface IHistoryState extends IHistoryComp {
//   // order maps to preserve hierarchy
//   appOrder: string[] // app IDs in order
//   fileOrder: Record<string, string[]> // appId -> file IDs
//   sheetOrder: Record<string, string[]> // fileId -> sheet IDs
//   plotOrder: Record<string, string[]> // fileId -> plot IDs
//   groupOrder: Record<string, string[]> // fileId -> group IDs
//   genesetOrder: Record<string, string[]> // fileId -> geneset IDs

//   currentApp: string
//   currentFile: string
//   currentSheet: string
//   currentPlot: string | undefined
//   currentSelections: ISelectionPath[]
// }

// // Stores all objects by ID for easy access and immutability
// interface IHistoryDataStore {
//   apps: Record<string, IHistoryApp>
//   files: Record<string, IHistoryComp>
//   sheets: Record<string, DataFrameType>
//   plots: Record<string, HistoryPlot>
//   groupNames: Record<string, string>
//   groups: Record<string, IClusterGroup>
//   genesets: Record<string, IGeneSet>
// }

// interface IHistoryStore
//   extends
//     IHistorySlice,
//     IAppSlice,
//     ISheetSlice,
//     IPlotSlice,
//     IGroupSlice,
//     IGenesetSlice,
//     IUndoState<IHistoryState>,
//     IHistoryDataStore {
//   //addAction: (action: HistoryEvent, fn: (draft: IHistoryState) => void) => void

//   /**
//    * Remove a specific history point.
//    * @param id The ID(s) of the history point to remove.
//    * @param type The type of history point (app, branch, step, sheet, plot).
//    * @returns
//    */

//   reset: () => void
//   resetApp: (app: OptStrOrIdObj) => void

//   undo: () => void
//   redo: () => void
//   seek: (step: number | string) => void
// }

// export function pathJoin(...parts: ({ id: string } | UndefNullStr)[]): string {
//   return (
//     '/' +
//     parts
//       .filter((part) => part !== null && part !== undefined)
//       .map((part) => (typeof part === 'string' ? part.trim() : part.id))
//       .map((part) => part.split(PATH_SEP))
//       .flat() // split parts by path separator to avoid issues with nested paths and flatten the result

//       .filter((p, pi) => pi > 0 || p !== '') // remove empty leading
//       .join(PATH_SEP)
//   )
// }

// function initState(): Omit<IHistoryState, 'id' | 'name' | 'createdAt'> {
//   return {
//     appOrder: [DEFAULT_APP.id],
//     fileOrder: { [DEFAULT_APP.id]: [DEFAULT_FILE.id] },
//     sheetOrder: { [DEFAULT_FILE.id]: [DEFAULT_SHEET.id] },
//     plotOrder: { [DEFAULT_FILE.id]: [] },
//     groupOrder: { [DEFAULT_FILE.id]: [] },
//     genesetOrder: { [DEFAULT_FILE.id]: [] },

//     currentApp: DEFAULT_APP.id,
//     currentFile: DEFAULT_FILE.id,
//     currentSheet: DEFAULT_SHEET.id,
//     currentPlot: '',
//     currentSelections: [{ type: 'sheet', id: DEFAULT_SHEET.id }],
//   }
// }

// function resetState(
//   state: IHistoryState
// ): Omit<IHistoryState, 'id' | 'name' | 'createdAt'> {
//   const defaultSheet = state.sheetOrder[DEFAULT_FILE.id]![0]!

//   return {
//     appOrder: [DEFAULT_APP.id],
//     fileOrder: { [DEFAULT_APP.id]: [DEFAULT_FILE.id] },
//     sheetOrder: { [DEFAULT_FILE.id]: [defaultSheet] },
//     plotOrder: { [DEFAULT_FILE.id]: [] },
//     groupOrder: { [DEFAULT_FILE.id]: [] },
//     genesetOrder: { [DEFAULT_FILE.id]: [] },

//     currentApp: DEFAULT_APP.id,
//     currentFile: DEFAULT_FILE.id,
//     currentSheet: defaultSheet,
//     currentPlot: '',
//     currentSelections: [{ type: 'sheet', id: defaultSheet }],
//   }
// }

// function resetApp(state: IHistoryState, opts: { app?: OptStrOrIdObj } = {}) {
//   const { app } = opts
//   const id = getAppId(state, { app })

//   state.fileOrder[id] = [DEFAULT_FILE.id]

//   state.currentFile = DEFAULT_FILE.id
//   state.currentSheet = state.sheetOrder[0]![0]!
//   state.currentPlot = ''
//   state.currentSelections = [{ type: 'sheet', id: state.currentSheet }]
// }

// function resetStore(): IHistoryDataStore {
//   return {
//     apps: { [DEFAULT_APP.id]: DEFAULT_APP },
//     files: { [DEFAULT_FILE.id]: DEFAULT_FILE },
//     sheets: { [DEFAULT_SHEET.id]: DEFAULT_SHEET },
//     plots: {},
//     groups: {},
//     groupNames: { [DEFAULT_FILE.id]: 'Groups' },
//     genesets: {},
//   }
// }

// // The store is a datastore of files and an undo state
// // that stores IHistoryState snapshots and patches for undo/redo functionality.
// function init(): IUndoState<IHistoryState> & IHistoryDataStore {
//   const id = makeUuid()

//   //const defaultSheet = createDefaultSheet()

//   let state: IHistoryState = {
//     id,
//     name: 'History',
//     createdAt: Date.now(),
//     ...initState(),
//   }

//   const historyEntry: IHistoryEntry<IHistoryState> = {
//     id: makeUuid(),
//     name: 'Initialize history',
//     description: '',
//     createdAt: Date.now(),
//     state,
//     type: 'snapshot',
//   }

//   return {
//     ...resetStore(),

//     present: state,
//     history: [historyEntry],
//     cursor: 0,
//   }
// }

// function dataStoreView(state: IHistoryStore): IHistoryDataStore {
//   return {
//     apps: state.apps,
//     files: state.files,
//     sheets: state.sheets,
//     plots: state.plots,
//     groupNames: state.groupNames,
//     groups: state.groups,
//     genesets: state.genesets,
//   }
// }

// // logic to manage history state, including undo/redo and goto functionality.
// // We use a combination of snapshots and patches to optimize for both memory
// // usage and performance. Snapshots are taken every 10 steps or when the
// // number of patches exceeds 50 to ensure that we don't have to apply too
// // many patches when undoing/redoing.
// const historyManager = new HistoryManager<IHistoryState>()

// export const useHistoryStore = create<IHistoryStore>((set, get) => {
//   /**
//    * To update the history state with an action we use immer to produce the next state
//    * and record the patches for undo/redo functionality rather than
//    * directly mutating the state.
//    *
//    * @param action Description of the action for logging and debugging purposes.
//    * @param description Optional additional details about the action.
//    * @param tory Function that receives a draft of the current history state to apply changes.
//    * @returns
//    */
//   function addAction(
//     name: string,
//     description: string,
//     updateHistory: (
//       state: IHistoryState,
//       store: Readonly<IHistoryDataStore>
//     ) => void,
//     updateStore?: (store: IHistoryDataStore) => void
//   ) {
//     // use the current state for producing the next state. Inverse
//     // patches are used for undo functionality.

//     set((state) => {
//       const result = historyManager.applyUpdate(
//         state,
//         name,
//         description,
//         (draft: IHistoryState) => {
//           // draft` is mutable here — Immer handles producing the next state
//           // `state as Readonly<IDataStore>` ensures that updateHistory cannot accidentally mutate
//           // the rest of the store.
//           updateHistory(
//             draft,
//             dataStoreView(state) as Readonly<IHistoryDataStore>
//           )
//         }
//       )

//       const newState = {
//         ...state,
//         ...result,
//       }

//       // side effects can safely mutate the returned store
//       if (updateStore) {
//         updateStore(dataStoreView(newState))
//       }

//       // the returned object becomes the new state
//       return newState
//     })
//   }

//   return {
//     ...init(),

//     reset: () => {
//       set(
//         produce((state: IHistoryStore) => {
//           state.present = {
//             ...state.present,
//             ...resetState(state.present),
//           }

//           const historyEntry: IHistoryEntry<IHistoryState> = {
//             id: makeUuid(),
//             name: 'Initialize history',
//             description: '',
//             createdAt: Date.now(),
//             state: state.present,
//             type: 'snapshot',
//           }

//           state.history = [historyEntry]
//           state.cursor = 0
//         })
//       )
//     },

//     resetApp: (app: OptStrOrIdObj = undefined) => {
//       set(
//         produce((state: IHistoryStore) => {
//           const id = getAppId(state.present, { app })
//           const appObj = state.apps[id]!

//           resetApp(state.present, { app })

//           const historyEntry: IHistoryEntry<IHistoryState> = {
//             id: makeUuid(),
//             name: `Reset ${appObj.name} app`,
//             description: '',
//             createdAt: Date.now(),
//             state: state.present,
//             type: 'snapshot',
//           }

//           state.history = [historyEntry]
//           state.cursor = 0
//         })
//       )
//     },

//     undo: () => {
//       // the past becomes the present, the current present becomes the future
//       // and the past loses an entry
//       set((state) => ({
//         ...historyManager.undo(state),
//       }))
//     },

//     redo: () => {
//       set((state) => ({
//         ...historyManager.redo(state),
//       }))
//     },

//     seek: (step: number | string) => {
//       set((state) => ({
//         ...historyManager.goto(state, step),
//       }))
//     },

//     openApp: (id: string) => {
//       const la = id.toLowerCase()

//       // check if app with this name already exists. If it does, we don't want to create a new app, just switch to it
//       const appExists = Object.values(get().apps).some(
//         (a) => a.name.toLowerCase() === la || a.id.toLowerCase() === la
//       )

//       if (appExists) {
//         addAction(`Open ${id} app`, '', (state: IHistoryState) => {
//           //const { branch } = newDefaultBranch()

//           // switch to the new app
//           state.currentApp = app.id
//         })
//         return
//       }

//       const app = newHistoryApp(id)

//       addAction(
//         `Open ${id} app`,
//         '',
//         (state: IHistoryState) => {
//           //const { branch } = newDefaultBranch()

//           // switch to the new app
//           state.currentApp = app.id

//           state.appOrder.push(app.id)

//           state.fileOrder[state.currentApp] = [DEFAULT_FILE.id]
//           state.sheetOrder[DEFAULT_FILE.id] = [DEFAULT_SHEET.id]

//           const files = state.fileOrder[state.currentApp]!
//           state.currentFile = files[files.length - 1]!

//           const sheets = state.sheetOrder[state.currentFile]!
//           state.currentSheet = sheets[sheets.length - 1]!

//           state.currentPlot = ''

//           state.currentSelections = [{ type: 'sheet', id: state.currentSheet }]
//         },
//         (store: IHistoryDataStore) => {
//           // after opening the app, we want to make sure the default file and sheet are added to the store
//           store.apps[app.id] = app
//         }
//       )
//     },

//     openFile: (name: string, opts: IFileOps = {}) => {
//       let {
//         sheets = [DEFAULT_SHEET],
//         plots = [],
//         mode = 'append',
//         app = get().present.currentApp,
//         groupsName = '',
//         groups = [],
//         genesets = [],
//       } = opts

//       if (sheets.length === 0) {
//         return
//       }

//       if (!name) {
//         name = sheets[0]!.name
//       }

//       const file = newHistoryFile(name)

//       //const defaultSheet = createDefaultSheet()

//       const la = app.toLowerCase()

//       const appExists = Object.values(get().apps).some(
//         (a) => a.name.toLowerCase() === la || a.id === la
//       )

//       const appObj = appExists ? null : newHistoryApp(app)

//       addAction(
//         `Open file ${name}`,
//         getFormattedShapeSmall(sheets[0]),
//         (state: IHistoryState) => {
//           // these actions are logged to the history

//           if (appObj) {
//             state.currentApp = appObj.id
//           }

//           if (mode === 'append') {
//             // remove default file if it exists. Default file
//             // must always be first
//             const files = (state.fileOrder[state.currentApp] || []).filter(
//               (id) => id !== DEFAULT_FILE.id
//             )

//             state.fileOrder[state.currentApp] = [...files, file.id]
//           } else {
//             // Replace existing files with the new file
//             state.fileOrder[state.currentApp] = [file.id] // [state.fileOrder[appId]![0]!, file.id]
//           }

//           state.sheetOrder[file.id] = sheets.map((s) => s.id)

//           state.plotOrder[file.id] = plots.map((p) => p.id)
//           state.groupOrder[file.id] = groups.map((g) => g.id)
//           state.genesetOrder[file.id] = genesets.map((g) => g.id)

//           state.currentFile = file.id
//           state.currentSheet = sheets[sheets.length - 1]!.id
//           state.currentPlot =
//             plots.length > 0 ? plots[plots.length - 1]!.id : state.currentPlot
//           state.currentSelections = [{ type: 'sheet', id: state.currentSheet }]
//         },
//         (store: IHistoryDataStore) => {
//           // these actions are not logged to the history,
//           // but are used to update the store with the new file, sheets, and plots.
//           // We separate them because we don't want to log the entire file and sheet data
//           // to the history, just the action of opening a file with a certain name and shape.
//           // this is so objects are stored once, but operations on them are logged to the history,
//           // which is more efficient and makes the history easier to understand.

//           if (appObj) {
//             store.apps[appObj.id] = appObj
//           }

//           store.files[file.id] = file

//           for (const sheet of sheets) {
//             store.sheets[sheet.id] = sheet
//           }

//           for (const plot of plots) {
//             store.plots[plot.id] = plot
//           }

//           for (const group of groups) {
//             store.groups[group.id] = group
//           }

//           for (const geneset of genesets) {
//             store.genesets[geneset.id] = geneset
//           }

//           if (groupsName) {
//             store.groupNames[file.id] = groupsName
//           }
//         }
//       )
//     },

//     addSheets: (sheets: BaseDataFrame[], opts: ISheetOps = {}) => {
//       if (sheets.length === 0) {
//         return
//       }

//       let { name = '', mode = 'set', file = get().present.currentFile } = opts

//       // the default file is a special case because it's created by default when the app is created
//       // and can't be removed, so we don't want to allow adding sheets
//       // to it since it should always have the default sheet

//       // cannot add to default file
//       if (file === DEFAULT_FILE.id) {
//         return
//       }

//       name =
//         name ||
//         (sheets.length === 1
//           ? `Add sheet ${sheets[0]!.name}`
//           : `Add ${sheets.length} sheets`)

//       addAction(
//         name,
//         getFormattedShape(sheets[0]!),
//         (state: IHistoryState) => {
//           // user cannot add default sheet
//           const ids = sheets.map((s) => s.id) //.filter(id => id !== DEFAULT_SHEET.id)

//           if (mode === 'append') {
//             console.log('Appending sheets:', ids)
//             // when appending, remove default sheet if it exists to avoid confusion, but keep it at the beginning of the order if it's still there since it's a special sheet that should always be available
//             const sheets = (state.sheetOrder[file] || []).filter(
//               (id) => id !== DEFAULT_SHEET.id
//             )
//             state.sheetOrder[file] = [...sheets, ...ids]
//           } else {
//             // There must be a default sheet
//             // state.sheetOrder[file] = [
//             //   state.sheetOrder[file]![0]!,
//             //   ...sheets.map(s => s.id),
//             // ]

//             state.sheetOrder[file] = ids
//           }

//           state.currentSheet = sheets[sheets.length - 1]!.id
//           state.currentSelections = [{ type: 'sheet', id: state.currentSheet }]
//         },
//         (store: IHistoryDataStore) => {
//           for (const sheet of sheets) {
//             store.sheets[sheet.id] = sheet
//           }
//         }
//       )
//     },

//     addPlots: (plots: HistoryPlot[], opts: ISheetOps = {}) => {
//       if (plots.length === 0) {
//         return
//       }

//       const {
//         name = '',
//         mode = 'append',
//         file = get().present.currentFile,
//       } = opts || {}

//       // Plots cannot be added to the default file since it's meant to be a simple starting point
//       // with just a default sheet, and allowing plots to be added to it could
//       // complicate the user experience and the logic for managing the default file's contents.
//       if (file === DEFAULT_FILE.id) {
//         return
//       }

//       addAction(
//         name ||
//           (plots.length === 1
//             ? `Add plot ${plots[0]!.name}`
//             : `Add ${plots.length} plots`),
//         '',
//         (state: IHistoryState) => {
//           if (mode === 'append') {
//             state.plotOrder[file]?.push(...plots.map((p) => p.id))
//           } else {
//             state.plotOrder[file] = plots.map((p) => p.id)
//           }

//           state.currentPlot = plots[plots.length - 1]!.id
//           state.currentSelections = [{ type: 'plot', id: state.currentPlot }]
//         },
//         (store: IHistoryDataStore) => {
//           for (const plot of plots) {
//             store.plots[plot.id] = plot
//           }
//         }
//       )
//     },

//     remove: (paths: HistoryPath[]) => {
//       if (paths.length === 0) {
//         return
//       }

//       const pathIds: PathId[] = paths.map((path) => {
//         return toPathId(path)
//       })

//       console.log(
//         'Removing paths',
//         pathIds,
//         isAppOnly(pathIds[0]!),
//         isFileOnly(pathIds[0]!),
//         isSheet(pathIds[0]!)
//       )

//       addAction(
//         `Remove objects`,
//         '',
//         (state: IHistoryState) => {
//           for (const p of pathIds) {
//             console.log('Removing path', p, state)
//             if (isAppOnly(p)) {
//               removeApp(state, p)
//             } else if (isFileOnly(p)) {
//               removeFile(state, p)
//             } else if (isSheet(p)) {
//               console.log('Removing sheet', p)
//               removeSheet(state, p)
//             } else if (isPlot(p)) {
//               removePlot(state, p)
//             } else if (isGroup(p)) {
//               removeGroup(state, p)
//             } else if (isGeneset(p)) {
//               removeGeneset(state, p)
//             } else {
//               // do nothing if the path is invalid
//             }
//           }
//         }
//         // (store: IHistoryDataStore) => {
//         //   for (const p of pathIds) {
//         //     if (isAppOnly(p) && Object.keys(store.apps).length > 1) {
//         //       delete store.apps[p.app]
//         //     } else if (isFileOnly(p) && Object.keys(store.files).length > 1) {
//         //       delete store.files[p.file]
//         //     } else if (isSheet(p) && Object.keys(store.sheets).length > 1) {
//         //       delete store.sheets[p.sheet]
//         //     } else if (isPlot(p)) {
//         //       delete store.plots[p.plot]
//         //     } else if (isGroup(p)) {
//         //       delete store.groups[p.group]
//         //     } else if (isGeneset(p)) {
//         //       delete store.genesets[p.geneset]
//         //     } else {
//         //       // do nothing if the path is invalid or if it's the only remaining item of that type
//         //     }
//         //   }
//         // }
//       )
//     },

//     removeFiles: (paths: FilePath[]) => {
//       if (paths.length === 0) {
//         return
//       }

//       const pathIds: PathId[] = paths.map((path) => {
//         return toPathId(path)
//       })

//       addAction(
//         `Remove ${pathIds.length} file${pathIds.length > 1 ? 's' : ''}`,
//         '',
//         (state: IHistoryState) => {
//           for (const p of pathIds) {
//             removeFile(state, p)
//           }
//         },
//         (store: IHistoryDataStore) => {
//           for (const p of pathIds) {
//             if (Object.keys(store.files).length > 1) {
//               delete store.files[p.file]
//             }
//           }
//         }
//       )
//     },

//     reorderSheets: (ids: string[], opts: ISheetOps = {}) => {
//       if (ids.length === 0) {
//         return
//       }

//       const { file = get().present.currentFile } = opts

//       if (file === DEFAULT_FILE.id) {
//         return
//       }

//       addAction(
//         'Reorder sheets',
//         '',

//         (state: IHistoryState) => {
//           state.sheetOrder[file] = ids
//         }
//       )
//     },

//     reorderPlots: (ids: string[], opts: ISheetOps = {}) => {
//       if (ids.length === 0) {
//         return
//       }

//       const { file = get().present.currentFile } = opts

//       if (file === DEFAULT_FILE.id) {
//         return
//       }

//       addAction('Reorder plots', '', (state: IHistoryState) => {
//         state.plotOrder[file] = ids
//       })
//     },

//     updatePlot: (plot: HistoryPlot) => {
//       addAction(
//         `Update plot ${plot.id}`,
//         '',
//         () => {},
//         (store: IHistoryDataStore) => {
//           store.plots[plot.id] = plot
//         }
//       )
//     },

//     addGroups: (groups: IClusterGroup[], opts: IGroupOps = {}) => {
//       if (groups.length === 0) {
//         return
//       }

//       const {
//         mode = 'append',
//         name = '',
//         file = get().present.currentFile,
//       } = opts

//       if (file === DEFAULT_FILE.id) {
//         return
//       }

//       addAction(
//         `Add ${formattedList(groups.map((gs) => gs.name))} group${groups.length > 1 ? 's' : ''}`,
//         '',

//         (state: IHistoryState) => {
//           if (mode === 'append') {
//             state.groupOrder[file]?.push(...groups.map((g) => g.id))
//           } else {
//             state.groupOrder[file] = groups.map((g) => g.id)
//           }
//         },
//         (store: IHistoryDataStore) => {
//           for (const group of groups) {
//             store.groups[group.id] = group
//           }

//           if (name) {
//             store.groupNames[file] = name
//           }
//         }
//       )
//     },

//     updateGroup: (group: IClusterGroup, opts: IGroupOps = {}) => {
//       const { file = get().present.currentFile } = opts

//       if (file === DEFAULT_FILE.id) {
//         return
//       }

//       console.log('Updating group', group.id, 'in file', file)

//       addAction(
//         ` Update group ${group.id}`,
//         '',

//         () => {},
//         (store: IHistoryDataStore) => {
//           store.groups[group.id] = group
//         }
//       )
//     },

//     removeGroups: (ids: string[], opts: IGroupOps = {}) => {
//       if (ids.length === 0) {
//         return
//       }

//       const { file = get().present.currentFile } = opts

//       if (file === DEFAULT_FILE.id) {
//         return
//       }

//       addAction(`Remove groups`, '', (state: IHistoryState) => {
//         state.groupOrder[file] = state.groupOrder[file]!.filter(
//           (id) => !ids.includes(id)
//         )
//       })
//     },

//     reorderGroups: (ids: string[], opts: IGroupOps = {}) => {
//       if (ids.length === 0) {
//         return
//       }

//       const { file = get().present.currentFile } = opts

//       if (file === DEFAULT_FILE.id) {
//         return
//       }

//       addAction('Reorder groups', '', (state: IHistoryState) => {
//         state.groupOrder[file] = ids
//       })
//     },

//     addGenesets: (genesets: IGeneSet[], opts: IGroupOps = {}) => {
//       if (genesets.length === 0) {
//         return
//       }

//       const { mode = 'append', file = get().present.currentFile } = opts

//       if (file === DEFAULT_FILE.id) {
//         return
//       }

//       addAction(
//         `Add ${formattedList(genesets.map((gs) => gs.name))} geneset${genesets.length > 1 ? 's' : ''}`,
//         '',
//         (state: IHistoryState) => {
//           if (mode === 'append') {
//             state.genesetOrder[file]?.push(...genesets.map((g) => g.id))
//           } else {
//             state.genesetOrder[file] = genesets.map((g) => g.id)
//           }
//         },
//         (store: IHistoryDataStore) => {
//           for (const geneset of genesets) {
//             store.genesets[geneset.id] = geneset
//           }
//         }
//       )
//     },

//     updateGeneset: (geneset: IGeneSet) => {
//       addAction(
//         `Update geneset ${geneset.id}`,
//         '',
//         () => {},
//         (store: IHistoryDataStore) => {
//           store.genesets[geneset.id] = geneset
//         }
//       )
//     },

//     removeGenesets: (ids: string[], opts: IGroupOps = {}) => {
//       if (ids.length === 0) {
//         return
//       }

//       const { file = get().present.currentFile } = opts

//       if (file === DEFAULT_FILE.id) {
//         return
//       }

//       addAction(
//         `Remove ${ids.join(', ')} geneset${ids.length > 1 ? 's' : ''}`,
//         '',
//         (state: IHistoryState) => {
//           state.genesetOrder[file] = state.genesetOrder[file]!.filter(
//             (id) => !ids.includes(id)
//           )
//         }
//       )
//     },

//     reorderGenesets: (ids: string[], opts: IGroupOps = {}) => {
//       const { file = get().present.currentFile } = opts

//       if (file === DEFAULT_FILE.id) {
//         return
//       }

//       addAction(
//         `Reorder ${ids.join(', ')} geneset${ids.length > 1 ? 's' : ''}`,
//         '',
//         (state: IHistoryState) => {
//           state.genesetOrder[file] = ids
//         }
//       )
//     },

//     goto: (path: HistoryPath) => {
//       const { app, file, sheet, plot } = toPathId(path)

//       addAction(
//         `Goto ${Boolean(plot) ? `plot ${plot}` : Boolean(sheet) ? `sheet ${sheet}` : Boolean(file) ? `file ${file}` : `app ${app}`}`,
//         '',
//         (state: IHistoryState, store: Readonly<IHistoryDataStore>) => {
//           if (app in store.apps) {
//             state.currentApp = app
//           }

//           if (file in store.files) {
//             state.currentFile = file
//           }

//           if (sheet in store.sheets) {
//             state.currentSheet = sheet
//             state.currentSelections = [
//               {
//                 type: 'sheet',
//                 id: state.currentSheet,
//               },
//             ]
//           }

//           if (plot in store.plots) {
//             state.currentPlot = plot
//             state.currentSelections = [
//               {
//                 type: 'plot',
//                 id: state.currentPlot,
//               },
//             ]
//           }
//         }
//       )
//     },
//   }
// })

// interface IFileOps {
//   mode?: AppendMode
//   app?: string
//   sheets?: BaseDataFrame[]
//   plots?: HistoryPlot[]
//   groupsName?: string
//   groups?: IClusterGroup[]
//   genesets?: IGeneSet[]
// }

// interface ISheetOps {
//   name?: string
//   mode?: AppendMode
//   file?: string
//   //path?: string
// }

// export function useHistory(): {
//   store: IHistoryDataStore
//   state: IHistoryState

//   history: IHistoryEntry<IHistoryState>[]
//   cursor: number
//   present: IHistoryEntry<IHistoryState> | undefined
//   currentApp: string
//   currentFile: string
//   currentSheet: string
//   currentPlot: string | undefined
//   // tracks the last item entered in the history
//   currentSelections: ISelectionPath[]
//   currentSelection: ISelectionPath | undefined
//   hydrated: boolean
//   reset: () => void
//   resetApp: (app: OptStrOrIdObj) => void
//   //openApp: (name: string) => void

//   // openBranch: (
//   //   name: string,

//   //   params?: IOpenBranchOpts
//   // ) => void
//   //updateBranch: (partial: Partial<IHistoryBranch>) => void

//   undo: () => void
//   redo: () => void
//   /**
//    * Seek to a specific point in history by index or id. If a string id is given,
//    * it will seek to the entry with that id. If a number index is given,
//    * it will seek to that index in the history array.
//    *
//    * @param step
//    * @returns
//    */
//   seek: (step: number | string) => void
// } & IHistorySlice &
//   IAppSlice &
//   ISheetSlice &
//   IPlotSlice &
//   IGroupSlice &
//   IGenesetSlice {
//   const store = useHistoryStore() as IHistoryDataStore

//   const hydrated = useHydration(store)

//   const {
//     state,
//     history,
//     cursor,
//     present,
//     currentApp,
//     currentFile,
//     currentSheet,
//     currentPlot,
//     currentSelections,
//     currentSelection,
//   } = useHistoryStore(
//     useShallow((state) => {
//       const presentEntry = state.history[state.cursor]

//       return {
//         state: state.present,
//         history: state.history,
//         cursor: state.cursor,
//         present: presentEntry,
//         currentApp: state.present.currentApp,
//         currentFile: state.present.currentFile,
//         currentSheet: state.present.currentSheet,
//         currentPlot: state.present.currentPlot,
//         currentSelections: state.present.currentSelections,
//         currentSelection:
//           state.present.currentSelections.length > 0
//             ? state.present.currentSelections[
//                 state.present.currentSelections.length - 1
//               ]!
//             : undefined,
//       }
//     })
//   )

//   const openApp = useHistoryStore((state) => state.openApp)
//   const openFile = useHistoryStore((state) => state.openFile)
//   const reset = useHistoryStore((state) => state.reset)
//   const resetApp = useHistoryStore((state) => state.resetApp)
//   const remove = useHistoryStore((state) => state.remove)
//   const removeFiles = useHistoryStore((state) => state.removeFiles)

//   const addSheets = useHistoryStore((state) => state.addSheets)
//   const reorderSheets = useHistoryStore((state) => state.reorderSheets)
//   const addPlots = useHistoryStore((state) => state.addPlots)
//   const reorderPlots = useHistoryStore((state) => state.reorderPlots)
//   const updatePlot = useHistoryStore((state) => state.updatePlot)

//   const addGroups = useHistoryStore((state) => state.addGroups)
//   const updateGroup = useHistoryStore((state) => state.updateGroup)
//   const removeGroups = useHistoryStore((state) => state.removeGroups)
//   const reorderGroups = useHistoryStore((state) => state.reorderGroups)

//   const addGenesets = useHistoryStore((state) => state.addGenesets)
//   const updateGeneset = useHistoryStore((state) => state.updateGeneset)
//   const removeGenesets = useHistoryStore((state) => state.removeGenesets)
//   const reorderGenesets = useHistoryStore((state) => state.reorderGenesets)

//   const goto = useHistoryStore((state) => state.goto)

//   const undo = useHistoryStore((state) => state.undo)
//   const redo = useHistoryStore((state) => state.redo)
//   const seek = useHistoryStore((state) => state.seek)

//   return {
//     store,
//     state,
//     history,
//     cursor,
//     present,
//     currentApp,
//     currentFile,
//     currentSheet,
//     currentPlot,
//     currentSelections,
//     currentSelection,
//     hydrated,
//     openApp,
//     openFile,

//     reset,
//     resetApp,
//     addSheets,

//     reorderSheets,
//     reorderPlots,
//     updatePlot,
//     addPlots,
//     addGroups,
//     updateGroup,
//     removeGroups,
//     reorderGroups,
//     addGenesets,
//     updateGeneset,
//     removeGenesets,
//     reorderGenesets,

//     remove,
//     removeFiles,
//     //select,
//     goto,
//     undo,
//     redo,
//     seek,
//   }
// }

// export function useState(): IHistoryState {
//   return useHistoryStore(useShallow((state) => state.present))
// }

// export function useApp(
//   app: OptStrOrIdObj = undefined
// ): IHistoryApp | undefined {
//   return useHistoryStore(
//     useShallow((state) => {
//       const aid = getAppId(state.present, { app })
//       return state.apps[aid]
//     })
//   )
// }

// export function useFiles(app: OptStrOrIdObj = undefined): IHistoryComp[] {
//   return useHistoryStore(
//     useShallow((state) => {
//       const aid = getAppId(state.present, { app })

//       return (state.present.fileOrder[aid] || []).map((id) => state.files[id]!)
//     })
//   )
// }

// /**
//  * Returns a file from an app. If no id is given, returns the
//  * current file in none given.
//  *
//  * @param path
//  * @param id
//  * @returns
//  */
// export function useFile(
//   file: OptStrOrIdObj = undefined
// ): IHistoryComp | undefined {
//   return useHistoryStore(
//     useShallow((state) => {
//       const fid = getFileId(state.present, { file })
//       return state.files[fid]
//     })
//   )
// }

// export function useGroups(file: OptStrOrIdObj = undefined): IClusterGroup[] {
//   return useHistoryStore(
//     useShallow((state) => {
//       const fid = getFileId(state.present, { file })
//       return (state.present.groupOrder[fid] || []).map(
//         (id) => state.groups[id]!
//       )
//     })
//   )
// }

// export function useGroupName(file: OptStrOrIdObj = undefined): string {
//   return useHistoryStore(
//     useShallow((state) => {
//       const fid = getFileId(state.present, { file })
//       return state.groupNames[fid] || ''
//     })
//   )
// }

// export function useGenesets(file: OptStrOrIdObj = undefined): IGeneSet[] {
//   return useHistoryStore(
//     useShallow((state) => {
//       const fid = getFileId(state.present, { file })
//       return (state.present.genesetOrder[fid] || []).map(
//         (id) => state.genesets[id]!
//       )
//     })
//   )
// }

// export function useSheet(
//   sheet: OptStrOrIdObj = undefined
// ): DataFrameType | undefined {
//   return useHistoryStore(
//     useShallow((state) => {
//       const sid = getSheetId(state.present, { sheet })

//       return state.sheets[sid]
//     })
//   )
// }

// export function useSheets(
//   opts: { file?: OptStrOrIdObj; removeDefaultSheets?: boolean } = {}
// ): DataFrameType[] {
//   const { file } = opts
//   return useHistoryStore(
//     useShallow((state) => {
//       const fid = getFileId(state.present, { file })
//       const sheets = state.present.sheetOrder[fid] || []
//       // return (
//       //   removeDefaultSheets && sheets.length > 1 ? sheets.slice(1) : sheets
//       // ).map(id => state.sheets[id]!)
//       return sheets.map((id) => state.sheets[id]).filter((s) => s !== undefined)
//     })
//   )
// }

// export function usePlots(file: OptStrOrIdObj = undefined): HistoryPlot[] {
//   return useHistoryStore(
//     useShallow((state) => {
//       const fid = getFileId(state.present, { file })
//       return (state.present.plotOrder[fid] || [])
//         .map((id) => state.plots[id])
//         .filter((p) => p !== undefined)
//     })
//   )
// }

// export function usePlot(
//   plot: OptStrOrIdObj = undefined
// ): HistoryPlot | undefined {
//   return useHistoryStore(
//     useShallow((state) => {
//       const pid = getPlotId(state.present, { plot })

//       return pid ? state.plots[pid] : undefined
//     })
//   )
// }

// function getAppId(
//   state: IHistoryState,
//   opts: { app?: OptStrOrIdObj } = {}
// ): string {
//   const { app } = opts
//   return (typeof app === 'string' ? app : app?.id) || state.currentApp
// }

// function getFileId(
//   state: IHistoryState,
//   opts: { file?: OptStrOrIdObj } = {}
// ): string {
//   const { file } = opts
//   return (typeof file === 'string' ? file : file?.id) || state.currentFile
// }

// function getSheetId(
//   state: IHistoryState,
//   opts: { sheet?: OptStrOrIdObj } = {}
// ): string {
//   const { sheet } = opts
//   return (typeof sheet === 'string' ? sheet : sheet?.id) || state.currentSheet
// }

// function getPlotId(
//   state: IHistoryState,
//   opts: { plot?: OptStrOrIdObj } = {}
// ): string | undefined {
//   const { plot } = opts
//   return (typeof plot === 'string' ? plot : plot?.id) || state.currentPlot
// }

// export function getApps(
//   store: IHistoryDataStore,
//   state: IHistoryState
// ): IHistoryApp[] {
//   console.log('order', state.appOrder)
//   console.log('apps', store.apps)

//   return state.appOrder
//     .filter((id) => id in store.apps)
//     .map((id) => store.apps[id]!)
// }

// export function getFiles(
//   store: IHistoryDataStore,
//   state: IHistoryState,
//   opts: { app?: OptStrOrIdObj } = {}
// ): IHistoryComp[] {
//   const { app } = opts
//   const id = getAppId(state, { app })

//   return (state.fileOrder[id] || []).map((id) => store.files[id]!)
// }

// export function getSheets(
//   store: IHistoryDataStore,
//   state: IHistoryState,
//   opts: { file?: OptStrOrIdObj } = {}
// ): DataFrameType[] {
//   const { file } = opts
//   const id = getFileId(state, { file })

//   return (state.sheetOrder[id] || []).map((id) => store.sheets[id]!)
// }

// export function getPlots(
//   store: IHistoryDataStore,
//   state: IHistoryState,
//   opts: { file?: OptStrOrIdObj } = {}
// ): HistoryPlot[] {
//   const { file } = opts
//   const id = getFileId(state, { file })

//   return (state.plotOrder[id] || []).map((id) => store.plots[id]!)
// }

// /**
//  * Returns all plots for a given app by first finding all files in the app and then
//  * finding all plots for each file and flattening the result.
//  * If no app is given, uses the current app.
//  *
//  * @param store
//  * @param state
//  * @param app
//  * @returns
//  */
// export function getAllPlots(
//   store: IHistoryDataStore,
//   state: IHistoryState,
//   opts: { app?: OptStrOrIdObj } = {}
// ): HistoryPlot[] {
//   const { app } = opts
//   const appId = getAppId(state, { app })

//   const fileIds = state.fileOrder[appId] || []

//   const plotIds = fileIds.flatMap((fileId) => state.plotOrder[fileId] || [])

//   return plotIds.map((id) => store.plots[id]!)
// }

// export function getGroups(
//   store: IHistoryDataStore,
//   state: IHistoryState,
//   opts: { file?: OptStrOrIdObj } = {}
// ): IClusterGroup[] {
//   const { file } = opts

//   const id = getFileId(state, { file })

//   return (state.groupOrder[id] || []).map((id) => store.groups[id]!)
// }

// export function getGenesets(
//   store: IHistoryDataStore,
//   state: IHistoryState,
//   opts: { file?: OptStrOrIdObj } = {}
// ): IGeneSet[] {
//   const { file } = opts
//   const id = getFileId(state, { file })

//   return (state.genesetOrder[id] || []).map((id) => store.genesets[id]!)
// }

// export function findSheet(
//   store: IHistoryDataStore,
//   state: IHistoryState,
//   q: string,
//   opts: { file?: OptStrOrIdObj } = {}
// ): DataFrameType | undefined {
//   const { file } = opts
//   const id = getFileId(state, { file })

//   const lid = q.toLowerCase()

//   return (state.sheetOrder[id] || [])
//     .map((id) => store.sheets[id]!)
//     .find((s) => s.id === q || s.name.toLowerCase() === lid)
// }

// type PathId = {
//   app: string
//   file: string
//   sheet: string
//   plot: string
//   group: string
//   geneset: string
// }

// /**
//  * Normalizes a path object which contains keys mapping to
//  * either strings or objects with id property to a set of
//  * (possibly empty) strings for each level of the path.
//  *
//  * @param path
//  * @returns
//  */
// function toPathId(path: Record<string, StrOrIdObj>): PathId {
//   const app = 'app' in path ? strOrIdToStr(path.app) : ''
//   const file = 'file' in path ? strOrIdToStr(path.file) : ''
//   const sheet = 'sheet' in path ? strOrIdToStr(path.sheet) : ''
//   const plot = 'plot' in path ? strOrIdToStr(path.plot) : ''
//   const group = 'group' in path ? strOrIdToStr(path.group) : ''
//   const geneset = 'geneset' in path ? strOrIdToStr(path.geneset) : ''

//   return { app, file, sheet, plot, group, geneset }
// }

// function removeApp(state: IHistoryState, p: PathId) {
//   if ((state.appOrder.length || 0) < 2 || p.app === DEFAULT_APP.id) {
//     return // cannot remove default
//   }

//   state.appOrder = state.appOrder.filter((id) => id !== p.app)
//   delete state.fileOrder[p.app]
// }

// function removeFile(state: IHistoryState, p: PathId) {
//   // there must be at least one file in the app, and the default file cannot be removed
//   if ((state.fileOrder[p.app]?.length || 0) < 2) {
//     return
//   }

//   state.fileOrder[p.app] = state.fileOrder[p.app]!.filter((id) => id !== p.file)

//   delete state.sheetOrder[p.file]
//   delete state.plotOrder[p.file]
//   delete state.groupOrder[p.file]
//   delete state.genesetOrder[p.file]

//   // select previous sheet/plot
//   const files = state.fileOrder[p.app]!
//   const lastFile = files[files.length - 1]!

//   state.currentFile = lastFile
//   const sheets = state.sheetOrder[lastFile]!
//   state.currentSheet = sheets[sheets.length - 1]!
//   const plots = state.plotOrder[lastFile]!
//   state.currentPlot = plots[plots.length - 1]!
//   state.currentSelections = [{ type: 'sheet', id: state.currentSheet }]
// }

// function removeSheet(state: IHistoryState, p: PathId) {
//   // cannot remove the first sheet
//   //if (p.sheet === state.sheetOrder[p.file]?.[0]) {
//   if ((state.sheetOrder[p.file]?.length || 0) < 2) {
//     return
//   }

//   state.sheetOrder[p.file] = state.sheetOrder[p.file]!.filter(
//     (id) => id !== p.sheet
//   )

//   console.log('Removing sheet', p.sheet, 'from file', p.file)

//   const sheets = state.sheetOrder[p.file]!
//   state.currentSheet = sheets[sheets.length - 1]!
//   state.currentSelections = [{ type: 'sheet', id: state.currentSheet }]
// }

// function removePlot(state: IHistoryState, p: PathId) {
//   state.plotOrder[p.file] = state.plotOrder[p.file]!.filter(
//     (id) => id !== p.plot
//   )

//   if (state.plotOrder[p.file]!.length > 0) {
//     // if there are still plots left, select the previous one
//     const plots = state.plotOrder[p.file]!
//     state.currentPlot = plots[plots.length - 1]!
//     state.currentSelections = [{ type: 'plot', id: state.currentPlot }]
//   } else {
//     // otherwise select the last sheet
//     const sheets = state.sheetOrder[p.file]!
//     state.currentPlot = undefined
//     state.currentSheet = sheets[sheets.length - 1]!
//     state.currentSelections = [{ type: 'sheet', id: state.currentSheet }]
//   }
// }

// function removeGroup(state: IHistoryState, p: PathId) {
//   state.groupOrder[p.file] = state.groupOrder[p.file]!.filter(
//     (id) => id !== p.group
//   )
// }

// function removeGeneset(state: IHistoryState, p: PathId) {
//   state.genesetOrder[p.file] = state.genesetOrder[p.file]!.filter(
//     (id) => id !== p.geneset
//   )
// }

// function isAppOnly(p: PathId): boolean {
//   return (
//     Boolean(p.app) && !p.file && !p.sheet && !p.plot && !p.group && !p.geneset
//   )
// }

// function isFileOnly(p: PathId): boolean {
//   return (
//     Boolean(p.app) &&
//     Boolean(p.file) &&
//     !p.sheet &&
//     !p.plot &&
//     !p.group &&
//     !p.geneset
//   )
// }

// function isSheet(p: PathId): boolean {
//   return Boolean(p.file) && Boolean(p.sheet)
// }

// function isPlot(p: PathId): boolean {
//   return Boolean(p.file) && Boolean(p.plot)
// }

// function isGroup(p: PathId): boolean {
//   return Boolean(p.file) && Boolean(p.group)
// }

// function isGeneset(p: PathId): boolean {
//   return Boolean(p.file) && Boolean(p.geneset)
// }
