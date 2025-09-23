import { useStableId } from '@/hooks/stable-id'
import { PanelResizeHandle } from 'react-resizable-panels'

const CLS =
  'group px-2 flex shrink-0 grow-0 cursor-ew-resize flex-col items-center justify-center outline-hidden'

export function ThinHResizeHandle({
  id,
  ...props
}: React.ComponentProps<typeof PanelResizeHandle>) {
  const _id = useStableId(id, 'thin-h-resize-handle')

  return (
    <PanelResizeHandle id={_id} className={CLS} {...props}>
      <span className="h-full w-[2px] group-hover:bg-ring trans-color" />
    </PanelResizeHandle>
  )
}
