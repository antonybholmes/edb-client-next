import type { IFieldMap } from '@/interfaces/field-map'
import { listrm } from '@/lib/collections'
import { nanoid } from '@/lib/utils'
import { type IChildrenProps } from '@interfaces/children-props'
import { produce } from 'immer'
import { createContext, useReducer, type Dispatch } from 'react'
import { BaseDataFrame, type SheetId } from '../lib/dataframe/base-dataframe'
import { INF_DATAFRAME } from '../lib/dataframe/inf-dataframe'

export const HISTORY_STEP_TYPE_OPEN = 'open'

export const MAX_HISTORY_ITEMS = 1000

export interface IPlot {
  id: string
  //index: number
  name: string
  //cf: IClusterFrame
  style: string
  //displayOptions: IFieldMap
  customProps: IFieldMap
}

export interface IHistoryComp {
  id: string
  name: string
}

export interface IHistoryAction {
  name: string
  addr: IHistItemAddr | null
}

export interface IHistoryBranchState extends IHistoryComp {
  currentBranch: number
  // maintains the current position in the history stack
  // since the stack can include redo actions if we undo
  // an action
  branches: IHistoryBranch[]

  actions: string[]
}

export interface IHistoryBranch extends IHistoryComp {
  currentStep: number
  // maintains the current position in the history stack
  // since the stack can include redo actions if we undo
  // an action
  steps: IHistoryStep[]
}

export interface IHistoryStep extends IHistoryComp {
  currentSheet: string
  sheets: string[]
  sheetMap: { [key: string]: BaseDataFrame }

  currentPlot: string
  plots: string[]
  plotMap: { [key: string]: IPlot }
}

export interface IHistLookup {
  branch?: string
  step?: string
  item: string
}

// branch index, step index, item index
//export type IHistStepAddr = [number, number]
export type IHistItemAddr = [number, number, string]

//export const INVALID_STEP_ADDR: IHistStepAddr = [-1, -1]
export const INVALID_ITEM_ADDR: IHistItemAddr = [-1, -1, '']

// export function histItemAddr(
//   stepAddr: IHistStepAddr,
//   index: number
// ): IHistItemAddr {
//   return [...stepAddr, index]
// }

export function newPlot(name: string, style: string = ''): IPlot {
  return { id: nanoid(), name, style: style ? style : name, customProps: {} }
}

export function newHistoryStep(
  description: string,
  sheets: BaseDataFrame[] = [],
  plots: IPlot[] = []
): IHistoryStep {
  return {
    id: nanoid(),
    name: description,
    sheets: sheets.map((s) => s.id),
    currentSheet: sheets.length > 0 ? sheets[0]!.id : '',
    sheetMap: Object.fromEntries(sheets.map((s) => [s.id, s])),
    plots: plots.map((s) => s.id),
    currentPlot: plots.length > 0 ? plots[0]!.id : '',
    plotMap: Object.fromEntries(plots.map((s) => [s.id, s])),
  }
}

export function currentBranch(
  history: IHistoryBranchState
): [IHistoryBranch | null, number] {
  if (history.currentBranch < 0) {
    return [null, -1]
  }

  return [history.branches[history.currentBranch]!, history.currentBranch]
}

export function getCurrentStep(
  branch: IHistoryBranch
): [IHistoryStep | null, number] {
  if (branch.currentStep < 0) {
    return [null, -1]
  }

  return [branch.steps[branch.currentStep]!, branch.currentStep]
}

export function getCurrentSheet(step: IHistoryStep): BaseDataFrame {
  return step.sheetMap[step.currentSheet]!
}

export function _currentPlot(step: IHistoryStep): IPlot {
  return step.plotMap[step.currentPlot]!
}

export function currentStep(
  history: IHistoryBranchState,
  branchId: SheetId | undefined = undefined
): [IHistoryStep | null, number] {
  const branch =
    branchId !== undefined
      ? findBranch(branchId, history)
      : currentBranch(history)

  if (branch[0] === null) {
    return [null, -1]
  }

  return [branch[0]!.steps[branch[0]!.currentStep]!, branch[0]!.currentStep]
}

/**
 * Returns the current sheet id in the history.
 *
 * @param history
 * @param stepId
 * @param branchId
 * @returns
 */
export function currentSheetId(
  history: IHistoryBranchState,
  stepId: SheetId | undefined = undefined,
  branchId: SheetId | undefined = undefined
): [string, IHistItemAddr] {
  const branch =
    branchId !== undefined
      ? findBranch(branchId, history)
      : currentBranch(history)

  if (branch[0] === null) {
    return ['', [...INVALID_ITEM_ADDR]]
  }

  const step =
    stepId !== undefined
      ? findStep(stepId, branch[0]!)
      : getCurrentStep(branch[0]!)

  if (step[0] === null) {
    return ['', [...INVALID_ITEM_ADDR]]
  }

  return [step[0]!.currentSheet, [branch[1]!, step[1]!, step[0]!.currentSheet]]
}

/**
 * Returns the current sheet/dataframe in the history.
 *
 * @param history
 * @param stepId
 * @param branchId
 * @returns
 */
export function currentSheet(
  history: IHistoryBranchState,
  stepId: SheetId | undefined = undefined,
  branchId: SheetId | undefined = undefined
): [BaseDataFrame | null, IHistItemAddr] {
  const branch =
    branchId !== undefined
      ? findBranch(branchId, history)
      : currentBranch(history)

  if (branch[0] === null) {
    return [null, [...INVALID_ITEM_ADDR]]
  }

  const step =
    stepId !== undefined
      ? findStep(stepId, branch[0]!)
      : getCurrentStep(branch[0]!)

  if (step[0] === null) {
    return [null, [...INVALID_ITEM_ADDR]]
  }

  return [
    step[0]!.sheetMap[step[0]!.currentSheet]!,
    [branch[1]!, step[1]!, step[0]!.currentSheet],
  ]
}

export function currentSheets(
  history: IHistoryBranchState,
  stepId: SheetId | undefined = undefined,
  branchId: SheetId | undefined = undefined
): [BaseDataFrame[], IHistItemAddr] {
  const branch =
    branchId !== undefined
      ? findBranch(branchId, history)
      : currentBranch(history)

  if (branch[0] === null) {
    return [[], [...INVALID_ITEM_ADDR]]
  }

  const step =
    stepId !== undefined
      ? findStep(stepId, branch[0]!)
      : getCurrentStep(branch[0]!)

  if (step[0] === null) {
    return [[], [...INVALID_ITEM_ADDR]]
  }

  const s = step[0]!

  return [
    s.sheets.map((id) => s.sheetMap[id]!),
    [branch[1]!, step[1]!, step[0]!.currentSheet],
  ]
}

export function newHistoryBranch(
  description: string,
  steps: IHistoryStep[] = []
): IHistoryBranch {
  return {
    id: nanoid(),
    name: description,
    steps,
    currentStep: steps.length - 1,
  }
}

export function cloneHistory(
  history: IHistoryBranchState
): IHistoryBranchState {
  return produce(history, () => {})
}

export function newHistoryBranchState(
  description: string,
  branches: IHistoryBranch[] = []
): IHistoryBranchState {
  return {
    id: nanoid(),
    name: description,
    branches: branches,
    currentBranch: branches.length - 1,
    actions: ['open'],
  }
}

export function defaultHistoryTree(): IHistoryBranchState {
  return newHistoryBranchState('History', [
    newHistoryBranch('Table 1', [
      newHistoryStep('Load default sheet', [INF_DATAFRAME]),
    ]),
  ])
}

export function findHistoryComp<T extends IHistoryComp>(
  id: SheetId,
  comps: T[]
): [T | null, number] {
  if (typeof id == 'number') {
    return [comps[id]!, id]
  }

  id = id.toString()

  let matches = comps
    .map((step, si) => [step, si] as [T, number])
    .filter((s) => s[0].id === id)

  if (matches.length > 0) {
    return matches[0]!
  }

  // If id not found, try searching by name
  id = id.toString().toLowerCase()
  matches = comps
    .map((step, si) => [step, si] as [T, number])
    .filter((s) => s[0].name.toLowerCase().includes(id as string))
  //.map(s => s[1])

  if (comps.length === 0) {
    return [null, -1]
  }

  return matches[0]!
}

/**
 * Trys to find the index of a sheet by id or index. If not found returns -1
 * @param sheet
 * @param dataframes
 * @returns
 */
export function findSheet(
  sheet: SheetId,
  step: IHistoryStep
): BaseDataFrame | null {
  if (typeof sheet == 'number') {
    return step.sheetMap[step.sheets[sheet]!]!
  }

  sheet = sheet.toLowerCase()

  const steps = step.sheets
    .map((id) => step.sheetMap[id]!)
    .filter(
      (s) => s.id === sheet || s.name.toLowerCase().includes(sheet as string)
    )
  //.map(d => d[1])

  if (steps.length === 0) {
    return null
  }

  return steps[0]!
}

export function getSheetAddr(
  addr: IHistLookup,
  history: IHistoryBranchState
): [BaseDataFrame | null, IHistItemAddr] {
  const branch =
    addr.branch !== undefined
      ? findBranch(addr.branch, history)
      : currentBranch(history)

  if (branch[0] === null) {
    return [null, [...INVALID_ITEM_ADDR]]
  }

  const step =
    addr.step !== undefined
      ? findStep(addr.step, branch[0]!)
      : getCurrentStep(branch[0]!)

  if (step[0] === null) {
    return [null, [...INVALID_ITEM_ADDR]]
  }

  const sheet = findSheet(addr.item, step[0]!)

  if (!sheet) {
    return [null, [...INVALID_ITEM_ADDR]]
  }

  return [sheet, [branch[1]!, step[1]!, sheet.id]]
}

export function getSheetFromAddr(
  addr: IHistItemAddr,
  history: IHistoryBranchState
): BaseDataFrame | null {
  if (history.branches.length <= addr[0]) {
    return null
  }

  if (history.branches[addr[0]]!.steps.length <= addr[1]) {
    return null
  }

  if (!(addr[2]! in history.branches[addr[0]]!.steps[addr[1]]!.sheetMap)) {
    return null
  }

  return history.branches[addr[0]!]!.steps[addr[1]!]!.sheetMap[addr[2]!]!
}

export function findPlot(plot: SheetId, step: IHistoryStep): IPlot | null {
  if (typeof plot == 'number') {
    return step.plotMap[step.plots[plot]!]!
  }

  plot = plot.toLowerCase()

  const steps = step.plots
    .map((id) => step.plotMap[id]!)
    .filter(
      (s) => s.id === plot || s.name.toLowerCase().includes(plot as string)
    )
  //.map(d => d[1])

  if (steps.length === 0) {
    return null
  }

  return steps[0]!
}

export function getPlotAddr(
  addr: IHistLookup,
  history: IHistoryBranchState
): [IPlot | null, IHistItemAddr] {
  const branch =
    addr.branch !== undefined
      ? findBranch(addr.branch, history)
      : currentBranch(history)

  if (branch[0] === null) {
    return [null, [...INVALID_ITEM_ADDR]]
  }

  const step =
    addr.step !== undefined
      ? findStep(addr.step, branch[0]!)
      : getCurrentStep(branch[0]!)

  if (step[0] === null) {
    return [null, [...INVALID_ITEM_ADDR]]
  }

  const plot = findPlot(addr.item, step[0]!)

  if (!plot) {
    return [null, [...INVALID_ITEM_ADDR]]
  }

  return [plot, [branch[1]!, step[1]!, plot.id]]
}

export function getPlotFromAddr(
  addr: IHistItemAddr,
  history: IHistoryBranchState
): IPlot | null {
  if (history.branches.length <= addr[0]) {
    return null
  }

  if (history.branches[addr[0]]!.steps.length <= addr[1]) {
    return null
  }

  if (!(addr[2]! in history.branches[addr[0]]!.steps[addr[1]]!.plotMap)) {
    return null
  }

  return history.branches[addr[0]!]!.steps[addr[1]!]!.plotMap[addr[2]!]!
}

export function findBranch(id: SheetId, history: IHistoryBranchState) {
  return findHistoryComp(id, history.branches)
}

export function findStep(id: SheetId, branch: IHistoryBranch) {
  return findHistoryComp(id, branch.steps)
}

export function getBranch(
  index: number,
  history: IHistoryBranchState
): [IHistoryBranch, number] {
  return [history.branches[index]!, index]
}

export function getStep(
  index: number,
  branch: IHistoryBranch
): [IHistoryStep, number] {
  return [branch.steps[index]!, index]
}

export type HistoryAction =
  | { type: 'undo'; branchId?: SheetId }
  | { type: 'redo'; branchId?: SheetId }
  | {
      type: 'change-branch'
      branchId: SheetId
    }
  | {
      type: 'open'
      mode?: 'reset' | 'append'
      file?: string
      description: string
      sheets: BaseDataFrame | BaseDataFrame[]
    }
  | {
      type: 'add-step'
      branchId?: SheetId
      //sheetId?: SheetId
      description: string
      sheets: BaseDataFrame | BaseDataFrame[]
    }
  | {
      type: 'add-sheets'
      mode?: 'reset' | 'append'
      sheets: BaseDataFrame | BaseDataFrame[]
      branchId?: SheetId
      stepId?: SheetId
    }
  | { type: 'goto-sheet'; sheetId: SheetId; stepId?: string; branchId?: string }
  | {
      type: 'remove-sheet'
      sheetId: SheetId
      stepId?: SheetId
      branchId?: SheetId
    }
  | {
      type: 'sheet-order'
      sheetIds: string[]
      stepId?: SheetId
      branchId?: SheetId
    }
  | {
      type: 'add-plots'
      stepId?: SheetId
      branchId?: SheetId
      plots: IPlot | IPlot[]
    }
  | {
      type: 'remove-plot'
      //addr: IHistItemAddr
      plotId: string
      stepId?: SheetId
      branchId?: SheetId
    }
  | {
      type: 'update-plot'
      plot: IPlot
      stepId?: SheetId
      branchId?: SheetId
    }
  | {
      type: 'update-custom-prop'
      addr: IHistItemAddr
      name: string
      prop: unknown
    }
  | { type: 'goto-step'; branchId?: SheetId; stepId: SheetId }
  | { type: 'remove-step'; branchId?: SheetId; stepId: SheetId }
  | { type: 'clear'; description: string }

export function historyReducer(
  state: IHistoryBranchState,
  action: HistoryAction
): IHistoryBranchState {
  function changeBranch(branchId: SheetId): IHistoryBranchState {
    const branch = findBranch(branchId, state)

    if (branch[0] === null) {
      return state
    }

    const nextState = produce(state, (draft) => {
      draft.currentBranch = branch[1]!
    })

    return nextState
  }

  function addStep(
    description: string,
    sheets: BaseDataFrame[],
    branchId: SheetId | null = null
  ): IHistoryBranchState {
    const branch = branchId ? findBranch(branchId, state) : currentBranch(state)

    if (branch[0] === null) {
      return state
    }

    // add from the current history point, deletingunknown steps
    // ahead of the current point

    const newStep = newHistoryStep(description, sheets)

    const branchIndex = branch[1]!

    const nextState = produce(state, (draft) => {
      draft.branches[branchIndex]!.steps = [
        ...branch[0]!.steps.slice(0, branch[0]!.currentStep + 1),
        newStep,
      ]

      draft.branches[branchIndex]!.currentStep += 1
    })

    return nextState
  }

  function removeStep(
    stepId: SheetId,
    treeId: SheetId | null = null
  ): IHistoryBranchState {
    const branch = treeId ? findBranch(treeId, state) : currentBranch(state)

    if (branch[0] === null) {
      return state
    }

    const step = findStep(stepId, branch[0]!)

    if (step[0] === null) {
      return state
    }

    const nextState = produce(state, (draft) => {
      draft.branches[branch[1]]!.steps = listrm(branch[0]!.steps, step[1]!)
      draft.branches[branch[1]]!.currentStep =
        step[1]! < branch[0]!.currentStep
          ? branch[0]!.currentStep
          : branch[0]!.currentStep - 1
    })

    return nextState
  }

  function gotoStep(
    stepId: SheetId,
    treeId: SheetId | undefined = undefined
  ): IHistoryBranchState {
    const branch = treeId ? findBranch(treeId, state) : currentBranch(state)

    if (branch[0] === null) {
      return state
    }

    const step = findStep(stepId, branch[0]!)

    if (step[0] === null) {
      return state
    }

    const nextState = produce(state, (draft) => {
      draft.branches[branch[1]!]!.currentStep = step[1]!
    })

    return nextState
  }

  function addSheets(
    mode: 'reset' | 'append',
    sheets: BaseDataFrame[],
    stepId: SheetId | undefined = undefined,
    treeId: SheetId | undefined = undefined
  ): IHistoryBranchState {
    const branch = treeId ? findBranch(treeId, state) : currentBranch(state)

    if (branch[0] === null) {
      return state
    }

    const step = stepId
      ? findStep(stepId, branch[0]!)
      : getCurrentStep(branch[0]!)

    if (step[0] === null) {
      return state
    }

    const nextState = produce(state, (draft) => {
      const b = branch[1]!
      const s = step[1]!

      if (mode === 'append') {
        draft.branches[b]!.steps[s]!.sheets = [
          ...step[0]!.sheets,
          ...sheets.map((df) => df.id),
        ]

        draft.branches[b]!.steps[s]!.sheetMap = Object.fromEntries([
          ...Object.entries(step[0]!.sheetMap),
          ...sheets.map((sheet) => [sheet.id, sheet]),
        ])
      } else {
        draft.branches[b]!.steps[s]!.sheets = sheets.map((df) => df.id)

        draft.branches[b]!.steps[s]!.sheetMap = Object.fromEntries(
          sheets.map((sheet) => [sheet.id, sheet])
        )
      }

      draft.branches[b]!.steps[s]!.currentSheet = sheets[sheets.length - 1]!.id
    })

    //.setName(
    //  `${sheet.name} ${step[0]!.sheets.length + si + 1}`,
    //  true
    // )

    return nextState
  }

  function sheetOrder(
    sheets: string[],
    stepId: SheetId | undefined = undefined,
    treeId: SheetId | undefined = undefined
  ): IHistoryBranchState {
    const branch = treeId ? findBranch(treeId, state) : currentBranch(state)

    if (branch[0] === null) {
      return state
    }

    const step = stepId
      ? findStep(stepId, branch[0]!)
      : getCurrentStep(branch[0]!)

    if (step[0] === null) {
      return state
    }

    const nextState = produce(state, (draft) => {
      draft.branches[branch[1]!]!.steps[step[1]!]!.sheets = sheets
    })

    return nextState
  }

  function removeSheet(
    sheetId: SheetId,
    stepId: SheetId | undefined = undefined,
    treeId: SheetId | undefined = undefined
  ): IHistoryBranchState {
    const branch = treeId ? findBranch(treeId, state) : currentBranch(state)

    if (branch[0] === null) {
      return state
    }

    const step = stepId
      ? findStep(stepId, branch[0]!)
      : getCurrentStep(branch[0]!)

    if (step[0] === null) {
      return state
    }

    const sheet = findSheet(sheetId, step[0]!)

    if (sheet === null) {
      return state
    }

    const nextState = produce(state, (draft) => {
      draft.branches[branch[1]!]!.steps[step[1]!]!.sheets =
        step[0]!.sheets.filter((s) => s !== sheet.id)
      delete draft.branches[branch[1]!]!.steps[step[1]!]!.sheetMap[sheet.id]

      draft.branches[branch[1]!]!.steps[step[1]!]!.currentSheet =
        draft.branches[branch[1]!]!.steps[step[1]!]!.sheets[0]!
    })

    return nextState
  }

  function gotoSheet(
    sheetId: SheetId,
    stepId: SheetId | undefined = undefined,
    treeId: SheetId | undefined = undefined
  ): IHistoryBranchState {
    const branch = treeId ? findBranch(treeId, state) : currentBranch(state)

    if (branch[0] === null) {
      return state
    }

    const step = stepId
      ? findStep(stepId, branch[0]!)
      : getCurrentStep(branch[0]!)

    if (step[0] === null) {
      return state
    }

    const sheet = findSheet(sheetId, step[0]!)

    if (sheet === null) {
      return state
    }

    const nextState = produce(state, (draft) => {
      draft.branches[branch[1]!]!.steps[step[1]!]!.currentSheet = sheet!.id
    })

    return nextState
  }

  function addPlots(
    plots: IPlot[],
    stepId: SheetId | undefined = undefined,
    treeId: SheetId | undefined = undefined
  ): IHistoryBranchState {
    const branch = treeId ? findBranch(treeId, state) : currentBranch(state)

    if (branch[0] === null) {
      return state
    }

    const step = stepId
      ? findStep(stepId, branch[0]!)
      : getCurrentStep(branch[0]!)

    if (step[0] === null) {
      return state
    }

    const nextState = produce(state, (draft) => {
      const b = branch[1]!
      const s = step[1]!
      draft.branches[b]!.steps[s]!.plots = [
        ...step[0]!.plots,
        ...plots.map((p) => p.id),
      ]

      draft.branches[b]!.steps[s]!.plotMap = Object.fromEntries([
        ...Object.entries(step[0]!.plotMap),
        ...plots.map((plot, pi) => [
          plot.id,
          {
            ...plot,
            name: `${plot.name} ${step[0]!.plots.length + pi + 1}`,
          },
        ]),
      ])

      draft.branches[b]!.steps[s]!.currentPlot = plots[plots.length - 1]!.id
    })

    return nextState
  }

  function updatePlot(
    plot: IPlot,
    stepId: SheetId | undefined = undefined,
    treeId: SheetId | undefined = undefined
  ): IHistoryBranchState {
    const branch = treeId ? findBranch(treeId, state) : currentBranch(state)

    if (branch[0] === null) {
      return state
    }

    const step = stepId
      ? findStep(stepId, branch[0]!)
      : getCurrentStep(branch[0]!)

    if (step[0] === null) {
      return state
    }

    const p = findPlot(plot.id, step[0]!)

    if (p === null) {
      return state
    }

    const nextState = produce(state, (draft) => {
      draft.branches[branch[1]!]!.steps[step[1]!]!.plotMap[p.id] = plot
    })

    return nextState
  }

  function removePlot(
    plotId: string,
    stepId: SheetId | undefined = undefined,
    treeId: SheetId | undefined = undefined
  ): IHistoryBranchState {
    const branch = treeId ? findBranch(treeId, state) : currentBranch(state)

    if (branch[0] === null) {
      return state
    }

    const step = stepId
      ? findStep(stepId, branch[0]!)
      : getCurrentStep(branch[0]!)

    if (step[0] === null) {
      return state
    }

    const plot = findPlot(plotId, step[0]!)

    if (plot === null) {
      return state
    }

    const nextState = produce(state, (draft) => {
      draft.branches[branch[1]!]!.steps[step[1]!]!.sheets =
        step[0]!.sheets.filter((s) => s !== plot.id)
      delete draft.branches[branch[1]!]!.steps[step[1]!]!.sheetMap[plot.id]

      draft.branches[branch[1]!]!.steps[step[1]!]!.currentSheet =
        draft.branches[branch[1]!]!.steps[step[1]!]!.sheets[0]!
    })

    return nextState
  }

  function updateCustomProp(addr: IHistItemAddr, name: string, prop: unknown) {
    const p = getPlotFromAddr(addr, state)

    if (p == null) {
      return state
    }

    const plot = {
      ...p,
      customProps: { ...p.customProps, [name]: prop },
    }

    const nextState = produce(state, (draft) => {
      draft.branches[addr[0]!]!.steps[addr[1]!]!.plotMap[plot.id] = plot
    })

    return nextState
  }

  let branch: [IHistoryBranch | null, number]
  let nextState: IHistoryBranchState = state
  //let update: IHistoryUpdate = {state, success:true }

  switch (action.type) {
    case 'undo':
      branch =
        action.branchId !== undefined
          ? findBranch(action.branchId, state)
          : currentBranch(state)

      if (branch[0] === null) {
        return state
      }

      nextState = produce(state, (draft) => {
        draft.branches[branch[1]!]!.currentStep = Math.max(
          0,
          state.branches[branch[1]!]!.currentStep - 1
        )
      })

      break
    case 'redo':
      branch =
        action.branchId !== undefined
          ? findBranch(action.branchId, state)
          : currentBranch(state)

      if (branch[0] === null) {
        return state
      }

      nextState = produce(state, (draft) => {
        draft.branches[branch[1]]!.currentStep = Math.min(
          state.branches[branch[1]]!.steps.length - 1,
          state.branches[branch[1]]!.currentStep + 1
        )
      })

      break
    case 'add-step':
      nextState = addStep(
        action.description,
        Array.isArray(action.sheets) ? action.sheets : [action.sheets],
        action.branchId
      )
      break
    case 'remove-step':
      nextState = removeStep(action.stepId, action.branchId)
      break
    case 'goto-step':
      nextState = gotoStep(action.stepId, action.branchId)
      break
    case 'add-sheets':
      nextState = addSheets(
        action.mode ?? 'append',
        Array.isArray(action.sheets) ? action.sheets : [action.sheets],
        action.stepId,
        action.branchId
      )
      break
    case 'goto-sheet':
      nextState = gotoSheet(action.sheetId, action.stepId, action.branchId)
      break
    case 'sheet-order':
      nextState = sheetOrder(action.sheetIds, action.stepId, action.branchId)
      break
    case 'remove-sheet':
      nextState = removeSheet(action.sheetId, action.stepId, action.branchId)
      break
    case 'add-plots':
      nextState = addPlots(
        Array.isArray(action.plots) ? action.plots : [action.plots],
        action.stepId,
        action.branchId
      )
      break
    // case 'add-plot':
    //   return addPlots([action.plot], action.stepId, action.treeId)
    case 'update-plot':
      nextState = updatePlot(action.plot, action.stepId, action.branchId)
      break
    case 'remove-plot':
      nextState = removePlot(action.plotId) //, action.stepId, action.branchId)
      break
    case 'update-custom-prop':
      nextState = updateCustomProp(action.addr, action.name, action.prop)
      break
    case 'open':
      nextState = produce(state, (draft) => {
        if (action.mode !== 'append') {
          draft.branches = []
        }

        draft.branches.push({
          ...newHistoryBranch(action.file ?? 'Table 1', [
            newHistoryStep(
              action.description,
              Array.isArray(action.sheets) ? action.sheets : [action.sheets]
            ),
          ]),
        })

        draft.currentBranch = draft.branches.length - 1
      })
      break
    case 'change-branch':
      nextState = changeBranch(action.branchId)
      break
    case 'clear':
      nextState = defaultHistoryTree()
      break
    default:
    // do nothing
  }

  nextState = produce(nextState, (draft) => {
    draft.actions.push(action.type)

    // stop it growing forever
    draft.actions = draft.actions.slice(
      Math.max(0, draft.actions.length - MAX_HISTORY_ITEMS)
    )
  })

  return nextState
}

// export function useHistory(): [HistoryState, Dispatch<HistoryAction>] {
//   const [history, historyDispatch] = useReducer(
//     historyReducer,
//     new HistoryState(defaultHistory(), 0)
//   )

//   return [history, historyDispatch]
// }

// const [DEFAULT_HISTORY, DEFAULT_HISTORY_DISPATCH] = useReducer(
//   historyReducer,
//   new HistoryState(0, DEFAULT_HISTORY_STEPS),
// )

// export const SettingsContext = createContext<
//   [ISettingsState, Dispatch<SettingAction>]
// >([{ ...DEFAULT_SETTINGS }, () => {}])

export const HistoryContext = createContext<{
  history: IHistoryBranchState
  historyDispatch: Dispatch<HistoryAction>
}>({
  history: defaultHistoryTree(),
  historyDispatch: () => {},
})

// export const HistoryDispatchContext = createContext<Dispatch<IHistoryAction>>(
//   () => {},
// )

export function HistoryProvider({ children }: IChildrenProps) {
  const [history, historyDispatch] = useReducer(
    historyReducer,
    defaultHistoryTree()
  )

  return (
    <HistoryContext.Provider
      value={{
        history,
        historyDispatch,
      }}
    >
      {children}
    </HistoryContext.Provider>
  )
}
