import type { IChildrenProps } from '@/interfaces/children-props'
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ChangeEvent,
} from 'react'
import { useSelectionRange } from '../../../providers/selection-range'
import { useVirtualDataFrameContext } from './virtual-dataframe-provider'

const BASE_FONT_SIZE = 0.75

interface EditContextProps {
  editText: string
  fontSize: string
  showTextCell: boolean
  setShowTextCell: (show: boolean) => void
  setEditText: (text: string) => void
  onEditChange: (e: ChangeEvent) => void
  onEditKeyDown: (e: React.KeyboardEvent) => void
}

const EditContext = createContext<EditContextProps>({
  editText: '',
  fontSize: '',
  showTextCell: false,
  setShowTextCell: () => {},
  setEditText: () => {},
  onEditChange: () => {},
  onEditKeyDown: () => {},
})

export function useEditContext() {
  const ctx = useContext(EditContext)
  if (!ctx) {
    throw new Error('useEditContext must be used within a EditProvider')
  }
  return ctx
}

export function EditProvider({ children }: IChildrenProps) {
  const { df, editable, zoom } = useVirtualDataFrameContext()
  const { selection } = useSelectionRange()

  const [editText, setEditText] = useState('')
  const [showTextCell, setShowTextCell] = useState(false)

  const fontSize = useMemo(() => `${BASE_FONT_SIZE * zoom}rem`, [zoom])

  // useEffect(() => {
  //   setShowTextCell(false)
  // }, [selection])

  function onEditChange(e: ChangeEvent) {
    setEditText((e.target as HTMLInputElement).value)
  }

  function onEditKeyDown(e: React.KeyboardEvent) {
    if (!editable || !selection) {
      return
    }

    switch (e.code) {
      case 'Enter':
        if (selection.rows && selection.cols) {
          df.at(selection.rows.start, selection.cols.start, editText)
        }

        // updateSelection({
        //   start: selection.start,
        //   end: selection.start,
        // })
        //setEditCell(NO_SELECTION)
        break
    }
  }

  return (
    <EditContext.Provider
      value={{
        editText,
        fontSize,
        showTextCell,
        setShowTextCell,
        setEditText,
        onEditChange,
        onEditKeyDown,
      }}
    >
      {children}
    </EditContext.Provider>
  )
}
