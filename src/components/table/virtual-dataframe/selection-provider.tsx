import type { ICell } from '@/interfaces/cell'
import type { IChildrenProps } from '@/interfaces/children-props'
import type { IPos } from '@/interfaces/pos'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useSelectionRange } from '../../../providers/selection-range-provider'
import { useVirtualDataFrameContext } from './virtual-dataframe-provider'

export interface ISelectionPos {
  x1: number
  x2: number
  w: number
  y1: number
  y2: number
  h: number
}

interface SelectionContextProps {
  currentCell: ICell | undefined
  currentCellPos: IPos | undefined
  selectionPos: ISelectionPos | undefined

  setCurrentCell: (cell: ICell | undefined) => void
}

const SelectionContext = createContext<SelectionContextProps>({
  currentCell: undefined,
  currentCellPos: undefined,
  selectionPos: undefined,

  setCurrentCell: () => {},
})

export function useSelectionContext() {
  const ctx = useContext(SelectionContext)
  if (!ctx) {
    throw new Error(
      'useSelectionContext must be used within a SelectionProvider'
    )
  }
  return ctx
}

export function SelectionProvider({ children }: IChildrenProps) {
  const { df, colWidths, scaledCell, getColX } = useVirtualDataFrameContext()

  const { selection } = useSelectionRange()

  const [currentCell, setCurrentCell] = useState<ICell | undefined>(undefined)

  const currentCellPos: IPos | undefined = useMemo(() => {
    if (!currentCell) {
      return undefined
    }

    const { x } = getColX(currentCell.col)

    return { x, y: currentCell ? currentCell.row * scaledCell.h : 0 }
  }, [currentCell, colWidths, scaledCell.w, scaledCell.h])

  const selectionPos: ISelectionPos | undefined = useMemo(() => {
    if (!selection) {
      return undefined
    }

    const { x: x1 } = getColX(selection.cols ? selection.cols.start : 0)

    const { x: x2, w: w2 } = getColX(
      selection.cols ? selection.cols.end : df.shape[1] - 1
    )

    const w = x2 + w2 - x1
    const y1 = selection.rows ? selection.rows.start * scaledCell.h : 0
    const y2 =
      (selection.rows ? selection.rows.end + 1 : df.shape[0]) * scaledCell.h

    return {
      x1,
      x2: x2 + w2,
      w,
      y1,
      y2,
      h: y2 - y1,
    }
  }, [
    selection?.cols?.start,
    selection?.cols?.end,
    selection?.rows?.start,
    selection?.rows?.end,
    colWidths,
    scaledCell.w,
    scaledCell.h,
  ])

  // if there is no selection or we are selecting whole rows
  // or columns, there can be no cell selection
  useEffect(() => {
    if (!selection || !selection.rows || !selection.cols) {
      setCurrentCell(undefined)
    }
  }, [selection])

  return (
    <SelectionContext.Provider
      value={{
        currentCell,
        currentCellPos,
        selectionPos,
        setCurrentCell,
      }}
    >
      {children}
    </SelectionContext.Provider>
  )
}
