import {
  AnnotationDataFrame,
  DATAFRAME_100x26,
} from '@/lib/dataframe/annotation-dataframe'

import { makeUuid } from '@/lib/id'
import {
  applyPatches,
  enablePatches,
  produce,
  produceWithPatches,
  type Patch,
} from 'immer'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

import {
  DEFAULT_HEATMAP_PROPS,
  type IHeatMapDisplayOptions,
} from '@/components/plot/heatmap/heatmap-svg-props'
import type { IClusterGroup } from '@/lib/cluster-group'
import { type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import type { IExtGseaResult, IGseaResult } from '@/lib/gsea/ext-gsea'
import type { IGeneset, IRankedGenes } from '@/lib/gsea/geneset'
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

enablePatches()

export const HISTORY_STEP_TYPE_OPEN = 'open'

export const MAX_HISTORY_ITEMS = 1000

//export const DATAFRAME_100x26 = new EmptyFrame(100, 26) // create100x26Df()

export const DEFAULT_APP_NAME = 'Default'

export const DEFAULT_STEP_NAME = 'Load sheet'

export type NodeType = 'app' | 'branch' | 'step' | 'sheet' | 'plot'

export type GotoType = NodeType | 'path'

export interface IHistoryComp {
  id: string
  path: string
  name: string
  createdAt: number
}

export type DataFrameType = BaseDataFrame | AnnotationDataFrame | IClusterFrame

export interface IHistorySheet extends IHistoryComp {
  df: DataFrameType
  type: 'sheet'
}

export interface IHistoryGroup extends IHistoryComp {
  group: IClusterGroup
  type: 'group'
}

export interface IHistoryGeneset extends IHistoryComp {
  geneset: IGeneset
  type: 'geneset'
}

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

export type HistoryNode =
  | IHistoryApp
  | IHistoryBranch
  | IHistoryStep
  | IHistorySheet
  | HistoryPlot
  | IHistoryGroup
  | IHistoryGeneset

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
    path: '',
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
    path: '',
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
    path: '',
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
    path: '',
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

export interface IHistoryApp extends IHistoryComp {
  //currentBranch: IHistoryBranch | undefined
  currentBranch: string
  branches: IHistoryBranch[]
  //nextBranchIndex: number
  type: 'app'
}

export interface IHistoryBranch extends IHistoryComp {
  // maintains the current position in the history stack
  // since the stack can include redo actions if we undo
  // an action
  currentStep: string
  steps: IHistoryStep[]

  //currentPlot: string
  //plots: string[]

  // Name of the group set so we can given them an identifiable name. Defaults to "Groups".
  groupsName: string
  groups: IHistoryGroup[] //IHistoryGroups

  genesets: IHistoryGeneset[]
  type: 'branch'
}

export interface IHistoryStep extends IHistoryComp {
  //currentId: string
  //currentSheet: BaseDataFrame | undefined

  currentSheet: string
  sheets: IHistorySheet[]

  currentPlot: string
  plots: HistoryPlot[]
  type: 'step'
}

export function newHistoryStep(
  name: string,
  sheets: IHistorySheet[] = []
): IHistoryStep {
  const id = makeUuid()

  return {
    id,
    path: pathJoin('', id),
    name,
    //currentId: sheets.length > 0 ? sheets[sheets.length - 1]!.id : '',
    currentSheet: sheets.length > 0 ? sheets[sheets.length - 1]!.id : '',
    sheets,
    currentPlot: '',
    plots: [],
    //currentSheet: sheets.length > 0 ? sheets[sheets.length - 1]!.id : '',
    type: 'step',
    createdAt: Date.now(),
  }
}

export function newHistoryApp(
  name: string,
  branches: IHistoryBranch[] = []
): IHistoryApp {
  const id = makeUuid()
  return {
    id,
    path: pathJoin('', id),
    name,
    //nodeMap: Object.fromEntries(steps.map(s => [s.id, s])),
    branches,
    //nextBranchIndex: branches.length + 1,
    currentBranch: branches.length > 0 ? branches[branches.length - 1]!.id : '',
    type: 'app',
    createdAt: Date.now(),
  }
}

function newHistoryBranch(
  name: string,
  steps: IHistoryStep[] = [],
  //plots: Plot[] = [],
  groupsName: string = '',
  groups: IClusterGroup[] = [],
  genesets: IGeneset[] = []
): IHistoryBranch {
  return {
    id: makeUuid(),
    path: '',
    name,
    steps,
    currentStep: steps.length > 0 ? steps[steps.length - 1]!.id : '',
    //plots: plots.map(s => s.id),
    //currentPlot: plots.length > 0 ? plots[plots.length - 1]!.id : '',
    groupsName,
    groups: groups.map(s => newHistoryGroup(s)),
    genesets: genesets.map(s => newHistoryGeneset(s)),
    type: 'branch',
    createdAt: Date.now(),

    //
  }
}

export function cloneHistory(history: IHistoryApp): IHistoryApp {
  return produce(history, () => {})
}

export function defaultHistoryTree(): IHistoryApp {
  const branch = newHistoryBranch(DEFAULT_APP_NAME, [
    newHistoryStep(DEFAULT_STEP_NAME, [sheetFromDataframe(DATAFRAME_100x26)]),
  ])

  return newHistoryApp(DEFAULT_APP_NAME, [branch])
}

type AppendMode = 'set' | 'append'

export type HistoryUpdateProps = (
  addr: string,
  name: string,
  prop: unknown
) => void

interface IOpenBranchParams {
  stepName?: string | undefined
  //sheets?: BaseDataFrame[]
  groupsName?: string
  groups?: IClusterGroup[]
  genesets?: IGeneset[]
  //plots?: HistoryPlot[]
  mode?: AppendMode | undefined
}

interface IAppState {
  currentApp: string
  apps: IHistoryApp[]
}

interface IAppSlice {
  openApp: (name: string) => void
  //gotoApp: (addr: string) => void
}

interface IBranchSlice {
  openBranch: (
    name: string,
    sheets: BaseDataFrame[],
    params?: IOpenBranchParams
  ) => void

  updateBranch: (partial: Partial<IHistoryBranch>) => void

  /**
   * Undo the last action.
   *
   * @param mode The undo mode. 'step' will move back one step in the
   * current branch. 'all' will move to the first step in the
   * current branch. 'clear' will move to the first step
   * and remove all other steps in the current branch.
   * @returns
   */
  undo: (mode?: 'clear' | 'all' | 'step') => void
  redo: () => void
}

interface IPlotSlice {
  addPlots: (plot: HistoryPlot[], mode?: AppendMode) => void
  reorderPlots: (plotIds: string[]) => void
  updatePlot: (plot: HistoryPlot) => void
}

interface IGroupSlice {
  addGroups: (groups: IClusterGroup[], mode?: AppendMode) => void
  reorderGroups: (ids: string[]) => void
  removeGroups: (ids: string[]) => void
  updateGroup: (group: IClusterGroup) => void
}

interface IGenesetSlice {
  addGenesets: (genesets: IGeneset[], mode?: AppendMode) => void
  reorderGenesets: (ids: string[]) => void
  removeGenesets: (ids: string[]) => void
  updateGeneset: (geneset: IGeneset) => void
}

// interface IStepState {
//   nodeMap: Record<string, IHistoryStep>
// }

interface IStepSlice {
  addStep: (name: string, sheets: BaseDataFrame[], mode?: AppendMode) => void
}

interface ISheetSlice {
  addSheets: (sheets: BaseDataFrame[], mode?: AppendMode) => void
  reorderSheets: (sheets: string[]) => void
}

export interface IHistoryState extends IHistoryComp, IAppState {
  nodeMap: Record<string, HistoryNode>
  //historyActions: IHistoryAction[]
}

export interface IHistoryAction {
  id: string
  description: string

  // keep track of patches for undo/redo
  patches: Patch[]
  inversePatches: Patch[]
  createdAt: number
}

interface IUndoState {
  present: IHistoryState
  past: IHistoryAction[]
  future: IHistoryAction[]
}

interface IHistoryStore
  extends
    IAppSlice,
    IBranchSlice,
    IStepSlice,
    ISheetSlice,
    IPlotSlice,
    IGroupSlice,
    IGenesetSlice,
    IUndoState {
  //addAction: (action: HistoryEvent, fn: (draft: IHistoryState) => void) => void

  /**
   * Navigate to a specific history point.
   * @param id The ID of the history point to navigate to.
   * @param type The type of history point (app, branch, step, sheet, plot).
   * @returns
   */
  goto: (id: string, type: GotoType) => void

  /**
   * Remove a specific history point.
   * @param id The ID(s) of the history point to remove.
   * @param type The type of history point (app, branch, step, sheet, plot).
   * @returns
   */
  remove: (ids: string[], type: NodeType) => void
  reset: () => void
}

function getCurrentApp(state: IHistoryState): IHistoryApp {
  return state.apps.find(app => app.id === state.currentApp)!
}

function getCurrentBranch(state: IHistoryState): {
  app: IHistoryApp
  branch: IHistoryBranch
} {
  const app = getCurrentApp(state)

  const branch = app.branches.find(b => b.id === app.currentBranch)!

  return { app, branch }
}

function getCurrentStep(state: IHistoryState): {
  app: IHistoryApp
  branch: IHistoryBranch
  step: IHistoryStep
} {
  const { app, branch } = getCurrentBranch(state)

  const step = branch.steps.find(s => s.id === branch.currentStep)!

  return { app, branch, step }
}

function pathJoin(...parts: string[]): string {
  return parts.join('/')
}

/**
 * Encapsulates a dataframe with metadata for history tracking.
 *
 * @param df
 * @returns
 */
function sheetFromDataframe(df: DataFrameType): IHistorySheet {
  return {
    id: df.id,
    path: pathJoin('', df.id),
    name: df.name,
    df,
    type: 'sheet',
    createdAt: Date.now(),
  }
}

function newHistoryGroup(group: IClusterGroup): IHistoryGroup {
  //const id = makeRandId()
  return {
    id: group.id,
    path: pathJoin('', group.id),
    name: group.name,
    group,
    type: 'group',
    createdAt: Date.now(),
  }
}

function newHistoryGeneset(geneset: IGeneset): IHistoryGeneset {
  //const id = makeRandId()
  return {
    id: geneset.id,
    path: pathJoin('', geneset.id),
    name: geneset.name,
    geneset,
    type: 'geneset',
    createdAt: Date.now(),
  }
}

function newDefaultStep(): { step: IHistoryStep; sheet: IHistorySheet } {
  const s = sheetFromDataframe(DATAFRAME_100x26)
  return {
    step: newHistoryStep(DEFAULT_STEP_NAME, [s]),
    sheet: s,
  }
}

function newDefaultBranch(): {
  branch: IHistoryBranch
  step: IHistoryStep
  sheet: IHistorySheet
} {
  const { step, sheet } = newDefaultStep()

  const branch = newHistoryBranch('Default', [step])

  return { branch, step, sheet }
}

function newDefaultApp(): {
  app: IHistoryApp
  branch: IHistoryBranch
  step: IHistoryStep
  sheet: IHistorySheet
} {
  const { branch, step, sheet } = newDefaultBranch()

  let app = newHistoryApp('Default', [branch])

  //app = fixAppPath({} as IHistoryState, app)

  return { app, branch, step, sheet }
}

function fixStepPath(step: IHistoryStep, state: IHistoryState, root: string) {
  step.path = pathJoin(root, step.id)
  state.nodeMap[step.id] = step

  for (const sheet of step.sheets) {
    sheet.path = pathJoin(step.path, sheet.id)
    state.nodeMap[sheet.id] = sheet
  }

  for (const plot of step.plots) {
    plot.path = pathJoin(step.path, plot.id)
    state.nodeMap[plot.id] = plot
  }
}

function fixSheetsPath(step: IHistoryStep, state: IHistoryState) {
  for (const sheet of step.sheets) {
    sheet.path = pathJoin(step.path, sheet.id)
    state.nodeMap[sheet.id] = sheet
  }
}

function fixPlotsPath(step: IHistoryStep, state: IHistoryState) {
  for (const plot of step.plots) {
    plot.path = pathJoin(step.path, plot.id)
    state.nodeMap[plot.id] = plot
  }
}

function fixBranchPath(
  branch: IHistoryBranch,
  state: IHistoryState,
  root: string
) {
  branch.path = pathJoin(root, branch.id)
  state.nodeMap[branch.id] = branch

  for (const step of branch.steps) {
    step.path = pathJoin(branch.path, step.id) // [branch.path, 'Steps', step.name].join('/')
    state.nodeMap[step.id] = step

    for (const sheet of step.sheets) {
      sheet.path = pathJoin(step.path, sheet.id)
      state.nodeMap[sheet.id] = sheet
    }

    for (const plot of step.plots) {
      plot.path = pathJoin(step.path, plot.id)
      state.nodeMap[plot.id] = plot
    }
  }
}

function fixAppPath(app: IHistoryApp, state: IHistoryState) {
  app.path = pathJoin('', app.id)
  state.nodeMap[app.id] = app

  for (const branch of app.branches) {
    branch.path = pathJoin(app.path, branch.id)
    state.nodeMap[branch.id] = branch

    for (const step of branch.steps) {
      step.path = pathJoin(branch.path, step.id) // [draft.path, 'Steps', step.name].join('/')
      state.nodeMap[step.id] = step

      for (const sheet of step.sheets) {
        sheet.path = pathJoin(step.path, sheet.id)
        state.nodeMap[sheet.id] = sheet
      }

      for (const plot of step.plots) {
        plot.path = pathJoin(step.path, plot.id)
        state.nodeMap[plot.id] = plot
      }
    }
  }
}

function fixHistoryPath(history: IHistoryState) {
  for (const app of history.apps) {
    app.path = pathJoin('', app.id)
    history.nodeMap[app.id] = app

    for (const branch of app.branches) {
      branch.path = pathJoin(app.path, branch.id)
      history.nodeMap[branch.id] = branch

      for (const step of branch.steps) {
        step.path = pathJoin(branch.path, step.id) // [history.path, 'Steps', step.name].join('/')
        history.nodeMap[step.id] = step

        for (const sheet of step.sheets) {
          sheet.path = pathJoin(step.path, sheet.id)
          history.nodeMap[sheet.id] = sheet
        }

        for (const plot of step.plots) {
          plot.path = pathJoin(step.path, plot.id)
          history.nodeMap[plot.id] = plot
        }
      }
    }
  }
}

function init(): IUndoState {
  let { app } = newDefaultApp()

  const id = makeUuid()

  let history: IHistoryState = {
    id,
    name: 'History',
    path: pathJoin('', id),
    apps: [app],
    currentApp: app.id,
    nodeMap: {},
    createdAt: Date.now(),
  }

  fixHistoryPath(history)

  return { present: history, past: [], future: [] }
}

export const useHistoryStore = create<IHistoryStore>((set, get) => {
  /**
   * To update the history state with an action we use immer to produce the next state
   * and record the patches for undo/redo functionality rather than
   * directly mutating the state.
   *
   * @param action
   * @param fn
   * @returns
   */
  function addAction(action: string, fn: (draft: IHistoryState) => void) {
    const { present } = get()
    // use the current state for producing the next state. Inverse
    // patches are used for undo functionality.
    const [next, patches, inversePatches] = produceWithPatches(present, fn)

    if (patches.length === 0) return // nothing changed

    const historyAction: IHistoryAction = {
      id: makeUuid(),
      description: action,
      patches,
      inversePatches,
      createdAt: Date.now(),
    }

    set(state => ({
      present: next,
      past: [...state.past, historyAction].slice(-MAX_HISTORY_ITEMS),
      future: [], // clear redo history
    }))
  }

  return {
    ...init(),

    openApp: (name: string) => {
      addAction(`Open ${name} app`, (state: IHistoryState) => {
        // set the name we are using

        const { branch } = newDefaultBranch()

        let app = newHistoryApp(name, [branch])

        state.apps.push(app)

        state.currentApp = app.id

        fixAppPath(app, state)
      })
    },

    reset: () => {
      set(
        produce((state: IHistoryStore) => {
          const { app } = newDefaultApp()

          state.present.apps = [app]
          state.present.nodeMap = {}
          state.present.currentApp = app.id

          fixAppPath(app, state.present)

          state.past = []
          state.future = []
        })
      )
    },
    openBranch: (
      name: string,
      dataframes: BaseDataFrame[],
      params: IOpenBranchParams = {}
    ) => {
      if (dataframes.length === 0) {
        return
      }

      addAction(`Open ${name} branch`, (state: IHistoryState) => {
        let {
          stepName = DEFAULT_STEP_NAME,
          groupsName = '',
          groups = [],
          genesets = [],

          mode = 'set',
        } = params

        const app = getCurrentApp(state)

        if (app) {
          if (mode === 'set') {
            // always keep the default branch if it exists
            app.branches = [app.branches[0]!]
          }

          const sheetList = dataframes.map(df => sheetFromDataframe(df))

          const step = newHistoryStep(stepName, sheetList)

          let branch = newHistoryBranch(
            name,
            [step],
            groupsName,
            groups,
            genesets
          )

          app.branches.push(branch)
          app.currentBranch = branch.id // app.branches[app.branches.length - 1]!.id

          // fix the paths
          fixBranchPath(branch, state, app.path)
        }
      })
    },

    updateBranch: (partial: Partial<IHistoryBranch>) => {
      addAction(`Update branch`, (state: IHistoryState) => {
        // add from the current history point, deleting steps
        // ahead of the current point
        const { branch } = getCurrentBranch(state)

        if (branch) {
          Object.assign(branch, partial)
        }
      })
    },

    addStep: (
      name: string,
      sheets: BaseDataFrame[],
      mode: AppendMode = 'append'
    ) => {
      if (sheets.length === 0) {
        return
      }

      addAction(`Add ${name} step`, (state: IHistoryState) => {
        // add from the current history point, deleting steps
        // ahead of the current point
        const { branch } = getCurrentBranch(state)

        // a step must have at least one sheet
        if (branch) {
          const sheetList = sheets.map(s => sheetFromDataframe(s))

          // add the new sheets to the node map
          //for (const sheet of sheetList) {
          //  state.nodeMap[sheet.id] = sheet
          //}

          // make a new step to represent the change
          let step = newHistoryStep(name, sheetList)

          if (mode === 'set') {
            branch.steps = [step]
          } else {
            const idx = branch.steps.findIndex(b => b.id === branch.currentStep)

            branch.steps = [...branch.steps.slice(0, idx + 1), step]
          }

          branch.currentStep = step.id // branch.steps[branch.steps.length - 1]!.id

          fixStepPath(step, state, branch.path)
        }
      })
    },

    addSheets: (sheets: BaseDataFrame[], mode: AppendMode = 'append') => {
      if (sheets.length === 0) {
        return
      }

      addAction('Add sheets', (state: IHistoryState) => {
        const { step } = getCurrentStep(state)

        if (step) {
          const sheetList = sheets.map(s => sheetFromDataframe(s))

          if (mode === 'append') {
            step.sheets = [...step.sheets, ...sheetList]
          } else {
            step.sheets = sheetList
          }

          //for (const sheet of sheetList) {
          //  state.nodeMap[sheet.id] = sheet
          //}

          // use the first sheet as the current sheet
          step.currentSheet = step.sheets[0]!.id

          // don't update step, path, just the sheets and plots
          fixSheetsPath(step, state)
          //step.currentId = step.currentSheet
        }
      })
    },

    addPlots: (plots: HistoryPlot[], mode: AppendMode = 'append') => {
      addAction(
        `Add ${formattedList(plots.map(p => p.name))} plot${plots.length > 1 ? 's' : ''}`,
        (state: IHistoryState) => {
          const { step } = getCurrentStep(state)

          if (step) {
            if (mode === 'append') {
              step.plots = [...step.plots, ...plots]
            } else {
              step.plots = plots
            }

            // use the first plot as the current plot
            step.currentPlot = step.plots[0]!.id

            fixPlotsPath(step, state)
          }
        }
      )
    },

    /**
     * Navigate to a specific history point.
     * @param id The ID of the history point to navigate to.
     * @param type The type of history point (app, branch, step, sheet, plot).
     */
    goto: (id: string, type: GotoType) => {
      addAction(`Goto ${type} ${id}`, (state: IHistoryState) => {
        // add from the current history point, deletingunknown steps
        // ahead of the current point

        switch (type) {
          case 'app':
            state.currentApp = id

            break

          case 'branch':
            {
              const app = getCurrentApp(state)

              app.currentBranch = id
            }
            break

          case 'step':
            {
              const { branch } = getCurrentBranch(state)

              branch.currentStep = id
            }
            break

          case 'sheet':
            {
              const { step } = getCurrentStep(state)

              step.currentSheet = id
            }
            break

          case 'plot':
            {
              const { step } = getCurrentStep(state)

              step.currentPlot = id
            }
            break

          case 'path':
            // id is a path like /apps/appId/branches/branchId/steps/stepId/sheets/sheetId
            const parts = id.toLocaleLowerCase().slice(1).split('/')

            for (const [i, id] of parts.entries()) {
              //node = state.nodeMap[id]!

              switch (i) {
                case 0:
                  state.currentApp = id

                  break

                case 1:
                  {
                    const app = getCurrentApp(state)

                    const branch = findBranch(id, app)!

                    app.currentBranch = branch.id
                  }
                  break

                case 2:
                  {
                    const { branch } = getCurrentBranch(state)

                    const step = findStep(id, branch)!

                    branch.currentStep = step.id
                  }
                  break
                case 3:
                  {
                    const { step } = getCurrentStep(state)

                    const sheet = findSheet(id, step)

                    // selecting a sheet
                    if (sheet) {
                      step.currentSheet = sheet.id
                    } else {
                      // not a sheet so see if it's a plot
                      const plot = findPlot(id, step)

                      if (plot) {
                        step.currentPlot = plot.id
                      }
                    }
                  }
                  break

                default:
                  break
              }
            }

            break
          default:
            break
        }
      })
    },

    remove: (ids: string[], type: NodeType) => {
      if (ids.length === 0) {
        return
      }

      const { present } = get()

      let names: string[] = []

      switch (type) {
        case 'app':
          names = present.apps
            .filter(app => ids.includes(app.id))
            .map(app => app.name)
          break
        case 'branch':
          {
            const app = getCurrentApp(present)!

            names = app.branches
              .filter(branch => ids.includes(branch.id))
              .map(branch => branch.name)
          }
          break
        case 'step':
          {
            const { branch } = getCurrentBranch(present)!

            names = branch.steps
              .filter(step => ids.includes(step.id))
              .map(step => step.name)
          }
          break
        case 'sheet':
          {
            const { step } = getCurrentStep(present)!

            names = step.sheets
              .filter(sheet => ids.includes(sheet.id))
              .map(sheet => sheet.name)
          }
          break
        case 'plot':
          {
            const { step } = getCurrentStep(present)!

            names = step.plots
              .filter(plot => ids.includes(plot.id))
              .map(plot => plot.name)
          }
          break
        default:
          break
      }

      addAction(
        `Remove ${formattedList(names)} ${type}${ids.length > 1 ? 's' : ''}`,
        (state: IHistoryState) => {
          switch (type) {
            case 'app':
              const idx = state.apps.findIndex(a => a.id === state.currentApp)
              //state.apps = state.apps.filter(a => a !== id)

              ids = ids.filter(id => id !== state.apps[0]!.id) // never remove the default app

              for (const id of ids) {
                state.apps = state.apps.filter(a => a.id !== id)

                state.currentApp =
                  state.apps[Math.min(idx, state.apps.length - 1)]?.id ?? ''
              }

              break

            case 'branch':
              {
                const app = getCurrentApp(state)!

                if (app) {
                  const idx = app.branches.findIndex(
                    b => b.id === app.currentBranch
                  )

                  for (const id of ids) {
                    if (id === app.branches[0]!.id) {
                      // never remove the default branch (always first)
                      continue
                    }

                    app.branches = app.branches.filter(b => b.id !== id)

                    app.currentBranch =
                      app.branches[Math.min(idx, app.branches.length - 1)]
                        ?.id ?? ''
                  }
                }
              }

              break

            case 'step':
              {
                const { branch } = getCurrentBranch(state)

                if (branch) {
                  const idx = branch.steps.findIndex(
                    s => s.id === branch.currentStep
                  )

                  for (const id of ids) {
                    if (id === branch.steps[0]!.id) {
                      // a branch must always have at least one step
                      continue
                    }

                    branch.steps = branch.steps.filter(s => s.id !== id)

                    branch.currentStep =
                      branch.steps[Math.min(idx, branch.steps.length - 1)]
                        ?.id ?? ''
                  }
                }
              }

              break
            case 'sheet':
              {
                const { step } = getCurrentStep(state)

                if (step) {
                  const idx = step.sheets.findIndex(
                    s => s.id === step.currentSheet
                  )

                  for (const id of ids) {
                    if (id === step.sheets[0]!.id) {
                      // a step must always have at least one sheet
                      continue
                    }

                    step.sheets = step.sheets.filter(s => s.id !== id)
                  }

                  step.currentSheet =
                    step.sheets[Math.min(idx, step.sheets.length - 1)]!.id
                  //step.currentId = step.currentSheet
                }
              }
              break
            case 'plot':
              {
                const { step } = getCurrentStep(state)

                if (step) {
                  const idx = step.plots.findIndex(
                    p => p.id === step.currentPlot
                  )

                  for (const id of ids) {
                    step.plots = step.plots.filter(b => b.id !== id)
                  }

                  if (step.plots.length > 0) {
                    step.currentPlot =
                      step.plots[Math.min(idx, step.plots.length - 1)]!.id
                    //step.currentId = step.currentPlot
                  } else {
                    // no plots left so select sheet
                    step.currentPlot = ''
                    //step.currentId = step.currentSheet
                  }
                }
              }
              break
            default:
              break
          }

          // remove from the node map
          for (const id of ids) {
            delete state.nodeMap[id]
          }
        }
      )
    },

    reorderSheets: (ids: string[]) => {
      if (ids.length === 0) {
        return
      }

      addAction('Reorder sheets', (state: IHistoryState) => {
        const { step } = getCurrentStep(state)

        if (step) {
          step.sheets = ids
            .map(id => step.sheets.find(s => s.id === id)!)
            .filter(s => s) // filter to avoid undefined
        }
      })
    },

    reorderPlots: (ids: string[]) => {
      if (ids.length === 0) {
        return
      }

      addAction('Reorder plots', (state: IHistoryState) => {
        const { step } = getCurrentStep(state)

        if (step) {
          step.plots = ids
            .map(id => step.plots.find(p => p.id === id)!)
            .filter(p => p) // filter to avoid undefined
        }
      })
    },

    updatePlot: (plot: HistoryPlot) => {
      addAction('Update plot', (state: IHistoryState) => {
        const { step } = getCurrentStep(state)

        if (step) {
          const idx = step.plots.findIndex(p => p.id === plot.id)

          if (idx >= 0) {
            step.plots[idx] = plot
          }

          state.nodeMap[plot.id] = plot
        }
      })
    },

    addGroups: (groups: IClusterGroup[], mode: AppendMode = 'append') => {
      if (groups.length === 0) {
        return
      }

      addAction(
        `Add ${formattedList(groups.map(gs => gs.name))} group${groups.length > 1 ? 's' : ''}`,
        (state: IHistoryState) => {
          const { branch } = getCurrentBranch(state)

          const groupList: IHistoryGroup[] = groups.map(g => newHistoryGroup(g))

          if (branch) {
            if (mode === 'append') {
              branch.groups = [...branch.groups, ...groupList]
            } else {
              branch.groups = groupList
            }

            //for (const g of groupList) {
            //   state.nodeMap[g.id] = g
            // }
          }
        }
      )
    },

    removeGroups: (ids: string[]) => {
      if (ids.length === 0) {
        return
      }

      const { present } = get()

      const { branch } = getCurrentBranch(present)

      const names = formattedList(
        ids.map(id => {
          const group = branch.groups.find(g => g.id === id)
          return group ? group.name : id
        })
      )

      addAction(
        `Remove ${names} group${ids.length > 1 ? 's' : ''}`,
        (state: IHistoryState) => {
          const { branch } = getCurrentBranch(state)

          if (branch) {
            const idset = new Set(ids)

            branch.groups = branch.groups.filter(group => !idset.has(group.id))
          }
        }
      )
    },

    reorderGroups: (ids: string[]) => {
      if (ids.length === 0) {
        return
      }

      addAction('Reorder groups', (state: IHistoryState) => {
        const { branch } = getCurrentBranch(state)

        if (branch) {
          branch.groups = ids
            .map(id => branch.groups.find(g => g.id === id)!)
            .filter(g => g) // filter to avoid undefined
        }
      })
    },

    updateGroup: (group: IClusterGroup) => {
      addAction(`Update ${group.name} group`, (state: IHistoryState) => {
        const { branch } = getCurrentBranch(state)

        if (branch) {
          const idx = branch.groups.findIndex(g => g.id === group.id)

          if (idx >= 0) {
            branch.groups[idx] = newHistoryGroup(group)
          }
        }
      })
    },

    addGenesets: (genesets: IGeneset[], mode: AppendMode = 'append') => {
      if (genesets.length === 0) {
        return
      }

      addAction(
        `Add ${formattedList(genesets.map(gs => gs.name))} geneset${genesets.length > 1 ? 's' : ''}`,
        (state: IHistoryState) => {
          const { branch } = getCurrentBranch(state)

          if (branch) {
            const genesetList: IHistoryGeneset[] = genesets.map(gs =>
              newHistoryGeneset(gs)
            )

            if (mode === 'append') {
              branch.genesets = [...branch.genesets, ...genesetList]
            } else {
              branch.genesets = genesetList
            }

            // for (const geneset of genesetList) {
            //   state.nodeMap[geneset.id] = geneset
            // }
          }
        }
      )
    },

    removeGenesets: (ids: string[]) => {
      if (ids.length === 0) {
        return
      }

      addAction(
        `Remove ${ids.join(', ')} geneset${ids.length > 1 ? 's' : ''}`,
        (state: IHistoryState) => {
          const { branch } = getCurrentBranch(state)

          const idset = new Set(ids)

          if (branch) {
            branch.genesets = branch.genesets.filter(
              geneset => !idset.has(geneset.id)
            )
          }
        }
      )
    },

    reorderGenesets: (ids: string[]) => {
      addAction(
        `Reorder ${ids.join(', ')} geneset${ids.length > 1 ? 's' : ''}`,
        (state: IHistoryState) => {
          const { branch } = getCurrentBranch(state)

          if (branch) {
            branch.genesets = ids
              .map(id => branch.genesets.find(g => g.id === id)!)
              .filter(g => g) // filter to avoid undefined
          }
        }
      )
    },

    updateGeneset: (geneset: IGeneset) => {
      addAction(`Update ${geneset.name} geneset`, (state: IHistoryState) => {
        const { branch } = getCurrentBranch(state)

        if (branch) {
          const idx = branch.genesets.findIndex(g => g.id === geneset.id)

          if (idx >= 0) {
            branch.genesets[idx] = newHistoryGeneset(geneset)
          }
        }
      })
    },

    undo: () => {
      const { past, present, future } = get()

      if (past.length === 0) {
        return
      }

      const action = past[past.length - 1]!
      const newPresent = applyPatches(present, action.inversePatches)

      // the past becomes the present, the current present becomes the future
      // and the past loses an entry
      set({
        present: newPresent,
        past: past.slice(0, -1),
        future: [action, ...future],
      })
    },

    redo: () => {
      const { past, present, future } = get()

      // redo must has a future action
      if (future.length === 0) {
        return
      }

      // the future becomes the present,
      // the current present becomes the past
      const action = future[0]!
      const newPresent = applyPatches(present, action.patches)

      set({
        present: newPresent,
        past: [...past, action],
        future: future.slice(1),
      })
    },
  }
})

export function useHistory(): {
  history: IHistoryState
  app: IHistoryApp
  branch: IHistoryBranch
  branches: IHistoryBranch[]
  step: IHistoryStep
  sheet: IHistorySheet | undefined
  sheets: IHistorySheet[]
  plot: HistoryPlot | undefined
  plots: HistoryPlot[]
  allPlots: HistoryPlot[]
  groupsName: string
  groups: IHistoryGroup[]
  genesets: IHistoryGeneset[]
  past: IHistoryAction[]
  future: IHistoryAction[]
  reset: () => void
  openApp: (name: string) => void

  openBranch: (
    name: string,
    sheets: BaseDataFrame[],
    params?: IOpenBranchParams
  ) => void
  updateBranch: (partial: Partial<IHistoryBranch>) => void

  addStep: (
    description: string,
    sheets: BaseDataFrame[],
    mode?: AppendMode
  ) => void

  addSheets: (sheets: BaseDataFrame[], mode?: AppendMode) => void
  remove: (ids: string[], type: NodeType) => void
  /**
   * Goto a specific history point using the uid of the point.
   * Point is always relative to current parent, e.g. if type is 'step',
   * the step must be in the current branch.
   * @param id  The unique ID of the history point to go to.
   * @param type  The type of the history point to go to.
   * @returns
   */
  goto: (id: string, type: GotoType) => void

  reorderSheets: (sheets: string[]) => void
  reorderPlots: (plotIds: string[]) => void
  updatePlot: (plot: HistoryPlot) => void
  addPlots: (plots: HistoryPlot[], mode?: AppendMode) => void

  addGroups: (groups: IClusterGroup[], mode?: AppendMode) => void
  reorderGroups: (ids: string[]) => void
  removeGroups: (ids: string[]) => void
  updateGroup: (group: IClusterGroup) => void

  addGenesets: (groups: IGeneset[], mode?: AppendMode) => void
  reorderGenesets: (ids: string[]) => void
  removeGenesets: (ids: string[]) => void
  updateGeneset: (group: IGeneset) => void

  undo: (mode?: 'clear' | 'all' | 'step') => void
  redo: () => void
} {
  const openApp = useHistoryStore(state => state.openApp)
  const reset = useHistoryStore(state => state.reset)
  const remove = useHistoryStore(state => state.remove)
  const goto = useHistoryStore(state => state.goto)
  const openBranch = useHistoryStore(state => state.openBranch)
  const updateBranch = useHistoryStore(state => state.updateBranch)

  const addStep = useHistoryStore(state => state.addStep)
  const addSheets = useHistoryStore(state => state.addSheets)
  const reorderSheets = useHistoryStore(state => state.reorderSheets)
  const addPlots = useHistoryStore(state => state.addPlots)
  const reorderPlots = useHistoryStore(state => state.reorderPlots)
  const updatePlot = useHistoryStore(state => state.updatePlot)

  const addGroups = useHistoryStore(state => state.addGroups)
  const removeGroups = useHistoryStore(state => state.removeGroups)
  const reorderGroups = useHistoryStore(state => state.reorderGroups)
  const updateGroup = useHistoryStore(state => state.updateGroup)

  const addGenesets = useHistoryStore(state => state.addGenesets)
  const removeGenesets = useHistoryStore(state => state.removeGenesets)
  const reorderGenesets = useHistoryStore(state => state.reorderGenesets)
  const updateGeneset = useHistoryStore(state => state.updateGeneset)

  const undo = useHistoryStore(state => state.undo)
  const redo = useHistoryStore(state => state.redo)

  const history = useHistoryStore(state => state.present)

  const past = useHistoryStore(state => state.past)

  const future = useHistoryStore(state => state.future)

  const app = useCurrentApp()

  const branches: IHistoryBranch[] = useCurrentBranches()

  const { branch, groups, groupsName, genesets } = useCurrentBranch()

  const { step, sheet, sheets, plots, plot } = useCurrentStep()

  const allPlots: HistoryPlot[] = app.branches
    .map(b => b.steps)
    .flat()
    .map(s => s.plots)
    .flat()

  return {
    history,
    app,
    branches,
    branch,
    step,
    sheet,
    sheets,
    plot,
    plots,
    allPlots,
    groupsName,
    groups,
    genesets,
    past,
    future,
    openApp,
    reset,
    openBranch,
    updateBranch,
    addStep,
    addSheets,
    goto,
    remove,
    reorderSheets,
    reorderPlots,
    updatePlot,
    addPlots,
    addGroups,
    removeGroups,
    reorderGroups,
    updateGroup,
    addGenesets,
    removeGenesets,
    reorderGenesets,
    updateGeneset,
    undo,
    redo,
  }
}

export function useState(): IHistoryState {
  return useHistoryStore(useShallow(state => state.present))
}

export function useCurrentApp(): IHistoryApp {
  return useHistoryStore(
    useShallow(
      state => state.present.apps.find(a => a.id === state.present.currentApp)!
    )
  )
}

export function useCurrentBranches(): IHistoryBranch[] {
  const app = useCurrentApp()

  return app.branches
}

export function useCurrentBranch(): IBranchStore {
  const app = useCurrentApp()

  return useBranch(app.currentBranch)
}

export function useCurrentStep(): IStepStore {
  const { branch } = useCurrentBranch()
  return useStep(branch.currentStep)
}

export function useCurrentSheets(): IHistorySheet[] {
  const { sheets } = useCurrentStep()

  return sheets
}

export function useCurrentPlots(): HistoryPlot[] {
  const { plots } = useCurrentBranch()

  return plots
}

export function useAllPlots(): HistoryPlot[] {
  const app = useCurrentApp()

  return app.branches
    .map(b => b.steps)
    .flat()
    .map(s => s.plots)
    .flat()
}

interface IBranchStore {
  branch: IHistoryBranch
  step: IHistoryStep
  steps: IHistoryStep[]
  sheet: IHistorySheet | undefined
  sheets: IHistorySheet[]
  plot: HistoryPlot | undefined
  plots: HistoryPlot[]
  groupsName: string
  groups: IHistoryGroup[]
  genesets: IHistoryGeneset[]
  updateBranch: (partial: Partial<IHistoryBranch>) => void
  addGroups: (groups: IClusterGroup[], mode?: AppendMode) => void
  removeGroups: (ids: string[]) => void
  reorderGroups: (ids: string[]) => void
  updateGroup: (group: IClusterGroup) => void
  addGenesets: (genesets: IGeneset[], mode?: AppendMode) => void
  removeGenesets: (ids: string[]) => void
  reorderGenesets: (ids: string[]) => void
}

export function useBranch(branchId: string): IBranchStore {
  const state = useState()
  const app = getCurrentApp(state)
  const branch = app.branches.find(b => b.id === branchId)!
  const step = branch.steps.find(s => s.id === branch.currentStep)!

  const steps = branch.steps

  const sheets = step.sheets

  const plots = step.plots

  const groups = branch.groups

  const genesets = branch?.genesets

  const updateBranch = useHistoryStore(state => state.updateBranch)

  const addGroups = useHistoryStore(state => state.addGroups)
  const removeGroups = useHistoryStore(state => state.removeGroups)
  const reorderGroups = useHistoryStore(state => state.reorderGroups)
  const updateGroup = useHistoryStore(state => state.updateGroup)

  const addGenesets = useHistoryStore(state => state.addGenesets)
  const removeGenesets = useHistoryStore(state => state.removeGenesets)
  const reorderGenesets = useHistoryStore(state => state.reorderGenesets)

  const sheet = sheets.find(s => s.id === step.currentSheet) ?? sheets[0]!
  const plot = plots.find(p => p.id === step.currentPlot)

  return {
    branch,
    step,
    steps,
    sheet,
    sheets,
    plot,
    plots,
    groupsName: branch.groupsName,
    groups,
    genesets,
    updateBranch,
    addGroups,
    removeGroups,
    reorderGroups,
    updateGroup,
    addGenesets,
    removeGenesets,
    reorderGenesets,
  }
}

interface IStepStore {
  step: IHistoryStep
  sheet: IHistorySheet
  sheets: IHistorySheet[]
  plots: HistoryPlot[]
  plot: HistoryPlot | undefined
}

export function useStep(stepId: string): IStepStore {
  const state = useState()

  const app = state.apps.find(a => a.id === state.currentApp)!

  const branch = app.branches.find(b => b.id === app.currentBranch)!

  const step = branch.steps.find(s => s.id === stepId)!

  const sheets = step.sheets

  const plots = step.plots

  const sheet = sheets.find(s => s.id === step.currentSheet) ?? sheets[0]!
  const plot = plots.find(p => p.id === step.currentPlot)

  return { step, sheet, sheets, plots, plot }
}

export function usePlot(id: string): HistoryPlot | undefined {
  return useHistoryStore(
    state => state.present.nodeMap[id] as HistoryPlot | undefined
  )
}

//
// Non-hook versions for use outside of React components
//

export function currentApp(): IHistoryApp {
  return useHistoryStore
    .getState()
    .present.apps.find(
      a => a.id === useHistoryStore.getState().present.currentApp
    )!
}

export function branchIdFromPath(path: string): string {
  const parts = path.split('/')
  return parts[parts.length - 2]!
}

export function stepIdFromPath(path: string): string {
  const parts = path.split('/')
  return parts[parts.length - 1]!
}

export function findApp(
  id: string,
  state: IHistoryState
): IHistoryApp | undefined {
  const lid = id.toLowerCase()
  return state.apps.find(s => s.id === id || s.name.toLowerCase() === lid)
}

export function findBranch(
  id: string,
  app: IHistoryApp
): IHistoryBranch | undefined {
  const lid = id.toLowerCase()
  return app.branches.find(s => s.id === id || s.name.toLowerCase() === lid)
}

export function findStep(
  id: string,
  branch: IHistoryBranch
): IHistoryStep | undefined {
  const lid = id.toLowerCase()
  return branch.steps.find(s => s.id === id || s.name.toLowerCase() === lid)
}

export function findSheet(
  id: string,
  step: IHistoryStep
): IHistorySheet | undefined {
  const lid = id.toLowerCase()
  return step.sheets.find(s => s.id === id || s.name.toLowerCase() === lid)
}

export function findPlot(
  id: string,
  step: IHistoryStep
): HistoryPlot | undefined {
  const lid = id.toLowerCase()
  return step.plots.find(s => s.id === id || s.name.toLowerCase() === lid)
}

export function getPlotFromId(
  id: string,
  state: IHistoryState
): HistoryPlot | undefined {
  for (const app of state.apps) {
    for (const branch of app.branches) {
      for (const step of branch.steps) {
        const plot = step.plots.find(p => p.id === id)

        if (plot) {
          return plot
        }
      }
    }
  }

  return undefined
}

// export function plotFromPath(
//   path: string,
//   state: IHistoryState
// ): HistoryPlot | undefined {
//   const parts = path.split('/')

//   if (parts.length < 4) {
//     return undefined
//   }

//   const appId = parts[0]!
//   const branchId = parts[1]!
//   const stepId = parts[2]!
//   const plotId = parts[3]!

//   const app = state.apps.find(a => a.id === appId)

//   if (!app) {
//     return undefined
//   }

//   const branch = app.branches.find(b => b.id === branchId)

//   if (!branch) {
//     return undefined
//   }

//   const step = branch.steps.find(s => s.id === stepId)

//   if (!step) {
//     return undefined
//   }

//   const plot = step.plots.find(p => p.id === plotId)

//   return plot
// }
