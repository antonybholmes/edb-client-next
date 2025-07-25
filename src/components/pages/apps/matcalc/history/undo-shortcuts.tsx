import { OptionalDropdownButton } from '@toolbar/optional-dropdown-button'
import { useHistory } from './history-store'

import { useKeyDownListener } from '@/hooks/keydown-listener'
import { DropdownMenuItem } from '@themed/dropdown-menu'
import { Redo2, Undo2 } from 'lucide-react'

export function UndoShortcuts() {
  const { undo, redo } = useHistory()

  useKeyDownListener((e: Event) => {
    const keyEvent = e as KeyboardEvent

    const isUndo = keyEvent.ctrlKey && keyEvent.key === 'z'
    const isRedo =
      keyEvent.ctrlKey &&
      (keyEvent.key === 'y' || (keyEvent.shiftKey && keyEvent.key === 'z'))

    if (isUndo) {
      e.preventDefault()
      undo()
    }

    if (isRedo) {
      e.preventDefault()
      redo()
    }
  })

  return (
    <>
      <OptionalDropdownButton
        icon={<Undo2 className="w-4.5 -rotate-45 " strokeWidth={2} />}
        onMainClick={() => {
          undo()
        }}
        title="Undo"
      >
        <DropdownMenuItem aria-label="Log10(x+1)" onClick={() => undo()}>
          <Undo2 className="w-4.5 -rotate-45" strokeWidth={2} />
          <span>Undo</span>
        </DropdownMenuItem>

        <DropdownMenuItem aria-label="Log10(x+1)" onClick={() => redo()}>
          <Redo2 className="w-4.5 rotate-45" strokeWidth={2} />
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
