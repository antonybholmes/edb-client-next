import { produce } from 'immer'
import { create } from 'zustand'

export interface IRange {
  start: number
  end: number
}

export interface ISelectionRange {
  rows: IRange | undefined
  cols: IRange | undefined
}

//export const NO_SELECTION: ICell = { row: -1, col: -1 }

// export const NO_SELECTION_RANGE: ISelectionRange = {
//   rows: undefined,
//   cols: undefined,
// }

interface ISelectionRangeStore {
  selection: ISelectionRange | undefined

  update: (range: ISelectionRange) => void
  clear: () => void
}

export const useSelectionRangeStore = create<ISelectionRangeStore>(set => ({
  selection: undefined,
  update: (selection: ISelectionRange) => {
    set(
      produce((state: ISelectionRangeStore) => {
        if (
          selection.rows?.start !== state.selection?.rows?.start ||
          selection.cols?.start !== state.selection?.cols?.start ||
          selection.rows?.end !== state.selection?.rows?.end ||
          selection.cols?.end !== state.selection?.cols?.end
        ) {
          state.selection = selection
        }
      })
    )
  },
  clear: () => {
    set(
      produce((state: ISelectionRangeStore) => {
        state.selection = undefined
      })
    )
  },
}))

export function useSelectionRange(): {
  selection: ISelectionRange | undefined
  update: (range: ISelectionRange) => void
  clear: () => void
} {
  const selection = useSelectionRangeStore(state => state.selection)
  const update = useSelectionRangeStore(state => state.update)
  const clear = useSelectionRangeStore(state => state.clear)

  return { selection, update, clear }
}

// export type SelectionRangeAction =
//   | {
//       type: 'set'
//       range: ISelectionRange
//     }
//   | { type: 'clear' }

// export function selectionRangeReducer(
//   state: ISelectionRange,
//   action: SelectionRangeAction
// ): ISelectionRange {
//   switch (action.type) {
//     case 'set':
//       if (
//         action.range.start.row !== state.start.row ||
//         action.range.start.col !== state.start.col ||
//         action.range.end.row !== state.end.row ||
//         action.range.end.col !== state.end.col
//       ) {
//         //console.log(JSON.stringify(action.range))
//         return { ...action.range }
//       } else {
//         return state
//       }

//     case 'clear':
//       return { ...NO_SELECTION_RANGE }

//     default:
//       return state
//   }
// }

// export const SelectionRangeContext = createContext<
//   [ISelectionRange, Dispatch<SelectionRangeAction>]
// >([{ ...NO_SELECTION_RANGE }, () => {}])

// export function SelectionRangeProvider({ children }: IChildrenProps) {
//   const [state, selectionRangeDispatch] = useReducer(selectionRangeReducer, {
//     ...NO_SELECTION_RANGE,
//   })

//   return (
//     <SelectionRangeContext.Provider value={[state, selectionRangeDispatch]}>
//       {children}
//     </SelectionRangeContext.Provider>
//   )
// }
