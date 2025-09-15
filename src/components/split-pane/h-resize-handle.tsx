import { TRANS_COLOR_CLS, TRANS_OPACITY_CLS } from '@/theme'
import { HCenterCol } from '@layout/h-center-col'
import { cn } from '@lib/shadcn-utils'
import { useState } from 'react'
import { PanelResizeHandle } from 'react-resizable-panels'

export const RESIZE_DRAG_CLS =
  'data-[resize-handle-active=keyboard]:ring-2 data-[resize-handle-active=keyboard]:ring-ring'

export const RESIZE_FOCUS_CLS =
  'opacity-0 group-hover:opacity-100 group-data-[resize-handle-active=keyboard]:opacity-100'

export const RESIZE_DOT_CLS = cn(
  RESIZE_FOCUS_CLS,
  TRANS_OPACITY_CLS,
  'h-1 w-1 min-w-1 min-h-1 rounded-full bg-muted-foreground'
)

const CLS = cn(
  TRANS_COLOR_CLS,
  'group m-1 flex shrink-0 grow-0 cursor-ew-resize flex-col items-center justify-center gap-y-1 outline-hidden rounded-full'
)

export function HResizeHandle({
  ...props
}: React.ComponentProps<typeof PanelResizeHandle>) {
  const [drag, setDrag] = useState(false)

  const resizeDotCls = cn(RESIZE_DOT_CLS, drag && 'opacity-100')

  return (
    <PanelResizeHandle
      //id={id ?? `h-resize-handle-${nanoid()}`}
      className={cn(CLS, drag ? 'bg-muted' : RESIZE_DRAG_CLS)}
      onDragging={(drag) => {
        setDrag(drag)
      }}
      {...props}
    >
      <HCenterCol
        className={cn(
          TRANS_COLOR_CLS,
          'gap-y-1 rounded-full px-0.5 py-2 group-hover:bg-muted'
        )}
      >
        <div className={resizeDotCls} />
        <div className={resizeDotCls} />
        <div className={resizeDotCls} />
      </HCenterCol>
    </PanelResizeHandle>
  )
}
