import { type IChildrenProps } from '@interfaces/children-props'

import { createContext, useReducer, type Dispatch } from 'react'

import type { ICell } from '@interfaces/cell'

export interface ISelectionRange {
  start: ICell
  end: ICell
}

export const NO_SELECTION: ICell = { row: -1, col: -1 }

export const NO_SELECTION_RANGE: ISelectionRange = {
  start: NO_SELECTION,
  end: NO_SELECTION,
}

export type SelectionRangeAction =
  | {
      type: 'set'
      range: ISelectionRange
    }
  | { type: 'clear' }

export function selectionRangeReducer(
  state: ISelectionRange,
  action: SelectionRangeAction
): ISelectionRange {
  switch (action.type) {
    case 'set':
      return { ...action.range }
    case 'clear':
      return { ...NO_SELECTION_RANGE }

    default:
      return state
  }
}

// const [DEFAULT_HISTORY, DEFAULT_HISTORY_DISPATCH] = useReducer(
//   historyReducer,
//   new HistoryState(0, DEFAULT_HISTORY_STEPS),
// )

export const SelectionRangeContext = createContext<
  [ISelectionRange, Dispatch<SelectionRangeAction>]
>([{ ...NO_SELECTION_RANGE }, () => {}])

export function SelectionRangeProvider({ children }: IChildrenProps) {
  const [state, selectionRangeDispatch] = useReducer(selectionRangeReducer, {
    ...NO_SELECTION_RANGE,
  })

  return (
    <SelectionRangeContext.Provider value={[state, selectionRangeDispatch]}>
      {children}
    </SelectionRangeContext.Provider>
  )
}
