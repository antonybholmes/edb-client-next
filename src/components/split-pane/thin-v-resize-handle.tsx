import { useStableId } from '@/hooks/stable-id'
import { type ComponentProps } from 'react'
import { PanelResizeHandle } from 'react-resizable-panels'

const CLS =
  'group flex shrink-0 grow-0 flex-row items-center justify-center outline-hidden py-2 group'

export function ThinVResizeHandle({
  id,
  ...props
}: ComponentProps<typeof PanelResizeHandle>) {
  const _id = useStableId(id, 'thin-v-resize-handle')

  return (
    <PanelResizeHandle id={_id} className={CLS} {...props}>
      <span className="trans-color w-full h-[2px] trans-color group-data-[resize-handle-state=hover]:bg-ring group-data-[resize-handle-state=drag]:bg-ring" />
    </PanelResizeHandle>
  )
}
