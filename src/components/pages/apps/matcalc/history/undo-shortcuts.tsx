import { OptionalDropdownButton } from '@/toolbar/optional-dropdown-button'

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { useKeyDownListener } from '@/hooks/keydown-listener'
import { Redo2, Undo2 } from 'lucide-react'
import { useHistory } from './history-provider/history-provider'

export function UndoShortcuts() {
  const { history, undo: historyUndo, redo: historyRedo } = useHistory()

  const pastTooltip =
    history.length > 1 ? `Undo ${history[history.length - 1]!.description}` : ''
  const futureTooltip =
    history.length > 0 ? `Redo ${history[0]!.description}` : ''

  useKeyDownListener((e: Event) => {
    const keyEvent = e as KeyboardEvent

    const isUndo = keyEvent.ctrlKey && keyEvent.key === 'z'
    const isRedo =
      keyEvent.ctrlKey &&
      (keyEvent.key === 'y' || (keyEvent.shiftKey && keyEvent.key === 'z'))

    if (isUndo) {
      e.preventDefault()
      historyUndo()
    }

    if (isRedo) {
      e.preventDefault()
      historyRedo()
    }
  })

  return (
    <>
      <OptionalDropdownButton
        icon={<Undo2 size={18} className="-rotate-45" strokeWidth={1.5} />}
        onMainClick={() => {
          historyUndo()
        }}
        title="Undo"
      >
        <DropdownMenuItem
          aria-label="Undo"
          onClick={() => historyUndo()}
          title={pastTooltip}
        >
          <Undo2 size={18} className="-rotate-45" strokeWidth={1.5} />
          <span>Undo</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          aria-label="Redo"
          onClick={() => historyRedo()}
          title={futureTooltip}
        >
          <Redo2 size={18} className="rotate-45" strokeWidth={1.5} />
          <span>Redo</span>
        </DropdownMenuItem>
      </OptionalDropdownButton>

      {/* <IconButton
        onClick={() => undo()}
        aria-label="Undo"
        title={`Undo ${step?.name ?? ''}`}
        className="group"
        rounded="full"
      >
        <Undo2
          className="w-4.5 -rotate-45 group-hover:stroke-theme trans-color"
          strokeWidth={2}
        />
      </IconButton> */}

      {/* <IconButton
        onClick={() => redo()}
        aria-label="Redo"
        title={`Redo ${step?.name ?? ''}`}
        rounded="full"
        className="group"
      >
        <Redo2
          className="w-4.5 rotate-45 group-hover:stroke-theme trans-color"
          strokeWidth={2}
        />
      </IconButton> */}
    </>
  )
}
