import {
  AnnotationDataFrame,
  DATAFRAME_100x26,
} from '@lib/dataframe/annotation-dataframe'

import { nanoid } from '@lib/utils'
import { produce } from 'immer'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

import type { IClusterGroup } from '@lib/cluster-group'
import {
  DEFAULT_TABLE_NAME,
  type BaseDataFrame,
} from '@lib/dataframe/base-dataframe'
import type { IGeneset } from '@lib/gsea/geneset'
import type { IClusterFrame } from '@lib/math/hcluster'
import { useCallback } from 'react'
import type { PlotStyle } from '../plots-provider'

export const HISTORY_STEP_TYPE_OPEN = 'open'

export const MAX_HISTORY_ITEMS = 1000

export const DEFAULT_HISTORY_APP = 'default'

export const HISTORY_ACTION_OPEN_APP = 'open-app'
export const HISTORY_ACTION_GOTO_APP = 'goto-app'
export const HISTORY_ACTION_OPEN_BRANCH = 'open-branch'
export const HISTORY_ACTION_GOTO_BRANCH = 'goto-branch'
export const HISTORY_ACTION_GOTO_STEP = 'goto-step'
export const HISTORY_ACTION_GOTO_SHEET = 'goto-sheet'
export const HISTORY_ACTION_GOTO_PLOT = 'goto-plot'
export const HISTORY_ACTION_ADD_STEP = 'add-step'
export const HISTORY_ACTION_ADD_SHEET = 'add-sheet'
export const HISTORY_ACTION_ADD_PLOTS = 'add-plots'
export const HISTORY_ACTION_REMOVE_PLOT = 'remove-plot'
export const HISTORY_ACTION_REMOVE_STEP = 'remove-step'
export const HISTORY_ACTION_REMOVE_SHEET = 'remove-sheet'
export const HISTORY_ACTION_REMOVE_BRANCH = 'remove-branch'
export const HISTORY_ACTION_RESET_BRANCH = 'reset-branch'
export const HISTORY_ACTION_REORDER_SHEETS = 'reorder-sheets'
export const HISTORY_ACTION_REORDER_PLOTS = 'reorder-plots'
export const HISTORY_ACTION_UPDATE_PLOT = 'update-plot'
export const HISTORY_ACTION_UNDO = 'undo'
export const HISTORY_ACTION_REDO = 'redo'
export const HISTORY_ACTION_RESET = 'reset'

export interface IHistoryComp {
  id: string
  name: string
}

export type DataFrameType = BaseDataFrame | AnnotationDataFrame | IClusterFrame

export interface IPlot extends IHistoryComp {
  dataframes: Record<string, DataFrameType>
  style: PlotStyle
  // groups to make plots so that they are independent
  // of history such that if user moves groups around
  // it won't affect any plots generated
  groups: IClusterGroup[]
  customProps: Record<string, unknown>
}

export interface IHistoryState {
  //currentBranch: IHistoryBranch | undefined
  currentApp: string
  apps: string[]

  // maintains the current position in the history stack
  // since the stack can include redo actions if we undo
  // an action
  appMap: Record<string, IHistoryApp>
  branchMap: Record<string, IHistoryBranch>
  stepMap: Record<string, IHistoryStep>
  sheetMap: Record<string, BaseDataFrame>
  plotMap: Record<string, IPlot>
  groupMap: Record<string, IClusterGroup>
  genesetMap: Record<string, IGeneset>
}

export interface IHistoryApp extends IHistoryComp {
  //currentBranch: IHistoryBranch | undefined
  currentBranch: string
  branches: string[]

  // branchMap: Record<string, IHistoryBranch>
  // stepMap: Record<string, IHistoryStep>
  // sheetMap: Record<string, BaseDataFrame>
  // plotMap: Record<string, IPlot>

  //branchMap: Record<string, IHistoryBranch>
}

export interface IHistoryBranch extends IHistoryComp {
  // maintains the current position in the history stack
  // since the stack can include redo actions if we undo
  // an action
  currentStep: string
  steps: string[]
  //stepMap: Record<string, IHistoryStep>
  //currentStep: string

  currentPlot: string
  plots: string[]
  //plotMap: Record<string, IPlot>

  groups: string[]

  genesets: string[]
}

export interface IHistoryStep extends IHistoryComp {
  //currentSheet: BaseDataFrame | undefined

  currentSheet: string
  sheets: string[]

  //sheetMap: Record<string, BaseDataFrame>
  //currentSheet: string

  //sheetMap: { [key: string]: BaseDataFrame }

  //currentPlot: IPlot | undefined
  //currentPlotIndex: number
  //plots: IPlot[]
  //plotMap: { [key: string]: IPlot }
}

// export function histItemAddr(
//   stepAddr: IHistStepAddr,
//   index: number
// ): IHistItemAddr {
//   return [...stepAddr, index]
// }

export function newPlot(
  name: string,
  dataframes: Record<string, DataFrameType> = {},
  style: PlotStyle = 'heatmap'
): IPlot {
  return {
    id: nanoid(),
    name,
    dataframes,
    groups: [],
    style,
    customProps: {},
  }
}

export function newHistoryStep(
  name: string,
  sheets: BaseDataFrame[] = []
  //plots: IPlot[] = []
): IHistoryStep {
  return {
    id: nanoid(),

    name,
    sheets: sheets.map(s => s.id),
    //sheetMap: Object.fromEntries(sheets.map(s => [s.id, s])),
    currentSheet: sheets.length > 0 ? sheets[sheets.length - 1]!.id : '',

    //sheetMap: Object.fromEntries(sheets.map(s => [s.id, s])),
    //plots, //: plots.map(s => s.id),
    //currentPlot: plots.length > 0 ? plots[plots.length - 1]! : undefined,
    //currentPlotIndex: plots.length - 1,

    //plotMap: Object.fromEntries(plots.map(s => [s.id, s])),
  }
}

export function newHistoryApp(
  name: string,
  branches: IHistoryBranch[] = []
): IHistoryApp {
  return {
    id: nanoid(),
    name,
    //stepMap: Object.fromEntries(steps.map(s => [s.id, s])),
    branches: branches.map(s => s.id),
    currentBranch: branches.length > 0 ? branches[branches.length - 1]!.id : '',

    // branchMap: {},
    // stepMap: {},
    // sheetMap: {},
    // plotMap: {},
  }
}

export function newHistoryBranch(
  name: string,
  steps: IHistoryStep[] = [],
  plots: IPlot[] = [],
  groups: IClusterGroup[] = [],
  genesets: IGeneset[] = []
): IHistoryBranch {
  return {
    id: nanoid(),
    name,
    //stepMap: Object.fromEntries(steps.map(s => [s.id, s])),
    steps: steps.map(s => s.id),
    currentStep: steps.length > 0 ? steps[steps.length - 1]!.id : '',
    plots: plots.map(s => s.id),
    currentPlot: plots.length > 0 ? plots[plots.length - 1]!.id : '',
    groups: groups.map(s => s.id),
    genesets: genesets.map(s => s.id),

    //
  }
}

export function cloneHistory(history: IHistoryApp): IHistoryApp {
  return produce(history, () => {})
}

// export function newHistoryBranchState(
//   branches: IHistoryBranch[] = []
// ): IHistoryApp {
//   return {
//     //branchMap: Object.fromEntries(branches.map(s => [s.id, s])),
//     branches: branches.map(s => s.id),
//     currentBranch: branches.length - 1,

//     // log: [
//     //   {
//     //     action: HISTORY_ACTION_OPEN_BRANCH,
//     //     ids: [branches[branches.length - 1]!.id],
//     //   },
//     // ],
//   }
// }

export function defaultHistoryTree(): IHistoryApp {
  const branch = newHistoryBranch(DEFAULT_TABLE_NAME, [
    newHistoryStep('Load default sheet', [DATAFRAME_100x26]),
  ])

  return newHistoryApp(DEFAULT_HISTORY_APP, [branch])
}

type AppendMode = 'set' | 'append'

export type HistoryAddPlots = (plots: IPlot[], mode?: AppendMode) => void

export type HistoryUpdateProps = (
  addr: string,
  name: string,
  prop: unknown
) => void

interface IOpenBranchParams {
  groups?: IClusterGroup[]
  genesets?: IGeneset[]
  plots?: IPlot[]
  mode?: AppendMode | undefined
}

export type HistoryOpenBranch = (
  name: string,
  sheets: BaseDataFrame[],
  params?: IOpenBranchParams
) => void

interface IHistoryStore {
  history: IHistoryState
  historyActions: { action: string; ids: string[] }[]

  openApp: (addr: string) => void
  gotoApp: (addr: string) => void

  reset: () => void

  openBranch: HistoryOpenBranch

  gotoBranch: (addr: string) => void
  resetBranch: (addr: string) => void
  removeBranch: (addr: string) => void

  addStep: (
    branchId: string,
    description: string,
    sheets: BaseDataFrame[]
  ) => void

  gotoStep: (branchId: string, stepId: string) => void
  removeStep: (addr: string) => void

  addSheets: (
    stepId: string,
    sheets: BaseDataFrame[],
    mode?: AppendMode
  ) => void
  gotoSheet: (stepId: string, sheetId: string) => void

  removeSheet: (stepId: string, sheetId: string) => void
  reorderSheets: (stepId: string, sheets: string[]) => void

  addPlots: HistoryAddPlots
  gotoPlot: (addr: string) => void
  reorderPlots: (branchId: string, plotIds: string[]) => void
  removePlot: (addr: string) => void
  updatePlot: (plot: IPlot) => void
  updateCustomProp: HistoryUpdateProps

  addGroups: (
    branchId: string,
    groups: IClusterGroup[],
    mode?: AppendMode
  ) => void
  reorderGroups: (branchId: string, ids: string[]) => void
  removeGroups: (branchId: string, ids: string[]) => void
  updateGroup: (group: IClusterGroup) => void

  addGenesets: (
    branchId: string,
    genesets: IGeneset[],
    mode?: AppendMode
  ) => void
  reorderGenesets: (branchId: string, ids: string[]) => void
  removeGenesets: (branchId: string, ids: string[]) => void
  updateGeneset: (geneset: IGeneset) => void

  undo: () => void
  redo: () => void
}

function init(): {
  history: IHistoryState
  historyActions: { action: string; ids: string[] }[]
} {
  const step = newHistoryStep('Load default sheet', [DATAFRAME_100x26])

  const branch = newHistoryBranch(DEFAULT_TABLE_NAME, [step])

  const app = newHistoryApp(DEFAULT_HISTORY_APP, [branch])

  return {
    history: {
      apps: [app.id],
      currentApp: app.id,
      appMap: {
        [app.id]: app,
      },
      branchMap: { [branch.id]: branch },
      stepMap: { [step.id]: step },
      sheetMap: { [DATAFRAME_100x26.id]: DATAFRAME_100x26 },
      plotMap: {},
      groupMap: {},
      genesetMap: {},
    },
    historyActions: [
      { action: 'init-history', ids: [] },
      { action: HISTORY_ACTION_OPEN_APP, ids: [app.id] },
      { action: HISTORY_ACTION_OPEN_BRANCH, ids: [branch.id] },
    ],
  }
}

export const useHistoryStore = create(
  subscribeWithSelector<IHistoryStore>((set, get) => ({
    ...init(),
    //historyActions: [{ action: 'init-history', ids: [] }],
    openApp: (name: string): IHistoryStore => {
      set(
        produce((state: IHistoryStore) => {
          // set the name we are using

          if (
            !Object.values(state.history.appMap).some(
              app => app.id === name || app.name === name
            )
          ) {
            //.id === targetId)) {
            // create a default app history with a default table

            const step = newHistoryStep('Load default sheet', [
              DATAFRAME_100x26,
            ])

            const branch = newHistoryBranch(DEFAULT_TABLE_NAME, [step])

            const app = newHistoryApp(name, [branch])
            state.history.appMap[app.id] = app
            state.history.apps.push(app.id)

            state.history.stepMap[step.id] = step
            state.history.sheetMap[DATAFRAME_100x26.id] = DATAFRAME_100x26

            //state.history.currentApp = state.history.apps.length - 1

            state.history.branchMap[branch.id] = branch
          }

          const app = state.history.apps
            .map(id => state.history.appMap[id]!)
            .find(app => app.id === name || app.name === name)

          if (app && state.history.currentApp !== app.id) {
            state.history.currentApp = app.id

            const branch =
              state.history.appMap[state.history.currentApp]!.currentBranch

            //logAction(HISTORY_ACTION_OPEN_APP, [name], state)

            logAction(HISTORY_ACTION_OPEN_APP, [app.id], state)
            logAction(HISTORY_ACTION_OPEN_BRANCH, [branch], state)
          }
        })
      )

      return get()
    },
    gotoApp: (id: string) => {
      set(
        produce((state: IHistoryStore) => {
          const app = state.history.apps
            .map(id => state.history.appMap[id]!)
            .find(app => app.id === id || app.name === id)

          if (app && state.history.currentApp !== app.id) {
            state.history.currentApp = app.id

            logAction('goto-app', [id], state)
          }
        })
      )
    },
    reset: () => {
      set(
        produce((state: IHistoryStore) => {
          const step = newHistoryStep('Load default sheet', [DATAFRAME_100x26])
          const branch = newHistoryBranch(DEFAULT_TABLE_NAME, [step])
          const app = newHistoryApp(DEFAULT_HISTORY_APP, [branch])

          state.history.apps = [app.id]

          state.history.currentApp = ''
          state.history.appMap = {
            [DEFAULT_HISTORY_APP]: newHistoryApp(DEFAULT_HISTORY_APP, []),
          }

          logAction(HISTORY_ACTION_OPEN_APP, [DEFAULT_HISTORY_APP], state)
        })
      )
    },
    openBranch: (
      name: string,
      sheets: BaseDataFrame[],
      params: IOpenBranchParams = {}
    ) => {
      set(
        produce((state: IHistoryStore) => {
          const {
            groups = [],
            genesets = [],
            plots = [],
            mode = 'set',
          } = params

          const app = state.history.appMap[state.history.currentApp]

          if (app) {
            if (mode === 'set') {
              app.branches = []
            }

            const step = newHistoryStep(name, sheets)

            const branch = newHistoryBranch(
              `Table ${app?.branches.length ?? 0 + 1}`,
              [step],
              plots,
              groups,
              genesets
            )

            app.branches.push(branch.id)
            app.currentBranch = app.branches[app.branches.length - 1]!

            state.history.branchMap[branch.id] = branch

            state.history.stepMap[step.id] = step

            for (const sheet of sheets) {
              state.history.sheetMap[sheet.id] = sheet
            }

            for (const g of groups) {
              state.history.groupMap[g.id] = g
            }

            for (const g of genesets) {
              state.history.genesetMap[g.id] = g
            }

            for (const p of plots) {
              state.history.plotMap[p.id] = p
            }

            logAction(HISTORY_ACTION_OPEN_BRANCH, [branch.id], state)
          }
        })
      )
    },
    gotoBranch: (id: string) => {
      set(
        produce((state: IHistoryStore) => {
          const app = state.history.appMap[state.history.currentApp]

          if (app && id !== app.currentBranch) {
            app.currentBranch = id

            logAction('goto-branch', [id], state)
          }
        })
      )
    },
    resetBranch: (id: string) => {
      set(
        produce((state: IHistoryStore) => {
          //const app = state.history.appMap[state.history.currentApp]!

          if (id in state.history.branchMap) {
            state.history.branchMap[id]!.currentStep = ''
            state.history.branchMap[id]!.steps = []

            logAction('reset-branch', [id], state)
          }
        })
      )
    },

    removeBranch: (id: string) => {
      set(
        produce((state: IHistoryStore) => {
          const app = state.history.appMap[state.history.currentApp]

          if (app) {
            const idx = app.branches.indexOf(id)

            app.branches = app.branches.filter(b => b !== id)

            app.currentBranch =
              app.branches[Math.min(idx, app.branches.length - 1)] ?? ''

            // if we remove all branches, reload the default branch
            if (app.branches.length === 0) {
              const branch = newHistoryBranch(DEFAULT_TABLE_NAME, [
                newHistoryStep('Load default sheet', [DATAFRAME_100x26]),
              ])

              app.branches = [branch.id]
              app.currentBranch = branch.id
              state.history.branchMap[branch.id] = branch
            }

            logAction('remove-branch', [app.currentBranch], state)
          }
        })
      )
    },
    addStep: (branchId: string, name: string, sheets: BaseDataFrame[]) => {
      set(
        produce((state: IHistoryStore) => {
          // add from the current history point, deletingunknown steps
          // ahead of the current point
          const branch = state.history.branchMap[branchId]

          if (branch) {
            const step = newHistoryStep(name, sheets)

            const idx = branch.steps.indexOf(branch.currentStep)

            branch.steps = [...branch.steps.slice(0, idx + 1), step.id]

            branch.currentStep = branch.steps[branch.steps.length - 1]!

            state.history.stepMap[step.id] = step

            for (const sheet of sheets) {
              state.history.sheetMap[sheet.id] = sheet
            }

            logAction('add-step', [step.id], state)
          }
        })
      )
    },
    gotoStep: (branchId: string, stepId: string) => {
      set(
        produce((state: IHistoryStore) => {
          // add from the current history point, deletingunknown steps
          // ahead of the current point
          //const app = state.history.appMap[state.history.currentApp]

          //if (app) {
          const branch = state.history.branchMap[branchId]

          if (
            branch &&
            branch.steps.includes(stepId) &&
            branch.currentStep !== stepId
          ) {
            branch.currentStep = stepId

            logAction('goto-step', [stepId], state)
          }
          //}
        })
      )
    },

    removeStep: (addr: string) => {
      set(
        produce((state: IHistoryStore) => {
          const app = state.history.appMap[state.history.currentApp]!

          const branch = state.history.branchMap[app.currentBranch]!

          const idx = branch.steps.indexOf(branch.currentStep)

          branch.steps = branch.steps.filter(b => b !== addr)

          branch.currentStep =
            branch.steps[Math.min(idx, branch.steps.length - 1)] ?? ''

          logAction('remove-step', [addr], state)
        })
      )
    },

    addSheets: (
      stepId: string,
      sheets: BaseDataFrame[],
      mode: AppendMode = 'append'
    ) => {
      set(
        produce((state: IHistoryStore) => {
          const step = state.history.stepMap[stepId]

          if (step) {
            if (mode === 'append') {
              step.sheets = [...step.sheets, ...sheets.map(s => s.id)]
            } else {
              step.sheets = sheets.map(s => s.id)
            }

            step.currentSheet = step.sheets[step.sheets.length - 1]!

            for (const sheet of sheets) {
              state.history.sheetMap[sheet.id] = sheet
            }

            logAction(
              'add-sheets',
              sheets.map(s => s.id),
              state
            )
          }
        })
      )
    },

    gotoSheet: (stepId: string, sheetId: string) => {
      set(
        produce((state: IHistoryStore) => {
          const step = state.history.stepMap[stepId]

          if (
            step &&
            step.sheets.includes(sheetId) &&
            step.currentSheet !== sheetId
          ) {
            step.currentSheet = sheetId
            logAction('goto-sheet', [sheetId], state)
          }
        })
      )
    },

    removeSheet: (stepId: string, sheetId: string) => {
      set(
        produce((state: IHistoryStore) => {
          const step = state.history.stepMap[stepId]

          if (step) {
            const idx = step.sheets.indexOf(sheetId)

            step.sheets = step.sheets.filter(sheet => sheet !== sheetId)

            step.currentSheet =
              step.sheets[Math.min(idx, step.sheets.length - 1)] ?? ''

            logAction('remove-sheet', [sheetId], state)
          }
        })
      )
    },

    reorderSheets: (stepId: string, sheetIds: string[]) => {
      set(
        produce((state: IHistoryStore) => {
          const step = state.history.stepMap[stepId]

          if (step) {
            step.sheets = sheetIds

            logAction('reorder-sheets', [], state)
          }
        })
      )
    },

    addPlots: (plots: IPlot[], mode: AppendMode = 'append') => {
      set(
        produce((state: IHistoryStore) => {
          const app = state.history.appMap[state.history.currentApp]

          if (app) {
            const branch = state.history.branchMap[app.currentBranch]

            if (branch) {
              if (mode === 'append') {
                branch.plots = [...branch.plots, ...plots.map(s => s.id)]
              } else {
                branch.plots = plots.map(s => s.id)
              }

              branch.currentPlot = branch.plots[branch.plots.length - 1]!

              for (const plot of plots) {
                state.history.plotMap[plot.id] = plot
              }

              logAction(
                'add-plots',
                plots.map(s => s.id),
                state
              )
            }
          }
        })
      )
    },

    gotoPlot: (addr: string) => {
      set(
        produce((state: IHistoryStore) => {
          const app = state.history.appMap[state.history.currentApp]

          if (app) {
            const branch = state.history.branchMap[app.currentBranch]

            if (branch && branch.currentPlot !== addr) {
              branch.currentPlot = addr

              logAction('goto-plot', [addr], state)
            }
          }
        })
      )
    },

    removePlot: (addr: string) => {
      set(
        produce((state: IHistoryStore) => {
          const app = state.history.appMap[state.history.currentApp]

          if (app) {
            const branch = state.history.branchMap[app.currentBranch]

            if (branch) {
              const idx = branch.plots.indexOf(addr)

              branch.plots = branch.plots.filter(plot => plot !== addr)

              branch.currentPlot =
                branch.plots[Math.min(idx, branch.plots.length - 1)] ?? ''

              logAction('remove-sheet', [addr], state)
            }
          }
        })
      )
    },

    reorderPlots: (branchId: string, plotIds: string[]) => {
      set(
        produce((state: IHistoryStore) => {
          const branch = state.history.branchMap[branchId]

          if (branch) {
            branch.plots = plotIds

            logAction('reorder-plots', [], state)
          }
        })
      )
    },

    updatePlot: (plot: IPlot) => {
      set(
        produce((state: IHistoryStore) => {
          //const app = state.history.appMap[state.history.currentApp]!

          state.history.plotMap[plot.id] = plot

          logAction('update-plot', [plot.id], state)
        })
      )
    },

    updateCustomProp: (plotId: string, name: string, prop: unknown) => {
      set(
        produce((state: IHistoryStore) => {
          //const app = state.history.appMap[state.history.currentApp]!

          //const branch = state.history.branchMap[app?.currentBranch ?? '']

          const plot = state.history.plotMap[plotId]

          if (plot) {
            plot.customProps = {
              ...plot.customProps,
              [name]: prop,
            }

            logAction('update-props', [plot.id], state)
          }
        })
      )
    },

    addGroups: (
      branchId: string,
      groups: IClusterGroup[],
      mode: AppendMode = 'append'
    ) => {
      set(
        produce((state: IHistoryStore) => {
          const branch = state.history.branchMap[branchId]

          //console.log('mode', mode)

          if (branch) {
            if (mode === 'append') {
              branch.groups = [...branch.groups, ...groups.map(s => s.id)]
            } else {
              branch.groups = groups.map(s => s.id)
            }

            for (const plot of groups) {
              state.history.groupMap[plot.id] = plot
            }

            logAction(
              'add-groups',
              groups.map(s => s.id),
              state
            )
          }
        })
      )
    },

    removeGroups: (branchId: string, ids: string[]) => {
      set(
        produce((state: IHistoryStore) => {
          const branch = state.history.branchMap[branchId]

          const idset = new Set(ids)

          if (branch) {
            branch.groups = branch.groups.filter(group => !idset.has(group))

            logAction('remove-groups', ids, state)
          }
        })
      )
    },

    reorderGroups: (branchId: string, groupIds: string[]) => {
      set(
        produce((state: IHistoryStore) => {
          const branch = state.history.branchMap[branchId]

          if (branch) {
            branch.groups = groupIds

            logAction('reorder-groups', groupIds, state)
          }
        })
      )
    },

    updateGroup: (group: IClusterGroup) => {
      set(
        produce((state: IHistoryStore) => {
          //const app = state.history.appMap[state.history.currentApp]!

          state.history.groupMap[group.id] = group

          logAction('update-group', [group.id], state)
        })
      )
    },

    addGenesets: (
      branchId: string,
      genesets: IGeneset[],
      mode: AppendMode = 'append'
    ) => {
      set(
        produce((state: IHistoryStore) => {
          const branch = state.history.branchMap[branchId]

          if (branch) {
            if (mode === 'append') {
              branch.genesets = [...branch.genesets, ...genesets.map(s => s.id)]
            } else {
              branch.genesets = genesets.map(s => s.id)
            }

            for (const plot of genesets) {
              state.history.genesetMap[plot.id] = plot
            }

            logAction(
              'add-genesets',
              genesets.map(s => s.id),
              state
            )
          }
        })
      )
    },

    removeGenesets: (branchId: string, ids: string[]) => {
      set(
        produce((state: IHistoryStore) => {
          const branch = state.history.branchMap[branchId]

          const idset = new Set(ids)

          if (branch) {
            branch.genesets = branch.genesets.filter(
              geneset => !idset.has(geneset)
            )

            logAction('remove-genesets', ids, state)
          }
        })
      )
    },

    reorderGenesets: (branchId: string, genesetIds: string[]) => {
      set(
        produce((state: IHistoryStore) => {
          const branch = state.history.branchMap[branchId]

          if (branch) {
            branch.genesets = genesetIds

            logAction('reorder-genesets', genesetIds, state)
          }
        })
      )
    },

    updateGeneset: (geneset: IGeneset) => {
      set(
        produce((state: IHistoryStore) => {
          //const app = state.history.appMap[state.history.currentApp]!

          state.history.genesetMap[geneset.id] = geneset

          logAction('update-geneset', [geneset.id], state)
        })
      )
    },

    undo: () => {
      set(
        produce((state: IHistoryStore) => {
          const app = state.history.appMap[state.history.currentApp]

          if (app) {
            const branch = state.history.branchMap[app.currentBranch]

            if (branch) {
              const idx = branch.steps.indexOf(branch.currentStep)

              if (idx > 0) {
                branch.currentStep = branch.steps[Math.max(0, idx - 1)]!

                logAction('undo', [branch.id], state)
              }
            }
          }
        })
      )
    },

    redo: () => {
      set(
        produce((state: IHistoryStore) => {
          const app = state.history.appMap[state.history.currentApp]

          if (app) {
            const branch = state.history.branchMap[app.currentBranch]

            if (branch) {
              const idx = branch.steps.indexOf(branch.currentStep)

              if (idx < branch.steps.length - 1) {
                branch.currentStep =
                  branch.steps[Math.min(idx + 1, branch.steps.length - 1)]!

                logAction('redo', [branch.id], state)
              }
            }
          }
        })
      )
    },
  }))
)

export type HistoryAction =
  | {
      type: 'open-app'
      name: string
    }
  | {
      type: 'goto-app'
      name: string
    }
  | {
      type: 'open-branch'
      name: string
      sheets: BaseDataFrame[]
      mode?: AppendMode
    }
  | {
      type: 'goto-branch'
      addr: string
    }
  | {
      type: 'goto-step'
      addr: string
    }
  | {
      type: 'goto-sheet'
      addr: string
    }
  | {
      type: 'remove-step'
      addr: string
    }
  | {
      type: 'remove-sheet'
      addr: string
    }
  | {
      type: 'remove-plot'
      addr: string
    }
  | {
      type: 'add-step'
      addr: string
      description: string
      sheets: BaseDataFrame[]
    }
  | {
      type: 'add-sheets'
      addr: string
      sheets: BaseDataFrame[]
      mode?: AppendMode
    }
  | {
      type: 'add-plots'
      addr: string
      plots: IPlot[]
      mode?: AppendMode
    }
  | {
      type: 'remove-branch'
      addr: string
    }
  | {
      type: 'reset-branch'
      addr: string
    }
  | {
      type: 'reorder-sheets'
      sheets: string[]
      addr?: string
    }
  | {
      type: 'reorder-plots'
      plotIds: string[]
      addr?: string
    }
  | {
      type: 'update-plot'
      plot: IPlot
      addr?: string
    }
  | {
      type: 'update-props'
      addr: string
      name: string
      prop: unknown
    }
  | {
      type: 'undo'
      addr?: string
    }
  | {
      type: 'redo'
      addr?: string
    }
  | {
      type: 'reset'
    }

export function useHistory(): {
  history: IHistoryApp | undefined
  historyActions: { action: string; ids: string[] }[]
  branch: IHistoryBranch | undefined
  branches: IHistoryBranch[]
  step: IHistoryStep | undefined
  sheet: BaseDataFrame | undefined
  sheets: BaseDataFrame[]
  plot: IPlot | undefined
  plots: IPlot[]
  allPlots: IPlot[]
  groups: IClusterGroup[]
  genesets: IGeneset[]
  reset: () => void
  openApp: (addr: string) => void
  gotoApp: (addr: string) => void
  openBranch: HistoryOpenBranch
  gotoBranch: (addr: string) => void
  resetBranch: (addr: string) => void
  removeBranch: (addr: string) => void
  addStep: (description: string, sheets: BaseDataFrame[]) => void

  addSheets: (sheets: BaseDataFrame[], mode?: AppendMode) => void
  gotoSheet: (addr: string) => void
  gotoStep: (addr: string) => void
  removeStep: (addr: string) => void
  removeSheet: (addr: string) => void
  reorderSheets: (sheets: string[]) => void
  removePlot: (addr: string) => void
  reorderPlots: (plotIds: string[]) => void
  updatePlot: (plot: IPlot) => void
  addPlots: HistoryAddPlots
  updateProps: HistoryUpdateProps
  gotoPlot: (addr: string) => void

  addGroups: (groups: IClusterGroup[], mode?: AppendMode) => void
  reorderGroups: (ids: string[]) => void
  removeGroups: (ids: string[]) => void
  updateGroup: (group: IClusterGroup) => void

  addGenesets: (groups: IGeneset[], mode?: AppendMode) => void
  reorderGenesets: (ids: string[]) => void
  removeGenesets: (ids: string[]) => void
  updateGeneset: (group: IGeneset) => void

  undo: () => void
  redo: () => void
  dispatch: (action: HistoryAction) => void
} {
  //const historyState = useHistoryStore(state => state.history)

  const openApp = useHistoryStore(state => state.openApp)
  const gotoApp = useHistoryStore(state => state.gotoApp)
  const reset = useHistoryStore(state => state.reset)
  const openBranch = useHistoryStore(state => state.openBranch)
  const gotoBranch = useHistoryStore(state => state.gotoBranch)
  const resetBranch = useHistoryStore(state => state.resetBranch)
  const removeBranch = useHistoryStore(state => state.removeBranch)
  const addStep = useHistoryStore(state => state.addStep)
  const gotoStep = useHistoryStore(state => state.gotoStep)
  const removeStep = useHistoryStore(state => state.removeStep)
  const addSheets = useHistoryStore(state => state.addSheets)
  const gotoSheet = useHistoryStore(state => state.gotoSheet)
  const removeSheet = useHistoryStore(state => state.removeSheet)
  const reorderSheets = useHistoryStore(state => state.reorderSheets)
  const addPlots = useHistoryStore(state => state.addPlots)
  const gotoPlot = useHistoryStore(state => state.gotoPlot)
  const removePlot = useHistoryStore(state => state.removePlot)
  const reorderPlots = useHistoryStore(state => state.reorderPlots)
  const updatePlot = useHistoryStore(state => state.updatePlot)
  const updateProps = useHistoryStore(state => state.updateCustomProp)

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

  const app = useCurrentApp()
  const historyActions = useHistoryActions()

  //console.log('hist', historyState, historyActions)

  const branches: IHistoryBranch[] = useCurrentBranches()

  const { branch, step, sheet, sheets, plot, plots, groups, genesets } =
    useCurrentBranch()

  const dispatch = useCallback(function dispatch(action: HistoryAction) {
    switch (action.type) {
      case HISTORY_ACTION_OPEN_APP:
        openApp(action.name)
        break
      case HISTORY_ACTION_GOTO_APP:
        gotoApp(action.name)
        break
      case HISTORY_ACTION_OPEN_BRANCH:
        openBranch(action.name, action.sheets, {
          mode: action.mode,
        })
        break
      case HISTORY_ACTION_GOTO_BRANCH:
        gotoBranch(action.addr)
        break
      case HISTORY_ACTION_GOTO_SHEET:
        gotoSheet(step?.id ?? '', action.addr)
        break
      case HISTORY_ACTION_GOTO_STEP:
        gotoStep(branch?.id ?? '', action.addr)
        break
      case HISTORY_ACTION_REMOVE_PLOT:
        removePlot(action.addr)
        break
      case HISTORY_ACTION_REMOVE_STEP:
        removeStep(action.addr)
        break
      default:
        console.log('unknown action', action)
        break
    }
  }, [])

  // useEffect(() => {
  //   openAppHistory(app)
  // }, [app])

  //openAppHistory(app)

  //console.log(historyState, 'hist')

  const allPlots: IPlot[] = useHistoryStore(
    useShallow(
      state =>
        app?.branches
          .map(b => state.history.branchMap[b]?.plots ?? [])
          .flat()
          .map(id => state.history.plotMap[id]!) ?? []
    )
  )

  return {
    history: app,
    historyActions,
    branches,
    branch,
    step,
    sheet,
    sheets,
    plot,
    plots,
    allPlots,
    groups,
    genesets,
    openApp,
    gotoApp,
    reset,
    openBranch,
    gotoBranch,
    resetBranch,
    removeBranch,
    addStep: (description: string, sheets: BaseDataFrame[]) => {
      addStep(branch?.id ?? '', description, sheets)
    },
    addSheets: (sheets: BaseDataFrame[], mode?: AppendMode) => {
      addSheets(branch?.currentStep ?? '', sheets, mode)
    },
    gotoStep: (addr: string) => {
      gotoStep(branch?.id ?? '', addr)
    },

    removeStep,
    removeSheet: (sheetId: string) => {
      removeSheet(step?.id ?? '', sheetId)
    },
    reorderSheets: (sheets: string[]) => {
      reorderSheets(step?.id ?? '', sheets)
    },
    gotoSheet: (sheetId: string) => {
      gotoSheet(step?.id ?? '', sheetId)
    },
    reorderPlots: (plotIds: string[]) => {
      reorderPlots(branch?.id ?? '', plotIds)
    },
    removePlot,
    updatePlot,
    addPlots,
    updateProps,
    gotoPlot,

    addGroups: (groups: IClusterGroup[], mode?: AppendMode) => {
      addGroups(branch?.id ?? '', groups, mode)
    },
    removeGroups: (ids: string[]) => {
      removeGroups(branch?.id ?? '', ids)
    },
    reorderGroups: (ids: string[]) => {
      reorderGroups(branch?.id ?? '', ids)
    },
    updateGroup,

    addGenesets: (genesets: IGeneset[], mode?: AppendMode) => {
      addGenesets(branch?.id ?? '', genesets, mode)
    },
    removeGenesets: (ids: string[]) => {
      removeGenesets(branch?.id ?? '', ids)
    },
    reorderGenesets: (ids: string[]) => {
      reorderGenesets(branch?.id ?? '', ids)
    },
    updateGeneset,

    undo,
    redo,
    dispatch,
  }
}

export function useCurrentApp(): IHistoryApp | undefined {
  return useHistoryStore(
    state => state.history.appMap[state.history.currentApp]
  )
}

export function useHistoryActions(): {
  action: string
  ids: string[]
}[] {
  return useHistoryStore(useShallow(state => state.historyActions))
}

export function useCurrentBranches(): IHistoryBranch[] {
  const app = useCurrentApp()!

  return useHistoryStore(
    useShallow(
      state => app.branches.map(id => state.history.branchMap[id]!) ?? []
    )
  )
}

export function useCurrentBranch(): IBranchStore {
  const app = useCurrentApp()
  return useBranch(app?.currentBranch ?? '')
}

// function _useBranch(branchId: string): IHistoryBranch | undefined {
//   const cb = useCurrentBranch()
//   const b = useHistoryStore(state => state.history.branchMap[branchId])
//   return b ?? cb
// }

// function _useStep(stepId: string): IHistoryStep | undefined {
//   const cb = useCurrentStep(stepId)
//   const b = useHistoryStore(state => state.history.stepMap[stepId])
//   return b ?? cb
// }

export function useCurrentStep(): IStepStore {
  const { branch } = useCurrentBranch()
  return useStep(branch?.currentStep ?? '')
}

export function useCurrentSheet(): BaseDataFrame | undefined {
  const { sheet } = useCurrentStep()!

  return sheet
}

export function useCurrentSheets(): BaseDataFrame[] {
  const { sheets } = useCurrentStep()!

  return sheets
}

export function useCurrentPlot(): IPlot | undefined {
  const { plot } = useCurrentBranch()!

  return plot
}

export function useCurrentPlots(): IPlot[] {
  const { plots } = useCurrentBranch()!

  return plots
}

export function useAllPlots(): IPlot[] {
  const app = useCurrentApp()!

  return useHistoryStore(
    useShallow(
      state =>
        app.branches
          .map(b => state.history.branchMap[b]?.plots ?? [])
          .flat()
          .map(id => state.history.plotMap[id]!) ?? []
    )
  )
}

interface IBranchStore {
  branch: IHistoryBranch | undefined
  step: IHistoryStep | undefined
  steps: IHistoryStep[]
  sheet: BaseDataFrame | undefined
  sheets: BaseDataFrame[]
  plot: IPlot | undefined
  plots: IPlot[]
  groups: IClusterGroup[]
  genesets: IGeneset[]
  gotoStep: (stepId: string) => void
  addStep: (description: string, sheets: BaseDataFrame[]) => void
  addSheets: (sheets: BaseDataFrame[], mode?: AppendMode) => void
  removeSheet: (sheetId: string) => void
  gotoSheet: (sheetId: string) => void
  reorderSheets: (sheets: string[]) => void
  reorderPlots: (plotIds: string[]) => void

  addGroups: (groups: IClusterGroup[], mode?: AppendMode) => void
  removeGroups: (ids: string[]) => void
  reorderGroups: (ids: string[]) => void

  addGenesets: (genesets: IGeneset[], mode?: AppendMode) => void
  removeGenesets: (ids: string[]) => void
  reorderGenesets: (ids: string[]) => void
}

/**
 * A view of the history of a particular branch. This is preferable
 * to the global state as it ensures only the branch of interest is
 * updated and accidental updates in other branches are not triggered.
 *
 * @param branchId
 * @returns
 */
export function useBranch(branchId: string): IBranchStore {
  const gotoStep = useHistoryStore(state => state.gotoStep)
  const addStep = useHistoryStore(state => state.addStep)
  const addSheets = useHistoryStore(state => state.addSheets)
  const removeSheet = useHistoryStore(state => state.removeSheet)
  const gotoSheet = useHistoryStore(state => state.gotoSheet)
  const reorderSheets = useHistoryStore(state => state.reorderSheets)
  const reorderPlots = useHistoryStore(state => state.reorderPlots)

  const addGroups = useHistoryStore(state => state.addGroups)
  const removeGroups = useHistoryStore(state => state.removeGroups)
  const reorderGroups = useHistoryStore(state => state.reorderGroups)

  const addGenesets = useHistoryStore(state => state.addGenesets)
  const removeGenesets = useHistoryStore(state => state.removeGenesets)
  const reorderGenesets = useHistoryStore(state => state.reorderGenesets)

  const branch = useHistoryStore(state => state.history.branchMap[branchId])

  const step = useHistoryStore(
    state => state.history.stepMap[branch?.currentStep ?? '']
  )

  const steps = useHistoryStore(
    useShallow(state => {
      return branch?.steps?.map(id => state.history.stepMap[id]!) ?? []
    })
  )

  const sheet = useHistoryStore(
    state => state.history.sheetMap[step?.currentSheet ?? '']
  )
  const sheets = useHistoryStore(
    useShallow(state => {
      return step?.sheets?.map(id => state.history.sheetMap[id]!) ?? []
    })
  )

  const plot = useHistoryStore(
    state => state.history.plotMap[branch?.currentPlot ?? '']
  )

  const plots = useHistoryStore(
    useShallow(state => {
      return branch?.plots?.map(id => state.history.plotMap[id]!) ?? []
    })
  )

  const groups = useHistoryStore(
    useShallow(state => {
      return branch?.groups?.map(id => state.history.groupMap[id]!) ?? []
    })
  )

  const genesets = useHistoryStore(
    useShallow(state => {
      return branch?.genesets?.map(id => state.history.genesetMap[id]!) ?? []
    })
  )

  return {
    branch,
    step,
    steps,
    sheet,
    sheets,
    plot,
    plots,
    groups,
    genesets,
    gotoStep: (stepId: string) => {
      gotoStep(branch?.id ?? '', stepId)
    },
    addStep: (description: string, sheets: BaseDataFrame[]) => {
      addStep(branch?.id ?? '', description, sheets)
    },
    addSheets: (sheets: BaseDataFrame[], mode: AppendMode = 'append') => {
      addSheets(branch?.id ?? '', sheets, mode)
    },
    removeSheet: (sheetId: string) => {
      removeSheet(step?.id ?? '', sheetId)
    },
    gotoSheet: (sheetId: string) => {
      gotoSheet(step?.id ?? '', sheetId)
    },
    reorderSheets: (sheets: string[]) => {
      reorderSheets(step?.id ?? '', sheets)
    },
    reorderPlots: (plotIds: string[]) => {
      reorderPlots(branch?.id ?? '', plotIds)
    },
    addGroups: (groups: IClusterGroup[], mode: AppendMode = 'append') => {
      addGroups(branch?.id ?? '', groups, mode)
    },
    removeGroups: (ids: string[]) => {
      removeGroups(branch?.id ?? '', ids)
    },
    reorderGroups: (ids: string[]) => {
      reorderGroups(branch?.id ?? '', ids)
    },

    addGenesets: (genesets: IGeneset[], mode: AppendMode = 'append') => {
      addGenesets(branch?.id ?? '', genesets, mode)
    },
    removeGenesets: (ids: string[]) => {
      removeGenesets(branch?.id ?? '', ids)
    },
    reorderGenesets: (ids: string[]) => {
      reorderGenesets(branch?.id ?? '', ids)
    },
  }
}

interface IStepStore {
  step: IHistoryStep | undefined
  sheet: BaseDataFrame | undefined
  sheets: BaseDataFrame[]
}

export function useStep(stepId: string): IStepStore {
  const step = useHistoryStore(state => state.history.stepMap[stepId])

  const sheet = useHistoryStore(
    state => state.history.sheetMap[step?.currentSheet ?? '']
  )
  const sheets = useHistoryStore(
    useShallow(state => {
      return step?.sheets?.map(id => state.history.sheetMap[id]!) ?? []
    })
  )

  return { step, sheet, sheets }
}

export function useSheet(
  sheet: IHistoryStep | string | undefined
): BaseDataFrame | undefined {
  const id = typeof sheet === 'string' ? sheet : (sheet?.currentSheet ?? '')
  return useHistoryStore(state => state.history.sheetMap[id])
}

export function useSheets(
  step: IHistoryStep | string | undefined
): BaseDataFrame[] {
  const id = typeof step === 'string' ? step : (step?.id ?? '')
  return useHistoryStore(
    useShallow(state => {
      const sheets = state.history.stepMap[id]?.sheets
      return sheets?.map(id => state.history.sheetMap[id]!) ?? []
    })
  )
}

export function usePlot(plotId: string): IPlot | undefined {
  return useHistoryStore(state => state.history.plotMap[plotId])
}

export function usePlots(branchId: string): IPlot[] {
  return useHistoryStore(
    useShallow(state => {
      const plots = state.history.branchMap[branchId]?.plots
      return plots?.map(id => state.history.plotMap[id]!) ?? []
    })
  )
}

export function currentApp(): IHistoryApp | undefined {
  return useHistoryStore.getState().history.appMap[
    useHistoryStore.getState().history.currentApp
  ]
}

export function branchFromAddr(branchId: string): IHistoryBranch | undefined {
  return useHistoryStore.getState().history.branchMap[branchId]
}

export function stepFromAddr(stepId: string): IHistoryStep | undefined {
  return useHistoryStore.getState().history.stepMap[stepId]
}

export function sheetFromAddr(sheetId: string): BaseDataFrame | undefined {
  return useHistoryStore.getState().history.sheetMap[sheetId]
}

export function plotFromAddr(plotId: string): IPlot | undefined {
  return useHistoryStore.getState().history.plotMap[plotId]
}

export function plots(branchId: string): IPlot[] {
  const b = branchFromAddr(branchId)
  const plotMap = useHistoryStore.getState().history.plotMap
  return b?.plots.map(id => plotMap[id]!) ?? []
}

export function currentBranch(): IHistoryBranch | undefined {
  const app = currentApp()
  return useHistoryStore.getState().history.branchMap[app?.currentBranch ?? '']
}

export function currentStep(
  branch: IHistoryBranch | undefined
): IHistoryStep | undefined {
  return useHistoryStore.getState().history.stepMap[branch?.currentStep ?? '']
}

export function currentSteps(
  branch: IHistoryBranch | undefined
): IHistoryStep[] {
  const stepMap = useHistoryStore.getState().history.stepMap
  return branch?.steps.map(id => stepMap[id]!) ?? []
}

export function currentStepIndex(branch: IHistoryBranch | undefined): number {
  return branch?.steps.indexOf(branch?.currentStep) ?? -1
}

export function currentSheet(
  step: IHistoryStep | undefined
): BaseDataFrame | undefined {
  return useHistoryStore.getState().history.sheetMap[step?.currentSheet ?? '']
}

export function currentSheets(step: IHistoryStep | undefined): BaseDataFrame[] {
  const sheetMap = useHistoryStore.getState().history.sheetMap
  return step?.sheets.map(id => sheetMap[id]!) ?? []
}

export function currentPlot(
  branch: IHistoryBranch | undefined
): IPlot | undefined {
  return useHistoryStore.getState().history.plotMap[branch?.currentPlot ?? '']
}

export function currentPlots(branch: IHistoryBranch | undefined): IPlot[] {
  const plotMap = useHistoryStore.getState().history.plotMap
  return branch?.plots.map(id => plotMap[id]!) ?? []
}

export function findSheet(
  step: IHistoryStep,
  id: string
): BaseDataFrame | undefined {
  const sheetMap = useHistoryStore.getState().history.sheetMap
  return step.sheets
    .map(id => sheetMap[id]!)
    .find(s => s.id === id || s.name === id)
}

function logAction(action: string, ids: string[], store: IHistoryStore) {
  store.historyActions.push({ action, ids })
  store.historyActions = store.historyActions.slice(
    Math.max(0, store.historyActions.length - MAX_HISTORY_ITEMS)
  )
}
