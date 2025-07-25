import { nanoid } from 'nanoid'
import { PanelResizeHandle } from 'react-resizable-panels'

const CLS =
  'group px-2 flex shrink-0 grow-0 cursor-ew-resize flex-col items-center justify-center outline-hidden'

export function ThinHResizeHandle({
  id,
  ...props
}: React.ComponentProps<typeof PanelResizeHandle>) {
  return (
    <PanelResizeHandle
      id={id ?? `h-resize-handle-thin-${nanoid()}`}
      className={CLS}
      {...props}
    >
      <span className="h-full w-[2px] group-hover:bg-ring trans-color" />
    </PanelResizeHandle>
  )
}
