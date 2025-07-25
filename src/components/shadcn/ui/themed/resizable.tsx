import { SmallVerticalGripIcon } from '@icons/small-vertical-grip-icon'
import { VCenterCol } from '@layout/v-center-col'
import { cn } from '@lib/shadcn-utils'
import type { ComponentProps } from 'react'
import * as ResizablePrimitive from 'react-resizable-panels'

const ResizablePanelGroup = ({
  className,
  ...props
}: ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn('flex data-[drag-dir=vertical]:flex-col', className)}
    {...props}
  />
)

const ResizablePanel = ResizablePrimitive.Panel

export const HANDLE_CLS = cn(
  'group shrink-0 grow-0 justify-center items-center outline-hidden overflow-hidden relative',
  'flex data-[drag-dir=horizontal]:flex-col data-[drag-dir=vertical]:flex-row',
  'data-[drag-dir=horizontal]:w-[16px] data-[drag-dir=vertical]:h-[16px]',
  'data-[panel-group-direction=horizontal]:w-[16px] data-[panel-group-direction=vertical]:h-[16px]',
  'data-[drag-dir=horizontal]:cursor-ew-resize data-[drag-dir=vertical]:cursor-ns-resize'
)

const ResizableHandle = ({
  withHandle = false,
  className,
  ...props
}: ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(HANDLE_CLS, className)}
    {...props}
  >
    <InnerHandle withHandle={withHandle} />
  </ResizablePrimitive.PanelResizeHandle>
)

const INNER_HANDLE_CLS = cn(
  'grow items-center justify-center rounded-full bg-border trans-opacity pointer-events-none',
  'flex group-data-[drag-dir=vertical]:flex-row group-data-[drag-dir=horizontal]:flex-col',
  'group-data-[drag-dir=vertical]:h-px group-data-[drag-dir=horizontal]:w-px',
  'group-data-[panel-group-direction=horizontal]:w-px group-data-[panel-group-direction=vertical]:h-px',
  'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
  'group-data-[resize-handle-state=hover]:opacity-100 group-data-[resize-handle-state=drag]:opacity-100'
)

export function InnerHandle({ withHandle = false }: { withHandle?: boolean }) {
  if (withHandle) {
    return (
      <div className={INNER_HANDLE_CLS}>{withHandle && <DragHandle />}</div>
    )
  } else {
    return <span className={INNER_HANDLE_CLS} />
  }
}

export function DragHandle() {
  return (
    <VCenterCol className="bg-white py-1 w-2.5 items-center rounded-full border border-ring group-data-[drag-dir=vertical]:rotate-90 z-10 ">
      <SmallVerticalGripIcon stroke="stroke-ring" />
    </VCenterCol>
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
