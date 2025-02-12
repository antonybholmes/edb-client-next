import { currentStep, HistoryContext } from '@providers/history-provider'
import { useContext } from 'react'

import { IconButton } from '@components/shadcn/ui/themed/icon-button'
import { Redo2, Undo2 } from 'lucide-react'

export function UndoShortcuts() {
  const { history, historyDispatch } = useContext(HistoryContext)

  return (
    <>
      <IconButton
        onClick={() => historyDispatch({ type: 'undo' })}
        aria-label="Undo"
        title={`Undo ${currentStep(history)[0]!.name}`}
      >
        <Undo2 className="w-4.5" strokeWidth={1.5} />
      </IconButton>
      <IconButton
        onClick={() => historyDispatch({ type: 'redo' })}
        aria-label="Redo"
        title={`Redo ${currentStep(history)[0]!.name}`}
      >
        <Redo2 className="w-4.5" strokeWidth={1.5} />
      </IconButton>
    </>
  )
}
