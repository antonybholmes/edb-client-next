import type { ICell } from '@interfaces/cell'
import { produce } from 'immer'
import { create } from 'zustand'

export interface ISelectionRange {
  start: ICell
  end: ICell
}

export const NO_SELECTION: ICell = { row: -1, col: -1 }

export const NO_SELECTION_RANGE: ISelectionRange = {
  start: NO_SELECTION,
  end: NO_SELECTION,
}

interface ISelectionRangeStore {
  selection: ISelectionRange

  update: (range: ISelectionRange) => void
  clear: () => void
}

export const useSelectionRangeStore = create<ISelectionRangeStore>(set => ({
  selection: NO_SELECTION_RANGE,
  update: (selection: ISelectionRange) => {
    set(
      produce((state: ISelectionRangeStore) => {
        if (
          selection.start.row !== state.selection.start.row ||
          selection.start.col !== state.selection.start.col ||
          selection.end.row !== state.selection.end.row ||
          selection.end.col !== state.selection.end.col
        ) {
          state.selection = selection
        }
      })
    )
  },
  clear: () => {
    set(
      produce((state: ISelectionRangeStore) => {
        state.selection = { ...NO_SELECTION_RANGE }
      })
    )
  },
}))

export function useSelectionRange(): {
  selection: ISelectionRange
  updateSelection: (range: ISelectionRange) => void
  clearSelection: () => void
} {
  const selection = useSelectionRangeStore(state => state.selection)
  const updateSelection = useSelectionRangeStore(state => state.update)
  const clear = useSelectionRangeStore(state => state.clear)

  return { selection, updateSelection, clearSelection: clear }
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
