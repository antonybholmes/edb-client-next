// import { listrm } from '@/lib/collections'
// import { nanoid } from '@/lib/utils'
// import { produce } from 'immer'
// import { assign, setup } from 'xstate'
// import { BaseDataFrame, type SheetId } from '../lib/dataframe/base-dataframe'
// import {
//   currentBranch,
//   findBranch,
//   findStep,
//   getCurrentStep,
//   type IHistItemAddr,
//   type IHistoryBranchState,
//   type IPlot,
// } from './history-provider'

// export const historyMachine = setup({
//   types: {
//     context: {} as { history: IHistoryBranchState },
//     events: {} as
//       | { type: 'redo'; treeId?: SheetId }
//       | {
//           type: 'open'
//           mode?: 'Reset' | 'Append'
//           file?: string
//           description: string
//           sheets: BaseDataFrame[]
//         }
//       | {
//           type: 'add-step'
//           treeId?: SheetId
//           description: string
//           sheets: BaseDataFrame[]
//           sheetId?: SheetId
//         }
//       | {
//           type: 'add-sheets'
//           treeId?: SheetId
//           stepId?: SheetId
//           sheets: BaseDataFrame[]
//         }
//       | {
//           type: 'add-sheet'
//           sheetId: SheetId
//           sheet: BaseDataFrame
//           treeId?: SheetId
//           stepId?: SheetId
//         }
//       | {
//           type: 'goto-sheet'
//           sheetId: SheetId
//           treeId?: string
//           stepId?: string
//         }
//       | {
//           type: 'remove-sheet'
//           sheetId: SheetId
//           treeId?: SheetId
//           stepId?: SheetId
//         }
//       | {
//           type: 'add.plot'
//           treeId?: SheetId
//           stepId?: SheetId
//           plot: IPlot
//         }
//       | {
//           type: 'add-plots'
//           treeId?: SheetId
//           stepId?: SheetId
//           plots: IPlot[]
//         }
//       | {
//           type: 'remove-plot'
//           //addr: IHistItemAddr
//           plotId: SheetId
//           treeId?: SheetId
//           stepId?: SheetId
//         }
//       | {
//           type: 'update-plot'
//           treeId?: SheetId
//           stepId?: SheetId
//           plot: IPlot
//         }
//       | {
//           type: 'update-custom-prop'
//           addr: IHistItemAddr
//           name: string
//           prop:unknown
//         }
//       | { type: 'goto-step'; treeId?: SheetId; stepId: SheetId }
//       | { type: 'remove-step'; treeId?: SheetId; stepId: SheetId }
//       | { type: 'clear'; description: string },
//   },

//   actions: {
//     'add-plots': assign({
//       history: ({ context, event }) => {
//         if (event.type !== 'add-plots') {
//           return context.history
//         }

//         return produce(context.history, (draft: IHistoryBranchState) => {
//           const treeId = event.treeId

//           const branch = treeId
//             ? findBranch(treeId, draft)
//             : currentBranch(draft)

//           if (branch[0] === null) {
//             return
//           }

//           const stepId = event.stepId

//           const step = stepId
//             ? findStep(stepId, branch[0]!)
//             : getCurrentStep(branch[0]!)

//           if (step[0] === null) {
//             return
//           }

//           const plots: IPlot[] = event.plots

//           draft.branches[branch[1]!]!.steps[step[1]!]!.plots = [
//             ...step[0]!.plots,
//             ...plots.map((plot, pi) => ({
//               ...plot,
//               name: `${plot.name} ${step[0]!.plots.length + pi + 1}`,
//             })),
//           ]
//           draft.branches[branch[1]!]!.steps[step[1]!]!.currentPlot +=
//             plots.length
//         })
//       },
//     }),

//     'remove-step': assign({
//       history: ({ context, event }) => {
//         const history = context.history
//         if (event.type !== 'remove-step') {
//           return history
//         }

//         const branch = event.treeId
//           ? findBranch(event.treeId, history)
//           : currentBranch(history)

//         if (branch[0] === null) {
//           return history
//         }

//         if (branch[0] === null) {
//           return history
//         }

//         const step = findStep(event.stepId, branch[0]!)

//         if (step[0] === null) {
//           return history
//         }

//         // branches[branchIndex] = {
//         //   ...branch,
//         //   currentStep:
//         //     stepIndex < branch.currentStep
//         //       ? branch.currentStep
//         //       : branch.currentStep - 1,
//         //   steps: listrm(branch.steps, stepIndex),
//         // }

//         const nextState = produce(
//           context.history,
//           (draft: IHistoryBranchState) => {
//             draft.branches[branch[1]]!.steps = listrm(
//               branch[0]!.steps,
//               step[1]!
//             )
//             draft.branches[branch[1]]!.currentStep =
//               step[1]! < branch[0]!.currentStep
//                 ? branch[0]!.currentStep
//                 : branch[0]!.currentStep - 1
//           }
//         )

//         return nextState
//       },
//     }),

//     'goto-step': assign({
//       history: ({ context, event }) => {
//         const history = context.history

//         if (event.type !== 'goto-step') {
//           return history
//         }

//         const branch = event.treeId
//           ? findBranch(event.treeId, history)
//           : currentBranch(history)

//         if (branch[0] === null) {
//           return history
//         }

//         const step = event.stepId
//           ? findStep(event.stepId, branch[0]!)
//           : getCurrentStep(branch[0]!)

//         if (step[0] === null) {
//           return history
//         }

//         const nextState = produce(history, draft => {
//           draft.branches[branch[1]!]!.currentStep = step[1]!
//         })

//         return nextState
//       },
//     }),
//   },
// }).createMachine({
//   initial: 'init',
//   context: {
//     history: {
//       uuid: nanoid(),
//       name: 'History',
//       currentBranch: -1,
//       branches: [],
//     },
//   },
//   states: {
//     init: {
//       on: {
//         'add-plots': {
//           target: 'active',
//         },
//       },
//     },
//     active: {},
//   },
// })
